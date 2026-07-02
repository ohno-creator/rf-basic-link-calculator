// マイクロストリップを曲げると角で反射（不要な容量）が生じる。外側の角を斜めにカット（マイター）
// すると反射が減る。曲げ角度とマイター率に連動する上面図の動的SVG。

import type { BendSignificance } from "@/lib/rf/microstrip";

type MicrostripBendDiagramProps = {
  angleDeg: number;
  miterPercent: number;
  cutbackMm: number;
  significance?: BendSignificance;
};

const OX = 208;
const OY = 150;
const HALF_W = 22;
const IN_LEFT = 40;
const OUT_LEN = 104;

// 曲げ影響の重要度に応じた配色・ラベル（図のマイター面・注記に反映）。
const significanceStyle: Record<
  BendSignificance,
  { stroke: string; fill: string; label: string }
> = {
  negligible: { stroke: "#059669", fill: "rgba(5,150,105,0.16)", label: "影響：ほぼ無視できる" },
  minor: { stroke: "#b45309", fill: "rgba(180,83,9,0.18)", label: "影響：小さめ（対策推奨）" },
  significant: { stroke: "#e11d48", fill: "rgba(225,29,72,0.16)", label: "影響：大きい（要対策）" }
};

function round(value: number): number {
  return Number(value.toFixed(2));
}

function pt(x: number, y: number): string {
  return `${round(x)},${round(y)}`;
}

export function MicrostripBendDiagram({
  angleDeg,
  miterPercent,
  cutbackMm,
  significance = "minor"
}: MicrostripBendDiagramProps) {
  const style = significanceStyle[significance];
  const theta = (Math.min(Math.max(angleDeg, 1), 90) * Math.PI) / 180;
  const w = HALF_W;
  const dx = Math.cos(theta);
  const dy = -Math.sin(theta);
  const nx = Math.sin(theta);
  const ny = Math.cos(theta);

  // 入射バンド（水平）
  const incoming = `${pt(IN_LEFT, OY - w)} ${pt(OX, OY - w)} ${pt(OX, OY + w)} ${pt(IN_LEFT, OY + w)}`;

  // 出射バンド（θだけ上へ曲がる）
  const startOuterX = OX - w * nx;
  const startOuterY = OY - w * ny;
  const startInnerX = OX + w * nx;
  const startInnerY = OY + w * ny;
  const outgoing = `${pt(startOuterX, startOuterY)} ${pt(startOuterX + OUT_LEN * dx, startOuterY + OUT_LEN * dy)} ${pt(startInnerX + OUT_LEN * dx, startInnerY + OUT_LEN * dy)} ${pt(startInnerX, startInnerY)}`;

  // 外側の角（鋭角コーナー）と、マイターのカット端
  const t = (w * (1 - Math.cos(theta))) / Math.sin(theta);
  const pcX = startOuterX + t * dx;
  const pcY = OY - w;
  const cut = Math.min(2 * w, Math.max(4, (miterPercent / 100) * 2 * w));
  const e1X = pcX - cut;
  const e1Y = OY - w;
  const e2X = pcX + cut * dx;
  const e2Y = pcY + cut * dy;

  return (
    <figure className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <figcaption className="text-sm font-semibold text-slate-950">
        上から見た90°マイター曲げ（角の斜めカット）
      </figcaption>
      <svg viewBox="0 0 360 210" role="img" aria-label="マイクロストリップの90°曲げ。外側の角を斜めにカットしたマイター形状を示す上面図。" className="mt-2 w-full">
        {/* 線路（入射・出射） */}
        <polygon points={incoming} fill={style.fill} stroke={style.stroke} strokeWidth="1" />
        <polygon points={outgoing} fill={style.fill} stroke={style.stroke} strokeWidth="1" />

        {/* マイターで切り取る三角（背景色で消す） */}
        <polygon points={`${pt(pcX, pcY)} ${pt(e1X, e1Y)} ${pt(e2X, e2Y)}`} fill="#f8fafc" />
        {/* 元の鋭角コーナー（点線） */}
        <line x1={round(e1X)} y1={round(e1Y)} x2={round(pcX)} y2={round(pcY)} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={round(e2X)} y1={round(e2Y)} x2={round(pcX)} y2={round(pcY)} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
        {/* マイター面（カット線） */}
        <line x1={round(e1X)} y1={round(e1Y)} x2={round(e2X)} y2={round(e2Y)} stroke="#0071BD" strokeWidth="2.5" />

        {/* 中心線と曲げ角 */}
        <line x1={IN_LEFT} y1={OY} x2={OX} y2={OY} stroke="#475569" strokeWidth="1" strokeDasharray="5 4" />
        <line x1={OX} y1={OY} x2={round(OX + OUT_LEN * dx)} y2={round(OY + OUT_LEN * dy)} stroke="#475569" strokeWidth="1" strokeDasharray="5 4" />
        <text x={round(OX - 40)} y={round(OY - 52)} fontSize="12" fontWeight="700" fill="#0071BD">
          マイター {miterPercent.toFixed(0)}%
        </text>
        <text x={IN_LEFT} y={OY + w + 20} fontSize="11" fill="#64748b">
          信号の向き →
        </text>
        <text x={round(OX + 8)} y={round(OY + 26)} fontSize="11" fontWeight="700" fill="#475569">
          {angleDeg.toFixed(0)}°
        </text>
        <text x={IN_LEFT} y={26} fontSize="11" fontWeight="700" fill={style.stroke}>
          {style.label}
        </text>
      </svg>

      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        この図は90°曲げにマイターを施した上面図です（45°×2回や円弧の代替案は本文で提案。図は90°のケースを示します）。曲げの外側の角は、そのままだと余分な容量が付いて反射の原因になります。角を斜めにカット（マイター）すると整合が改善します。対角のカット長は約 {cutbackMm.toFixed(2)} mm
        です。RFで重要な配線は、直角ではなく緩い角度や円弧で曲げるのも有効です。
      </p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        ※ 図形（角度・マイター形状）は周波数では変わりません。周波数は上の「曲げの影響」の判定（W/λg比）と枠の色に反映されます。
      </p>
    </figure>
  );
}
