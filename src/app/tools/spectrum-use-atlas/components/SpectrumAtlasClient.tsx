"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ToolColumnCard } from "@/components/ToolColumnCard";
import { spectrumAtlasColumns } from "@/data/columns/spectrumAtlas";
import { JAPAN_ACTION_PLAN_ITEMS, JAPAN_WG_ACTIVITIES, SPECTRUM_CATEGORY_LABELS, SPECTRUM_ENTRIES, SPECTRUM_REGION_LABELS, type SpectrumEntry, type SpectrumRegion, type SpectrumUseCategory } from "@/data/spectrumUses";
import { chartTheme } from "@/lib/chartTheme";
import { filterByRegionAndCategory, findUsesAtFrequency, searchSpectrumEntries } from "@/lib/rf/spectrumAtlas";

type Mode = "ruler" | "category" | "japan" | "world" | "search";
const modes = [{ id: "ruler", label: "入門" }, { id: "category", label: "用途別" }, { id: "japan", label: "日本詳細" }, { id: "world", label: "世界比較" }, { id: "search", label: "検索一覧" }] as const;
const categories = Object.keys(SPECTRUM_CATEGORY_LABELS) as SpectrumUseCategory[];
const regions = Object.keys(SPECTRUM_REGION_LABELS) as SpectrumRegion[];
const colors = chartTheme.categorical;
const x = (frequencyMHz: number) => ((Math.log10(frequencyMHz) - Math.log10(30)) / 3) * 100;

