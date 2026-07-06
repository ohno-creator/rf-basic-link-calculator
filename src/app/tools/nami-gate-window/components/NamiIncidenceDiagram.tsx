import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";

// 電波の入射角を「窓面の法線に対してどの向きから来るか」と「室内のどちらへビームが向くか」で
// 可視化する動的SVG。入射角スライダーに連動して波の矢印と室内ビームが回転する。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目: v4 R4方式）。

type NamiIncidenceDiagramProps = {
  /** 窓面法線に対する入射角[deg]（-60〜60）。0°が正面。 */
  incidentAngleDeg: number;
};

const W = 320;
const H = 200;
const CX = W / 2; // 窓面（＝ナミゲート）の位置
const GLASS_Y0 = 40;
const GLASS_Y1 = H - 40;
const GLASS_MID = (GLASS_Y0 + GLASS_Y1) / 2;

// 角度→画面上の方向ベクトル。0°=水平（法線方向）、正で下向き・負で上向きに傾ける。
function dir(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { cos: Math.cos(rad), sin: Math.sin(rad) };
}

export function NamiIncidenceDiagram({ incidentAngleDeg }: NamiIncidenceDiagramProps) {
  const clamped = Math.max(-60, Math.min(60, Number.isFinite(incidentAngleDeg) ? incidentAngleDeg : 0));
  const d = dir(clamped);
  const rayLen = 96;

  // 屋外側（左）から窓面中央へ入射する3本の波の矢印（入射角ぶん傾ける）。
  const rays = [-1, 0, 1].map((offset) => {
    const startY = GLASS_MID + offset * 30 - d.sin * rayLen;
    const startX = CX - d.cos * rayLen;
    return {
      key: offset,
      x1: startX,
      y1: startY,
      x2: CX,
      y2: GLASS_MID + offset * 30
    };
  });

  // 室内側（右）へ steer されるビーム（入射方向をそのまま透過する向き）。
  const beamLen = 92;
  const beamEndX = CX + d.cos * beamLen;
  const beamEndY = GLASS_MID + d.sin * beamLen;
  // ビームの広がり（扇形）。
  const spread = 14;
  const bd1 = dir(clamped - spread);
  const bd2 = dir(clamped + spread);

  return (
    <svg
      role="img"
      aria-label={`電波の入射角 ${clamped} 度の幾何。左の屋外から窓面へ入射し、室内の入射方向へビームが向く。`}
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
    >
      <rect width={W} height={H} fill={chartTheme.surface.canvas} />

      {/* 屋外 / 室内 のラベル */}
      <text x={16} y={24} fill={diagramPalette.muted} fontSize={11} fontWeight={700}>
        屋外
      </text>
      <text x={W - 16} y={24} textAnchor="end" fill={diagramPalette.muted} fontSize={11} fontWeight={700}>
        室内
      </text>

      {/* 窓ガラス面 */}
      <line x1={CX} y1={GLASS_Y0} x2={CX} y2={GLASS_Y1} stroke={diagramPalette.skyStroke} strokeWidth={3} />
      {/* ナミゲート本体（窓面中央の小箱） */}
      <rect
        x={CX - 6}
        y={GLASS_MID - 16}
        width={12}
        height={32}
        rx={2}
        fill={diagramPalette.staf}
        stroke={diagramPalette.white}
        strokeWidth={1.5}
      />
      <text x={CX} y={GLASS_Y1 + 16} textAnchor="middle" fill={diagramPalette.stafDark} fontSize={10} fontWeight={700}>
        ナミゲート
      </text>

      {/* 法線（点線・水平） */}
      <line
        x1={CX - 70}
        y1={GLASS_MID}
        x2={CX + 70}
        y2={GLASS_MID}
        stroke={diagramPalette.faint}
        strokeDasharray="4 4"
      />
      <text x={CX - 74} y={GLASS_MID - 5} textAnchor="end" fill={diagramPalette.faint} fontSize={9}>
        法線
      </text>

      {/* 入射角の弧＋ラベル */}
      <path
        d={`M ${CX - 42} ${GLASS_MID} A 42 42 0 0 ${d.sin >= 0 ? 1 : 0} ${CX - 42 * d.cos} ${GLASS_MID - 42 * -d.sin}`}
        fill="none"
        stroke={chartTheme.seriesText.gain}
        strokeWidth={1.5}
      />
      <text
        x={CX - 52}
        y={GLASS_MID - 20 * (d.sin >= 0 ? -1 : 1)}
        textAnchor="end"
        fill={chartTheme.seriesText.gain}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        θ={clamped}°
      </text>

      {/* 入射波の矢印（屋外→窓面） */}
      <defs>
        <marker id="nami-inc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={diagramPalette.staf} />
        </marker>
      </defs>
      {rays.map((r) => (
        <line
          key={r.key}
          x1={r.x1}
          y1={r.y1}
          x2={r.x2}
          y2={r.y2}
          stroke={diagramPalette.staf}
          strokeWidth={2}
          markerEnd="url(#nami-inc-arrow)"
        />
      ))}

      {/* 室内ビーム（窓面→室内・入射方向へ steer） */}
      <polygon
        points={`${CX},${GLASS_MID} ${CX + bd1.cos * beamLen},${GLASS_MID + bd1.sin * beamLen} ${CX + bd2.cos * beamLen},${GLASS_MID + bd2.sin * beamLen}`}
        fill={chartTheme.series.gain}
        opacity={0.18}
      />
      <line
        x1={CX}
        y1={GLASS_MID}
        x2={beamEndX}
        y2={beamEndY}
        stroke={chartTheme.seriesText.gain}
        strokeWidth={2}
        strokeDasharray="5 3"
      />
      <text
        x={beamEndX + (d.cos >= 0 ? 4 : -4)}
        y={beamEndY + (d.sin >= 0 ? 12 : -6)}
        textAnchor={d.cos >= 0 ? "start" : "end"}
        fill={chartTheme.seriesText.gain}
        fontSize={10}
        fontWeight={700}
      >
        室内へ向くビーム
      </text>
    </svg>
  );
}
