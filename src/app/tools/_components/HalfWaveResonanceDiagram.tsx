// 半波長ダイポールの電流定在波を示すアニメーションSVG。
// 「なぜ半波長で共振するのか」を視覚的に伝えるための図。
// 電流分布は I(z) = I0·cos(π·z / L)（中央で最大＝腹、両端でゼロ＝節）。

import { DiagramDefs } from "@/components/diagrams/DiagramDefs";
import { DIAGRAM_DEF_IDS, diagramRef, diagramStroke, diagramText } from "@/lib/ui/diagramTheme";

const X0 = 70;
const X1 = 490;
const XC = (X0 + X1) / 2;
const AXIS_Y = 140;
const AMP = 64;
const N = 48;

function currentPath(amplitude: number): string {
  const points: string[] = [];
  for (let i = 0; i <= N; i += 1) {
    const x = X0 + ((X1 - X0) * i) / N;
    const z = x - XC;
    const y = AXIS_Y - amplitude * Math.cos((Math.PI * z) / (X1 - X0));
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M${points.join(" L")}`;
}

const posPath = currentPath(AMP);
const zeroPath = currentPath(0);
const negPath = currentPath(-AMP);
const animationValues = [posPath, zeroPath, negPath, zeroPath, posPath].join(";");

export function HalfWaveResonanceDiagram() {
  return (
    <figure className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <figcaption className="text-sm font-semibold text-slate-950">
        半波長で共振するしくみ（電流の定在波）
      </figcaption>
      <svg
        viewBox="0 0 560 230"
        role="img"
        aria-label="半波長ダイポール上の電流分布。中央の給電点で電流が最大、両端で電流がゼロになる定在波を示す図。"
        className="mt-2 w-full"
      >
        <DiagramDefs />

        {/* 振れ幅（定在波の包絡線） */}
        <path d={posPath} fill="none" stroke="#93c5fd" strokeWidth={diagramStroke.main} strokeDasharray="4 4" />
        <path d={negPath} fill="none" stroke="#93c5fd" strokeWidth={diagramStroke.main} strokeDasharray="4 4" />

        {/* 導体（ダイポールの2本のアーム）：金属素材のグラデーション */}
        <g filter={diagramRef(DIAGRAM_DEF_IDS.softShadow)}>
          <rect
            x={X0 - 2.5}
            y={AXIS_Y - 2.5}
            width={XC - 12 - (X0 - 2.5) + 2.5}
            height="5"
            rx="2.5"
            fill={diagramRef(DIAGRAM_DEF_IDS.gradientMetal)}
            stroke="#64748b"
            strokeWidth={diagramStroke.support}
          />
          <rect
            x={XC + 12 - 2.5}
            y={AXIS_Y - 2.5}
            width={X1 + 2.5 - (XC + 12 - 2.5)}
            height="5"
            rx="2.5"
            fill={diagramRef(DIAGRAM_DEF_IDS.gradientMetal)}
            stroke="#64748b"
            strokeWidth={diagramStroke.support}
          />
        </g>

        {/* 端（電流ゼロ＝節） */}
        <circle cx={X0} cy={AXIS_Y} r="5" fill="#94a3b8" />
        <circle cx={X1} cy={AXIS_Y} r="5" fill="#94a3b8" />

        {/* 電流の定在波（時間とともに腹が上下する） */}
        <path d={posPath} fill="none" stroke="#0071BD" strokeWidth={diagramStroke.emphasis} strokeLinejoin="round">
          <animate
            attributeName="d"
            dur="2.6s"
            repeatCount="indefinite"
            values={animationValues}
          />
        </path>

        {/* 給電点 */}
        <circle cx={XC} cy={AXIS_Y} r="7" fill="#ffffff" stroke="#0071BD" strokeWidth={diagramStroke.emphasis} />

        {/* ラベル */}
        <text x={XC} y={AXIS_Y - AMP - 12} textAnchor="middle" fontSize="13" fontWeight="700" fill="#0071BD">
          電流 最大（腹）
        </text>
        <text x={X0} y={AXIS_Y - 14} textAnchor="middle" {...diagramText.label}>
          電流ゼロ（節）
        </text>
        <text x={X1} y={AXIS_Y - 14} textAnchor="middle" {...diagramText.label}>
          電流ゼロ（節）
        </text>
        <text x={XC} y={AXIS_Y + 26} textAnchor="middle" {...diagramText.label} fontWeight="600">
          給電点
        </text>

        {/* 寸法線 λ/2 */}
        <line
          x1={X0}
          y1={AXIS_Y + 54}
          x2={X1}
          y2={AXIS_Y + 54}
          stroke="#94a3b8"
          strokeWidth={diagramStroke.support}
          markerStart={diagramRef(DIAGRAM_DEF_IDS.arrowHeadMuted)}
          markerEnd={diagramRef(DIAGRAM_DEF_IDS.arrowHeadMuted)}
        />
        <text
          x={XC}
          y={AXIS_Y + 74}
          textAnchor="middle"
          fill={diagramText.value.fill}
          fontSize={diagramText.value.fontSize}
          fontWeight={diagramText.value.fontWeight}
          style={{ fontVariantNumeric: diagramText.value.fontVariantNumeric }}
        >
          λ/2（半波長）
        </text>
      </svg>

      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        青線が導体上の電流です。長さがちょうど半波長（λ/2）だと、電流の定在波がアンテナにぴったり収まり、両端が電流ゼロ（節）・中央の給電点が電流最大（腹）になります。この「ぴったり収まった」状態が共振で、効率よく放射できます。点線は電流の振れ幅（包絡線）です。
      </p>
    </figure>
  );
}
