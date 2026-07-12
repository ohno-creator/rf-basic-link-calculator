"use client";

import { useState } from "react";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { TermFrame } from "../TermFrame";

function Experience() {
  const [width, setWidth] = useState(60);
  const half = width / 2;
  const top = 110 - 85 * Math.tan((half * Math.PI) / 180);
  const bottom = 110 + 85 * Math.tan((half * Math.PI) / 180);
  return <div><svg role="img" viewBox="0 0 560 220" className="h-auto w-full" data-testid="experience-beamwidth-svg" data-beamwidth={width}>
    <rect width="560" height="220" fill={chartTheme.surface.canvas}/><circle cx="95" cy="110" r="7" fill={diagramPalette.ink}/>
    <path d={`M95 110 L430 ${Math.max(15, top)} A335 335 0 0 1 430 ${Math.min(205, bottom)} Z`} fill={chartTheme.series.gain} opacity="0.24"/>
    <line x1="95" y1="110" x2="430" y2={Math.max(15, top)} stroke={chartTheme.series.gain} strokeWidth="2"/>
    <line x1="95" y1="110" x2="430" y2={Math.min(205, bottom)} stroke={chartTheme.series.gain} strokeWidth="2"/>
    <text x="445" y="35" fill={diagramPalette.inkSoft} fontSize="12" fontWeight="700">端で −3 dB</text><text x="260" y="105" fill={diagramPalette.ink} fontSize="16" fontWeight="700">HPBW {width}°</text>
  </svg><label className="mt-3 block text-sm font-semibold">半値角 {width}°<input type="range" min="10" max="120" value={width} onChange={(e)=>setWidth(Number(e.target.value))} className="mt-2 w-full"/></label></div>;
}
export function TermBeamwidth(){return <TermFrame termId="beamwidth" title="半値角（ビーム幅）" experienceHint="扇形を広げ、狭いビームほど向き合わせが厳しくなる様子を見ます。" experience={<Experience/>} grasp={["半値角はメインローブがピークから−3dBになる2方向の間隔です。","狭いほど同じ電力を特定方向へ集中できます。","高利得化と設置角度の許容差はトレードオフです。"]} iotPerspective={{text:"固定局の高利得アンテナは施工時の向きずれがリンク余裕を奪います。",toolHref:"/tools/pointing-margin",toolLabel:"方向ずれ損失を計算"}} deepDive={{formula:"HPBW = θ(+3dB edge) − θ(−3dB edge)",body:<p>実際の半値角は測定した放射パターンから読み取ります。この扇形は概念図で、サイドローブは省略しています。</p>}}/>}
