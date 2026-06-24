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
  }
} as const;
