"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import {
  WALL_FREQUENCY_LABELS,
  WALL_MATERIAL_LABELS,
  WALL_PENETRATION_SOURCES,
  getWallPenetrationRange,
  type WallFrequencyBand,
  type WallMaterial
} from "@/data/wallPenetrationData";
import { calculateWallPenetrationLoss } from "@/lib/rf/wallPenetration";
import { formatNumber } from "@/lib/rf/format";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { WallPenetrationColumn } from "./WallPenetrationColumn";

const materials = Object.keys(WALL_MATERIAL_LABELS) as WallMaterial[];
const bands = Object.keys(WALL_FREQUENCY_LABELS) as WallFrequencyBand[];
const chipClass = (active: boolean) =>
  `inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${active ? "border-staf bg-staf text-white" : "border-slate-200 bg-white text-slate-600 hover:border-staf/40"}`;

function WallStackDiagram({ rows, totalMin, totalMax }: {
  rows: Array<{ material: WallMaterial; count: number; min: number; max: number }>;
  totalMin: number;
  totalMax: number;
}) {
  const width = 680;
  const rowHeight = 48;
  const activeRows = rows.filter((row) => row.count > 0);
  const height = Math.max(250, 116 + activeRows.length * rowHeight);
  const scaleMax = Math.max(10, totalMax);
  return (
    <svg role="img" aria-label={`壁${activeRows.reduce((sum, row) => sum + row.count, 0)}枚の透過損失合計${formatNumber(totalMin, 1)}から${formatNumber(totalMax, 1)}dB`} viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" data-testid="wall-penetration-diagram" data-total-min={totalMin} data-total-max={totalMax}>
      <rect width={width} height={height} fill={diagramPalette.canvas} />
      <text x="40" y="34" fill={diagramPalette.inkSoft} fontSize="13" fontWeight="700">建材別の損失レンジ</text>
      {activeRows.length === 0 ? <text x="40" y="110" fill={diagramPalette.muted} fontSize="13">壁を追加すると内訳が表示されます。</text> : null}
      {activeRows.map((row, index) => {
        const y = 64 + index * rowHeight;
        const minWidth = (row.min / scaleMax) * 480;
        const maxWidth = (row.max / scaleMax) * 480;
        return <g key={row.material}>
          <text x="40" y={y + 17} fill={diagramPalette.inkSoft} fontSize="11" fontWeight="600">{WALL_MATERIAL_LABELS[row.material]} ×{row.count}</text>
          <rect x="40" y={y + 24} width={maxWidth} height="14" rx="7" fill={diagramPalette.skySoft} />
          <rect x="40" y={y + 24} width={minWidth} height="14" rx="7" fill={diagramPalette.staf} />
          <text x={Math.min(610, 50 + maxWidth)} y={y + 36} fill={diagramPalette.inkSoft} fontSize="10" fontWeight="700">{formatNumber(row.min, 1)}–{formatNumber(row.max, 1)}dB</text>
        </g>;
      })}
      <line x1="40" x2="630" y1={height - 58} y2={height - 58} stroke={diagramPalette.line} />
      <text x="40" y={height - 27} fill={diagramPalette.stafDeep} fontSize="15" fontWeight="700">合計 {formatNumber(totalMin, 1)}–{formatNumber(totalMax, 1)} dB</text>
    </svg>
  );
}

