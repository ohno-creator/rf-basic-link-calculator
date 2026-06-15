// 同軸線路の本質＝特性インピーダンスは導体の寸法比 D/d と誘電体（εr）でほぼ決まる。
// 入力の D・d・εr に連動して、断面の比率と誘電体の色が変わる動的SVG。

type CoaxCrossSectionDiagramProps = {
  outerInnerDiameter: number;
  innerOuterDiameter: number;
  dielectricConstant: number;
  impedanceOhms: number;
  velocityFactor: number;
};

const CX = 116;
const CY = 116;
const OUTER_R = 84;

export function CoaxCrossSectionDiagram({
  outerInnerDiameter,
  innerOuterDiameter,
  dielectricConstant,
  impedanceOhms,
  velocityFactor
}: CoaxCrossSectionDiagramProps) {
  const ratio = outerInnerDiameter / innerOuterDiameter;
  const innerR = Number(Math.min(OUTER_R - 8, Math.max(6, OUTER_R / ratio)).toFixed(2));
  const dielectricAlpha = Number(
    Math.min(0.55, Math.max(0.05, 0.05 + (dielectricConstant - 1) * 0.05)).toFixed(3)
  );

  // SSRとクライアントで文字列が一致するよう、座標は固定桁に丸める（ハイドレーション不一致防止）。
  const fieldLines = Array.from({ length: 12 }, (_, k) => {
    const angle = (k * Math.PI) / 6;
    return {
      x1: Number((CX + innerR * Math.cos(angle)).toFixed(2)),
      y1: Number((CY + innerR * Math.sin(angle)).toFixed(2)),
      x2: Number((CX + OUTER_R * Math.cos(angle)).toFixed(2)),
      y2: Number((CY + OUTER_R * Math.sin(angle)).toFixed(2))
    };
  });

  return (
    <figure className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <figcaption className="text-sm font-semibold text-slate-950">
        断面で見る特性インピーダンス（D/d と εr）
      </figcaption>
      <svg viewBox="0 0 340 232" role="img" aria-label="同軸ケーブルの断面図。外部導体の内径Dと内部導体の外径d、誘電体の比誘電率を示す。" className="mt-2 w-full">
        {/* 誘電体（εrで色の濃さが変わる） */}
        <circle cx={CX} cy={CY} r={OUTER_R} fill={`rgba(0,113,189,${dielectricAlpha})`} />
        {/* 外部導体 */}
        <circle cx={CX} cy={CY} r={OUTER_R} fill="none" stroke="#334155" strokeWidth="6" />
        {/* 電界（内→外の放射状） */}
        {fieldLines.map((line, index) => (
          <line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#0071BD"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.55"
          />
        ))}
        {/* 内部導体 */}
        <circle cx={CX} cy={CY} r={innerR} fill="#334155" />

        {/* 寸法ラベル */}
        <line x1={CX} y1={CY} x2={CX + OUTER_R} y2={CY} stroke="#94a3b8" strokeWidth="1" />
        <text x={CX + OUTER_R / 2} y={CY - 6} textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569">
          D
        </text>
        <text x={CX} y={CY + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#ffffff">
          d
        </text>
        <text x={CX} y={CY + OUTER_R + 18} textAnchor="middle" fontSize="11" fill="#0071BD">
          誘電体 εr {dielectricConstant}
        </text>

        {/* 右側の数値 */}
        <g transform="translate(232, 60)">
          <text x="0" y="0" fontSize="12" fill="#64748b">寸法比 D/d</text>
          <text x="0" y="22" fontSize="20" fontWeight="700" fill="#0f172a">{ratio.toFixed(2)}</text>
          <text x="0" y="58" fontSize="12" fill="#64748b">特性インピーダンス</text>
          <text x="0" y="80" fontSize="20" fontWeight="700" fill="#0071BD">{impedanceOhms.toFixed(1)} Ω</text>
          <text x="0" y="116" fontSize="12" fill="#64748b">速度係数 VF</text>
          <text x="0" y="138" fontSize="20" fontWeight="700" fill="#0071BD">{velocityFactor.toFixed(3)}</text>
        </g>
      </svg>

      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        特性インピーダンスは導体の寸法比 D/d の対数と、誘電体の比誘電率εrで決まります。D/dを大きくするとZ0は上がり、εrを上げると下がります。無線では50Ω系が基準です。
      </p>
    </figure>
  );
}
