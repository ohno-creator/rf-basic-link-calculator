"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Card } from "@/components/Card";
import { Callout } from "@/components/Callout";
import { STANDARD_BAND_RANGES } from "@/data/cellularCarrierBands";
import { MAX_OTA_BANDS } from "@/data/otaBandPresets";
import { findHarmonicHits, type HarmonicClock } from "@/lib/rf/harmonicHunter";
import { analyzeOtaBand } from "@/lib/rf/otaImplementationLoss";
import {
  classifyRequirementMargin,
  desenseDistanceImpact,
  parseOtaMeasurementRows,
  tisRequirementMargin,
  trpRequirementMargin
} from "@/lib/rf/otaExpert";
import { formatNumber, formatSigned } from "@/lib/rf/format";
import type { OtaBandRow } from "./OtaImplementationLossPanel";

const rxBands = STANDARD_BAND_RANGES.flatMap((range) => {
  const rx = range.duplex === "FDD" ? range.downlinkMHz : range.tddMHz;
  return rx ? [{ band: range.key, rxLowMHz: rx[0], rxHighMHz: rx[1] }] : [];
});
const verdictLabel = { pass: "合格", caution: "注意", fail: "不合格" } as const;
type Targets = Record<number, { trp?: number; tis?: number }>;

export function OtaExpertPanel({ rows, setRows, nextId, setNextId, setSelectedId }: {
  rows: OtaBandRow[];
  setRows: Dispatch<SetStateAction<OtaBandRow[]>>;
  nextId: number;
  setNextId: Dispatch<SetStateAction<number>>;
  setSelectedId: Dispatch<SetStateAction<number>>;
}) {
  const [clocks, setClocks] = useState<HarmonicClock[]>([{ name: "TCXO", freqMHz: 26 }]);
  const [targets, setTargets] = useState<Targets>({});
  const [exponent, setExponent] = useState<2 | 3 | 4>(2);
  const [conditions, setConditions] = useState("");
  const [importText, setImportText] = useState("");
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => setConditions(localStorage.getItem("ota-expert-conditions-v1") ?? ""), []);
  const saveConditions = (value: string) => {
    setConditions(value);
    localStorage.setItem("ota-expert-conditions-v1", value);
  };
  const analyses = useMemo(() => rows.map((row) => {
    try { return analyzeOtaBand(row); } catch { return null; }
  }), [rows]);
  const hits = useMemo(() => findHarmonicHits({
    clocks: clocks.filter((clock) => clock.name.trim() && clock.freqMHz > 0), bands: rxBands
  }), [clocks]);
  const bandKey = (label: string) => label.match(/(?:B|n)\d+/i)?.[0] ?? label.trim();

  const applyImport = () => {
    const parsed = parseOtaMeasurementRows(importText);
    setImportErrors(parsed.errors);
    if (!parsed.rows.length) return;
    let id = nextId;
    const imported = parsed.rows.slice(0, MAX_OTA_BANDS).map((row) => ({ id: id++, label: row.band, ...row }));
    setRows(imported);
    setNextId(id);
    setSelectedId(imported[0].id);
  };
  const copyCsv = async () => {
    const header = "Band,Pc[dBm],Sc[dBm],eta[dB],TRP[dBm],TIS[dBm],TRP gap[dB],TIS gap[dB],desense[dB],TRP margin[dB],TIS margin[dB]";
    const lines = rows.map((row, index) => {
      const analysis = analyses[index];
      const target = targets[row.id] ?? {};
      return [row.label, row.conductedPowerDbm, row.conductedSensitivityDbm, row.antennaEfficiencyDb,
        row.trpDbm, row.tisDbm, analysis?.trpGapDb ?? "", analysis?.tisGapDb ?? "", analysis?.desenseDb ?? "",
        target.trp === undefined ? "" : trpRequirementMargin(row.trpDbm, target.trp),
        target.tis === undefined ? "" : tisRequirementMargin(row.tisDbm, target.tis)].join(",");
    });
    await navigator.clipboard.writeText([header, ...lines].join("\n"));
    setCopyStatus("CSVをコピーしました。");
  };

  return <section className="mt-6 space-y-6" data-testid="ota-expert-panel">
    <Card as="section" padding="lg">
      <h2 className="text-base font-bold text-slate-950">干渉源ハンター（高調波マップ）</h2>
      <p className="mt-2 text-sm text-slate-600">FDDは端末受信側のDL帯、TDDは共用帯と照合します。</p>
      <div className="mt-4 space-y-2">{clocks.map((clock, index) => <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input aria-label={`クロック${index + 1}名称`} value={clock.name} onChange={(e) => setClocks((items) => items.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} className="rounded-lg border px-3 py-2" />
        <label className="flex items-center gap-2"><input aria-label={`クロック${index + 1}周波数`} type="number" value={clock.freqMHz} onChange={(e) => setClocks((items) => items.map((item, i) => i === index ? { ...item, freqMHz: Number(e.target.value) } : item))} className="min-w-0 flex-1 rounded-lg border px-3 py-2" />MHz</label>
        <button type="button" disabled={clocks.length === 1} onClick={() => setClocks((items) => items.filter((_, i) => i !== index))} className="rounded-lg border px-3 py-2 disabled:opacity-40">削除</button>
      </div>)}</div>
      <button type="button" data-testid="add-clock-button" disabled={clocks.length >= 8} onClick={() => setClocks((items) => [...items, { name: "USB", freqMHz: 48 }])} className="mt-3 rounded-full border border-dashed border-staf px-4 py-2 text-sm font-semibold text-staf-dark disabled:opacity-40">＋ クロック源を追加（最大8）</button>
      <div className="mt-4 space-y-2" data-testid="harmonic-hits">{rows.map((row, index) => {
        const analysis = analyses[index];
        if (!analysis || analysis.verdict === "clean") return null;
        const rowHits = hits.filter((hit) => hit.band.toLowerCase() === bandKey(row.label).toLowerCase());
        return <div key={row.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm"><strong>{row.label}: デセンス {formatNumber(analysis.desenseDb, 1)}dB</strong>{rowHits.length ? rowHits.map((hit) => <p key={`${hit.clockName}-${hit.order}`}>← {hit.clockName}×{hit.order}次 = {formatNumber(hit.harmonicMHz, 3)}MHz、RX帯端から +{formatNumber(hit.offsetFromEdgeMHz, 3)}MHz</p>) : <p>該当なし。基本波リストの見直し・広帯域ノイズ（DC-DC等）も確認してください。</p>}</div>;
      })}</div>
      <p className="mt-3 text-xs text-slate-500">該当は犯人の当たり付けです。実際の結合量はレイアウト依存のため近傍界測定で確定してください。</p>
    </Card>

    <Card as="section" padding="lg">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-bold">要求値との合否判定</h2><button type="button" onClick={() => setTargets(Object.fromEntries(rows.map((row) => [row.id, { trp: 18, tis: -99 }]))) } className="rounded-full border px-3 py-2 text-sm">社内目標例を入力</button></div>
      <p className="mt-2 text-xs text-slate-500">例: TRP≥18dBm / TIS≤-99dBm。キャリア認証値はNDA資料を確認し、手入力してください。</p>
      <div className="mt-4 space-y-3">{rows.map((row) => {
        const target = targets[row.id] ?? {};
        const trpMargin = target.trp === undefined ? null : trpRequirementMargin(row.trpDbm, target.trp);
        const tisMargin = target.tis === undefined ? null : tisRequirementMargin(row.tisDbm, target.tis);
        const result = (margin: number | null) => margin === null ? "判定なし" : `${formatSigned(margin, "dB")} ${verdictLabel[classifyRequirementMargin(margin)]}`;
        return <div key={row.id} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-3"><strong>{row.label}</strong><label>TRP ≥ <input aria-label={`${row.label} TRP要求値`} type="number" value={target.trp ?? ""} onChange={(e) => setTargets((all) => ({ ...all, [row.id]: { ...all[row.id], trp: e.target.value === "" ? undefined : Number(e.target.value) } }))} className="w-20 rounded border px-2 py-1" /> dBm<br/><span className="text-xs">{result(trpMargin)}</span></label><label>TIS ≤ <input aria-label={`${row.label} TIS要求値`} type="number" value={target.tis ?? ""} onChange={(e) => setTargets((all) => ({ ...all, [row.id]: { ...all[row.id], tis: e.target.value === "" ? undefined : Number(e.target.value) } }))} className="w-20 rounded border px-2 py-1" /> dBm<br/><span className="text-xs">{result(tisMargin)}</span></label></div>;
      })}</div>
    </Card>

    <Card as="section" padding="lg">
      <h2 className="text-base font-bold">デセンス → 通信距離影響</h2>
      <label className="mt-3 block text-sm">伝搬指数 n： <select value={exponent} onChange={(e) => setExponent(Number(e.target.value) as 2 | 3 | 4)} className="rounded border px-3 py-2"><option value="2">2（自由空間）</option><option value="3">3</option><option value="4">4</option></select></label>
      <div className="mt-3 space-y-1 text-sm">{rows.map((row, index) => { const db = Math.max(0, analyses[index]?.desenseDb ?? 0); const impact = desenseDistanceImpact(db, exponent); return <p key={row.id}>{row.label}: {formatNumber(db, 1)}dB → 距離 -{formatNumber(impact.distanceReductionPercent, 1)}%（n={exponent}）</p>; })}</div>
    </Card>

    <Card as="section" padding="lg">
      <h2 className="text-base font-bold">Excel連携・測定条件</h2>
      <label className="mt-3 block text-sm font-semibold">Band, Pc, Sc, η, TRP, TIS の6列<textarea aria-label="OTA測定結果インポート" value={importText} onChange={(e) => setImportText(e.target.value)} className="mt-1 min-h-28 w-full rounded-lg border p-3 font-mono text-sm" /></label>
      <div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={applyImport} className="rounded-lg bg-staf px-4 py-2 font-semibold text-white">一括投入</button><button type="button" onClick={() => void copyCsv()} className="rounded-lg border px-4 py-2 font-semibold">全Band結果をCSVコピー</button></div>
      {importErrors.length ? <div className="mt-3"><Callout tone="danger" title="投入できなかった行">{importErrors.join(" / ")}</Callout></div> : null}
      {copyStatus ? <p className="mt-2 text-sm text-emerald-700">{copyStatus}</p> : null}
      <label className="mt-4 block text-sm font-semibold">測定条件メモ<textarea data-testid="conditions-memo-textarea" value={conditions} onChange={(e) => saveConditions(e.target.value)} placeholder="ファントム有無、温度、姿勢、治具" className="mt-1 min-h-24 w-full rounded-lg border p-3 text-sm" /></label>
    </Card>
  </section>;
}
