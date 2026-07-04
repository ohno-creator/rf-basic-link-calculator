import { DiagramDefs } from "@/components/diagrams/DiagramDefs";
import type { ObstacleKind } from "@/data/fresnelPresets";
import type { ObstacleAnalysis } from "@/lib/rf/fresnel";
import { formatMeters, formatNumber } from "@/lib/rf/format";
import { DIAGRAM_DEF_IDS, diagramRef, diagramStroke, diagramText } from "@/lib/ui/diagramTheme";

// フレネルゾーンの本質＝電波は直線ではなく楕円体の空間を通る。送受間に置いた障害物が
// この楕円（特に60%）に食い込むかを、縦方向は実寸スケールの断面図で示す。

type FresnelZoneDiagramProps = {
  midRadiusM: number;
  positionRatio: number;
  txHeightM: number;
  rxHeightM: number;
  obstacleKind: ObstacleKind;
  obstacleHeightM: number;
  obstacleLabel: string;
  analysis: ObstacleAnalysis;
};

const X0 = 64;
const X1 = 516;
const GROUND_Y = 214;
const TOP_Y = 28;
const DRAW_H = GROUND_Y - TOP_Y;
const N = 60;

const VERDICT_COLOR: Record<ObstacleAnalysis["verdict"], { fill: string; stroke: string; text: string }> = {
  clear: { fill: "rgba(16,185,129,0.25)", stroke: "#047857", text: "#047857" },
  caution: { fill: "rgba(245,158,11,0.32)", stroke: "#b45309", text: "#b45309" },
  blocked: { fill: "rgba(244,63,94,0.30)", stroke: "#be123c", text: "#be123c" }
};

function shape(t: number): number {
  // r(t)/rMid = √(4 t (1-t))（中央で最大、両端で0）
  return Math.sqrt(Math.max(0, 4 * t * (1 - t)));
}

function renderObstacle(
  kind: ObstacleKind,
  cx: number,
  baseY: number,
  topY: number,
  fill: string,
  stroke: string
) {
  const h = Math.max(2, baseY - topY);
  const sw = 1.2;

  if (kind === "person") {
    const headR = Math.max(2.4, Math.min(4, h * 0.16));
    const bodyTop = topY + headR * 2 - 1;
    return (
      <g>
        <circle cx={cx} cy={topY + headR} r={headR} fill={fill} stroke={stroke} strokeWidth={sw} />
        <rect
          x={cx - 2.6}
          y={bodyTop}
          width={5.2}
          height={Math.max(2, baseY - bodyTop)}
          rx={2.6}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      </g>
    );
  }

  if (kind === "car") {
    const w = 42;
    const left = cx - w / 2;
    const cabinH = Math.min(h * 0.45, h);
    const bodyH = Math.max(2, h - cabinH);
    const bodyY = baseY - bodyH;
    return (
      <g>
        <rect x={cx - w * 0.27} y={topY} width={w * 0.54} height={cabinH + 3} rx={4} fill={fill} stroke={stroke} strokeWidth={sw} />
        <rect x={left} y={bodyY} width={w} height={bodyH} rx={6} fill={fill} stroke={stroke} strokeWidth={sw} />
        <circle cx={left + w * 0.24} cy={baseY} r={3.6} fill={stroke} />
        <circle cx={left + w * 0.76} cy={baseY} r={3.6} fill={stroke} />
      </g>
    );
  }

  if (kind === "tree") {
    const canopyR = Math.max(6, Math.min(20, h * 0.36));
    const trunkW = Math.max(4, canopyR * 0.34);
    return (
      <g>
        <rect
          x={cx - trunkW / 2}
          y={topY + canopyR}
          width={trunkW}
          height={Math.max(2, baseY - (topY + canopyR))}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
        <circle cx={cx} cy={topY + canopyR} r={canopyR} fill={fill} stroke={stroke} strokeWidth={sw} />
      </g>
    );
  }

  if (kind === "building") {
    const w = 46;
    const left = cx - w / 2;
    const rows = Math.max(1, Math.min(7, Math.round(h / 16)));
    const windows: number[] = [];
    for (let r = 1; r <= rows; r += 1) {
      windows.push(topY + (h * r) / (rows + 1));
    }
    return (
      <g>
        <rect x={left} y={topY} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={sw} />
        {windows.map((wy) => (
          <line key={wy} x1={left + 5} y1={Number(wy.toFixed(1))} x2={left + w - 5} y2={Number(wy.toFixed(1))} stroke={stroke} strokeWidth={0.8} strokeOpacity={0.6} />
        ))}
      </g>
    );
  }

  // hill: なだらかな山形（二次ベジェの稜線）
  const w = 88;
  const ctrlY = Number((2 * topY - baseY).toFixed(2));
  const path = `M${(cx - w / 2).toFixed(1)},${baseY.toFixed(1)} Q${cx.toFixed(1)},${ctrlY} ${(cx + w / 2).toFixed(1)},${baseY.toFixed(1)} Z`;
  return <path d={path} fill={fill} stroke={stroke} strokeWidth={sw} />;
}

