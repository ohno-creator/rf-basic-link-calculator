"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { GROUND_PLANE_EFFICIENCY_TABLE, GROUND_PLANE_SIZE_SOURCES } from "@/data/groundPlaneSizeData";
import { analyzeGroundPlaneSize, interpolateGroundPlaneEfficiencyChange } from "@/lib/rf/groundPlaneSize";
import { formatNumber } from "@/lib/rf/format";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { GroundPlaneSizeColumn } from "./GroundPlaneSizeColumn";

const presets = [{ label: "920MHz LPWA", mhz: 920 }, { label: "1575MHz GNSS", mhz: 1575 }, { label: "2.4GHz", mhz: 2400 }] as const;
const chipClass = (active: boolean) => `inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${active ? "border-staf bg-staf text-white" : "border-slate-200 bg-white text-slate-600 hover:border-staf/40"}`;

function EfficiencyCurve({ ratio, changeDb }: { ratio: number; changeDb: number }) {
  const width = 660, height = 330, left = 64, right = 30, top = 34, bottom = 58;
  const x = (value: number) => left + (Math.min(0.3, Math.max(0, value)) / 0.3) * (width - left - right);
  const y = (value: number) => top + ((0 - Math.max(-20, Math.min(0, value))) / 20) * (height - top - bottom);
  const samples = Array.from({ length: 61 }, (_, index) => { const r = index * 0.005; return `${x(r)},${y(interpolateGroundPlaneEfficiencyChange(r, GROUND_PLANE_EFFICIENCY_TABLE))}`; }).join(" ");
  return <svg role="img" aria-label={`GND長${formatNumber(ratio, 3)}波長、効率変化${formatNumber(changeDb, 1)}dB`} viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" data-testid="ground-plane-size-diagram" data-ratio={ratio.toFixed(4)} data-change-db={changeDb.toFixed(3)}><rect width={width} height={height} fill={diagramPalette.canvas} />{[-20, -15, -10, -5, 0].map((tick) => <g key={tick}><line x1={left} x2={width-right} y1={y(tick)} y2={y(tick)} stroke={diagramPalette.grid} /><text x={left-8} y={y(tick)+4} textAnchor="end" fill={diagramPalette.muted} fontSize="11">{tick}</text></g>)}<polyline points={samples} fill="none" stroke={diagramPalette.staf} strokeWidth="3" /><line x1={x(0.25)} x2={x(0.25)} y1={top} y2={height-bottom} stroke={diagramPalette.successDeep} strokeDasharray="6 4" /><text x={x(0.25)-5} y={top+14} textAnchor="end" fill={diagramPalette.successDeep} fontSize="11" fontWeight="700">λ/4目安</text><circle cx={x(ratio)} cy={y(changeDb)} r="7" fill={changeDb >= -1 ? diagramPalette.success : changeDb >= -6 ? diagramPalette.warn : diagramPalette.danger} stroke={diagramPalette.white} strokeWidth="2" /><text x={x(ratio)+10} y={y(changeDb)-10} fill={diagramPalette.inkSoft} fontSize="11" fontWeight="700">現在 {formatNumber(changeDb, 1)}dB</text><text x={(left+width-right)/2} y={height-20} textAnchor="middle" fill={diagramPalette.muted} fontSize="12">GND最長辺 / λ</text></svg>;
}

export function GroundPlaneSizePanel() {
  const [frequencyMHz, setFrequencyMHz] = useState(920);
  const [groundLengthMm, setGroundLengthMm] = useState(81.5);
  const result = useMemo(() => { try { return analyzeGroundPlaneSize({ frequencyMHz, groundLengthMm, table: GROUND_PLANE_EFFICIENCY_TABLE }); } catch { return null; } }, [frequencyMHz, groundLengthMm]);
  const primary = { label: "効率変化の目安", value: result ? formatNumber(result.efficiencyChangeDb, 1) : "—", unit: "dB" };
  const judgement = result ? { label: result.efficiencyChangeDb >= -1 ? "GND長は十分" : result.efficiencyChangeDb >= -6 ? "GND不足に注意" : "深刻なGND不足", level: result.efficiencyChangeDb >= -1 ? "good" as const : result.efficiencyChangeDb >= -6 ? "caution" as const : "poor" as const } : undefined;
  return <><section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]"><Card as="section" padding="lg"><h2 className="text-base font-bold text-slate-950">周波数と基板GND</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">基板の最長GND辺を自由空間波長λで割り、代表的な効率変化テーブルを補間します。</p><div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="周波数プリセット">{presets.map((preset) => <button key={preset.mhz} type="button" className={chipClass(frequencyMHz === preset.mhz)} onClick={() => setFrequencyMHz(preset.mhz)}>{preset.label}</button>)}</div><div className="mt-5 space-y-4"><Field id="groundPlaneFrequency" label="周波数" unit="MHz" value={frequencyMHz} min={1} step={10} emptyBehavior="preserve" onChange={setFrequencyMHz} help="自由空間波長λを求めます。" example="920" /><Field id="groundPlaneLength" label="GND最長辺 Lg" unit="mm" value={groundLengthMm} min={0} max={200} step={0.1} showSlider emptyBehavior="preserve" onChange={setGroundLengthMm} help="アンテナが利用できる連続した基板GNDの最長寸法です。" example="81.5" /></div></Card><div className="space-y-4 lg:sticky lg:top-20 lg:self-start"><div id="ground-plane-size-primary-result"><ResultBar primary={primary} judgement={judgement} /></div>{result ? <><Callout tone={result.efficiencyChangeDb >= -1 ? "success" : result.efficiencyChangeDb >= -6 ? "caution" : "danger"} title={judgement?.label}>Lg/λ={formatNumber(result.groundToWavelengthRatio, 3)}。推奨λ/4は {formatNumber(result.recommendedGroundLengthMm, 1)}mmです。</Callout><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><MetricCard label="GND長/λ" value={formatNumber(result.groundToWavelengthRatio, 3)} /><MetricCard label="λ/4との差" value={formatNumber(groundLengthMm-result.recommendedGroundLengthMm, 1)} unit="mm" /></div></> : <Callout tone="danger">入力値を確認してください。</Callout>}</div></section>{result ? <div className="mt-6"><ChartFrame eyebrow="GND寸法" title="GND長/λと効率変化の目安" description="出典付き代表点を区分線形補間し、0.25λ以上は0dBへクランプします。" exportName="ground-plane-efficiency-curve" caption={`出典: ${Object.values(GROUND_PLANE_SIZE_SOURCES).join(" / ")}。λ/4系アンテナの初期目安。`}><EfficiencyCurve ratio={result.groundToWavelengthRatio} changeDb={result.efficiencyChangeDb} /></ChartFrame></div> : null}<div className="mt-6"><FormulaExplanationCard title="GND長のλ換算と補間" formula={"λ0=c/f\nratio=Lg/λ0\n効率変化[dB]=出典付きテーブルの区分線形補間"} showColumnLink={false}><p className="text-sm leading-relaxed text-slate-700">効率変化はdB領域の符号付き値です。負値ほど基準状態から悪化します。</p></FormulaExplanationCard></div><GroundPlaneSizeColumn /><MobileResultBar primary={primary} judgement={judgement} targetId="ground-plane-size-primary-result" /></>;
}
