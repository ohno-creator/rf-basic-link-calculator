"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { ResultBar } from "@/components/ResultBar";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { pointingLossDb } from "@/lib/rf/pointingMargin";
import { approximateDirectivityDbi, coverageDiameterM } from "@/lib/rf/patchHpbw";
import { formatNumber } from "@/lib/rf/format";
import { PatchHpbwColumn } from "./PatchHpbwColumn";

type Scenario = "ceiling" | "p2p" | "catalog";

export function PatchHpbwPanel(){
  const [hpbw,setHpbw]=useState(65); const [angle,setAngle]=useState(32.5); const [offset,setOffset]=useState(10);
  const [height,setHeight]=useState(3); const [scenario,setScenario]=useState<Scenario>("ceiling"); const [orientation,setOrientation]=useState<"portrait"|"landscape">("portrait");
  const exponent=useMemo(()=>Math.log(.5)/Math.log(Math.cos((hpbw/2)*Math.PI/180)),[hpbw]);
  const power=Math.max(1e-6,Math.cos(Math.min(90,Math.abs(angle))*Math.PI/180)**exponent);
  const relativeDb=10*Math.log10(power); const halfEdge=Math.abs(Math.abs(angle)-hpbw/2)<.6;
  const directivity=approximateDirectivityDbi(hpbw,hpbw); const loss=pointingLossDb(offset,hpbw); const diameter=coverageDiameterM(height,hpbw);
  const pattern=useMemo(()=>{const pts:string[]=[];for(let a=-90;a<=90;a+=2){const p=Math.max(0,Math.cos(Math.abs(a)*Math.PI/180))**exponent;const r=30+150*p;const rad=(a-90)*Math.PI/180;pts.push(`${a===-90?"M":"L"}${280+r*Math.cos(rad)} ${185+r*Math.sin(rad)}`)}return pts.join(" ")},[exponent]);
  const markerRad=(angle-90)*Math.PI/180; const markerR=30+150*power; const primary={label:"現在角の相対利得",value:formatNumber(relativeDb,1),unit:"dB"};
  return <>
    <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]"><Card as="section" padding="lg"><h2 className="text-xl font-bold">半値角とは何か</h2><p className="mt-2 text-sm text-slate-600">本ツールのHPBWは左右の−3dB点を結ぶ<strong>半値全角</strong>です。</p>
      <svg role="img" viewBox="0 0 560 380" className="mt-4 w-full" data-testid="patch-hpbw-pattern" data-relative-db={relativeDb.toFixed(2)} data-half-edge={halfEdge}><rect width="560" height="380" fill={chartTheme.surface.canvas}/><path d={pattern} fill={chartTheme.series.gain} opacity=".25" stroke={chartTheme.seriesText.source} strokeWidth="3"/><line x1="280" y1="185" x2={280+markerR*Math.cos(markerRad)} y2={185+markerR*Math.sin(markerRad)} stroke={halfEdge?diagramPalette.danger:diagramPalette.ink} strokeWidth="3"/><circle cx={280+markerR*Math.cos(markerRad)} cy={185+markerR*Math.sin(markerRad)} r="7" fill={halfEdge?diagramPalette.danger:diagramPalette.amber}/><text x="280" y="345" textAnchor="middle" fill={diagramPalette.ink} fontSize="16" fontWeight="700">{halfEdge?"ここが半値角の端（−3dB・電力半分）":`角度 ${angle.toFixed(1)}° → ${relativeDb.toFixed(1)}dB`}</text></svg>
      <label className="mt-3 block text-sm font-semibold">角度マーカー {angle.toFixed(1)}°<input data-testid="patch-angle-slider" type="range" min="-90" max="90" step=".5" value={angle} onChange={e=>setAngle(Number(e.target.value))} className="mt-2 w-full"/></label><label className="mt-4 block text-sm font-semibold">半値全角 HPBW {hpbw}°<input data-testid="patch-hpbw-slider" type="range" min="30" max="120" value={hpbw} onChange={e=>{const next=Number(e.target.value);setHpbw(next);setOffset(current=>Math.min(current,next))}} className="mt-2 w-full"/></label>
    </Card><div className="space-y-4 lg:sticky lg:top-20"><div id="patch-hpbw-primary-result"><ResultBar primary={primary} judgement={{label:halfEdge?"電力が半分になる境界":"角度マーカーを走査中",level:halfEdge?"caution":"good"}}/></div><MetricCard label="半値全角" value={String(hpbw)} unit="°" sub={`片側の端は ±${formatNumber(hpbw/2,1)}°`}/><div data-testid="patch-directivity"><MetricCard label="概算指向性" value={formatNumber(directivity,1)} unit="dBi" sub="D≈41253/(θE·θH)、±1〜2dBの粗い目安"/></div><Link href="/tools/db-feel" className="block rounded-lg border p-3 text-sm font-semibold text-staf-dark">−3dB＝電力半分を体感 →</Link><div className="grid gap-2 sm:grid-cols-2"><Link href="/tools/aperture-gain-beamwidth" className="rounded-lg border p-3 text-sm font-semibold text-staf-dark">開口とビーム幅 →</Link><Link href="/tools/patch-antenna-dimensions" className="rounded-lg border p-3 text-sm font-semibold text-staf-dark">パッチ寸法 →</Link></div></div></section>

    <Card as="section" padding="lg" className="mt-6"><h2 className="text-xl font-bold">なぜ半値角が重要か</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><div className="rounded-lg border p-4"><h3 className="font-bold">利得との表裏</h3><p className="mt-2 text-sm">HPBW {hpbw}° → 概算 {formatNumber(directivity,1)}dBi。絞るほど強く、届く方向は狭くなります。</p></div><div className="rounded-lg border p-4"><h3 className="font-bold">設置ずれ耐性</h3><label className="mt-2 block text-sm">ずれ角 {offset}°<input data-testid="patch-offset-slider" type="range" min="0" max={hpbw} value={offset} onChange={e=>setOffset(Number(e.target.value))} className="mt-2 w-full"/></label><p className="mt-2 text-lg font-bold">損失 {formatNumber(loss,2)}dB</p><p className="text-xs text-slate-500">L=12(θ/HPBW)²（主ローブ内の近似）</p></div></div></Card>

    <Card as="section" padding="lg" className="mt-6"><h2 className="text-xl font-bold">実際にはどう使われるか</h2><div className="mt-3 flex flex-wrap gap-2">{([['ceiling','天井GW'],['p2p','P2P照準'],['catalog','カタログE/H面']] as const).map(([id,label])=><button key={id} type="button" onClick={()=>setScenario(id)} className={`rounded-full border px-3 py-2 text-sm font-semibold ${scenario===id?'bg-staf text-white':'border-slate-200'}`}>{label}</button>)}</div>
      {scenario==='ceiling'?<div className="mt-4"><label className="text-sm font-semibold">天井高 {height}m<input type="range" min="2" max="12" step=".5" value={height} onChange={e=>setHeight(Number(e.target.value))} className="mt-2 w-full"/></label><div className="mt-3 rounded-lg bg-slate-50 p-6 text-center"><div className="mx-auto rounded-[50%] border-4 border-staf bg-staf-light/50" style={{width:`${Math.min(100,diameter/15*100)}%`,aspectRatio:'2/1'}}/><p className="mt-3 font-bold" data-testid="coverage-diameter" data-diameter={diameter.toFixed(2)}>床面−3dBカバー直径 {formatNumber(diameter,2)}m</p></div></div>:null}
      {scenario==='p2p'?<div className="mt-4 rounded-lg border p-4"><p>同じアンテナを両端で使用すると、片側{offset}°ずれの合計損失は<strong>{formatNumber(loss*2,2)}dB</strong>です。</p><Link href="/tools/pointing-margin" className="mt-2 inline-block font-semibold text-staf-dark">照準余裕を詳しく計算 →</Link></div>:null}
      {scenario==='catalog'?<div className="mt-4 rounded-lg border p-4"><table className="w-full text-sm"><tbody><tr><th className="text-left">E面 HPBW</th><td>65°</td></tr><tr><th className="text-left">H面 HPBW</th><td>70°</td></tr></tbody></table><button type="button" data-testid="catalog-orientation" data-orientation={orientation} onClick={()=>setOrientation(v=>v==='portrait'?'landscape':'portrait')} className="mt-3 rounded-lg border px-3 py-2">設置向きを切替：{orientation==='portrait'?'縦':'横'}</button><p className="mt-2 text-sm">設置向きを90°回すと、床面・壁面に対するE面/H面の向きも入れ替わります。</p></div>:null}
    </Card>
    <div className="mt-6"><PatchHpbwColumn/></div><MobileResultBar primary={primary} targetId="patch-hpbw-primary-result" />
  </>;
}