export function FresnelZoneDiagram({
  midRadiusM,
  positionRatio,
  txHeightM,
  rxHeightM,
  obstacleKind,
  obstacleHeightM,
  obstacleLabel,
  analysis
}: FresnelZoneDiagramProps) {
  const losHeightAt = (t: number) => txHeightM + (rxHeightM - txHeightM) * t;

  // 縦スケール（実寸）：フレネル上包絡線のピーク・障害物・アンテナ高から最大値を決める。
  let peakUpper = 0;
  for (let i = 0; i <= N; i += 1) {
    const t = i / N;
    peakUpper = Math.max(peakUpper, losHeightAt(t) + midRadiusM * shape(t));
  }
  const maxHeightM = Math.max(peakUpper, obstacleHeightM, txHeightM, rxHeightM, 0.5) * 1.12;
  const pxPerM = DRAW_H / maxHeightM;
  const y = (h: number) => Number((GROUND_Y - h * pxPerM).toFixed(2));
  const x = (t: number) => Number((X0 + (X1 - X0) * t).toFixed(2));

  const upper: string[] = [];
  const lower: string[] = [];
  const clr60: string[] = [];
  for (let i = 0; i <= N; i += 1) {
    const t = i / N;
    const losH = losHeightAt(t);
    const r = midRadiusM * shape(t);
    upper.push(`${x(t)},${y(losH + r)}`);
    lower.push(`${x(t)},${y(Math.max(0, losH - r))}`);
    clr60.push(`${x(t)},${y(Math.max(0, losH - 0.6 * r))}`);
  }
  const zonePath = `M${upper.join(" L")} L${lower.reverse().join(" L")} Z`;
  const clr60Path = `M${clr60.join(" L")}`;

  const obstacleX = x(positionRatio);
  const obstacleTopY = y(obstacleHeightM);
  const losYatObstacle = y(analysis.losHeightM);
  const color = VERDICT_COLOR[analysis.verdict];

  return (
    <figure className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <figcaption className="text-sm font-semibold text-slate-950">経路の断面図（縦は実寸スケール）</figcaption>
      <svg viewBox="0 0 580 248" role="img" aria-label="送受信アンテナの間に広がる第1フレネルゾーンと、置いた障害物が遮るかどうかを示す断面図。" className="mt-2 w-full">
        <DiagramDefs />
        {/* 空（背景） */}
        <rect x="20" y="12" width="540" height={GROUND_Y - 12} fill={diagramRef(DIAGRAM_DEF_IDS.gradientSky)} />
        {/* 地面 */}
        <rect x="20" y={GROUND_Y} width="540" height="10" fill={diagramRef(DIAGRAM_DEF_IDS.hatchGround)} />
        <line x1="20" y1={GROUND_Y} x2="560" y2={GROUND_Y} stroke="#cbd5e1" strokeWidth={diagramStroke.main} />

        {/* 第1フレネルゾーン */}
        <path d={zonePath} fill="rgba(0,113,189,0.12)" stroke="#0071BD" strokeWidth={diagramStroke.main} />
        {/* 60%クリアランス境界（この線より下に障害物が無ければ実務上クリア） */}
        <path d={clr60Path} fill="none" stroke="#16a34a" strokeWidth={diagramStroke.main} strokeDasharray="5 4" />

        {/* 見通し線(LOS) */}
        <line x1={x(0)} y1={y(txHeightM)} x2={x(1)} y2={y(rxHeightM)} stroke="#0071BD" strokeWidth="1.8" strokeDasharray="6 4" />

        {/* アンテナ（送信・受信） */}
        {[
          { ax: x(0), h: txHeightM, label: "送信" },
          { ax: x(1), h: rxHeightM, label: "受信" }
        ].map((ant) => (
          <g key={ant.label}>
            <line x1={ant.ax} y1={GROUND_Y} x2={ant.ax} y2={y(ant.h)} stroke="#334155" strokeWidth={diagramStroke.emphasis} />
            <circle cx={ant.ax} cy={y(ant.h)} r="4" fill="#0071BD" />
            <text x={ant.ax} y={GROUND_Y + 18} textAnchor="middle" fontSize={diagramText.label.fontSize} fill={diagramText.label.fill}>
              {ant.label} {formatNumber(ant.h, 1)}m
            </text>
          </g>
        ))}

        {/* 障害物 */}
        <g filter={diagramRef(DIAGRAM_DEF_IDS.softShadow)}>
          {renderObstacle(obstacleKind, obstacleX, GROUND_Y, obstacleTopY, color.fill, color.stroke)}
        </g>

        {/* 障害物頂点と見通し線の関係（クリアランス） */}
        <line x1={obstacleX} y1={obstacleTopY} x2={obstacleX} y2={losYatObstacle} stroke={color.stroke} strokeWidth="1" strokeDasharray="3 3" />
        <circle cx={obstacleX} cy={obstacleTopY} r="2.6" fill={color.stroke} />
        <text x={obstacleX} y={Math.min(obstacleTopY, losYatObstacle) - 6} textAnchor="middle" fontSize={diagramText.label.fontSize} fontWeight="700" fill={color.text}>
          {obstacleLabel} {formatNumber(obstacleHeightM, 1)}m
        </text>
      </svg>

      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <div className="rounded-md bg-white p-2 text-center">
          <p className="text-xs text-slate-500">この位置の第1フレネル半径</p>
          <p className="text-base font-bold tabular-nums text-staf-dark">{formatMeters(analysis.firstZoneRadiusM)}</p>
        </div>
        <div className="rounded-md bg-white p-2 text-center">
          <p className="text-xs text-slate-500">クリアランス</p>
          <p className="text-base font-bold tabular-nums" style={{ color: color.text }}>
            {formatMeters(analysis.clearanceM)}
          </p>
        </div>
        <div className="rounded-md bg-white p-2 text-center">
          <p className="text-xs text-slate-500">回折損失の目安</p>
          <p className="text-base font-bold tabular-nums" style={{ color: color.text }}>
            {formatNumber(analysis.diffractionLossDb, 1)} dB
          </p>
        </div>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        青の楕円が第1フレネルゾーン、青破線が見通し線(LOS)、緑破線が60%クリアランスの境界です。障害物の頂点がこの緑破線より下なら回り込み損失はほぼ無視でき、楕円に食い込むほど（さらにLOSを越えるほど）損失が増えます。縦方向はメートルの実寸スケールで描いています。
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
        ※横方向（距離）と縦方向（高さ）の縮尺は異なります（路線断面図と同様）。回折損失はナイフエッジ近似による目安で、樹木・建物の透過・反射や地形の細部は含みません。
      </p>
    </figure>
  );
}
