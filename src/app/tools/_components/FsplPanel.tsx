"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { glossary } from "@/data/glossary";
import { calculateFsplDb } from "@/lib/rf/fspl";
import { formatDb, formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { FsplColumn } from "./FsplColumn";

// ---- 距離-FSPLの対数カーブ（入力連動の動的SVG） --------------------------------------
// FSPL は距離の対数に対して直線（片対数グラフで直線）になる。周波数を変えるとカーブが上下に
// 平行移動し、距離を10倍にすると +20dB 増える様子を、現在の入力点に当てた三角ブラケットで見せる。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目: v4 R4方式）。

function FsplDistanceCurve({
  frequencyMHz,
  distanceKm,
  fsplDb
}: {
  frequencyMHz: number;
  distanceKm: number;
  fsplDb: number;
}) {
  const chart = { width: 640, height: 340, top: 28, right: 28, bottom: 52, left: 52 };
  const plotWidth = chart.width - chart.left - chart.right;
  const plotHeight = chart.height - chart.top - chart.bottom;

  // 距離ドメイン（log10(km)）。既定は 0.001km(1m)〜100km の5桁。現在点が外れても必ず含める。
  const freqTermDb = 20 * Math.log10(frequencyMHz);
  const fsplAt = (logKm: number) => 32.44 + 20 * logKm + freqTermDb;
  const curLog = Math.log10(distanceKm);
  const xMinLog = Math.min(-3, Math.floor(curLog) - 1);
  const xMaxLog = Math.max(2, Math.ceil(curLog) + 1);

  const yLo = fsplAt(xMinLog);
  const yHi = fsplAt(xMaxLog);
  const yMin = Math.floor((yLo - 6) / 20) * 20;
  const yMax = Math.ceil((yHi + 6) / 20) * 20;
  const ySpan = Math.max(1, yMax - yMin);
  const xSpan = Math.max(1, xMaxLog - xMinLog);

  const X = (logKm: number) => chart.left + ((logKm - xMinLog) / xSpan) * plotWidth;
  const Y = (db: number) => chart.top + ((yMax - db) / ySpan) * plotHeight;

  // 対数軸上では FSPL は直線。両端を結べば十分だが、視認性のため複数点でポリラインにする。
  const samples = 60;
  const curvePoints = Array.from({ length: samples + 1 }, (_, k) => {
    const logKm = xMinLog + (k / samples) * xSpan;
    return `${X(logKm).toFixed(1)},${Y(fsplAt(logKm)).toFixed(1)}`;
  }).join(" ");

  const xTicks = Array.from({ length: xMaxLog - xMinLog + 1 }, (_, i) => xMinLog + i);
  const yTicks = Array.from({ length: Math.floor(ySpan / 20) + 1 }, (_, i) => yMax - i * 20);

  const distanceTickLabel = (logKm: number) => {
    const km = Math.pow(10, logKm);
    return km < 1 ? `${formatNumber(km * 1000, 0)}m` : `${formatNumber(km, 0)}km`;
  };

  // 現在点と、その10倍距離（+20dB）を結ぶ三角ブラケット。curLog+1 <= xMaxLog を満たすため域内。
  const cx0 = X(curLog);
  const cy0 = Y(fsplDb);
  const nextLog = curLog + 1;
  const cx1 = X(nextLog);
  const cy1 = Y(fsplAt(nextLog));

  return (
    <svg
      role="img"
      aria-label={`周波数${formatNumber(frequencyMHz)}MHzでの距離-自由空間損失カーブ。距離${formatNumber(distanceKm)}kmで${formatNumber(fsplDb)}dB。距離10倍で約20dB増加`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />

      {/* 横グリッド（dB）と目盛り */}
      {yTicks.map((tick) => (
        <g key={`y-${tick}`}>
          <line
            x1={chart.left}
            x2={chart.width - chart.right}
            y1={Y(tick)}
            y2={Y(tick)}
            stroke={chartTheme.grid.primary}
          />
          <text
            x={chart.left - 8}
            y={Y(tick) + 4}
            textAnchor="end"
            fill={diagramPalette.muted}
            fontSize={11}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {tick}
          </text>
        </g>
      ))}
      <text x={chart.left} y={chart.top - 12} fill={diagramPalette.muted} fontSize={12} fontWeight={600}>
        FSPL[dB]
      </text>

      {/* 縦グリッド（距離の桁）と目盛り */}
      {xTicks.map((tick) => (
        <g key={`x-${tick}`}>
          <line
            x1={X(tick)}
            x2={X(tick)}
            y1={chart.top}
            y2={chart.height - chart.bottom}
            stroke={chartTheme.grid.primary}
          />
          <text
            x={X(tick)}
            y={chart.height - chart.bottom + 18}
            textAnchor="middle"
            fill={diagramPalette.muted}
            fontSize={11}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {distanceTickLabel(tick)}
          </text>
        </g>
      ))}
      <text
        x={chart.width - chart.right}
        y={chart.height - 10}
        textAnchor="end"
        fill={diagramPalette.muted}
        fontSize={12}
        fontWeight={600}
      >
        距離（対数軸）
      </text>

      {/* FSPLカーブ本体 */}
      <polyline
        points={curvePoints}
        fill="none"
        stroke={chartTheme.series.source}
        strokeWidth={chartTheme.stroke.series}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* 距離10倍=+20dB の三角ブラケット（現在点起点） */}
      <line
        x1={cx0}
        x2={cx1}
        y1={cy0}
        y2={cy0}
        stroke={diagramPalette.faint}
        strokeDasharray="4 4"
      />
      <line
        x1={cx1}
        x2={cx1}
        y1={cy0}
        y2={cy1}
        stroke={diagramPalette.faint}
        strokeDasharray="4 4"
      />
      <text
        x={(cx0 + cx1) / 2}
        y={cy0 + 16}
        textAnchor="middle"
        fill={diagramPalette.inkSoft}
        fontSize={11}
        fontWeight={600}
      >
        距離 ×10
      </text>
      <text
        x={cx1 + 6}
        y={(cy0 + cy1) / 2 + 4}
        textAnchor="start"
        fill={chartTheme.seriesText.source}
        fontSize={11}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        +20dB
      </text>

      {/* 現在点マーカー（縦ガイド＋ドット＋値） */}
      <line
        x1={cx0}
        x2={cx0}
        y1={chart.top}
        y2={cy0}
        stroke={chartTheme.reference.sensitivity}
        strokeDasharray={chartTheme.reference.sensitivityDash}
      />
      <circle cx={cx0} cy={cy0} r={5} fill={chartTheme.series.source} stroke={chartTheme.surface.plain} strokeWidth={2} />
      <text
        x={cx0}
        y={Math.max(chart.top + 12, cy0 - 12)}
        textAnchor="middle"
        fill={chartTheme.seriesText.source}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatDb(fsplDb, 0)}
      </text>
    </svg>
  );
}

