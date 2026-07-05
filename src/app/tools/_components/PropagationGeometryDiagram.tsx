import { DiagramDefs } from "@/components/diagrams/DiagramDefs";
import { diagramPalette, DIAGRAM_DEF_IDS, diagramRef, diagramStroke } from "@/lib/ui/diagramTheme";

type PropagationGeometryDiagramProps = {
  frequencyMHz: number;
  distanceKm: number;
  txHeightM: number;
  rxHeightM: number;
  areaLabel: string;
  /** 2波モデルが比較対象に含まれる（地面反射経路を描く） */
  showReflection: boolean;
  /** Hata系が比較対象に含まれる（市街地クラッタを描く） */
  showBuildings: boolean;
};

const view = { width: 960, height: 380, groundY: 274, txX: 122, rxX: 838 };

function formatDistance(distanceKm: number): string {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    return "—";
  }
  return distanceKm >= 1 ? `${distanceKm.toFixed(2)} km` : `${Math.round(distanceKm * 1000)} m`;
}

function mastHeightPx(heightM: number, maxHeightM: number): number {
  const normalized = Math.sqrt(Math.max(0, heightM) / Math.max(1, maxHeightM));
  return 46 + normalized * 176;
}

const buildings = [
  { x: 250, w: 70, h: 70 },
  { x: 360, w: 58, h: 104 },
  { x: 470, w: 76, h: 58 },
  { x: 580, w: 60, h: 92 },
  { x: 678, w: 64, h: 64 }
];

