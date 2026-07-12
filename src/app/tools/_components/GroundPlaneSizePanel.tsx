"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import {
  calculateGroundPlaneEffect,
  groundPlaneEfficiencyDropDb,
  GROUND_PLANE_RECOMMENDED_FRACTION
} from "@/lib/rf/groundPlaneEffect";
import { GROUND_PLANE_EFFECT_SOURCES, GROUND_PLANE_EFFICIENCY_TABLE } from "@/data/groundPlaneEffect";
import { formatNumber } from "@/lib/rf/format";
import { CONTACT_URL } from "@/lib/rf/presets";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { ToolColumnCard } from "@/components/ToolColumnCard";
import { groundPlaneEffectColumn } from "@/data/columns/groundPlaneEffect";

// 周波数プリセット（出典が固い帯のみ）。
// 920: 日本のsub-GHz帯（ARIB STD-T108, LPWA/RFID）。1575: GNSS L1帯。2400: 2.4GHz ISM帯。
// クリックで周波数だけを変える＝「同じ基板が帯域でどう化けるか」を見せる。
const FREQUENCY_PRESETS = [
  { label: "920MHz", mhz: 920 },
  { label: "1575MHz（GNSS）", mhz: 1575 },
  { label: "2.4GHz", mhz: 2400 }
] as const;

// グラフ・スライダーの横軸上限（Lg/λ）。推奨0.25の少し先まで見せる。
const CHART_MAX_FRACTION = 0.3;

/** 効率低下の表示文字列（0以下のdB。0は "0.0"、それ以外は負号付き）。 */
function formatDropValue(dropDb: number): string {
  if (!Number.isFinite(dropDb)) {
    return "—";
  }
  return formatNumber(dropDb, 1);
}

// ---- GND鏡像ミニ図＋効率低下カーブ（入力連動の動的SVG） -----------------------------
// 上段: 「アンテナ(λ/4)｜GNDプレーン(Lg)｜鏡像」の側面図。Lgが縮むと鏡像も欠けていく。
// 下段: 横軸 Lg/λ(0〜0.3) の効率低下カーブ（目安表の区分線形）と現在点マーカー＋λ/4基準線。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目: v4 R4方式）。

