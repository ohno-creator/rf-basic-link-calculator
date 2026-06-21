import { formatMeters } from "@/lib/rf/format";

// フレネルゾーンの本質＝電波は直線ではなく楕円体の空間を通る。見通しでもこの楕円を
// 障害物が侵すと損失が増える。周波数・距離・障害物位置に連動して楕円と半径が変わる動的SVG。

type FresnelZoneDiagramProps = {
  midRadiusM: number;
  positionRatio: number;
  firstZoneRadiusM: number;
  clearance60M: number;
};

const X0 = 70;
const X1 = 490;
const GROUND = 180;
const LOS_Y = 92;
const N = 60;

function shape(t: number): number {
  // r(t)/rMid = √(4 t (1-t))（中央で最大、両端で0の楕円形状）
  return Math.sqrt(Math.max(0, 4 * t * (1 - t)));
}

export function FresnelZoneDiagram({
  midRadiusM,
  positionRatio,
  firstZoneRadiusM,
  clearance60M
}: FresnelZoneDiagramProps) {
  const heightPx = Math.min(92, Math.max(16, midRadiusM * 3.2));

  const upper: string[] = [];
  const lower: string[] = [];
  for (let i = 0; i <= N; i += 1) {
    const t = i / N;
    const x = X0 + (X1 - X0) * t;
    const offset = heightPx * shape(t);
    upper.push(`${x.toFixed(1)},${(LOS_Y - offset).toFixed(1)}`);
    lower.push(`${x.toFixed(1)},${(LOS_Y + offset).toFixed(1)}`);
  }
  const zonePath = `M${upper.join(" L")} L${lower.reverse().join(" L")} Z`;

  // SSRとクライアントで文字列を一致させるため丸める（ハイドレーション不一致防止）。
  const obstacleX = Number((X0 + (X1 - X0) * positionRatio).toFixed(2));
  const localOffset = Number((heightPx * shape(positionRatio)).toFixed(2));
  // 60%クリアランスは r1 マーカーと同じ縦スケールで描く（数値表示と一致）。
  const clearanceOffset = Number((localOffset * 0.6).toFixed(2));

  return (
    <figure className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <figcaption className="text-sm font-semibold text-slate-950">
        経路で見るフレネルゾーン
      </figcaption>
      <svg viewBox="0 0 560 210" role="img" aria-label="送受信点の間に広がる第1フレネルゾーンの楕円と、障害物位置での半径を示す図。" className="mt-2 w-full">
        {/* 地面 */}
        <line x1="20" y1={GROUND} x2="540" y2={GROUND} stroke="#cbd5e1" strokeWidth="2" />

        {/* 第1フレネルゾーン */}
        <path d={zonePath} fill="rgba(0,113,189,0.12)" stroke="#0071BD" strokeWidth="1.5" />

        {/* 見通し線（LOS） */}
        <line x1={X0} y1={LOS_Y} x2={X1} y2={LOS_Y} stroke="#0071BD" strokeWidth="2" strokeDasharray="6 4" />

        {/* アンテナ（送信・受信） */}
        {[X0, X1].map((x, index) => (
          <g key={x}>
            <line x1={x} y1={GROUND} x2={x} y2={LOS_Y} stroke="#334155" strokeWidth="3" />
            <circle cx={x} cy={LOS_Y} r="5" fill="#0071BD" />
            <text x={x} y={GROUND + 16} textAnchor="middle" fontSize="11" fill="#475569">
              {index === 0 ? "送信" : "受信"}
            </text>
          </g>
        ))}

        {/* 60%クリアランス帯（LOSから0.6×r1まで＝確保すべき範囲） */}
        <rect
          x={X0}
          y={LOS_Y}
          width={X1 - X0}
          height={clearanceOffset}
          fill="rgba(22,163,74,0.10)"
        />
        {/* 60%クリアランスのライン（実務上の判断基準） */}
        <line
          x1={X0}
          y1={LOS_Y + clearanceOffset}
          x2={X1}
          y2={LOS_Y + clearanceOffset}
          stroke="#16a34a"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        <text x={X1 - 2} y={LOS_Y + clearanceOffset - 4} textAnchor="end" fontSize="10" fontWeight="700" fill="#15803d">
          60%クリアランス
        </text>

        {/* 障害物位置の半径マーカー（100%＝r1） */}
        <line
          x1={obstacleX}
          y1={LOS_Y}
          x2={obstacleX}
          y2={LOS_Y + localOffset}
          stroke="#e11d48"
          strokeWidth="2"
        />
        <circle cx={obstacleX} cy={LOS_Y + localOffset} r="3.5" fill="#e11d48" />
        {/* 障害物位置での60%クリアランス点 */}
        <circle cx={obstacleX} cy={LOS_Y + clearanceOffset} r="3" fill="#16a34a" />
        <text x={obstacleX} y={LOS_Y - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0071BD">
          r1
        </text>
      </svg>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div className="rounded-md bg-white p-2 text-center">
          <p className="text-xs text-slate-500">この位置の第1フレネル半径</p>
          <p className="text-lg font-bold text-staf">{formatMeters(firstZoneRadiusM)}</p>
        </div>
        <div className="rounded-md bg-white p-2 text-center">
          <p className="text-xs text-slate-500">60%クリアランス目安</p>
          <p className="text-lg font-bold text-staf">{formatMeters(clearance60M)}</p>
        </div>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        電波は送受信点を結ぶ直線だけでなく、その周囲の楕円体（フレネルゾーン）を通って伝わります。赤線が第1フレネルゾーン半径(r1)、緑の破線が60%クリアランスの目安です。第1フレネルゾーンの60%以上（緑の破線より上）を障害物から空けると、回り込みによる損失を抑えられます。周波数が高い・距離が長いほどゾーンの半径は変わります。
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
        ※この図は模式図です。縦方向（半径）は見やすさのため強調・圧縮しており、実寸の縮尺ではありません。実際の寸法は上の数値をご確認ください。
      </p>
    </figure>
  );
}