export function WallPenetrationPanel() {
  const [band, setBand] = useState<WallFrequencyBand>("2400");
  const [counts, setCounts] = useState<Record<WallMaterial, number>>({
    wood: 0, drywall: 2, concrete: 1, reinforced_concrete: 0, glass: 0, low_e_glass: 0, brick: 0
  });

  const rows = useMemo(() => materials.map((material) => {
    const range = getWallPenetrationRange(material, band)!;
    const count = counts[material];
    return { material, count, min: count * range.minimumLossDb, max: count * range.maximumLossDb, range };
  }), [band, counts]);
  const result = useMemo(() => calculateWallPenetrationLoss(rows.map((row) => ({
    count: row.count,
    lossMinDbPerWall: row.range.minimumLossDb,
    lossMaxDbPerWall: row.range.maximumLossDb
  }))), [rows]);
  const hasOpenEndedMaximum = rows.some((row) => row.count > 0 && row.range.maximumIsOpenEnded);
  const primary = { label: "合計透過損失", value: result.wallCount === 0 ? "0" : `${formatNumber(result.minimumLossDb, 1)}–${formatNumber(result.maximumLossDb, 1)}${hasOpenEndedMaximum ? "+" : ""}`, unit: "dB" };
  const updateCount = (material: WallMaterial, delta: number) => setCounts((current) => ({ ...current, [material]: Math.max(0, Math.min(20, current[material] + delta)) }));

  return <>
    <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
      <Card as="section" padding="lg">
        <h2 className="text-base font-bold text-slate-950">周波数帯と通過する壁</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">送受信点を結ぶ経路上にある建材を枚数分追加します。</p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="周波数帯">{bands.map((item) => <button key={item} type="button" className={chipClass(band === item)} onClick={() => setBand(item)}>{WALL_FREQUENCY_LABELS[item]}</button>)}</div>
        <div className="mt-5 divide-y divide-slate-200 rounded-lg border border-slate-200">
          {materials.map((material) => {
            const range = getWallPenetrationRange(material, band)!;
            return <div key={material} className="flex min-h-16 items-center justify-between gap-3 px-3 py-2">
              <div className="min-w-0"><p className="text-sm font-semibold text-slate-900">{WALL_MATERIAL_LABELS[material]}</p><p className="text-xs tabular-nums text-slate-500">1枚 {formatNumber(range.minimumLossDb, 1)}–{formatNumber(range.maximumLossDb, 1)}{range.maximumIsOpenEnded ? "+" : ""}dB</p></div>
              <div className="flex items-center gap-2" aria-label={`${WALL_MATERIAL_LABELS[material]}の枚数`}>
                <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:border-staf/40" onClick={() => updateCount(material, -1)} aria-label={`${WALL_MATERIAL_LABELS[material]}を減らす`}><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center font-bold tabular-nums text-slate-900" data-testid={`wall-count-${material}`}>{counts[material]}</span>
                <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:border-staf/40" onClick={() => updateCount(material, 1)} aria-label={`${WALL_MATERIAL_LABELS[material]}を増やす`}><Plus className="h-4 w-4" /></button>
              </div>
            </div>;
          })}
        </div>
      </Card>
      <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div id="wall-penetration-primary-result"><ResultBar primary={primary} /></div>
        <Callout tone={result.maximumLossDb >= 30 ? "danger" : result.maximumLossDb >= 15 ? "caution" : "info"} title={`${result.wallCount}枚の経路`}>
          dB領域で各壁の損失レンジを加算しています。最悪側は {formatNumber(result.maximumLossDb, 1)}{hasOpenEndedMaximum ? "以上" : ""}dBです。
        </Callout>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><MetricCard label="最小側" value={formatNumber(result.minimumLossDb, 1)} unit="dB" /><MetricCard label="最大側" value={`${formatNumber(result.maximumLossDb, 1)}${hasOpenEndedMaximum ? "+" : ""}`} unit="dB" tone={result.maximumLossDb >= 15 ? "danger" : "neutral"} /></div>
      </div>
    </section>
    <div className="mt-6"><ChartFrame eyebrow="損失内訳" title="建材ごとの透過損失レンジ" description="濃色までが最小側、淡色までが最大側です。" exportName="wall-penetration-breakdown" caption={`周波数帯: ${WALL_FREQUENCY_LABELS[band]}。出典: ${Object.values(WALL_PENETRATION_SOURCES).join(" / ")}。`}><WallStackDiagram rows={rows} totalMin={result.minimumLossDb} totalMax={result.maximumLossDb} /></ChartFrame></div>
    <div className="mt-6"><FormulaExplanationCard title="複数壁のdB加算" formula={"Ltotal,min[dB] = Σ ni·Li,min\nLtotal,max[dB] = Σ ni·Li,max"} showColumnLink={false}><p className="text-sm leading-relaxed text-slate-700">各壁を順に通過する損失は線形電力では乗算、対数のdBでは加算します。</p></FormulaExplanationCard></div>
    <WallPenetrationColumn />
    <MobileResultBar primary={primary} targetId="wall-penetration-primary-result" />
  </>;
}
