// VSWRの本質＝整合が悪いほど反射波が増え、定在波の山(Vmax)と谷(Vmin)の差が広がる。
// 入力（反射係数Γ）に連動して包絡線の波打ちが深くなる動的SVG。

import { Tooltip } from "@/components/Tooltip";
import { DiagramDefs } from "@/components/diagrams/DiagramDefs";
import { DIAGRAM_DEF_IDS, diagramRef, diagramStroke, diagramText } from "@/lib/ui/diagramTheme";

type VswrStandingWaveDiagramProps = {
  reflection: number;
  vswr: number;
  reflectedPowerPercent: number;
  mismatchLossDb: number;
};

function formatInfinite(value: number, digits: number): string {
  return Number.isFinite(value) ? value.toFixed(digits) : "∞";
}

const X0 = 40;
const X1 = 520;
const BASE = 150;
const SCALE = 46;
const N = 140;
const PHASE_SPAN = 6 * Math.PI;

function envelopePath(gamma: number): string {
  const points: string[] = [];
  for (let i = 0; i <= N; i += 1) {
    const phi = (PHASE_SPAN * i) / N;
    const magnitude = Math.sqrt(1 + gamma * gamma + 2 * gamma * Math.cos(phi));
    const x = X0 + ((X1 - X0) * i) / N;
    const y = BASE - magnitude * SCALE;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M${points.join(" L")}`;
}

export function VswrStandingWaveDiagram({
  reflection,
  vswr,
  reflectedPowerPercent,
  mismatchLossDb
}: VswrStandingWaveDiagramProps) {
  const gamma = Math.min(Math.max(reflection, 0), 0.999);
  // SSRとクライアントで文字列を一致させるため丸める（ハイドレーション不一致防止）。
  const vMaxY = Number((BASE - (1 + gamma) * SCALE).toFixed(2));
  const vMinY = Number((BASE - (1 - gamma) * SCALE).toFixed(2));
  // Γが小さいとVmax線とVmin線が接近し、右端固定の2ラベルが重なる。
  // Vmaxは線の上、Vminは線の下に振り分け、近接時はさらに離してラベル重なりを防ぐ。
  const labelGap = vMinY - vMaxY; // 常に正（VmaxはVminより上＝yが小さい）
  const MIN_LABEL_GAP = 22;
  const extraSpread = Math.max(0, (MIN_LABEL_GAP - labelGap) / 2);
  const vMaxLabelY = Number((vMaxY - 4 - extraSpread).toFixed(2));
  const vMinLabelY = Number((vMinY + 12 + extraSpread).toFixed(2));
  const vswrText = formatInfinite(vswr, 2);
  const mismatchLossText = formatInfinite(mismatchLossDb, 2);
  const reflectedWidth = Math.min(100, Math.max(0, reflectedPowerPercent));
  const envelope = envelopePath(gamma);
  // 波形下の淡い塗り用に、包絡線を伝送線路（BASE）まで閉じたパス。
  const envelopeFillPath = `${envelope} L${X1},${BASE} L${X0},${BASE} Z`;

  return (
    <figure className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <figcaption className="text-sm font-semibold text-slate-950">
          定在波で見るVSWR（電圧の大きさ）
        </figcaption>
        <Tooltip term="定在波図">
          伝送線路上の電圧の山（Vmax=1+Γ）と谷（Vmin=1−Γ）の包絡線です。整合が悪いほど波打ちが深くなります。VSWR=Vmax/Vmin。
        </Tooltip>
      </div>
      <svg viewBox="0 0 560 200" role="img" aria-label="伝送線路上の電圧定在波。反射が大きいほど山と谷の差が広がる図。" className="mt-2 w-full">
        <DiagramDefs />

        {/* 波形下の淡い塗り（基準線・包絡線より背面） */}
        <path d={envelopeFillPath} fill={diagramRef(DIAGRAM_DEF_IDS.gradientSky)} fillOpacity="0.5" stroke="none" />

        {/* Vmax / Vmin の基準線 */}
        <line x1={X0} y1={vMaxY} x2={X1} y2={vMaxY} stroke="#fca5a5" strokeWidth={diagramStroke.support} strokeDasharray="4 4" />
        <line x1={X0} y1={vMinY} x2={X1} y2={vMinY} stroke="#93c5fd" strokeWidth={diagramStroke.support} strokeDasharray="4 4" />
        <text x={X1} y={vMaxLabelY} textAnchor="end" {...diagramText.label} fill="#dc2626">
          Vmax = 1 + Γ
        </text>
        <text x={X1} y={vMinLabelY} textAnchor="end" {...diagramText.label} fill="#2563eb">
          Vmin = 1 − Γ
        </text>

        {/* 定在波の包絡線 */}
        <path d={envelope} fill="none" stroke="#0071BD" strokeWidth={diagramStroke.emphasis} strokeLinejoin="round" />

        {/* 伝送線路と負荷 */}
        <line x1={X0} y1={BASE} x2={X1 - 36} y2={BASE} stroke="#334155" strokeWidth={diagramStroke.emphasis} />
        <rect
          x={X1 - 36}
          y={BASE - 16}
          width="36"
          height="32"
          rx="4"
          fill={diagramRef(DIAGRAM_DEF_IDS.gradientConcrete)}
          stroke="#334155"
          strokeWidth={diagramStroke.main}
          filter={diagramRef(DIAGRAM_DEF_IDS.softShadow)}
        />
        <text x={X1 - 18} y={BASE + 4} textAnchor="middle" fontSize="9" fill="#334155">
          負荷
        </text>
        <text x={X0} y={BASE + 18} {...diagramText.label}>
          送信機側 →
        </text>
      </svg>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div className="rounded-md bg-white p-2 text-center">
          <p className="text-xs text-slate-500">VSWR = Vmax / Vmin</p>
          <p className="text-lg font-bold text-staf-dark">{vswrText}</p>
        </div>
        <div className="rounded-md bg-white p-2 text-center">
          <p className="text-xs text-slate-500">ミスマッチ損失（整合損失）</p>
          <p className="text-lg font-bold text-staf-dark">{mismatchLossText} dB</p>
        </div>
        <div className="rounded-md bg-white p-2 sm:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-500">反射電力（送信のうち戻る割合）</p>
            <Tooltip term="反射電力バー">
              反射電力割合を0〜100%でバー表示します。送信のうち戻る分で、バーが短いほど効率が良い状態です。
            </Tooltip>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-rose-400" style={{ width: `${reflectedWidth}%` }} />
            </div>
            <span className="text-xs font-semibold text-slate-700">{reflectedPowerPercent.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        整合が悪い（Γが大きい）ほど反射波が増え、定在波の山(Vmax)と谷(Vmin)の差が広がります。VSWRはこの比 Vmax/Vmin
        です。Γ=0（完全整合）なら波打たず一定で、反射電力は0になります。反射した分はミスマッチ損失[dB]として負荷に伝わらず失われ、リンクバジェットへ直接効きます。
      </p>
    </figure>
  );
}
