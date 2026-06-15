// dBの本質＝「掛け算を足し算にするものさし」を可視化する動的SVG。
// 目盛りはdBで等間隔だが、倍率は ×2・×10・×100 と一気に増える。

type DbFeelDiagramProps = {
  db: number;
};

const X0 = 44;
const X1 = 516;
const AXIS_Y = 58;
const DB_MIN = -20;
const DB_MAX = 20;

const anchors = [
  { db: -20, ratio: "÷100" },
  { db: -10, ratio: "÷10" },
  { db: -6, ratio: "÷4" },
  { db: -3, ratio: "÷2" },
  { db: 0, ratio: "×1" },
  { db: 3, ratio: "×2" },
  { db: 6, ratio: "×4" },
  { db: 10, ratio: "×10" },
  { db: 20, ratio: "×100" }
];

function xForDb(db: number): number {
  const clamped = Math.min(DB_MAX, Math.max(DB_MIN, db));
  return Number((X0 + ((clamped - DB_MIN) / (DB_MAX - DB_MIN)) * (X1 - X0)).toFixed(2));
}

export function DbFeelDiagram({ db }: DbFeelDiagramProps) {
  const markerX = xForDb(db);
  const ratio = 10 ** (db / 10);
  const ratioLabel = ratio >= 1 ? `×${ratio < 100 ? ratio.toFixed(1) : Math.round(ratio)}` : `×${ratio.toFixed(3)}`;

  return (
    <figure className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <figcaption className="text-sm font-semibold text-slate-950">
        dBの「ものさし」（足し算の目盛り＝掛け算の倍率）
      </figcaption>
      <svg viewBox="0 0 560 116" role="img" aria-label="dBの目盛りと電力倍率の対応を示すものさし。等間隔のdBが2倍・10倍・100倍に対応する。" className="mt-2 w-full">
        {/* 軸 */}
        <line x1={X0} y1={AXIS_Y} x2={X1} y2={AXIS_Y} stroke="#94a3b8" strokeWidth="2" />

        {anchors.map((anchor) => {
          const x = xForDb(anchor.db);
          const isZero = anchor.db === 0;
          return (
            <g key={anchor.db}>
              <line x1={x} y1={AXIS_Y - 6} x2={x} y2={AXIS_Y + 6} stroke={isZero ? "#334155" : "#cbd5e1"} strokeWidth={isZero ? 2 : 1} />
              <text x={x} y={AXIS_Y - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="#475569">
                {anchor.db > 0 ? `+${anchor.db}` : anchor.db}
              </text>
              <text x={x} y={AXIS_Y + 22} textAnchor="middle" fontSize="11" fill="#0071BD">
                {anchor.ratio}
              </text>
            </g>
          );
        })}

        {/* 現在のdBマーカー */}
        <line x1={markerX} y1={AXIS_Y - 26} x2={markerX} y2={AXIS_Y + 30} stroke="#0071BD" strokeWidth="2.5" />
        <circle cx={markerX} cy={AXIS_Y} r="5" fill="#0071BD" stroke="#ffffff" strokeWidth="2" />
        <text x={markerX} y={AXIS_Y - 32} textAnchor="middle" fontSize="13" fontWeight="700" fill="#0071BD">
          {db > 0 ? `+${db}` : db} dB → {ratioLabel}
        </text>

        <text x={X0} y={AXIS_Y + 44} fontSize="10" fill="#94a3b8">
          dB（足し算）
        </text>
        <text x={X1} y={AXIS_Y + 44} textAnchor="end" fontSize="10" fill="#94a3b8">
          倍率（掛け算）
        </text>
      </svg>

      <p className="mt-1 text-xs leading-relaxed text-slate-600">
        目盛りはdBで等間隔でも、倍率は ×2・×10・×100 と一気に増えます。これが「掛け算を足し算にするものさし」です。+10dBごとに電力は10倍になります。
      </p>
    </figure>
  );
}
