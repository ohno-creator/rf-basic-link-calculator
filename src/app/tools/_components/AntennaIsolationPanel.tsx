"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { calculateAntennaIsolation } from "@/lib/rf/antennaIsolation";
import { formatNumber } from "@/lib/rf/format";
import type { LinkJudgementLevel } from "@/lib/rf/judgement";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

const qualityMeta: Record<
  "good" | "caution" | "insufficient",
  { label: string; level: LinkJudgementLevel }
> = {
  good: { label: "結合量の目安：良好", level: "excellent" },
  caution: { label: "結合量の目安：注意", level: "caution" },
  insufficient: { label: "結合量の目安：不足", level: "poor" }
};

export function AntennaIsolationPanel() {
  const [frequencyMHz, setFrequencyMHz] = useState(920);
  const [spacingMm, setSpacingMm] = useState(299_792.458 / 920 / 2);
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
                onClick={() => result && setSpacingMm(result.wavelengthMm * ratio)}
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
          <svg role="img" aria-label="2アンテナ間の結合経路" viewBox="0 0 680 220" className="mt-3 h-44 w-full">
            <line x1="115" y1="55" x2="115" y2="165" stroke="currentColor" strokeWidth="10" strokeLinecap="round" className="text-staf" />
            <line x1="565" y1="55" x2="565" y2="165" stroke="currentColor" strokeWidth="10" strokeLinecap="round" className="text-staf" />
            <path d="M145 95 C250 35 430 35 535 95" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="8 6" className="text-sky-500" />
            <path d="M145 125 C250 185 430 185 535 125" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="8 6" className="text-sky-300" />
            <line x1="135" y1="190" x2="545" y2="190" stroke="currentColor" strokeWidth="2" className="text-slate-400" />
            <text x="340" y="212" textAnchor="middle" className="fill-slate-600 text-sm font-semibold">{formatNumber(spacingMm, 1)}mm（{formatNumber(result.spacingWavelengths, 2)}λ）</text>
            <text x="340" y="115" textAnchor="middle" className="fill-slate-800 text-base font-bold">S21 {formatNumber(result.couplingDb, 1)}dB</text>
          </svg>
        </Card>
      ) : null}

      <div className="mt-6">
        <FormulaExplanationCard title="Friis遠方界近似" formula={"S21[dB] ≈ 20log10(λ/(4πd)) + G1 + G2\ndtarget = λ/(4π·10^((S21target−G1−G2)/20))"} showColumnLink={false}>
          <p className="text-sm leading-relaxed text-slate-600">d≳λ/2、自由空間、偏波平行、整合済みアンテナの条件で使います。</p>
        </FormulaExplanationCard>
      </div>
      <MobileResultBar primary={primary} judgement={judgement} targetId="isolation-primary-result" />
    </>
  );
}
