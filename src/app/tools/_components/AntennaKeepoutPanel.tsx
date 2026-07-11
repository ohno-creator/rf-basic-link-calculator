"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import {
  ANTENNA_BAND_LABELS,
  ANTENNA_KIND_LABELS,
  ANTENNA_KEEPOUT_SOURCES,
  getAntennaKeepoutRequirement,
  type AntennaBand,
  type AntennaKind
} from "@/data/antennaKeepoutData";
import { evaluateAntennaKeepout, type AntennaKeepoutStatus } from "@/lib/rf/antennaKeepout";
import { formatNumber } from "@/lib/rf/format";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import type { LinkJudgementLevel } from "@/lib/rf/judgement";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { AntennaKeepoutColumn } from "./AntennaKeepoutColumn";

const kinds = Object.keys(ANTENNA_KIND_LABELS) as AntennaKind[];
const bands = Object.keys(ANTENNA_BAND_LABELS) as AntennaBand[];
const chipClass = (active: boolean) =>
  `inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${active ? "border-staf bg-staf text-white" : "border-slate-200 bg-white text-slate-600 hover:border-staf/40"}`;

function present(status: AntennaKeepoutStatus): { label: string; level: LinkJudgementLevel; tone: "success" | "caution" | "danger" } {
  if (status === "success") return { label: "必要領域を確保", level: "good", tone: "success" };
  if (status === "caution") return { label: "やや不足", level: "caution", tone: "caution" };
  return { label: "領域不足", level: "poor", tone: "danger" };
}

function KeepoutDiagram({ requiredWidth, requiredHeight, availableWidth, availableHeight, status }: {
  requiredWidth: number; requiredHeight: number; availableWidth: number; availableHeight: number; status: AntennaKeepoutStatus;
}) {
  const width = 640;
  const height = 340;
  const maxW = Math.max(requiredWidth, availableWidth, 1);
  const maxH = Math.max(requiredHeight, availableHeight, 1);
  const scale = Math.min(420 / maxW, 210 / maxH);
  const reqW = requiredWidth * scale;
  const reqH = requiredHeight * scale;
  const availW = availableWidth * scale;
  const availH = availableHeight * scale;
  const x = 100;
  const y = 70;
  const statusColor = status === "success" ? diagramPalette.successDeep : status === "caution" ? diagramPalette.warnDeep : diagramPalette.dangerDeep;
  return (
    <svg role="img" aria-label={`必要キープアウト${requiredWidth}×${requiredHeight}mmと確保領域${availableWidth}×${availableHeight}mmの比較`} viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" data-testid="antenna-keepout-diagram" data-status={status} data-available-width={availableWidth}>
      <rect width={width} height={height} fill={diagramPalette.canvas} />
      <rect x={x - 28} y={y - 28} width={Math.max(reqW, availW) + 90} height={Math.max(reqH, availH) + 72} rx={12} fill={diagramPalette.white} stroke={diagramPalette.line} />
      <rect x={x} y={y} width={reqW} height={reqH} rx={5} fill={diagramPalette.amberSoft} fillOpacity={0.3} stroke={diagramPalette.amberDeep} strokeWidth={1.5} />
      <text x={x + 8} y={y + 20} fill={diagramPalette.amberDeep} fontSize={12} fontWeight={700}>必要領域 {formatNumber(requiredWidth, 0)}×{formatNumber(requiredHeight, 0)}mm</text>
      <rect x={x} y={y} width={availW} height={availH} rx={5} fill="none" stroke={statusColor} strokeWidth={3} strokeDasharray="8 5" />
      <text x={x} y={y + Math.max(reqH, availH) + 34} fill={statusColor} fontSize={13} fontWeight={700}>確保領域 {formatNumber(availableWidth, 1)}×{formatNumber(availableHeight, 1)}mm</text>
      <rect x={x - 18} y={y + Math.max(reqH, availH) + 52} width={18} height={18} rx={3} fill={diagramPalette.faint} stroke={diagramPalette.inkSoft} />
      <text x={x + 10} y={y + Math.max(reqH, availH) + 66} fill={diagramPalette.inkSoft} fontSize={11}>アンテナ給電側（向きは固定）</text>
    </svg>
  );
}

