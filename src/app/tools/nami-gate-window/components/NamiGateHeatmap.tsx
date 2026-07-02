"use client";

import { memo, useState } from "react";
import {
  GRID_COLS,
  GRID_ROWS,
  cellColor,
  modeToCellMode,
  signed,
  stopsFor,
  type HeatmapMode,
  type NamiGateInput,
  type NamiGateSimulation
} from "@/lib/rf/namiGate";

type NamiGateHeatmapProps = {
  sim: NamiGateSimulation;
  mode: HeatmapMode;
  input: NamiGateInput;
};

const MODE_META: Record<HeatmapMode, { title: string; unit: string; scaleLabel: string }> = {
  off: { title: "設置なし（OFF）の受信電力", unit: "dBm", scaleLabel: "受信電力 dBm" },
  on: { title: "設置あり（ON）の受信電力", unit: "dBm", scaleLabel: "受信電力 dBm" },
  diff: { title: "改善量（ON − OFF）", unit: "dB", scaleLabel: "改善量 dB" }
};

const fmt = (v: number, mode: HeatmapMode) =>
  `${mode === "diff" && v >= 0 ? "+" : ""}${v.toFixed(1)} ${MODE_META[mode].unit}`;

function NamiGateHeatmapImpl({ sim, mode, input }: NamiGateHeatmapProps) {
  const [hover, setHover] = useState<{ col: number; row: number } | null>(null);

  // キーボード操作：矢印キーで注目セルを動かし、読み取り（aria-live）にOFF/ON/改善を出す。
  const moveHover = (dCol: number, dRow: number) =>
    setHover((current) => {
      const col = Math.min(GRID_COLS - 1, Math.max(0, (current?.col ?? Math.floor(GRID_COLS / 2)) + dCol));
      const row = Math.min(GRID_ROWS - 1, Math.max(0, (current?.row ?? Math.floor(GRID_ROWS / 2)) + dRow));
      return { col, row };
    });

  const handleKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
    const moves: Record<string, [number, number]> = {
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
      ArrowDown: [0, 1],
      ArrowUp: [0, -1]
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      moveHover(move[0], move[1]);
    }
  };

  const data = mode === "off" ? sim.off : mode === "diff" ? sim.diff : sim.on;
  const cellMode = modeToCellMode(mode);
  const stops = stopsFor(cellMode);
  const meta = MODE_META[mode];
  const stats = mode === "off" ? sim.offStats : mode === "diff" ? sim.diffStats : sim.onStats;

  // 入射角ray（窓中央から室内へ。viewBox上 +x右 / +y奥）。
  const winX = GRID_COLS / 2;
  const rad = (input.incidentAngleDeg * Math.PI) / 180;
  const rayLen = GRID_ROWS * 0.8;
  const rayX = winX + rayLen * Math.sin(rad);
  const rayY = rayLen * Math.cos(rad);

  const handlePointer = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const col = Math.floor(((event.clientX - rect.left) / rect.width) * GRID_COLS);
    const row = Math.floor(((event.clientY - rect.top) / rect.height) * GRID_ROWS);
    if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
      setHover({ col, row });
    }
  };

  const hoverValue = hover ? data[hover.row * GRID_COLS + hover.col] : null;
  const hoverX = hover ? ((hover.col / (GRID_COLS - 1)) * input.roomWidthM).toFixed(1) : null;
  const hoverY = hover ? (((hover.row + 1) / GRID_ROWS) * input.roomDepthM).toFixed(1) : null;
  const hoverOff = hover ? sim.off[hover.row * GRID_COLS + hover.col] : 0;
  const hoverOn = hover ? sim.on[hover.row * GRID_COLS + hover.col] : 0;
  const hoverDiff = hover ? sim.diff[hover.row * GRID_COLS + hover.col] : 0;

  const ariaSummary =
    `${input.roomWidthM}m×${input.roomDepthM}m室内の${meta.title}。` +
    `平均 ${stats.avg.toFixed(1)}${meta.unit}、最良 ${stats.max.toFixed(1)}${meta.unit}、` +
    `最弱 ${stats.min.toFixed(1)}${meta.unit}。判定 ${sim.evaluation.label}。`;

  return (
    <figure className="space-y-3">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-slate-950">{meta.title}</span>
        <span className="text-xs font-semibold text-slate-500">上辺＝窓面・中央がナミゲート（30cm角）</span>
      </figcaption>

      {/* 凡例（モードで切替） */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
        <span className="font-bold text-slate-500">{meta.scaleLabel}</span>
        {stops.map((stop) => (
          <span key={stop.label} className="inline-flex items-center gap-1">
            <span
              aria-hidden
              className="h-3 w-3 rounded-[2px] ring-1 ring-slate-300"
              style={{ backgroundColor: stop.fill }}
            />
            <span className="tabular-nums text-slate-600">{stop.label}</span>
          </span>
        ))}
      </div>

      <div
        className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white"
        style={{ aspectRatio: `${GRID_COLS} / ${GRID_ROWS + 1.6}` }}
      >
        <svg
          viewBox={`0 0 ${GRID_COLS} ${GRID_ROWS + 1.6}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          role="img"
          aria-label={`${ariaSummary} 矢印キーでセルを移動し、下の読み取りでOFF・ON・改善量を確認できます。`}
          tabIndex={0}
          className="block touch-pan-y rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-staf"
          onPointerMove={handlePointer}
          onPointerDown={handlePointer}
          onPointerLeave={() => setHover(null)}
          onKeyDown={handleKeyDown}
          onFocus={() =>
            setHover((current) => current ?? { col: Math.floor(GRID_COLS / 2), row: Math.floor(GRID_ROWS / 2) })
          }
        >
          {/* 窓面ストリップ（上辺） */}
          <rect x={0} y={0} width={GRID_COLS} height={1.2} fill="#475569" />
          <text x={1} y={0.82} fontSize={0.66} fill="#ffffff" fontWeight={700}>
            窓面
          </text>
          {/* ナミゲート位置（中央の30cm角） */}
          <rect x={winX - 2} y={0} width={4} height={1.2} fill="#0071bd" />
          <text x={winX} y={0.84} fontSize={0.62} fill="#ffffff" fontWeight={700} textAnchor="middle">
            NG
          </text>

          {/* 室内セル群 */}
          <g transform="translate(0, 1.6)">
            {Array.from({ length: GRID_ROWS }, (_, row) =>
              Array.from({ length: GRID_COLS }, (_, col) => {
                const value = data[row * GRID_COLS + col];
                const { fill } = cellColor(value, cellMode);
                return (
                  <rect
                    key={row * GRID_COLS + col}
                    x={col + 0.04}
                    y={row + 0.04}
                    width={0.92}
                    height={0.92}
                    rx={0.12}
                    fill={fill}
                    shapeRendering="crispEdges"
                  />
                );
              })
            )}

            {/* サンプル数値ラベル（色に依存しない冗長チャネル） */}
            {Array.from({ length: GRID_ROWS }, (_, row) =>
              Array.from({ length: GRID_COLS }, (_, col) => {
                if (row % 4 !== 0 || col % 5 !== 0) return null;
                const value = data[row * GRID_COLS + col];
                const { text } = cellColor(value, cellMode);
                return (
                  <text
                    key={`t-${row * GRID_COLS + col}`}
                    x={col + 0.5}
                    y={row + 0.5}
                    fontSize={0.52}
                    fill={text}
                    textAnchor="middle"
                    dominantBaseline="central"
                    pointerEvents="none"
                  >
                    {Math.round(value)}
                  </text>
                );
              })
            )}

            {/* 入射角ray */}
            <line
              x1={winX}
              y1={0}
              x2={rayX}
              y2={rayY}
              stroke="#22d3ee"
              strokeWidth={0.18}
              strokeDasharray="0.6 0.4"
              pointerEvents="none"
            />
            <circle cx={winX} cy={0} r={0.35} fill="#0071bd" pointerEvents="none" />

            {/* ホバー枠 */}
            {hover ? (
              <rect
                x={hover.col}
                y={hover.row}
                width={1}
                height={1}
                fill="none"
                stroke="#0f172a"
                strokeWidth={0.16}
                pointerEvents="none"
              />
            ) : null}
          </g>
        </svg>
      </div>

      {/* インスペクタ読み取り（マウス/タッチ/aria-live） */}
      <p aria-live="polite" className="min-h-[1.5rem] text-xs leading-6 text-slate-600">
        {hover && hoverValue !== null ? (
          <span>
            <span className="font-semibold text-slate-800">
              窓から幅 {hoverX}m・奥行 {hoverY}m：
            </span>{" "}
            OFF {hoverOff.toFixed(1)}dBm ／ ON {hoverOn.toFixed(1)}dBm ／ 改善 {signed(hoverDiff)}dB
          </span>
        ) : (
          <span className="text-slate-400">セルにカーソル／タップで、その位置のOFF・ON・改善量を表示します。</span>
        )}
      </p>

      {/* スクリーンリーダー・ズーム向けのデータ表（全セル） */}
      <details className="rounded-lg border border-slate-200 bg-slate-50 text-xs">
        <summary className="cursor-pointer px-3 py-2 font-semibold text-slate-700">
          数値テーブルで見る（{meta.title}・{MODE_META[mode].unit}）
        </summary>
        <div className="max-h-72 overflow-auto p-3">
          <table className="min-w-full border-collapse tabular-nums">
            <caption className="sr-only">{ariaSummary}</caption>
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 bg-slate-50 p-1 text-left">
                  奥行\幅
                </th>
                {Array.from({ length: GRID_COLS }, (_, col) => (
                  <th key={col} scope="col" className="p-1 text-right text-slate-400">
                    {((col / (GRID_COLS - 1)) * input.roomWidthM).toFixed(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: GRID_ROWS }, (_, row) => (
                <tr key={row}>
                  <th scope="row" className="sticky left-0 bg-slate-50 p-1 text-left text-slate-400">
                    {(((row + 1) / GRID_ROWS) * input.roomDepthM).toFixed(1)}
                  </th>
                  {Array.from({ length: GRID_COLS }, (_, col) => (
                    <td key={col} className="p-1 text-right text-slate-600">
                      {data[row * GRID_COLS + col].toFixed(0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <p className="text-xs text-slate-500">
        値は {fmt(stats.min, mode)} 〜 {fmt(stats.max, mode)}（平均 {fmt(stats.avg, mode)}）。
        セル内の数字はサンプル表示です。
      </p>
    </figure>
  );
}

// 親の毎キーストローク再レンダリングで816ノードを作り直さないようメモ化。
// props（sim・mode・deferredInput）が変わったときだけ再描画する。
export const NamiGateHeatmap = memo(NamiGateHeatmapImpl);
