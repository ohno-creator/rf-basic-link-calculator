// チャート/図版の色・線幅・破線・軸フォント・オーバーレイ濃度の単一の真実の源。
// recharts と手書きSVGの両方から参照し、図版ファミリーの見た目を統一する。
// （統合監査で確認したドリフトを是正：total棒 #334155 vs #1e293b、感度線 '5 5' vs '7 5'、
//  grid #E2E8F0 の重複、#10B981/#10b981 の表記ゆれ など）
export const chartTheme = {
  // 主要な系列色（リンクバジェットの構成要素など）
  series: {
    source: "#0071BD", // 送信・基準（ブランド）
    gain: "#10B981", // 利得（プラス）
    loss: "#FB7185", // 損失（マイナス）
    total: "#1E293B" // 合計・到達値
  },
  // 系列色に対応づけた「軸テキスト用」の濃い同系色。デュアルY軸で軸を系列に色対応させる際、
  // 淡い系列色そのままだと小さな軸文字（目盛り・軸名）がWCAG-AA 4.5:1を満たさないため、
  // 色の対応関係は保ったままテキストだけ濃く落とす。明るい図版背景でAA合格を確認済み。
  seriesText: {
    source: "#005A95", // series.source 対応（濃いブランド青）
    gain: "#047857", // series.gain 対応（emerald-700）
    loss: "#BE123C" // series.loss 対応（rose-700）
  },
  // 参照線（感度・基準線など）
  reference: {
    sensitivity: "#E11D48",
    sensitivityDash: "7 5",
    baseline: "#94A3B8",
    baselineDash: "4 4"
  },
  // グリッド線
  grid: {
    primary: "#E2E8F0",
    secondary: "#CBD5E1"
  },
  // 軸ラベル・目盛り
  axis: {
    label: { fontSize: 12, fill: "#64748B" },
    tick: { fontSize: 11, fill: "#94A3B8" }
  },
  // 線幅
  stroke: {
    series: 2.5,
    barBorder: 1.5,
    emphasis: 3
  },
  // 塗りの不透明度
  overlay: {
    primary: 0.15,
    secondary: 0.08,
    muted: 0.55
  },
  // 多系列比較用のカテゴリカルパレット（Okabe-Ito 色覚多様性対応・Track H1）。
  // 並びは使用頻度順: 青(≒ブランド)→橙→緑→朱→紫→空→墨→黄。
  // 黄 #F0E442 は白背景の細線ではコントラスト不足のため、塗り・帯用途に限定し線には使わない。
  // 原典の黒は図版の他要素(total #1E293B)に合わせ墨色へ置換。
  categorical: [
    "#0072B2", // 青（Okabe-Ito blue。ブランド#0071BDとほぼ同値）
    "#E69F00", // 橙
    "#009E73", // 緑
    "#D55E00", // 朱
    "#CC79A7", // 紫
    "#56B4E9", // 空
    "#1E293B", // 墨（原典blackの置換）
    "#F0E442" // 黄（塗り専用）
  ],
  // ツールチップの統一スタイル（recharts <Tooltip contentStyle/labelStyle/itemStyle> へ spread）。
  tooltip: {
    content: {
      backgroundColor: "#FFFFFF",
      border: "1px solid #E2E8F0",
      borderRadius: 8,
      boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
      padding: "8px 12px",
      fontSize: 12
    },
    label: { color: "#0F172A", fontWeight: 600, marginBottom: 4 },
    item: { color: "#334155", fontVariantNumeric: "tabular-nums" }
  },
  // 数値表示の基本（軸・ツールチップ・ラベルは tabular-nums で桁揺れを防ぐ）。
  font: {
    tabularNums: "tabular-nums" as const
  }
} as const;

/** 多系列チャートの系列色。インデックスはパレット末尾で巡回する。 */
export function seriesColor(index: number): string {
  const palette = chartTheme.categorical;
  const i = ((index % palette.length) + palette.length) % palette.length;
  return palette[i];
}

/** recharts <CartesianGrid> へ spread する統一グリッド設定。 */
export function rfGridProps() {
  return { strokeDasharray: "3 3", stroke: chartTheme.grid.primary, vertical: false } as const;
}

/** recharts <XAxis>/<YAxis> の tick へ渡す統一目盛りスタイル。 */
export function rfTickProps() {
  return {
    fontSize: chartTheme.axis.tick.fontSize,
    fill: chartTheme.axis.tick.fill,
    fontVariantNumeric: chartTheme.font.tabularNums
  } as const;
}

/** recharts <Tooltip> へ spread する統一スタイル一式。 */
export function rfTooltipProps() {
  return {
    contentStyle: chartTheme.tooltip.content,
    labelStyle: chartTheme.tooltip.label,
    itemStyle: chartTheme.tooltip.item,
    cursor: { stroke: chartTheme.grid.secondary, strokeWidth: 1 }
  } as const;
}