function GroundPlaneDiagram({
  lgOverLambda,
  groundLengthMm,
  efficiencyDropDb
}: {
  lgOverLambda: number;
  groundLengthMm: number;
  efficiencyDropDb: number;
}) {
  const width = 640;
  const height = 460;

  // ── 上段: 側面ミニ図 ──
  const antX = 150; // アンテナ（給電点）のx位置
  const gndY = 106; // GNDプレーン上面のy位置
  const gndH = 10;
  const antennaLen = 58; // λ/4素子の表示長（固定・直感用）
  const lgVis = Math.min(CHART_MAX_FRACTION, Math.max(0, lgOverLambda));
  const gndPx = Math.max(4, (lgVis / CHART_MAX_FRACTION) * 340);
  // 鏡像はGNDが担う「残り半分」: Lg/λ が 0.25 を切るほど短く欠けて見せる。
  const mirrorLen = antennaLen * Math.min(1, lgOverLambda / GROUND_PLANE_RECOMMENDED_FRACTION);

  // ── 下段: 効率低下カーブ ──
  const plot = { left: 58, right: 606, top: 236, bottom: 408 };
  const gMax = 1; // 0dBの上に少し余白
  const gMin = -21; // -20dB（GNDなし）の下に少し余白
  const xOf = (fraction: number) =>
    plot.left + (Math.min(CHART_MAX_FRACTION, Math.max(0, fraction)) / CHART_MAX_FRACTION) * (plot.right - plot.left);
  const yOf = (dropDb: number) =>
    plot.top + ((gMax - Math.min(gMax, Math.max(gMin, dropDb))) / (gMax - gMin)) * (plot.bottom - plot.top);

  // 61点のpolyline（目安表の区分線形をそのままなぞる）。
  const curvePoints: string[] = [];
  for (let i = 0; i <= 60; i += 1) {
    const fraction = (i / 60) * CHART_MAX_FRACTION;
    curvePoints.push(`${xOf(fraction).toFixed(1)},${yOf(groundPlaneEfficiencyDropDb(fraction)).toFixed(1)}`);
  }

  const yTicks = [0, -3, -6, -12, -20];
  const xTicks = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3];

  // 現在点（Lg/λ を 0..0.3 にクランプ）。
  const markerX = xOf(lgOverLambda);
  const markerY = yOf(efficiencyDropDb);
  const markerAnchor: "start" | "end" = lgVis > 0.21 ? "end" : "start";
  const overRange = lgOverLambda > CHART_MAX_FRACTION;

  return (
    <svg
      role="img"
      aria-label={`GND最長辺 Lg/λ=${formatNumber(lgOverLambda, 3)} のときの効率低下 ${formatDropValue(efficiencyDropDb)}dB。λ/4（0.25）で低下0dB、GNDが短いほど急落`}
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
    >
      <rect width={width} height={height} fill={chartTheme.surface.canvas} />

      {/* ── 上段: 側面ミニ図 ── */}
      <text x={20} y={26} fill={diagramPalette.inkSoft} fontSize={12} fontWeight={700}>
        λ/4モノポールの残り半分は、GNDプレーンに映る鏡像が担う
      </text>

      {/* GNDプレーン（側面）: 長さが Lg に連動 */}
      <rect x={antX} y={gndY} width={gndPx} height={gndH} rx={2} fill={diagramPalette.inkSoft} />
      <text
        x={antX + Math.max(gndPx, 90) / 2}
        y={gndY + gndH + 16}
        textAnchor="middle"
        fill={diagramPalette.inkSoft}
        fontSize={11}
        fontWeight={600}
      >
        GNDプレーン
      </text>

      {/* アンテナ素子（λ/4・GND左端に立つ） */}
      <line
        x1={antX}
        y1={gndY}
        x2={antX}
        y2={gndY - antennaLen}
        stroke={diagramPalette.staf}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <circle cx={antX} cy={gndY} r={4} fill={diagramPalette.staf} />
      <text x={antX - 8} y={gndY - antennaLen + 4} textAnchor="end" fill={diagramPalette.stafDark} fontSize={12} fontWeight={600}>
        アンテナ（λ/4）
      </text>

      {/* 鏡像（GNDの下・破線）。Lg/λ が 0.25 を切ると短く欠ける */}
      {mirrorLen > 1 ? (
        <line
          x1={antX}
          y1={gndY + gndH}
          x2={antX}
          y2={gndY + gndH + mirrorLen}
          stroke={diagramPalette.faint}
          strokeWidth={3}
          strokeDasharray="5 4"
          strokeLinecap="round"
        />
      ) : null}
      <text
        x={antX - 8}
        y={gndY + gndH + Math.max(mirrorLen, 16)}
        textAnchor="end"
        fill={diagramPalette.muted}
        fontSize={11}
        fontWeight={600}
      >
        {mirrorLen >= antennaLen - 0.5 ? "鏡像（残り半分・完全）" : "鏡像（欠けている）"}
      </text>

      {/* Lg の寸法線 */}
      <line
        x1={antX}
        y1={gndY + gndH + 66}
        x2={antX + gndPx}
        y2={gndY + gndH + 66}
        stroke={diagramPalette.inkMuted}
        strokeWidth={1.25}
      />
      <polygon
        points={`${antX},${gndY + gndH + 66} ${antX + 9},${gndY + gndH + 62} ${antX + 9},${gndY + gndH + 70}`}
        fill={diagramPalette.inkMuted}
      />
      <polygon
        points={`${antX + gndPx},${gndY + gndH + 66} ${antX + gndPx - 9},${gndY + gndH + 62} ${antX + gndPx - 9},${gndY + gndH + 70}`}
        fill={diagramPalette.inkMuted}
      />
      <text
        x={antX + gndPx / 2}
        y={gndY + gndH + 86}
        textAnchor="middle"
        fill={diagramPalette.ink}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        Lg = {formatNumber(groundLengthMm, 1)}mm（Lg/λ = {formatNumber(lgOverLambda, 3)}）
      </text>

      {/* ── 下段: 効率低下カーブ ── */}
      <text x={plot.left - 2} y={plot.top - 14} fill={diagramPalette.inkSoft} fontSize={12} fontWeight={700}>
        効率低下の目安カーブ（横軸 Lg/λ・目安表の区分線形補間）
      </text>

      {/* y目盛り・グリッド */}
      {yTicks.map((tick) => (
        <g key={tick}>
          <line x1={plot.left} x2={plot.right} y1={yOf(tick)} y2={yOf(tick)} stroke={chartTheme.grid.primary} />
          <text
            x={plot.left - 8}
            y={yOf(tick) + 4}
            textAnchor="end"
            fill={diagramPalette.muted}
            fontSize={11}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {tick}
          </text>
        </g>
      ))}
      <text x={plot.left - 8} y={plot.top - 2} textAnchor="end" fill={diagramPalette.muted} fontSize={11}>
        dB
      </text>

      {/* 0dB（低下なし）基準線 */}
      <line
        x1={plot.left}
        x2={plot.right}
        y1={yOf(0)}
        y2={yOf(0)}
        stroke={chartTheme.reference.baseline}
        strokeDasharray={chartTheme.reference.baselineDash}
      />

      {/* x目盛り */}
      {xTicks.map((tick) => (
        <text
          key={tick}
          x={xOf(tick)}
          y={plot.bottom + 18}
          textAnchor="middle"
          fill={diagramPalette.muted}
          fontSize={11}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatNumber(tick, 2)}
        </text>
      ))}
      <text x={plot.right} y={plot.bottom + 34} textAnchor="end" fill={diagramPalette.muted} fontSize={11}>
        Lg/λ
      </text>

      {/* λ/4（0.25）基準線: ここから右は低下0dB */}
      <line
        x1={xOf(GROUND_PLANE_RECOMMENDED_FRACTION)}
        x2={xOf(GROUND_PLANE_RECOMMENDED_FRACTION)}
        y1={plot.top}
        y2={plot.bottom}
        stroke={diagramPalette.successDeep}
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      <text
        x={xOf(GROUND_PLANE_RECOMMENDED_FRACTION)}
        y={plot.top + 14}
        textAnchor="middle"
        fill={diagramPalette.successDeep}
        fontSize={11}
        fontWeight={700}
      >
        λ/4（推奨・低下0dB）
      </text>

      {/* 効率低下カーブ */}
      <polyline points={curvePoints.join(" ")} fill="none" stroke={diagramPalette.staf} strokeWidth={2.5} />

      {/* 現在点マーカー */}
      <circle cx={markerX} cy={markerY} r={6} fill={diagramPalette.danger} stroke={diagramPalette.white} strokeWidth={2} />
      <text
        x={markerAnchor === "start" ? markerX + 10 : markerX - 10}
        y={markerY - 10}
        textAnchor={markerAnchor}
        fill={diagramPalette.dangerDeep}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        現在 {formatDropValue(efficiencyDropDb)}dB
      </text>
      {overRange ? (
        <text x={plot.right - 4} y={plot.bottom - 8} textAnchor="end" fill={diagramPalette.muted} fontSize={10}>
          Lg/λ&gt;0.3（グラフ右端に固定表示）
        </text>
      ) : null}
    </svg>
  );
}

