import { formatNumber } from "@/lib/rf/format";

// 同軸ケーブル損失の本質＝フィードラインを通る間に電力が減る。長さ・周波数・ケーブル種別で
// 失われるdBが変わる。損失と残る電力に連動する動的SVG。

type CoaxLossDiagramProps = {
  lengthM: number;
  totalDb: number;
  perMeterDb: number;
  powerRemainingPercent: number;
  connectorCount: number;
};

const X0 = 64;
const X1 = 300;
const Y = 54;

function round(value: number): number {
  return Number(value.toFixed(2));
}

export function CoaxLossDiagram({
  lengthM,
  totalDb,
  perMeterDb,
  powerRemainingPercent,
  connectorCount
}: CoaxLossDiagramProps) {
  const endOpacity = round(Math.min(1, Math.max(0.12, powerRemainingPercent / 100)));
  const dots = Math.max(2, Math.min(8, Math.round(connectorCount)));
  const connectors = Array.from({ length: dots }, (_, i) =>
    round(dots === 1 ? X0 : X0 + ((X1 - X0) * i) / (dots - 1))
  );
  const barWidth = round(Math.min(100, Math.max(2, powerRemainingPercent)));

  return (
    <figure className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <figcaption className="text-sm font-semibold text-slate-950">
        フィードラインで失われる電力
      </figcaption>
      <svg viewBox="0 0 360 110" role="img" aria-label="送信モジュールからアンテナへ向かう同軸ケーブルと、その間で減衰する信号を示す図。" className="mt-2 w-full">
        <defs>
          <linearGradient id="coaxFade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0071BD" stopOpacity="1" />
            <stop offset="100%" stopColor="#0071BD" stopOpacity={endOpacity} />
          </linearGradient>
        </defs>

        {/* モジュール */}
        <rect x="14" y={Y - 16} width="44" height="32" rx="5" fill="#e2e8f0" stroke="#334155" />
        <text x="36" y={Y + 4} textAnchor="middle" fontSize="9" fill="#334155">
          送信
        </text>

        {/* ケーブル（左ほど強く、右ほど減衰） */}
        <line x1={X0} y1={Y} x2={X1} y2={Y} stroke="url(#coaxFade)" strokeWidth="7" strokeLinecap="round" />

        {/* コネクタ */}
        {connectors.map((cx, index) => (
          <circle key={index} cx={cx} cy={Y} r="3.5" fill="#ffffff" stroke="#334155" strokeWidth="1.5" />
        ))}

        {/* アンテナ */}
        <line x1={X1 + 14} y1={Y + 14} x2={X1 + 14} y2={Y - 18} stroke="#334155" strokeWidth="2.5" />
        <path d={`M${X1 + 8},${Y - 14} Q${X1 + 14},${Y - 20} ${X1 + 20},${Y - 14}`} fill="none" stroke="#0071BD" strokeWidth="1.5" />
        <path d={`M${X1 + 4},${Y - 10} Q${X1 + 14},${Y - 24} ${X1 + 24},${Y - 10}`} fill="none" stroke="#0071BD" strokeWidth="1.5" />

        <text x={round((X0 + X1) / 2)} y={Y + 24} textAnchor="middle" fontSize="11" fill="#64748b">
          ケーブル {formatNumber(lengthM, 2)} m ／ コネクタ {dots} 個
        </text>
      </svg>

      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <div className="rounded-md bg-white p-2 text-center">
          <p className="text-xs text-slate-500">合計損失</p>
          <p className="text-lg font-bold text-staf">{formatNumber(totalDb, 2)} dB</p>
        </div>
        <div className="rounded-md bg-white p-2 text-center">
          <p className="text-xs text-slate-500">1mあたり</p>
          <p className="text-lg font-bold text-slate-700">{formatNumber(perMeterDb, 2)} dB</p>
        </div>
        <div className="rounded-md bg-white p-2">
          <p className="text-xs text-slate-500">アンテナに残る電力</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-staf" style={{ width: `${barWidth}%` }} />
            </div>
            <span className="text-xs font-semibold text-slate-700">{formatNumber(powerRemainingPercent, 0)}%</span>
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        フィードラインを通る間に電力は減ります。細い・長い・高周波のケーブルほど損失は大きく、3dBで電力は半分になります。この合計損失は、リンクバジェットの「ケーブル・コネクタ損失」にそのまま入れられます。
      </p>
    </figure>
  );
}
