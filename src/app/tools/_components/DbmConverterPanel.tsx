"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { SegmentedControl } from "@/components/SegmentedControl";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { calculateEirp, dbiToDbd, dbiToLinear } from "@/lib/rf/antenna";
import { dbmToMw, mwToDbm, mwToW, wToDbm, wToMw } from "@/lib/rf/db";
import { formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { DecibelScaleVisual } from "./DecibelScaleVisual";
import { ToolColumnCard } from "@/components/ToolColumnCard";
import { dbmConverterColumn } from "@/data/columns/dbmConverter";

type Mode = "dbm" | "mw" | "w";

const modes: Array<{ id: Mode; label: string }> = [
  { id: "dbm", label: "dBm" },
  { id: "mw", label: "mW" },
  { id: "w", label: "W" }
];

function formatPower(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e6 || abs < 1e-4) return value.toExponential(3);
  return Number.parseFloat(value.toPrecision(4)).toString();
}

// ---- dBm⇔mW 対数スケールの二段ルーラー（入力連動の動的SVG） ---------------------------
// 上段=dBm（等間隔＝足し算の世界）／下段=mW（10倍ずつ＝掛け算の世界）を、同じ物理間隔で
// 並べて対応づける。+10dB の一歩が mW では ×10 になる「掛け算が足し算になる」魔法を1枚で示す。
// 現在の入力値がマーカーとして両ルーラー上を連動して動く。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目: v4 R4方式）。
function formatMwTick(dbm: number): string {
  const mw = 10 ** (dbm / 10);
  if (mw >= 1000) {
    return `${Number.parseFloat((mw / 1000).toPrecision(3))}W`;
  }
  return `${Number.parseFloat(mw.toPrecision(3))}mW`;
}