export function GroundPlaneSizePanel() {
  // 既定は 920MHz・Lg=32.6mm（≈λ/10）: 「小型基板のGND不足で-6dB＝電力1/4」を最初に見せる。
  const [frequencyMHz, setFrequencyMHz] = useState(920);
  const [groundLengthMm, setGroundLengthMm] = useState(32.6);

  const result = useMemo(() => {
    try {
      return calculateGroundPlaneEffect({ frequencyMHz, groundLengthMm });
    } catch {
      return null;
    }
  }, [frequencyMHz, groundLengthMm]);

  // 早見表（目安表のアンカー点を、現在の周波数での実寸mmと合わせて表示）。
  const referenceRows = useMemo(() => {
    const wavelengthMm = result?.wavelengthMm;
    return [...GROUND_PLANE_EFFICIENCY_TABLE]
      .reverse()
      .map((row) => ({
        ...row,
        lengthMm: wavelengthMm !== undefined ? row.lgOverLambda * wavelengthMm : Number.NaN
      }));
  }, [result]);

  const frequencyError =
    !Number.isFinite(frequencyMHz) || frequencyMHz <= 0
      ? "周波数は0より大きい値をMHzで入力してください。"
      : undefined;
  const lengthError =
    !Number.isFinite(groundLengthMm) || groundLengthMm < 0
      ? "GND最長辺は0以上の値をmmで入力してください。"
      : undefined;

  // スライダー上限は Lg/λ=0.3 相当（推奨λ/4の少し先まで）。周波数に自動追従する。
  const sliderMaxMm = result ? Math.max(1, Math.round(result.wavelengthMm * CHART_MAX_FRACTION)) : 100;

  const primary = {
    label: "効率低下（GND寸法起因）",
    value: result === null ? "—" : formatDropValue(result.efficiencyDropDb),
    unit: "dB"
  };

  const chipClass = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${
      active
        ? "border-staf bg-staf text-white"
        : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
    }`;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            チップアンテナやIFAなどのλ/4モノポール系は、基板のGNDプレーンが「アンテナの残り半分」
            （鏡像）を担います。周波数と、基板でGNDが連続して確保できる最長辺 Lg を入れてください。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">
              周波数プリセット（同じ基板寸法のまま帯域を切り替えて比較）
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="周波数プリセット">
              {FREQUENCY_PRESETS.map((preset) => (
                <button
                  key={preset.mhz}
                  type="button"
                  className={chipClass(frequencyMHz === preset.mhz)}
                  onClick={() => setFrequencyMHz(preset.mhz)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Field
              id="gpFrequency"
              label="周波数"
              unit="MHz"
              value={frequencyMHz}
              min={1}
              step={5}
              emptyBehavior="preserve"
              onChange={setFrequencyMHz}
              help="波長 λ を決めます。効率低下はGND寸法そのものではなく波長比 Lg/λ で決まるため、同じ基板でも920MHzでは不足し、2.4GHzでは足りる、が起きます。"
              example="920"
              error={frequencyError}
            />
            <Field
              id="gpGroundLength"
              label="GND最長辺 Lg"
              unit="mm"
              value={groundLengthMm}
              min={0}
              max={sliderMaxMm}
              step={0.5}
              showSlider
              emptyBehavior="preserve"
              onChange={setGroundLengthMm}
              help="基板上でGNDが切れ目なく連続する、いちばん長い辺（対角ではなく辺）です。スライダーは Lg/λ=0〜0.3 の範囲を動きます。λ/4（0.25λ）を確保できると低下0dBです。"
              example={result ? formatNumber(result.recommendedLengthMm, 1) : "81.5"}
              error={lengthError}
            />
          </div>

          <div className="mt-4">
            <Callout tone="caution" title="目安値・実測前提">
              <p>
                この計算はベンダーアプリケーションノートの実測系の目安（
                {GROUND_PLANE_EFFECT_SOURCES.map((source, index) => (
                  <span key={source.href}>
                    {index > 0 ? "／" : ""}
                    <a
                      className="font-semibold underline decoration-amber-300 underline-offset-2 hover:text-amber-800"
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {source.label}
                    </a>
                  </span>
                ))}
                ）を区分線形でなぞった一次判断用です。実機ではGND形状・部品配置・筐体で共振ずれ・
                整合ずれが重なり、さらに悪化しえます。最終判断は実測を前提にしてください。
              </p>
            </Callout>
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="ground-plane-size-primary-result">
            <ResultBar primary={primary} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Lg/λ"
              value={result ? formatNumber(result.lgOverLambda, 3) : "—"}
              sub="0.25以上で低下なし"
              hint="GND最長辺の波長比です。効率低下は寸法mmではなくこの無次元比で決まります。"
            />
            <MetricCard
              label="推奨GND長（λ/4）"
              value={result ? formatNumber(result.recommendedLengthMm, 1) : "—"}
              unit="mm"
              sub={`λ=${result ? formatNumber(result.wavelengthMm, 1) : "—"}mm`}
              hint="この長さを確保できると鏡像が完全になり、GND起因の効率低下は目安0dBです。"
            />
          </div>

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">Lg/λごとの効率低下（早見表）</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              現在の周波数（{formatNumber(frequencyMHz)}MHz）での実寸mmに換算して表示します。
            </p>
            <div className="mt-3 space-y-1.5">
              {referenceRows.map((row) => {
                const isCurrent = result !== null && Math.abs(result.lgOverLambda - row.lgOverLambda) < 0.005;
                return (
                  <div
                    key={row.lgOverLambda}
                    className={`grid grid-cols-[96px_1fr_76px] items-center gap-3 rounded-lg px-2 py-1 text-sm ${
                      isCurrent ? "bg-staf-light ring-1 ring-staf/40" : ""
                    }`}
                  >
                    <span className={isCurrent ? "font-semibold text-staf-dark" : "text-slate-600"}>
                      Lg/λ={formatNumber(row.lgOverLambda, 2)}
                    </span>
                    <span className="text-xs tabular-nums text-slate-500">
                      {Number.isFinite(row.lengthMm) ? `≈${formatNumber(row.lengthMm, 1)}mm` : "—"}
                      {row.lgOverLambda === GROUND_PLANE_RECOMMENDED_FRACTION ? "（λ/4・推奨）" : ""}
                    </span>
                    <span className="text-right font-semibold tabular-nums text-slate-900">
                      {formatNumber(row.efficiencyDropDb, 1)}dB
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              この効率低下を
              <Link
                href="/tools/rf-basic-link-calculator"
                className="mx-1 inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                リンクバジェット診断のアンテナ利得
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
              に反映すると、小型化の代償を通信距離で見積もれます。λ/4のGNDが物理的に確保できない
              小型筐体では、
              <a
                className="mx-1 rounded font-semibold text-staf-dark underline decoration-staf/40 underline-offset-2 transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
                href={CONTACT_URL}
              >
                筐体・基板込みの実測評価のご相談へ
              </a>
              。
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="側面ミニ図＋効率低下カーブ"
          title="GNDプレーン最長辺と効率低下"
          description="上段は「アンテナ(λ/4)｜GNDプレーン(Lg)｜鏡像」の側面図で、GNDが短いほど鏡像が欠けます。下段は横軸 Lg/λ の効率低下カーブ（目安表の区分線形補間）です。入力に連動し、λ/4基準線と現在点マーカーで確認できます。"
          exportName="ground-plane-size-diagram"
          caption={
            result
              ? `条件: ${formatNumber(frequencyMHz)}MHz（λ=${formatNumber(result.wavelengthMm, 1)}mm）／ Lg=${formatNumber(groundLengthMm, 1)}mm（Lg/λ=${formatNumber(result.lgOverLambda, 3)}）─ 効率低下 ${formatDropValue(result.efficiencyDropDb)}dB。TI AN058等の目安の区分線形補間で、共振ずれ・整合ずれは含みません（実測前提）。`
              : "入力値を確認してください。"
          }
        >
          {result ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <GroundPlaneDiagram
                lgOverLambda={result.lgOverLambda}
                groundLengthMm={groundLengthMm}
                efficiencyDropDb={result.efficiencyDropDb}
              />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認すると側面図と効率低下カーブが表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜGNDの寸法でアンテナ効率が決まるのか"
          formula="Lg/λ = Lg ÷ 波長　効率低下[dB] = 目安表(Lg/λ)の区分線形補間　Lg/λ≥0.25（λ/4確保）で0dB"
          showColumnLink={false}
        >
          <p>
            <strong>① λ/4モノポールは「半分しかないアンテナ」です。</strong>
            基本のダイポールアンテナは全長λ/2の一対の素子ですが、チップアンテナやIFAは
            その半分（λ/4）しか持っていません。残り半分はどこにあるのか——
            <strong>GNDプレーンに映る鏡像</strong>が担っています。導体面は電波にとって鏡のように
            振る舞い、面の中に逆さまのアンテナが映って、本物と合わせて1本のダイポールとして動きます。
          </p>
          <p>
            <strong>② GNDが短いと鏡像が欠け、効率が落ちます。</strong>
            鏡が小さければ全身は映りません。同じように、GND最長辺 Lg が λ/4 より短いと鏡像が
            不完全になり、電波として放射できる電力が減ります。この低下は寸法mmそのものではなく
            <strong>波長比 Lg/λ</strong> で決まるのがポイントで、ベンダーの実測系の目安では
            λ/10で約-6dB（電力1/4）、λ/20で約-12dB（1/16）まで落ちます。
            ※「鏡」のたとえは無限に広い導体面での近似で、実際はGND上を流れるRF電流が
            アンテナの一部として放射しています。
          </p>
          <p>
            <strong>③ 推奨はGND最長辺でλ/4以上の確保です。</strong>
            Lg/λ≥0.25 なら鏡像がほぼ完全になり、GND寸法起因の低下は目安0dB。920MHzなら約81mm、
            2.4GHzなら約31mmです。周波数が低いほど必要なGNDは長くなるため、
            <strong>基板の外形を決めた瞬間にアンテナ効率の上限も決まります</strong>。
            なお実機ではGND不足で共振周波数や整合も同時にずれるため、この目安に上乗せの悪化が
            起こりえます。最終確認は実測で行ってください。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <ToolColumnCard
          column={groundPlaneEffectColumn}
          live={result ? { drop: `${formatNumber(result.efficiencyDropDb, 1)}dB` } : undefined}
        />
      </div>

      <MobileResultBar primary={primary} targetId="ground-plane-size-primary-result" />
    </>
  );
}