export function FsplPanel() {
  const [frequencyMHz, setFrequencyMHz] = useState(920);
  const [distance, setDistance] = useState(1);
  const [distanceUnit, setDistanceUnit] = useState<"m" | "km">("km");
  const distanceKm = distanceUnit === "m" ? distance / 1000 : distance;

  const result = useMemo(() => {
    try {
      const fspl = calculateFsplDb(frequencyMHz, distanceKm);
      // FSPLが負になる極端な近距離・低周波では、遠方界を前提とする式を無効扱いにする。
      return fspl >= 0 ? fspl : null;
    } catch {
      return null;
    }
  }, [frequencyMHz, distanceKm]);

  const sampleDistances = useMemo(() => {
    return [0.01, 0.1, 1, 10].map((distanceValue) => {
      try {
        const fspl = calculateFsplDb(frequencyMHz, distanceValue);
        return { distance: distanceValue, fspl: fspl >= 0 ? fspl : Number.NaN };
      } catch {
        return { distance: distanceValue, fspl: Number.NaN };
      }
    });
  }, [frequencyMHz]);

  const frequencyError =
    !Number.isFinite(frequencyMHz) || frequencyMHz <= 0
      ? "周波数は0より大きい値を入力してください。"
      : undefined;
  const distanceError =
    !Number.isFinite(distance) || distance <= 0
      ? "距離は0より大きい値を入力してください。"
      : undefined;
  const modelError = result === null && !frequencyError && !distanceError;
  const primary = {
    label: "自由空間損失",
    value: result === null ? "—" : formatNumber(result),
    unit: "dB"
  };

  // バー幅は固定のdBレンジ（60〜140dB）で正規化し、距離間を定量比較する。
  const barWidthPercent = (fspl: number) => {
    if (!Number.isFinite(fspl)) return 0;
    const ratio = (fspl - 60) / (140 - 60);
    return Math.min(100, Math.max(2, ratio * 100));
  };

  const inputMatchesSample = sampleDistances.some(
    (item) =>
      Number.isFinite(distanceKm) &&
      Math.abs(distanceKm - item.distance) < item.distance * 0.001
  );

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <div className="mt-4 space-y-4">
            <Field
              id="fsplFrequency"
              label="周波数"
              unit="MHz"
              value={frequencyMHz}
              min={1}
              step={1}
              emptyBehavior="preserve"
              onChange={setFrequencyMHz}
              help={glossary.fspl.description}
              example="920"
              error={frequencyError}
            />
            <Field
              id="fsplDistance"
              label="距離"
              value={distance}
              min={distanceUnit === "m" ? 1 : 0.001}
              step={distanceUnit === "m" ? 1 : 0.01}
              emptyBehavior="preserve"
              onChange={setDistance}
              unitSelect={{
                value: distanceUnit,
                options: [
                  { value: "m", label: "m" },
                  { value: "km", label: "km" }
                ],
                onChange: (value) => setDistanceUnit(value as "m" | "km"),
                ariaLabel: "距離の単位"
              }}
              help="送受信間の直線距離です。mは屋内・近距離、kmは屋外の見通し距離に使います。"
              example={distanceUnit === "m" ? "100" : "1"}
              error={distanceError}
            />
          </div>
          {modelError ? (
            <p className="mt-4 text-sm font-medium leading-relaxed text-rose-700">
              距離が波長に対して極端に短く、遠方界を前提とする自由空間損失の式が成立しません。
            </p>
          ) : null}
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="fspl-primary-result">
            <ResultBar primary={primary} />
          </div>
          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">距離ごとの損失比較</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              現在の周波数で、距離が10倍になると損失が約20dB増える様子を比較します。
            </p>

            {Number.isFinite(frequencyMHz) && frequencyMHz > 0 ? (
              <>
                <div className="mt-4 space-y-3">
                  {sampleDistances.map((item) => {
                    const isCurrent =
                      Number.isFinite(distanceKm) &&
                      Math.abs(distanceKm - item.distance) < item.distance * 0.001;
                    return (
                      <div
                        key={item.distance}
                        className={`grid grid-cols-[64px_1fr_72px] items-center gap-3 rounded-lg px-2 py-1 text-sm ${
                          isCurrent ? "bg-staf-light ring-1 ring-staf/40" : ""
                        }`}
                      >
                        <span className={isCurrent ? "font-semibold text-staf-dark" : "text-slate-600"}>
                          {item.distance < 1 ? `${item.distance * 1000}m` : `${item.distance}km`}
                        </span>
                        <div className="h-3 rounded-full bg-slate-100">
                          <div
                            className="h-3 rounded-full bg-staf"
                            style={{ width: `${barWidthPercent(item.fspl)}%` }}
                          />
                        </div>
                        <span className="text-right font-semibold text-slate-900">
                          {Number.isFinite(item.fspl) ? formatDb(item.fspl, 0) : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {result !== null && Number.isFinite(distanceKm) && !inputMatchesSample ? (
                  <div className="mt-4 grid grid-cols-[64px_1fr_72px] items-center gap-3 rounded-lg border border-staf/40 bg-staf-light px-2 py-2 text-sm">
                    <span className="font-semibold text-staf-dark">入力値</span>
                    <div className="h-3 rounded-full bg-white/70">
                      <div
                        className="h-3 rounded-full bg-staf-dark"
                        style={{ width: `${barWidthPercent(result)}%` }}
                      />
                    </div>
                    <span className="text-right font-bold text-slate-950">{formatDb(result, 0)}</span>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                周波数を入力すると距離ごとの損失が表示されます。
              </p>
            )}
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="対数カーブ"
          title="距離と自由空間損失の関係"
          description="片対数グラフでは自由空間損失は直線になります。周波数を変えるとカーブが上下に平行移動し、距離を10倍にすると損失が約20dB増えます。入力に連動して現在点（赤の縦線）が動きます。"
          exportName="fspl-distance-curve"
          caption={
            result !== null && Number.isFinite(frequencyMHz) && frequencyMHz > 0
              ? `条件: 周波数=${formatNumber(frequencyMHz)}MHz / 距離=${formatNumber(distance)}${distanceUnit} ─ 自由空間損失 ${formatDb(result, 1)}`
              : "入力値を確認してください。"
          }
        >
          {result !== null && Number.isFinite(frequencyMHz) && frequencyMHz > 0 && Number.isFinite(distanceKm) && distanceKm > 0 ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <FsplDistanceCurve frequencyMHz={frequencyMHz} distanceKm={distanceKm} fsplDb={result} />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              周波数と距離を有効な値にすると、距離-損失のカーブが表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="数式と理論"
          formula="FSPL[dB] = 32.44 + 20log10(距離[km]) + 20log10(周波数[MHz])"
          showColumnLink={false}
        >
          <p>
            自由空間損失は理想環境での損失です。実環境では壁、床、金属、人体、筐体、ノイズ、マルチパスの影響が加わります。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <FsplColumn />
      </div>

      <MobileResultBar primary={primary} targetId="fspl-primary-result" />
    </>
  );
}