export function PropagationGeometryDiagram({
  frequencyMHz,
  distanceKm,
  txHeightM,
  rxHeightM,
  areaLabel,
  showReflection,
  showBuildings
}: PropagationGeometryDiagramProps) {
  const maxHeightM = Math.max(txHeightM, rxHeightM, 5);
  const txHeightPx = mastHeightPx(txHeightM, maxHeightM);
  const rxHeightPx = mastHeightPx(rxHeightM, maxHeightM);
  const txAntennaY = view.groundY - txHeightPx;
  const rxAntennaY = view.groundY - rxHeightPx;
  const midX = (view.txX + view.rxX) / 2;
  const reflectionY = view.groundY - 6;
  const fresnelCy = (txAntennaY + rxAntennaY) / 2;
  const fresnelRy = showReflection ? 50 : 34;

  return (
    <figure className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      <svg
        role="img"
        aria-label="伝搬損失の前提を示す2D断面図"
        viewBox={`0 0 ${view.width} ${view.height}`}
        className="h-auto w-full"
      >
        <DiagramDefs />

        <rect width={view.width} height={view.height} fill={diagramRef(DIAGRAM_DEF_IDS.gradientSky)} />

        {/* 市街地クラッタ（Hata系のとき） */}
        {showBuildings
          ? buildings.map((building) => (
              <rect
                key={building.x}
                x={building.x}
                y={view.groundY - building.h}
                width={building.w}
                height={building.h}
                rx={4}
                fill={diagramRef(DIAGRAM_DEF_IDS.gradientConcrete)}
                opacity={0.7}
                stroke={diagramPalette.faint}
              />
            ))
          : null}

        <rect x="0" y={view.groundY} width={view.width} height={view.height - view.groundY} fill={diagramRef(DIAGRAM_DEF_IDS.gradientSoil)} />
        <rect
          x="0"
          y={view.groundY}
          width={view.width}
          height={view.height - view.groundY}
          fill={diagramRef(DIAGRAM_DEF_IDS.hatchGround)}
          opacity="0.25"
        />
        <line x1="60" x2="900" y1={view.groundY} y2={view.groundY} stroke={diagramPalette.muted} strokeWidth={diagramStroke.emphasis} />

        {/* 見通し・フレネルゾーン */}
        <ellipse
          cx={midX}
          cy={fresnelCy}
          rx={Math.max(150, (view.rxX - view.txX) / 2 - 60)}
          ry={fresnelRy}
          fill={diagramPalette.skyFill}
          opacity="0.2"
          stroke={diagramPalette.skyStroke}
          strokeWidth={diagramStroke.main}
          strokeDasharray="7 6"
        />

        {/* 見通し線（直接波）と距離ラベル */}
        <line x1={view.txX} x2={view.rxX} y1={txAntennaY} y2={rxAntennaY} stroke={diagramPalette.ink} strokeWidth="4" />
        <text
          x={midX}
          y={(txAntennaY + rxAntennaY) / 2 - 16}
          textAnchor="middle"
          className="fill-slate-900 text-[19px] font-bold"
        >
          距離 {formatDistance(distanceKm)}
        </text>

        {/* 地面反射経路（2波モデルのとき） */}
        {showReflection ? (
          <>
            <path
              d={`M ${view.txX} ${txAntennaY} Q ${midX} ${reflectionY} ${view.rxX} ${rxAntennaY}`}
              fill="none"
              stroke={diagramPalette.warn}
              strokeWidth="4"
              opacity="0.9"
            />
            <text x={midX} y={reflectionY - 12} textAnchor="middle" className="fill-orange-700 text-[16px] font-bold">
              地面反射（2波モデル）
            </text>
          </>
        ) : null}

        {/* 送信側マスト */}
        <line x1={view.txX} x2={view.txX} y1={view.groundY} y2={txAntennaY} stroke={diagramPalette.staf} strokeWidth="10" strokeLinecap="round" />
        <circle cx={view.txX} cy={txAntennaY} r="14" fill={diagramPalette.staf} stroke={diagramPalette.white} strokeWidth="4" />
        <text x={view.txX + 22} y={(view.groundY + txAntennaY) / 2} className="fill-staf text-[17px] font-bold">
          hb {Number.isFinite(txHeightM) ? txHeightM.toFixed(1) : "—"}m
        </text>

        {/* 受信側マスト */}
        <line x1={view.rxX} x2={view.rxX} y1={view.groundY} y2={rxAntennaY} stroke={diagramPalette.success} strokeWidth="10" strokeLinecap="round" />
        <circle cx={view.rxX} cy={rxAntennaY} r="14" fill={diagramPalette.success} stroke={diagramPalette.white} strokeWidth="4" />
        <text x={view.rxX - 22} y={(view.groundY + rxAntennaY) / 2} textAnchor="end" className="fill-emerald-700 text-[17px] font-bold">
          hm {Number.isFinite(rxHeightM) ? rxHeightM.toFixed(1) : "—"}m
        </text>

        {/* 送受信ラベル */}
        <rect x={view.txX - 66} y={view.groundY + 14} width="132" height="38" rx="8" fill={diagramPalette.white} stroke={diagramPalette.line} />
        <text x={view.txX} y={view.groundY + 39} textAnchor="middle" className="fill-slate-800 text-[16px] font-bold">
          送信側 hb
        </text>
        <rect x={view.rxX - 66} y={view.groundY + 14} width="132" height="38" rx="8" fill={diagramPalette.white} stroke={diagramPalette.line} />
        <text x={view.rxX} y={view.groundY + 39} textAnchor="middle" className="fill-slate-800 text-[16px] font-bold">
          受信側 hm
        </text>

        {/* 上部バッジ：周波数・エリア */}
        <g filter={diagramRef(DIAGRAM_DEF_IDS.softShadow)}>
          <rect x="332" y="16" width="296" height="64" rx="12" fill={diagramPalette.white} stroke={diagramPalette.line} />
          <text x="480" y="44" textAnchor="middle" className="fill-slate-950 text-[18px] font-bold">
            {Number.isFinite(frequencyMHz) ? frequencyMHz.toFixed(0) : "—"} MHz
          </text>
          <text x="480" y="68" textAnchor="middle" className="fill-slate-600 text-[15px] font-semibold">
            {showBuildings ? `市街地クラッタ：${areaLabel}` : "見通し条件（クラッタなし）"}
          </text>
        </g>
      </svg>
      <figcaption className="border-t border-slate-200 px-3 py-2 text-[11px] leading-relaxed text-slate-500">
        模式図です（縦の高さは見やすさ優先の圧縮表示で、実寸ではありません）。周波数・エリアは上部に数値表示のみで、図形の大きさには反映しません。
      </figcaption>
    </figure>
  );
}
