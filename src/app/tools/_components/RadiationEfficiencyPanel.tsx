"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { ResultBar } from "@/components/ResultBar";
import { MobileResultBar } from "@/components/MobileResultBar";
import { Callout } from "@/components/Callout";
import { EFFICIENCY_GUIDELINES, type EfficiencyGuidelineCategory } from "@/data/efficiencyGuidelines";
import { efficiencyDbToPercent, efficiencyPercentToDb, efficiencyToRangeFactor } from "@/lib/rf/radiationEfficiency";
import { formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { RadiationEfficiencyColumn } from "./RadiationEfficiencyColumn";

const filters: { id: "all" | EfficiencyGuidelineCategory; label: string }[] = [
  { id: "all", label: "すべて" }, { id: "external", label: "外付け" },
  { id: "embedded", label: "内蔵" }, { id: "wearable", label: "ウェアラブル" }, { id: "harsh", label: "金属・過酷" }
];

export function RadiationEfficiencyPanel() {
  const [percent, setPercent] = useState(50);
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const db = useMemo(() => efficiencyPercentToDb(percent), [percent]);
  const rangeFactor = efficiencyToRangeFactor(db);
  const primary = { label: "放射効率", value: formatNumber(percent, 1), unit: "%" };
  const judgement = percent >= 50 ? { label: "内蔵アンテナとして良好な目安", level: "good" as const }
    : percent < 20 ? { label: "実装見直しを推奨", level: "poor" as const }
      : { label: "実装条件と実測を確認", level: "caution" as const };
  const visible = EFFICIENCY_GUIDELINES.filter((item) => filter === "all" || item.category === filter);

  return <>
    <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
      <Card as="section" padding="lg">
        <h2 className="text-base font-bold">放射効率を入力</h2>
        <div className="mt-4 space-y-5">
          <Field id="efficiencyPercent" label="放射効率" unit="%" value={percent} min={0.1} max={100} step={0.1} showSlider onChange={setPercent} />
          <Field id="efficiencyDb" label="放射効率（dB）" unit="dB" value={db} min={-30} max={0} step={0.1} showSlider onChange={(value) => { try { setPercent(efficiencyDbToPercent(value)); } catch { /* Fieldの範囲内では到達しない */ } }} />
        </div>
      </Card>
      <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div id="radiation-efficiency-primary-result"><ResultBar primary={primary} judgement={judgement} /></div>
        <MetricCard label="dB表記" value={formatNumber(db, 2)} unit="dB" sub="電力比なので10log10" />
        <MetricCard label="自由空間の距離倍率" value={`×${formatNumber(rangeFactor, 2)}`} sub={`理想効率比で距離 ${formatNumber((rangeFactor - 1) * 100, 0)}%`} />
        <Callout tone={percent < 20 ? "danger" : percent >= 50 ? "success" : "caution"}>50%（約−3dB）超は内蔵として良好な目安。20%（約−7dB）未満では自由空間距離が半分以下になり得るため、実装を見直します。</Callout>
      </div>
    </section>

    <Card as="section" padding="lg" className="mt-6">
      <h2 className="text-base font-bold">実務目安との照合</h2>
      <p className="mt-2 text-sm text-slate-600">代表的な設計目安です。最終判断は実機OTA測定を優先してください。</p>
      <div className="mt-3 flex flex-wrap gap-2">{filters.map((item) => <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`rounded-full border px-3 py-2 text-sm font-semibold ${filter === item.id ? "border-staf bg-staf text-white" : "border-slate-200"}`}>{item.label}</button>)}</div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">{visible.map((item) => { const active = percent >= item.percentLow && percent <= item.percentHigh; return <div key={item.id} data-testid={`efficiency-guideline-${item.id}`} data-active={active} className={`rounded-lg border p-4 ${active ? "border-staf bg-staf-light/40" : "border-slate-200"}`}><div className="flex justify-between gap-3"><strong>{item.situation}</strong><span className="tabular-nums">{item.percentLow}〜{item.percentHigh}%</span></div><p className="mt-2 text-sm text-slate-600">{item.comment}</p>{item.relatedTool ? <Link href={item.relatedTool} className="mt-2 inline-block text-sm font-semibold text-staf-dark">関連ツールへ →</Link> : null}</div>; })}</div>
    </Card>

    <div className="mt-6"><FormulaExplanationCard title="効率・dB・距離の読み替え" formula="η[dB] = 10log10(η[%]/100)\n距離倍率（自由空間） = 10^(η[dB]/20)" showColumnLink={false}><p>効率は電力比なので10log10を使います。一方、自由空間損失は距離に対して20log10で増えるため、効率50%は距離約0.71倍に相当します。遠方界・自由空間で他の条件が同じ場合の目安です。</p></FormulaExplanationCard></div>
    <div className="mt-6"><RadiationEfficiencyColumn /></div>
    <MobileResultBar primary={primary} judgement={judgement} targetId="radiation-efficiency-primary-result" />
  </>;
}