function DbmScaleRuler({ currentDbm, currentMw }: { currentDbm: number; currentMw: number }) {
  const chart = { width: 680, height: 300, left: 64, right: 30 };
  const plotWidth = chart.width - chart.left - chart.right;
  const dbmRulerY = 108;
  const mwRulerY = 214;

  // 現在値を必ず含むよう、10dB刻みのデケード目盛りで軸範囲を決める（余白±10dB）。
  const decadeMin = Math.floor((Math.min(currentDbm, 0) - 10) / 10) * 10;
  const decadeMax = Math.ceil((Math.max(currentDbm, 30) + 10) / 10) * 10;
  const span = Math.max(10, decadeMax - decadeMin);
  const decades: number[] = [];
  for (let d = decadeMin; d <= decadeMax + 1e-9; d += 10) {
    decades.push(d);
  }

  const x = (v: number) => chart.left + ((v - decadeMin) / span) * plotWidth;
  const clampedDbm = Math.min(Math.max(currentDbm, decadeMin), decadeMax);
  const markerX = x(clampedDbm);
  const showStepLabels = decades.length - 1 <= 6; // 目盛りが多いときは +10dB/×10 注記を省いて混雑を避ける

  // マーカー数値ラベルの寄せ（端で切れないよう調整）。
  const markerAnchor =
    markerX < chart.left + 46 ? "start" : markerX > chart.width - chart.right - 46 ? "end" : "middle";
  const markerLabelX =
    markerAnchor === "start" ? markerX + 6 : markerAnchor === "end" ? markerX - 6 : markerX;

  return (
    <svg
      role="img"
      aria-label={`dBmとmWの対応ルーラー。現在 ${formatPower(currentDbm)}dBm は ${formatPower(currentMw)}mW`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />

      {/* 左端の軸見出し（右寄せ） */}
      <text
        x={chart.left - 12}
        y={dbmRulerY + 4}
        textAnchor="end"
        fill={chartTheme.seriesText.source}
        fontSize={12}
        fontWeight={700}
      >
        dBm
      </text>
      <text x={chart.left - 12} y={dbmRulerY + 20} textAnchor="end" fill={diagramPalette.muted} fontSize={9}>
        足し算
      </text>
      <text
        x={chart.left - 12}
        y={mwRulerY + 4}
        textAnchor="end"
        fill={diagramPalette.warnDeep}
        fontSize={12}
        fontWeight={700}
      >
        mW
      </text>
      <text x={chart.left - 12} y={mwRulerY + 20} textAnchor="end" fill={diagramPalette.muted} fontSize={9}>
        掛け算
      </text>

      {/* ルーラー本体 */}
      <line
        x1={x(decadeMin)}
        x2={x(decadeMax)}
        y1={dbmRulerY}
        y2={dbmRulerY}
        stroke={chartTheme.series.source}
        strokeWidth={2.5}
      />
      <line
        x1={x(decadeMin)}
        x2={x(decadeMax)}
        y1={mwRulerY}
        y2={mwRulerY}
        stroke={diagramPalette.warn}
        strokeWidth={2.5}
      />

      {decades.map((d, index) => {
        const tickX = x(d);
        const nextX = index < decades.length - 1 ? x(decades[index + 1]) : tickX;
        const midX = (tickX + nextX) / 2;
        return (
          <g key={d}>
            {/* dBm側の目盛りバーと値 */}
            <line x1={tickX} x2={tickX} y1={dbmRulerY - 9} y2={dbmRulerY} stroke={chartTheme.series.source} strokeWidth={2} />
            <text
              x={tickX}
              y={dbmRulerY - 15}
              textAnchor="middle"
              fill={chartTheme.seriesText.source}
              fontSize={11}
              fontWeight={600}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {d}
            </text>
            {/* mW側の目盛りバーと値 */}
            <line x1={tickX} x2={tickX} y1={mwRulerY} y2={mwRulerY + 9} stroke={diagramPalette.warn} strokeWidth={2} />
            <text
              x={tickX}
              y={mwRulerY + 22}
              textAnchor="middle"
              fill={diagramPalette.warnDeep}
              fontSize={11}
              fontWeight={600}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatMwTick(d)}
            </text>

            {/* 区間ごとの「+10dB」「×10」注記（同じ幅なのに読み方が変わる＝魔法の可視化） */}
            {showStepLabels && index < decades.length - 1 ? (
              <>
                <text
                  x={midX}
                  y={dbmRulerY + 16}
                  textAnchor="middle"
                  fill={chartTheme.seriesText.source}
                  fontSize={10}
                  fontWeight={600}
                >
                  +10dB
                </text>
                <text
                  x={midX}
                  y={mwRulerY - 8}
                  textAnchor="middle"
                  fill={diagramPalette.warnDeep}
                  fontSize={10}
                  fontWeight={700}
                >
                  ×10
                </text>
              </>
            ) : null}
          </g>
        );
      })}

      {/* 現在値マーカー: 両ルーラーを縦の破線で結び、入力に連動して動く */}
      <line
        x1={markerX}
        x2={markerX}
        y1={dbmRulerY}
        y2={mwRulerY}
        stroke={chartTheme.series.total}
        strokeWidth={1.5}
        strokeDasharray={chartTheme.reference.baselineDash}
      />
      <circle cx={markerX} cy={dbmRulerY} r={5} fill={chartTheme.series.total} stroke={chartTheme.surface.plain} strokeWidth={2} />
      <circle cx={markerX} cy={mwRulerY} r={5} fill={chartTheme.series.total} stroke={chartTheme.surface.plain} strokeWidth={2} />
      <text
        x={markerLabelX}
        y={(dbmRulerY + mwRulerY) / 2 - 4}
        textAnchor={markerAnchor}
        fill={chartTheme.seriesText.total}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        現在 {formatPower(currentDbm)}dBm
      </text>
      <text
        x={markerLabelX}
        y={(dbmRulerY + mwRulerY) / 2 + 12}
        textAnchor={markerAnchor}
        fill={chartTheme.seriesText.total}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        = {formatPower(currentMw)}mW
      </text>

      {/* 下部の一言（足し算↔掛け算の対応） */}
      <text x={chart.width / 2} y={chart.height - 14} textAnchor="middle" fill={diagramPalette.muted} fontSize={11}>
        同じ幅の一歩が、上では「+10」・下では「×10」——対数がこの2つを結び付けます
      </text>
    </svg>
  );
}

