// マイクロストリップの本質＝基板の上に細い導体（線路）、下にグラウンド面。
// 線路幅W、基板厚h、誘電率εrで特性インピーダンスが決まる。W/hとεrに連動する断面の動的SVG。

import { DiagramDefs } from "@/components/diagrams/DiagramDefs";
import { diagramPalette, DIAGRAM_DEF_IDS, diagramRef, diagramStroke, diagramText } from "@/lib/ui/diagramTheme";

type MicrostripCrossSectionDiagramProps = {
  widthMm: number;
  heightMm: number;
  dielectricConstant: number;
  impedanceOhms: number;
  effectiveDielectric: number;
  velocityFactor: number;
};

const SUB_LEFT = 28;
const SUB_W = 220;
const GROUND_Y = 166;
const TRACE_H = 7;
const CENTER_X = SUB_LEFT + SUB_W / 2;

function round(value: number): number {
  return Number(value.toFixed(2));
}

export function MicrostripCrossSectionDiagram({
  widthMm,
  heightMm,
  dielectricConstant,
  impedanceOhms,
  effectiveDielectric,
  velocityFactor
}: MicrostripCrossSectionDiagramProps) {
  const scale = 56 / Math.max(widthMm, heightMm);
  const hPx = Math.min(70, Math.max(16, heightMm * scale));
  const wPx = Math.min(SUB_W - 24, Math.max(8, widthMm * scale));
  const subTop = round(GROUND_Y - hPx);
  const traceTop = round(subTop - TRACE_H);
  const traceLeft = round(CENTER_X - wPx / 2);
  const traceRight = round(CENTER_X + wPx / 2);
  const dielectricAlpha = round(
    Math.min(0.5, Math.max(0.06, 0.06 + (dielectricConstant - 1) * 0.045))
  );

  const fringe = [0.35, 0.7, 1.05];

  return (
    <figure className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <figcaption className="text-sm font-semibold text-slate-950">
        断面で見るマイクロストリップ（W・h・εr）
      </figcaption>
      <svg viewBox="0 0 360 196" role="img" aria-label="マイクロストリップ線路の断面図。基板の上の導体とグラウンド面、誘電体を示す。" className="mt-2 w-full">
        <DiagramDefs />
        {/* 誘電体（基板）: 樹脂グラデ＋εr連動の青みオーバーレイ */}
        <rect x={SUB_LEFT} y={subTop} width={SUB_W} height={round(GROUND_Y - subTop)} fill={diagramRef(DIAGRAM_DEF_IDS.gradientResin)} stroke={diagramPalette.line} strokeWidth={diagramStroke.support} />
        <rect x={SUB_LEFT} y={subTop} width={SUB_W} height={round(GROUND_Y - subTop)} fill={`rgba(0,113,189,${dielectricAlpha})`} />
        {/* グラウンド面 */}
        <rect x={SUB_LEFT} y={GROUND_Y} width={SUB_W} height="8" fill={diagramRef(DIAGRAM_DEF_IDS.gradientMetal)} />
        {/* フリンジング電界 */}
        {fringe.map((spread, index) => {
          const leftPath = `M${traceLeft},${traceTop + TRACE_H} Q${round(traceLeft - spread * wPx - 6)},${round((traceTop + GROUND_Y) / 2)} ${round(traceLeft - 4)},${GROUND_Y}`;
          const rightPath = `M${traceRight},${traceTop + TRACE_H} Q${round(traceRight + spread * wPx + 6)},${round((traceTop + GROUND_Y) / 2)} ${round(traceRight + 4)},${GROUND_Y}`;
          return (
            <g key={index} stroke={diagramPalette.staf} strokeWidth="1" fill="none" opacity="0.5" strokeDasharray="3 3">
              <path d={leftPath} />
              <path d={rightPath} />
            </g>
          );
        })}
        {/* 導体（線路）＝図の主役。金属グラデ＋落ち影 */}
        <rect x={traceLeft} y={traceTop} width={round(wPx)} height={TRACE_H} rx="1.5" fill={diagramRef(DIAGRAM_DEF_IDS.gradientMetal)} filter={diagramRef(DIAGRAM_DEF_IDS.softShadow)} />

        {/* ラベル */}
        <text x={CENTER_X} y={round(traceTop - 6)} textAnchor="middle" fontSize="11" fontWeight="700" fill={diagramPalette.inkMuted}>
          導体 W
        </text>
        <text x={CENTER_X} y={round((subTop + GROUND_Y) / 2 + 4)} textAnchor="middle" fontSize="11" fill={diagramPalette.staf}>
          基板 εr {dielectricConstant}
        </text>
        <text x={CENTER_X} y={GROUND_Y + 20} textAnchor="middle" fontSize="11" fill={diagramPalette.inkMuted}>
          グラウンド面（GND）
        </text>
        <text x={SUB_LEFT - 6} y={round((subTop + GROUND_Y) / 2)} textAnchor="end" fontSize="11" fontWeight="700" fill={diagramPalette.inkMuted}>
          h
        </text>

        {/* 右側の数値 */}
        <g transform="translate(266, 36)">
          <text x="0" y="0" {...diagramText.label}>特性インピーダンス</text>
          <text x="0" y="20" fontSize="18" fontWeight="700" fill={diagramPalette.staf} style={{ fontVariantNumeric: diagramText.value.fontVariantNumeric }}>{impedanceOhms.toFixed(1)} Ω</text>
          <text x="0" y="52" {...diagramText.label}>実効比誘電率 εeff</text>
          <text x="0" y="72" fontSize="18" fontWeight="700" fill={diagramPalette.ink} style={{ fontVariantNumeric: diagramText.value.fontVariantNumeric }}>{effectiveDielectric.toFixed(2)}</text>
          <text x="0" y="104" {...diagramText.label}>速度係数 VF</text>
          <text x="0" y="124" fontSize="18" fontWeight="700" fill={diagramPalette.staf} style={{ fontVariantNumeric: diagramText.value.fontVariantNumeric }}>{velocityFactor.toFixed(3)}</text>
        </g>
      </svg>

      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        線路幅Wを広げるとインピーダンスは下がり、基板を厚く（hを大きく）すると上がります。誘電率εrが高いほど下がります。高速デジタルや高周波では、配線を50Ω（差動なら100Ω）に合わせるのが基本です。
      </p>
    </figure>
  );
}