function Cards({ entries }: { entries: readonly SpectrumEntry[] }) {
  if (!entries.length) return <Card padding="md"><p className="text-sm text-slate-600">この組み合わせの収録データはありません。</p></Card>;
  return <div className="grid gap-3 md:grid-cols-2">{entries.map((entry) => <Card key={entry.id} padding="md">
    <div className="flex justify-between gap-2"><strong>{entry.bandLabel}</strong><span className="text-xs">{entry.status === "confirmed-current" ? "確認済" : entry.status === "planned" ? "計画" : "要確認"}</span></div>
    <p className="mt-1 text-sm tabular-nums text-staf-dark">{entry.rangeMHz.low}〜{entry.rangeMHz.high} MHz</p><p className="mt-2 text-sm text-slate-600">{entry.useSummary}</p><p className="mt-2 text-xs">{SPECTRUM_REGION_LABELS[entry.region]}／{SPECTRUM_CATEGORY_LABELS[entry.category]}</p>
    {entry.sharing ? <p className="mt-2 rounded bg-sky-50 p-2 text-xs">共用 {entry.sharing.mechanism.toUpperCase()}: {entry.sharing.note}</p> : null}<a href={entry.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-staf-dark">出典 →</a>
  </Card>)}</div>;
}

function LogRuler({ frequencyMHz }: { frequencyMHz: number }) {
  return <div className="mt-4 overflow-x-auto" data-testid="spectrum-log-ruler"><svg viewBox="0 0 1000 390" role="img" aria-label={`30MHzから30GHzの対数周波数地図。カーソルは${frequencyMHz}MHz`} className="min-w-[760px] w-full rounded-lg bg-slate-50">
    {[30, 100, 300, 1000, 3000, 10000, 30000].map((tick) => <g key={tick}><line x1={80 + x(tick) * 8.8} x2={80 + x(tick) * 8.8} y1="22" y2="370" stroke={chartTheme.grid.primary}/><text x={80 + x(tick) * 8.8} y="17" textAnchor="middle" fontSize="11" fill={chartTheme.axis.label.fill}>{tick >= 1000 ? `${tick / 1000}GHz` : `${tick}MHz`}</text></g>)}
    {categories.map((category, index) => <g key={category}><text x="72" y={52 + index * 35} textAnchor="end" fontSize="10" fill={chartTheme.axis.label.fill}>{SPECTRUM_CATEGORY_LABELS[category]}</text>{SPECTRUM_ENTRIES.filter((entry) => entry.category === category).map((entry) => <rect key={entry.id} x={80 + x(Math.max(30, entry.rangeMHz.low)) * 8.8} y={39 + index * 35} width={Math.max(2, (x(Math.min(30000, entry.rangeMHz.high)) - x(Math.max(30, entry.rangeMHz.low))) * 8.8)} height="18" rx="3" fill={colors[index % colors.length]} opacity={entry.status === "confirmed-current" ? .75 : .35}><title>{entry.bandLabel}: {entry.rangeMHz.low}〜{entry.rangeMHz.high}MHz</title></rect>)}</g>)}
    <line x1={80 + x(frequencyMHz) * 8.8} x2={80 + x(frequencyMHz) * 8.8} y1="25" y2="370" stroke={chartTheme.reference.sensitivity} strokeWidth="3"/><text x={80 + x(frequencyMHz) * 8.8} y="384" textAnchor="middle" fontSize="11" fontWeight="700" fill={chartTheme.reference.sensitivity}>{frequencyMHz}MHz</text>
  </svg></div>;
}

export function SpectrumAtlasClient() {
  const [mode, setMode] = useState<Mode>("ruler"), [freq, setFreq] = useState(920.5), [category, setCategory] = useState<SpectrumUseCategory>("lpwa-ism"), [region, setRegion] = useState<SpectrumRegion>("japan"), [query, setQuery] = useState(""), [jpTab, setJpTab] = useState<"sharing" | "refarming" | "policy">("sharing");
  const hits = useMemo(() => findUsesAtFrequency(freq), [freq]), selected = useMemo(() => filterByRegionAndCategory(region, category), [region, category]), results = useMemo(() => searchSpectrumEntries(query), [query]);
  return <section data-testid="tool-calculator" className="mx-auto max-w-6xl px-4 py-6"><Card padding="lg"><p className="text-sm font-bold text-staf-dark">非セルラー周波数を世界9地域で比較</p><h1 className="mt-1 text-2xl font-bold">周波数の用途地図</h1><SegmentedControl options={[...modes]} value={mode} onChange={setMode} ariaLabel="周波数地図モード" className="mt-4 flex-wrap"/></Card>
    {mode === "ruler" ? <div className="mt-6"><Card padding="lg"><h2 className="font-bold">30MHz〜30GHzの対数ものさし</h2><LogRuler frequencyMHz={freq}/><label className="mt-4 block">周波数 <span className="tabular-nums">{freq}MHz</span><input data-testid="spectrum-frequency" type="range" min="30" max="30000" step=".5" value={freq} onChange={(event) => setFreq(Number(event.target.value))} className="mt-2 w-full"/></label></Card><div className="mt-4"><Cards entries={hits}/></div></div> : null}
    {mode === "category" ? <div className="mt-6"><div className="flex flex-wrap gap-2">{categories.map((item) => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)} className={`rounded-full border px-3 py-2 ${category === item ? "bg-staf text-white" : ""}`}>{SPECTRUM_CATEGORY_LABELS[item]}</button>)}</div><div className="mt-4"><Cards entries={SPECTRUM_ENTRIES.filter((entry) => entry.category === category)}/></div><ToolColumnCard column={spectrumAtlasColumns[category]}/></div> : null}
    {mode === "japan" ? <div className="mt-6"><div className="flex gap-2">{([["sharing", "共用"], ["refarming", "再編"], ["policy", "政策"]] as const).map(([id, label]) => <button type="button" key={id} aria-pressed={jpTab === id} onClick={() => setJpTab(id)} className={`rounded-full border px-4 py-2 ${jpTab === id ? "bg-staf text-white" : ""}`}>{label}</button>)}</div>{jpTab === "sharing" ? <div className="mt-4"><Cards entries={SPECTRUM_ENTRIES.filter((entry) => entry.region === "japan" && entry.sharing)}/></div> : null}{jpTab === "refarming" ? <div className="mt-4"><Cards entries={SPECTRUM_ENTRIES.filter((entry) => entry.region === "japan" && entry.refarming)}/></div> : null}{jpTab === "policy" ? <div className="mt-4"><div className="grid gap-3 md:grid-cols-2">{JAPAN_ACTION_PLAN_ITEMS.map((item) => <Card key={item.title} padding="md"><strong>{item.title}</strong><p className="mt-2 text-sm">{item.summary}</p><p className="mt-2 text-xs">{item.timeline}／{item.relatedBands.join("・")}</p></Card>)}</div><Card padding="lg" className="mt-4"><h3 className="font-bold">審議会・WG活動</h3><div className="overflow-x-auto"><table data-testid="spectrum-wg-table" className="mt-2 w-full min-w-[560px] text-sm"><tbody>{JAPAN_WG_ACTIVITIES.map((item) => <tr key={item.wgName} className="border-t"><th className="py-2 text-left">{item.wgName}</th><td>{item.scope}</td></tr>)}</tbody></table></div></Card></div> : null}</div> : null}
    {mode === "world" ? <div className="mt-6"><div className="flex flex-wrap gap-2">{regions.map((item) => <button type="button" key={item} aria-pressed={region === item} onClick={() => setRegion(item)} className={`rounded-full border px-3 py-2 ${region === item ? "bg-staf text-white" : ""}`}>{SPECTRUM_REGION_LABELS[item]}</button>)}</div><select aria-label="用途カテゴリ" value={category} onChange={(event) => setCategory(event.target.value as SpectrumUseCategory)} className="mt-3 rounded border px-3 py-2">{categories.map((item) => <option key={item} value={item}>{SPECTRUM_CATEGORY_LABELS[item]}</option>)}</select><div className="mt-4"><Cards entries={selected}/></div></div> : null}
    {mode === "search" ? <div className="mt-6"><input aria-label="周波数用途を検索" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="5.9 / LoRa / DFS" className="w-full rounded border p-3"/><div data-testid="spectrum-search-results" className="mt-4"><Cards entries={results}/></div></div> : null}
  </section>;
}
