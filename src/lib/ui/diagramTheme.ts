// 自作SVG診断図（断面図・ジオメトリ図・定在波図など）の共通ビジュアル言語（Track H3）。
// <DiagramDefs>（src/components/diagrams/DiagramDefs.tsx）が定義する defs の ID と、
// 線幅・ラベルタイポの規約を単一の真実の源として保持する。React 非依存・vitest 検証可能。

/** DiagramDefs が定義する defs の ID（グラデーション・フィルタ・マーカー・パターン）。 */
export const DIAGRAM_DEF_IDS = {
  /** 柔らかい落ち影（カード上の主要形状に）。 */
  softShadow: "dgm-soft-shadow",
  /** 寸法線・視線の矢印（主・強調色）。 */
  arrowHead: "dgm-arrow-head",
  /** 補助線用の淡い矢印。 */
  arrowHeadMuted: "dgm-arrow-head-muted",
  /** 空・上空（淡青→白の縦グラデ）。 */
  gradientSky: "dgm-grad-sky",
  /** 土・地中（土色の縦グラデ）。 */
  gradientSoil: "dgm-grad-soil",
  /** 金属（斜光のハイライト入りグレー）。 */
  gradientMetal: "dgm-grad-metal",
  /** コンクリート（僅かな明暗のフラットグレー）。 */
  gradientConcrete: "dgm-grad-concrete",
  /** 樹脂・プラスチック（明るい暖白）。 */
  gradientResin: "dgm-grad-resin",
  /** 水・湿潤（透明感のある青）。 */
  gradientWater: "dgm-grad-water",
  /** 地面のハッチング（断面の切り口表現）。 */
  hatchGround: "dgm-hatch-ground"
} as const;

export type DiagramDefId = (typeof DIAGRAM_DEF_IDS)[keyof typeof DIAGRAM_DEF_IDS];

/** SVG の fill/marker 属性で defs を参照するための url(#id) を返す。 */
export function diagramRef(id: DiagramDefId): string {
  return `url(#${id})`;
}

/** 線幅の規約：主要輪郭 1.5 / 補助・寸法 0.75 / 強調 2.5。 */
export const diagramStroke = {
  main: 1.5,
  support: 0.75,
  emphasis: 2.5
} as const;

/** ラベルタイポの規約（SVG <text> 属性へ展開）。数値は tabular-nums で桁揺れを防ぐ。 */
export const diagramText = {
  label: { fontSize: 11, fill: "#64748B" },
  value: { fontSize: 12, fill: "#0F172A", fontWeight: 600, fontVariantNumeric: "tabular-nums" as const },
  caption: { fontSize: 10, fill: "#94A3B8" }
} as const;