export function DbmConverterPanel() {
  const [mode, setMode] = useState<Mode>("dbm");
  const [value, setValue] = useState(20);
  const [antennaGainDbi, setAntennaGainDbi] = useState(2.15);
  const [cableLossDb, setCableLossDb] = useState(0.8);

  const result = useMemo(() => {
    try {
      if (mode === "dbm") {
        const mw = dbmToMw(value);
        return { dbm: value, mw, w: mwToW(mw) };
      }
      if (mode === "mw") {
        const dbm = mwToDbm(value);
        return { dbm, mw: value, w: mwToW(value) };
      }
      const mw = wToMw(value);
      return { dbm: wToDbm(value), mw, w: value };
    } catch {
      return null;
    }
  }, [mode, value]);

  const handleModeChange = (nextMode: Mode) => {
    if (nextMode === mode) return;
    try {
      const mw = mode === "dbm" ? dbmToMw(value) : mode === "mw" ? value : wToMw(value);
      const nextValue = nextMode === "dbm" ? mwToDbm(mw) : nextMode === "mw" ? mw : mwToW(mw);
      setValue(Number.parseFloat(nextValue.toPrecision(6)));
    } catch {
      // 空欄など換算不能な入力は保持し、単位だけを切り替える。
    }
    setMode(nextMode);
  };

  const activeMode = modes.find((item) => item.id === mode) ?? modes[0];
  const errorMessage = mode === "dbm" ? "数値を入力してください。" : "0より大きい値を入力してください。";
  const eirp = result
    ? calculateEirp({ txPowerDbm: result.dbm, antennaGainDbi, cableLossDb })
    : null;
  const primaryKind: Mode = mode === "dbm" ? "mw" : "dbm";
  const primary = {
    label: primaryKind === "dbm" ? "dBm換算" : "mW換算",
    value: result ? formatPower(result[primaryKind]) : "—",
    unit: primaryKind === "dbm" ? "dBm" : "mW"
  };
  const secondaryMetrics = result
    ? (["dbm", "mw", "w"] as Mode[])
        .filter((kind) => kind !== mode && kind !== primaryKind)
        .map((kind) => ({
          kind,
          label: `${kind === "dbm" ? "dBm" : kind === "mw" ? "mW" : "W"}換算`,
          value: formatPower(result[kind]),
          unit: kind === "dbm" ? "dBm" : kind === "mw" ? "mW" : "W"
        }))
    : [];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[5fr_4fr]">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <p className="mt-1 text-sm text-slate-600">分かっている電力単位を選び、その値を入力します。</p>
          <div className="mt-5">
            <SegmentedControl
              options={modes}
              value={mode}
              onChange={handleModeChange}
              ariaLabel="入力する電力単位"
              className="w-full justify-center"
            />
          </div>
          <div className="mt-5">
            <Field
              id="dbInput"
              label={`電力（${activeMode.label}）`}
              unit={activeMode.label}
              help="単位切替時も物理量を保ったまま値を換算します。dBmは絶対電力、mWとWは線形電力です。"
              value={value}
              onChange={setValue}
              min={mode === "dbm" ? undefined : 0.000001}
              step={mode === "dbm" ? 0.5 : 0.001}
              error={result ? undefined : errorMessage}
              emptyBehavior="preserve"
            />
          </div>
          <p className="mt-5 rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
            0dBm = 1mW、30dBm = 1Wです。+10dBで電力は10倍になります。
          </p>
        </Card>

        <div id="dbm-primary-result" className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <ResultBar primary={primary} />
          {secondaryMetrics.map((metric) => (
            <MetricCard
              key={metric.kind}
              label={metric.label}
              value={metric.value}
              unit={metric.unit}
              hint="選択した入力単位から換算した派生値です。"
            />
          ))}
          <DecibelScaleVisual currentDbm={result ? result.dbm : null} />
        </div>
      </div>

      <MobileResultBar primary={primary} targetId="dbm-primary-result" />

      <ChartFrame
        eyebrow="対数スケール"
        title="dBm と mW を並べて見る"
        description="上段のdBmは等間隔（足し算の世界）、下段のmWは10倍ずつ（掛け算の世界）。同じ幅の一歩が上では「+10dB」、下では「×10」になります。入力値に連動して現在位置が動きます。"
        exportName="dbm-mw-scale"
        caption={
          result
            ? `現在の入力: ${formatPower(result.dbm)}dBm = ${formatPower(result.mw)}mW = ${formatPower(result.w)}W ─ +10dB ごとに電力は10倍`
            : "有効な数値を入力すると対応ルーラーが表示されます。"
        }
      >
        {result ? (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <DbmScaleRuler currentDbm={result.dbm} currentMw={result.mw} />
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            有効な数値を入力すると、dBmとmWの対応ルーラーが表示されます。
          </p>
        )}
      </ChartFrame>

      <CollapsibleSection title="関連計算：dBi / dBd / EIRP" storageKey="dbm-converter:eirp">
        <p className="mb-4 text-xs leading-relaxed">
          入力電力を送信機出力として、アンテナ利得とケーブル損失を加味した実効放射電力を計算します。
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            id="dbmAntennaGain"
            label="アンテナ利得"
            unit="dBi"
            value={antennaGainDbi}
            step={0.1}
            emptyBehavior="preserve"
            onChange={setAntennaGainDbi}
          />
          <Field
            id="dbmCableLoss"
            label="ケーブル・整合損失"
            unit="dB"
            value={cableLossDb}
            min={0}
            step={0.1}
            emptyBehavior="preserve"
            onChange={setCableLossDb}
          />
        </div>
        {result && eirp ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <MetricCard
              label="dBd換算"
              value={formatPower(dbiToDbd(antennaGainDbi))}
              unit="dBd"
              size="sm"
              sub={`利得倍率 ×${formatPower(dbiToLinear(antennaGainDbi))}`}
            />
            <MetricCard label="アンテナ端子電力" value={formatPower(eirp.antennaInputDbm)} unit="dBm" size="sm" />
            <MetricCard label="EIRP" value={formatPower(eirp.eirpDbm)} unit="dBm" size="sm" sub={`${formatPower(eirp.eirpW)} W`} />
            <MetricCard label="ERP" value={formatPower(eirp.erpDbm)} unit="dBm" size="sm" sub={`${formatPower(eirp.erpW)} W`} />
          </div>
        ) : null}
      </CollapsibleSection>

      <CollapsibleSection title="早見表" storageKey="dbm-converter:quick-reference">
        <div className="grid gap-2 sm:grid-cols-2">
          <p>0dBm = 1mW</p><p>10dBm = 10mW</p><p>20dBm = 100mW</p><p>30dBm = 1W</p>
          <p>+3dB は約2倍</p><p>-10dB は1/10</p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="使い方・用語" storageKey="dbm-converter:guide">
        <ol className="space-y-2">
          <li>1. 仕様書の表記に合わせてdBm・mW・Wを選びます。</li>
          <li>2. 派生値を確認し、リンクバジェットではdBmへそろえます。</li>
          <li>3. 必要なら関連計算を開き、EIRPとERPを確認します。</li>
        </ol>
      </CollapsibleSection>

      <FormulaExplanationCard
        title="数式と理論"
        formula={"mW = 10 ^ (dBm / 10)\ndBm = 10 × log10(mW)\nW = mW / 1000\nEIRP[dBm] = 送信電力[dBm] + 利得[dBi] - 損失[dB]"}
        showColumnLink={false}
      >
        <p>dBmは電力そのもの、dBは比率や損失、dBiはアンテナ利得です。リンクバジェットではdB領域で足し引きします。</p>
      </FormulaExplanationCard>

      <ToolColumnCard
        column={dbmConverterColumn}
        live={result ? { mwToDbm: `${formatNumber(result.dbm, 2)}dBm` } : undefined}
      />
    </div>
  );
}
