"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { calculateDiversityGain } from "@/lib/rf/diversityGain";
import { calculateWavelengthFromMHz } from "@/lib/rf/frequency";
import { formatNumber } from "@/lib/rf/format";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { DiversityGainColumn } from "./DiversityGainColumn";

const outages = [1, 5, 10] as const;
const chipClass = (active: boolean) => `inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${active ? "border-staf bg-staf text-white" : "border-slate-200 bg-white text-slate-600 hover:border-staf/40"}`;

function GainDiagram({ independent, corrected, rho, spacingRatio }: { independent: number; corrected: number; rho: number; spacingRatio: number }) {
  const max = Math.max(1, independent);
  const bar = (value: number) => (value / max) * 380;
  return <svg role="img" aria-label={`独立時利得${formatNumber(independent, 2)}dB、相関補正後${formatNumber(corrected, 2)}dB`} viewBox="0 0 640 300" className="h-auto w-full" data-testid="diversity-gain-diagram" data-correlation={rho.toFixed(4)} data-corrected-gain={corrected.toFixed(3)}><rect width="640" height="300" fill={diagramPalette.canvas} /><text x="60" y="38" fill={diagramPalette.inkSoft} fontSize="13" fontWeight="700">d/λ={formatNumber(spacingRatio, 3)}　ρe={formatNumber(rho, 3)}</text><text x="60" y="95" fill={diagramPalette.inkSoft} fontSize="12">独立2ブランチ</text><rect x="180" y="72" width={bar(independent)} height="34" rx="7" fill={diagramPalette.skySoft} stroke={diagramPalette.staf} /><text x={190 + bar(independent)} y="94" fill={diagramPalette.stafDeep} fontSize="12" fontWeight="700">{formatNumber(independent, 2)}dB</text><text x="60" y="170" fill={diagramPalette.inkSoft} fontSize="12">相関補正後</text><rect x="180" y="147" width={bar(corrected)} height="34" rx="7" fill={rho < 0.5 ? diagramPalette.success : diagramPalette.warn} /><text x={190 + bar(corrected)} y="169" fill={rho < 0.5 ? diagramPalette.successDeep : diagramPalette.warnDeep} fontSize="12" fontWeight="700">{formatNumber(corrected, 2)}dB</text><line x1="90" x2="550" y1="238" y2="238" stroke={diagramPalette.line} /><circle cx="180" cy="238" r="8" fill={diagramPalette.staf} /><circle cx={180 + Math.min(360, spacingRatio * 360)} cy="238" r="8" fill={diagramPalette.staf} /><text x="180" y="270" fill={diagramPalette.muted} fontSize="11">アンテナ間隔（λ換算）</text></svg>;
}

export function DiversityGainPanel() {
  const [frequencyMHz, setFrequencyMHz] = useState(920);
  const [spacingMm, setSpacingMm] = useState(162.9);
  const [outagePercent, setOutagePercent] = useState(1);
  const computed = useMemo(() => { try { const wavelengthMm = calculateWavelengthFromMHz(frequencyMHz) * 1000; const spacingRatio = spacingMm / wavelengthMm; return { wavelengthMm, spacingRatio, result: calculateDiversityGain({ outagePercent, spacingWavelengths: spacingRatio }) }; } catch { return null; } }, [frequencyMHz, spacingMm, outagePercent]);
  const primary = { label: "相関補正後ダイバーシティ利得", value: computed ? formatNumber(computed.result.correctedGainDb, 2) : "—", unit: "dB" };
  const judgement = computed ? { label: computed.result.correlationAssessment === "effective" ? "相関が低く効果を期待" : "相関が高く効果が限定的", level: computed.result.correlationAssessment === "effective" ? "good" as const : "caution" as const } : undefined;
  return <><section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]"><Card as="section" padding="lg"><h2 className="text-base font-bold text-slate-950">アンテナ間隔とアウテージ条件</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">2ブランチ選択合成を、レイリー環境と一様到来の簡易相関モデルで評価します。</p><div className="mt-4"><p className="text-xs font-semibold text-slate-500">アウテージ率</p><div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="アウテージ率">{outages.map((value) => <button key={value} type="button" className={chipClass(outagePercent === value)} onClick={() => setOutagePercent(value)}>{value}%</button>)}</div></div><div className="mt-5 space-y-4"><Field id="diversityFrequency" label="周波数" unit="MHz" value={frequencyMHz} min={1} step={10} emptyBehavior="preserve" onChange={setFrequencyMHz} help="自由空間波長λを求め、間隔をd/λへ変換します。" example="920" /><Field id="diversitySpacing" label="アンテナ間隔 d" unit="mm" value={spacingMm} min={0} max={500} step={1} showSlider emptyBehavior="preserve" onChange={setSpacingMm} help="2本のアンテナ中心間距離です。" example="162.9" /></div></Card><div className="space-y-4 lg:sticky lg:top-20 lg:self-start"><div id="diversity-gain-primary-result"><ResultBar primary={primary} judgement={judgement} /></div>{computed ? <><Callout tone={computed.result.correlationAssessment === "effective" ? "success" : "caution"} title={judgement?.label}>d/λ={formatNumber(computed.spacingRatio, 3)}、ρe={formatNumber(computed.result.correlationCoefficient, 3)}です。</Callout><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><MetricCard label="独立時利得" value={formatNumber(computed.result.independentGainDb, 2)} unit="dB" /><MetricCard label="相関係数 ρe" value={formatNumber(computed.result.correlationCoefficient, 3)} sub="0に近いほど独立" /></div></> : <Callout tone="danger">入力値を確認してください。</Callout>}</div></section>{computed ? <div className="mt-6"><ChartFrame eyebrow="2ブランチ比較" title="独立時と相関補正後の利得" description="相関が高いほど、2本目のアンテナが同じフェージングを受けて利得が減ります。" exportName="diversity-gain-comparison"><GainDiagram independent={computed.result.independentGainDb} corrected={computed.result.correctedGainDb} rho={computed.result.correlationCoefficient} spacingRatio={computed.spacingRatio} /></ChartFrame></div> : null}<div className="mt-6"><FormulaExplanationCard title="選択合成と相関近似" formula={"Pout,N=(1−e^(−x))^N\nρe≈J0²(2πd/λ)\nGcorr≈Gindependent·√(1−ρe)"} showColumnLink={false}><p className="text-sm leading-relaxed text-slate-700">p、d/λ、ρeは無次元、利得はdBです。相関補正は設計目安であり厳密な合成CDFではありません。</p></FormulaExplanationCard></div><DiversityGainColumn /><MobileResultBar primary={primary} judgement={judgement} targetId="diversity-gain-primary-result" /></>;
}