export function AntennaKeepoutPanel() {
  const [kind, setKind] = useState<AntennaKind>("chip");
  const [band, setBand] = useState<AntennaBand>("2400");
  const [availableWidth, setAvailableWidth] = useState(10);
  const [availableHeight, setAvailableHeight] = useState(4);
  const requirement = getAntennaKeepoutRequirement(kind, band)!;
  const result = useMemo(() => {
    try {
      return evaluateAntennaKeepout({ availableWidthMm: availableWidth, availableHeightMm: availableHeight, requirement });
    } catch { return null; }
  }, [availableWidth, availableHeight, requirement]);
  const presentation = result ? present(result.status) : null;
  const primary = { label: "キープアウト判定", value: presentation?.label ?? "—" };
  const judgement = presentation ? { label: presentation.label, level: presentation.level } : undefined;
  const widthError = !Number.isFinite(availableWidth) || availableWidth < 0 ? "幅は0以上で入力してください。" : undefined;
  const heightError = !Number.isFinite(availableHeight) || availableHeight < 0 ? "高さは0以上で入力してください。" : undefined;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">アンテナと確保領域</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">代表的な必要GND禁止領域と、基板上で確保できるW×Hを同じ向きで比較します。</p>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">アンテナ種別</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="アンテナ種別">{kinds.map((item) => <button key={item} type="button" className={chipClass(kind === item)} onClick={() => setKind(item)}>{ANTENNA_KIND_LABELS[item]}</button>)}</div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">周波数帯</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="周波数帯">{bands.map((item) => <button key={item} type="button" className={chipClass(band === item)} onClick={() => setBand(item)}>{ANTENNA_BAND_LABELS[item]}</button>)}</div>
          </div>
          <div className="mt-5 space-y-4">
            <Field id="keepoutAvailableWidth" label="確保できる幅 W" unit="mm" value={availableWidth} min={0} step={0.5} showSlider max={60} emptyBehavior="preserve" onChange={setAvailableWidth} help="データシート基準図の幅方向と同じ向きで入力します。" example="10" error={widthError} />
            <Field id="keepoutAvailableHeight" label="確保できる高さ H" unit="mm" value={availableHeight} min={0} step={0.5} showSlider max={20} emptyBehavior="preserve" onChange={setAvailableHeight} help="幅の余りで相殺せず、高さ方向を独立に入力します。" example="4" error={heightError} />
          </div>
        </Card>
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="antenna-keepout-primary-result"><ResultBar primary={primary} judgement={judgement} /></div>
          {result && presentation ? <>
            <Callout tone={presentation.tone} title={presentation.label}>必要 {requirement.requiredWidthMm}×{requirement.requiredHeightMm}mm に対し、確保 {formatNumber(availableWidth, 1)}×{formatNumber(availableHeight, 1)}mmです。</Callout>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <MetricCard label="幅の不足" value={formatNumber(result.widthShortfallMm, 1)} unit="mm" tone={result.widthShortfallMm > 0 ? "danger" : "neutral"} />
              <MetricCard label="高さの不足" value={formatNumber(result.heightShortfallMm, 1)} unit="mm" tone={result.heightShortfallMm > 0 ? "danger" : "neutral"} />
            </div>
          </> : <Callout tone="danger">入力値を確認してください。</Callout>}
        </div>
      </section>
      {result ? <div className="mt-6"><ChartFrame eyebrow="実装領域" title="必要キープアウトと確保領域" description="黄塗りが必要領域、破線が確保領域です。" exportName="antenna-keepout-layout" caption={`出典: ${requirement.sourceRefs.map((ref) => ANTENNA_KEEPOUT_SOURCES[ref]).join(" / ")}。代表値のため対象品番データシートを優先。`}><KeepoutDiagram requiredWidth={requirement.requiredWidthMm} requiredHeight={requirement.requiredHeightMm} availableWidth={availableWidth} availableHeight={availableHeight} status={result.status} /></ChartFrame></div> : null}
      <div className="mt-6"><FormulaExplanationCard title="辺ごとの不足率判定" formula={"shortfallW=max(0,Wreq−Wavail)/Wreq\nshortfallH=max(0,Hreq−Havail)/Hreq\nmax(shortfall)<20% → caution / ≥20% → danger"} showColumnLink={false}><p className="text-sm leading-relaxed text-slate-700">W/Hは線形寸法[mm]です。面積が同じでも細長い領域は充足とみなしません。</p></FormulaExplanationCard></div>
      <AntennaKeepoutColumn />
      <MobileResultBar primary={primary} judgement={judgement} targetId="antenna-keepout-primary-result" />
    </>
  );
}
