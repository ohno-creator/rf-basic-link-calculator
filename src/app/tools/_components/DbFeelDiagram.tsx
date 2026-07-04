// dBの本質＝「掛け算を足し算にするものさし」を可視化する動的SVG。
// 目盛りはdBで等間隔だが、倍率は ×2・×10・×100 と一気に増える。

import { dbToPowerRatio } from "@/lib/rf/db";
import { diagramPalette, diagramStroke, diagramText } from "@/lib/ui/diagramTheme";
import { formatRatio } from "./DbFeelPanel";

type DbFeelDiagramProps = {
  db: number;
  /** チップ合計dB（任意）。指定すると同じものさし上に重ねて表示する。 */
  stackTotalDb?: number;
};

const X0 = 44;
const X1 = 516;
const AXIS_Y = 58;
const DB_MIN = -30;
const DB_MAX = 30;

const anchors = [
  { db: -30, ratio: "÷1000" },
  { db: -20, ratio: "÷100" },
  { db: -10, ratio: "÷10" },
  { db: -6, ratio: "÷4" },
  { db: -3, ratio: "÷2" },
  { db: 0, ratio: "×1" },
  { db: 3, ratio: "×2" },
  { db: 6, ratio: "×4" },
  { db: 10, ratio: "×10" },
  { db: 20, ratio: "×100" },
  { db: 30, ratio: "×1000" }
];

function xForDb(db: number): number {
  const clamped = Math.min(DB_MAX, Math.max(DB_MIN, db));
  return Number((X0 + ((clamped - DB_MIN) / (DB_MAX - DB_MIN)) * (X1 - X0)).toFixed(2));
}

export function DbFeelDiagram({ db, stackTotalDb }: DbFeelDiagramProps) {
  const markerX = xForDb(db);
  const ratioLabel = formatRatio(dbToPowerRatio(db));
  const showStack = stackTotalDb !== undefined && stackTotalDb !== db;
  const stackX = showStack ? xForDb(stackTotalDb) : 0;
  const stackLabel = showStack ? formatRatio(dbToPowerRatio(stackTotalDb)) : "";

  return (
    <figure className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <figcaption className="text-sm font-semibold text-slate-950">
        dBの「ものさし」（足し算の目盛り＝掛け算の倍率）
      </figcaption>
      <p className="mt-0.5 text-xs text-slate-500">
        青い▼はスライダーのdB
        {showStack ? "、グレーの▽はチップ合計dBを示します。" : "を示します（チップ合計はスライダーと同値のため重なっています）。"}
      </p>
      <svg viewBox="0 0 560 116" role="img" aria-label="dBの目盛りと電力倍率の対応を示すものさし。等間隔のdBが2倍・10倍・100倍に対応する。" className="mt-2 w-full">
        {/* 軸 */}
        <line x1={X0} y1={AXIS_Y} x2={X1} y2={AXIS_Y} stroke={diagramPalette.faint} strokeWidth={diagramStroke.main} />

        {anchors.map((anchor) => {
          const x = xForDb(anchor.db);
          const isZero = anchor.db === 0;
          return (
            <g key={anchor.db}>
              <line
                x1={x}
                y1={AXIS_Y - 6}
                x2={x}
                y2={AXIS_Y + 6}
                stroke={isZero ? diagramPalette.inkSoft : diagramPalette.line}
                strokeWidth={isZero ? diagramStroke.main : diagramStroke.support}
              />
              <text x={x} y={AXIS_Y - 12} textAnchor="middle" {...diagramText.label}>
                {anchor.db > 0 ? `+${anchor.db}` : anchor.db}
              </text>
              <text x={x} y={AXIS_Y + 22} textAnchor="middle" fontSize={diagramText.label.fontSize} fill={diagramPalette.staf}>
                {anchor.ratio}
              </text>
            </g>
          );
        })}

        {/* チップ合計dBマーカー（任意・グレーで重ね描き） */}
        {showStack ? (
          <g>
            <line x1={stackX} y1={AXIS_Y - 14} x2={stackX} y2={AXIS_Y + 30} stroke={diagramPalette.muted} strokeWidth={diagramStroke.main} strokeDasharray="4 3" />
            <circle cx={stackX} cy={AXIS_Y} r="4" fill={diagramPalette.muted} stroke={diagramPalette.white} strokeWidth="2" />
            <text
              x={stackX}
              y={AXIS_Y + 42}
              textAnchor="middle"
              fontSize={diagramText.value.fontSize}
              fontWeight={diagramText.value.fontWeight}
              fill={diagramPalette.muted}
              style={{ fontVariantNumeric: diagramText.value.fontVariantNumeric }}
            >
              合計 {stackTotalDb > 0 ? `+${stackTotalDb}` : stackTotalDb} dB → {stackLabel}
            </text>
          </g>
        ) : null}

        {/* 現在のdBマーカー */}
        <line x1={markerX} y1={AXIS_Y - 26} x2={markerX} y2={AXIS_Y + 30} stroke={diagramPalette.staf} strokeWidth={diagramStroke.emphasis} />
        <circle cx={markerX} cy={AXIS_Y} r="5" fill={diagramPalette.staf} stroke={diagramPalette.white} strokeWidth="2" />
        <text
          x={markerX}
          y={AXIS_Y - 32}
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill={diagramPalette.staf}
          style={{ fontVariantNumeric: diagramText.value.fontVariantNumeric }}
        >
          {db > 0 ? `+${db}` : db} dB → {ratioLabel}
        </text>

        <text x={X0} y={AXIS_Y + 44} {...diagramText.caption}>
          dB（足し算）
        </text>
        <text x={X1} y={AXIS_Y + 44} textAnchor="end" {...diagramText.caption}>
          倍率（掛け算）
        </text>
      </svg>

      <p className="mt-1 text-xs leading-relaxed text-slate-600">
        目盛りはdBで等間隔でも、倍率は ×2・×10・×100 と一気に増えます。これが「掛け算を足し算にするものさし」です。+10dBごとに電力は10倍になります。
      </p>
    </figure>
  );
}
