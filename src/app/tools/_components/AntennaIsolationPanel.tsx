"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { DiagramDefs } from "@/components/diagrams/DiagramDefs";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { calculateAntennaIsolation } from "@/lib/rf/antennaIsolation";
import { formatNumber } from "@/lib/rf/format";
import type { LinkJudgementLevel } from "@/lib/rf/judgement";
import {
  DIAGRAM_DEF_IDS,
  diagramPalette,
  diagramRef,
  diagramStroke,
  diagramText
} from "@/lib/ui/diagramTheme";
import { AntennaIsolationColumn } from "./AntennaIsolationColumn";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

const qualityMeta: Record<
  "good" | "caution" | "insufficient",
  { label: string; level: LinkJudgementLevel }
> = {
  good: { label: "結合量の目安：良好", level: "excellent" },
  caution: { label: "結合量の目安：注意", level: "caution" },
  insufficient: { label: "結合量の目安：不足", level: "poor" }
};

function displaySpacingMm(value: number): number {
  // λ/2などの境界プリセットが丸めで閾値未満へ落ちないよう、0.1mm単位で上側へそろえる。
  return Math.ceil(value * 10) / 10;
}

export function AntennaIsolationPanel() {
  const [frequencyMHz, setFrequencyMHz] = useState(920);
  const [spacingMm, setSpacingMm] = useState(displaySpacingMm(299_792.458 / 920 / 2));
  const [antenna1GainDbi, setAntenna1GainDbi] = useState(2.15);
  const [antenna2GainDbi, setAntenna2GainDbi] = useState(2.15);
  const [targetCouplingDb, setTargetCouplingDb] = useState(-15);

  const result = useMemo(() => {
    try {
      return calculateAntennaIsolation({
        frequencyMHz,
        spacingMm,
        antenna1GainDbi,
        antenna2GainDbi,
        targetCouplingDb
      });
    } catch {
      return null;
    }
  }, [frequencyMHz, spacingMm, antenna1GainDbi, antenna2GainDbi, targetCouplingDb]);

  const judgement = result ? qualityMeta[result.quality] : undefined;
  const primary = {
    label: "結合量 S21",
    value: result ? formatNumber(result.couplingDb, 1) : "—",
    unit: "dB"
  };
  const spacingLog = result ? Math.log2(Math.max(0.125, Math.min(4, result.spacingWavelengths))) : -1;
  const spacingVisualRatio = (spacingLog + 3) / 5;
  const antennaHalfGap = 105 + spacingVisualRatio * 155;
  const antenna1X = 340 - antennaHalfGap;
  const antenna2X = 340 + antennaHalfGap;
  const pathStartX = antenna1X + 24;
  const pathEndX = antenna2X - 24;
  const pathSpan = Math.max(80, pathEndX - pathStartX);
  const pathControlY = result?.isNearFieldEstimate ? 82 : 50;
  const couplingStrength = result ? Math.min(1, Math.max(0, (result.couplingDb + 30) / 25)) : 0.5;
  const pathStrokeWidth = 1.5 + couplingStrength * 5;
  const pathOpacity = 0.35 + couplingStrength * 0.6;
  const pathColor = result?.quality === "good"
    ? diagramPalette.successDeep
    : result?.quality === "insufficient"
      ? diagramPalette.dangerDeep
      : diagramPalette.amberDeep;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:items-start">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">偏波が平行な2アンテナを自由空間に置いた基準値です。</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field id="isolationFrequency" label="動作周波数" unit="MHz" value={frequencyMHz} min={1} step={1} emptyBehavior="invalid" onChange={setFrequencyMHz} help="周波数が高いほど同じ物理間隔を波長比で大きく取れます。" />
            <Field id="isolationSpacing" label="アンテナ間隔" unit="mm" value={spacingMm} min={0.1} step={1} emptyBehavior="invalid" onChange={setSpacingMm} help="アンテナの位相中心間距離です。λ/2未満は近傍界の参考値です。" />
            <Field id="isolationGain1" label="アンテナ1利得" unit="dBi" value={antenna1GainDbi} step={0.1} emptyBehavior="invalid" onChange={setAntenna1GainDbi} help="相手方向の実効利得を入力します。" />
            <Field id="isolationGain2" label="アンテナ2利得" unit="dBi" value={antenna2GainDbi} step={0.1} emptyBehavior="invalid" onChange={setAntenna2GainDbi} help="相手方向の実効利得を入力します。" />
            <Field id="isolationTarget" label="目標結合量" unit="dB" value={targetCouplingDb} max={0} step={1} emptyBehavior="invalid" onChange={setTargetCouplingDb} help="推奨間隔を逆算する目標S21です。−15dBが一つの目安です。" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[0.25, 0.5, 1].map((ratio) => (
              <button
                key={ratio}
                type="button"
                disabled={!result}
                onClick={() => result && setSpacingMm(displaySpacingMm(result.wavelengthMm * ratio))}
                className="inline-flex min-h-11 items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-staf/40 hover:text-staf-dark disabled:opacity-50"
              >
                {ratio}λへ設定
              </button>
            ))}
          </div>
        </Card>

        <div id="isolation-primary-result" className="space-y-4 lg:sticky lg:top-20">
          <ResultBar primary={primary} judgement={judgement} />
          {result ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard label="現在の間隔" value={formatNumber(result.spacingWavelengths, 3)} unit="λ" />
              <MetricCard label={`${formatNumber(targetCouplingDb, 0)}dB達成距離`} value={formatNumber(result.recommendedSpacingMm, 1)} unit="mm" />
              <MetricCard label="波長" value={formatNumber(result.wavelengthMm, 1)} unit="mm" />
              <MetricCard label="距離を2倍にした効果" value="−6.02" unit="dB" />
            </div>
          ) : (
            <Callout tone="danger">周波数と間隔は0より大きい値を入力してください。</Callout>
          )}
          {result?.isNearFieldEstimate ? (
            <Callout tone="warning" title="λ/2未満：近傍界の参考値">
              共有GNDや筐体電流が支配しやすい範囲です。実機のS21をVNAで確認してください。
            </Callout>
          ) : (
            <Callout tone="info">自由空間遠方界の一次目安です。共有GND上では結合が悪化する場合があります。</Callout>
          )}
        </div>
      </section>

      {result ? (
        <Card as="figure" padding="md" className="mt-6">
          <figcaption className="text-base font-bold text-slate-950">アンテナ間隔と結合経路</figcaption>
          <svg
            data-testid="antenna-isolation-diagram"
            data-antenna-1-x={antenna1X.toFixed(2)}
            data-antenna-2-x={antenna2X.toFixed(2)}
            data-path-stroke-width={pathStrokeWidth.toFixed(2)}
            data-near-field={result.isNearFieldEstimate ? "true" : "false"}
            role="img"
            aria-label={`2アンテナの間隔${formatNumber(spacingMm, 1)}mm、${formatNumber(result.spacingWavelengths, 2)}波長、結合量S21 ${formatNumber(result.couplingDb, 1)}dBの自由空間近似図`}
            viewBox="0 0 680 250"
            className="mt-3 h-auto w-full"
          >
            <DiagramDefs />
            <rect x="12" y="12" width="656" height="226" rx="12" fill={diagramPalette.canvas} stroke={diagramPalette.line} strokeWidth={diagramStroke.support} />
            {result.isNearFieldEstimate ? (
              <ellipse cx="340" cy="112" rx={Math.max(70, pathSpan / 2)} ry="75" fill={diagramPalette.skyFill} fillOpacity={0.28} stroke={diagramPalette.skyStroke} strokeWidth={diagramStroke.support} strokeDasharray="5 5" />
            ) : null}
            <g filter={diagramRef(DIAGRAM_DEF_IDS.softShadow)}>
              <line x1={antenna1X} y1="58" x2={antenna1X} y2="164" stroke={diagramPalette.staf} strokeWidth="10" strokeLinecap="round" />
              <line x1={antenna2X} y1="58" x2={antenna2X} y2="164" stroke={diagramPalette.staf} strokeWidth="10" strokeLinecap="round" />
              <rect x={antenna1X - 18} y="164" width="36" height="8" rx="4" fill={diagramRef(DIAGRAM_DEF_IDS.gradientMetal)} />
              <rect x={antenna2X - 18} y="164" width="36" height="8" rx="4" fill={diagramRef(DIAGRAM_DEF_IDS.gradientMetal)} />
            </g>
            <path
              d={`M ${pathStartX} 105 C ${pathStartX + pathSpan * 0.28} ${pathControlY}, ${pathEndX - pathSpan * 0.28} ${pathControlY}, ${pathEndX} 105`}
              fill="none"
              stroke={pathColor}
              strokeWidth={pathStrokeWidth}
              strokeOpacity={pathOpacity}
              strokeLinecap="round"
              markerEnd={diagramRef(DIAGRAM_DEF_IDS.arrowHead)}
            />
            <path
              d={`M ${pathEndX} 130 C ${pathEndX - pathSpan * 0.28} ${224 - pathControlY}, ${pathStartX + pathSpan * 0.28} ${224 - pathControlY}, ${pathStartX} 130`}
              fill="none"
              stroke={pathColor}
              strokeWidth={Math.max(diagramStroke.main, pathStrokeWidth - 1)}
              strokeOpacity={Math.max(0.28, pathOpacity - 0.18)}
              strokeLinecap="round"
              markerEnd={diagramRef(DIAGRAM_DEF_IDS.arrowHeadMuted)}
            />
            <text
              x="340"
              y="121"
              textAnchor="middle"
              fill={pathColor}
              fontSize={diagramText.value.fontSize}
              fontWeight={diagramText.value.fontWeight}
              style={{ fontVariantNumeric: diagramText.value.fontVariantNumeric }}
            >S21 {formatNumber(result.couplingDb, 1)}dB</text>
            {result.isNearFieldEstimate ? (
              <text x="340" y="145" textAnchor="middle" {...diagramText.label} fill={diagramPalette.warnDeep}>λ/2未満：近傍界の参考表示</text>
            ) : null}
            <line
              x1={antenna1X}
              x2={antenna2X}
              y1="200"
              y2="200"
              stroke={diagramPalette.muted}
              strokeWidth={diagramStroke.support}
              markerStart={diagramRef(DIAGRAM_DEF_IDS.arrowHeadMuted)}
              markerEnd={diagramRef(DIAGRAM_DEF_IDS.arrowHeadMuted)}
            />
            <text
              x="340"
              y="222"
              textAnchor="middle"
              fill={diagramText.value.fill}
              fontSize={diagramText.value.fontSize}
              fontWeight={diagramText.value.fontWeight}
              style={{ fontVariantNumeric: diagramText.value.fontVariantNumeric }}
            >{formatNumber(spacingMm, 1)}mm（{formatNumber(result.spacingWavelengths, 2)}λ）</text>
            <text x={antenna1X} y="45" textAnchor="middle" {...diagramText.caption}>アンテナ1</text>
            <text x={antenna2X} y="45" textAnchor="middle" {...diagramText.caption}>アンテナ2</text>
          </svg>
        </Card>
      ) : null}

      <div className="mt-6">
        <FormulaExplanationCard title="Friis遠方界近似" formula={"S21[dB] ≈ 20log10(λ/(4πd)) + G1 + G2\ndtarget = λ/(4π·10^((S21target−G1−G2)/20))"} showColumnLink={false}>
          <p className="text-sm leading-relaxed text-slate-600">d≳λ/2、自由空間、偏波平行、整合済みアンテナの条件で使います。</p>
        </FormulaExplanationCard>
      </div>
      <div className="mt-6">
        <AntennaIsolationColumn />
      </div>
      <MobileResultBar primary={primary} judgement={judgement} targetId="isolation-primary-result" />
    </>
  );
}
