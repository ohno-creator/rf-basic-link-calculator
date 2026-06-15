// VSWRの本質＝整合が悪いほど反射波が増え、定在波の山(Vmax)と谷(Vmin)の差が広がる。
// 入力（反射係数Γ）に連動して包絡線の波打ちが深くなる動的SVG。

type VswrStandingWaveDiagramProps = {
  reflection: number;
  vswr: number;
  reflectedPowerPercent: number;
};

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
  reflectedPowerPercent
}: VswrStandingWaveDiagramProps) {
  const gamma = Math.min(Math.max(reflection, 0), 0.999);
  // SSRとクライアントで文字列を一致させるため丸める（ハイドレーション不一致防止）。
  const vMaxY = Number((BASE - (1 + gamma) * SCALE).toFixed(2));
  const vMinY = Number((BASE - (1 - gamma) * SCALE).toFixed(2));
  const vswrText = Number.isFinite(vswr) ? vswr.toFixed(2) : "∞";
  const reflectedWidth = Math.min(100, Math.max(0, reflectedPowerPercent));

  return (
    <figure className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <figcaption className="text-sm font-semibold text-slate-950">
        定在波で見るVSWR（電圧の大きさ）
      </figcaption>
      <svg viewBox="0 0 560 200" role="img" aria-label="伝送線路上の電圧定在波。反射が大きいほど山と谷の差が広がる図。" className="mt-2 w-full">
        {/* Vmax / Vmin の基準線 */}
        <line x1={X0} y1={vMaxY} x2={X1} y2={vMaxY} stroke="#fca5a5" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={X0} y1={vMinY} x2={X1} y2={vMinY} stroke="#93c5fd" strokeWidth="1" strokeDasharray="4 4" />
        <text x={X1} y={vMaxY - 4} textAnchor="end" fontSize="11" fill="#dc2626">
          Vmax = 1 + Γ
        </text>
        <text x={X1} y={vMinY - 4} textAnchor="end" fontSize="11" fill="#2563eb">
          Vmin = 1 − Γ
        </text>

        {/* 定在波の包絡線 */}
        <path d={envelopePath(gamma)} fill="none" stroke="#0071BD" strokeWidth="2.5" strokeLinejoin="round" />

        {/* 伝送線路と負荷 */}
        <line x1={X0} y1={BASE} x2={X1 - 36} y2={BASE} stroke="#334155" strokeWidth="3" />
        <rect x={X1 - 36} y={BASE - 16} width="36" height="32" rx="4" fill="#e2e8f0" stroke="#334155" />
        <text x={X1 - 18} y={BASE + 4} textAnchor="middle" fontSize="9" fill="#334155">
          負荷
        </text>
        <text x={X0} y={BASE + 18} fontSize="10" fill="#64748b">
          送信機側 →
        </text>
      </svg>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div className="rounded-md bg-white p-2 text-center">
          <p className="text-xs text-slate-500">VSWR = Vmax / Vmin</p>
          <p className="text-lg font-bold text-staf">{vswrText}</p>
        </div>
        <div className="rounded-md bg-white p-2">
          <p className="text-xs text-slate-500">反射電力（送信のうち戻る割合）</p>
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
        です。Γ=0（完全整合）なら波打たず一定で、反射電力は0になります。
      </p>
    </figure>
  );
}
