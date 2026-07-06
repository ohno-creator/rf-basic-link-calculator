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

/**
 * 図版の色パレット（Track I 便4b）。SVG図版の直書きhexの受け皿で、
 * 値は既存図版で使用中の色の**同値集約**（置換で色は1つも変えない）。
 * 用途名で参照し、新規図版はここ以外の色を使わない（design-base-v3 §3.4）。
 */
export const diagramPalette = {
  // 墨・線（濃→淡。muted/faint は diagramText の label/caption と同値）
  ink: "#0F172A", // 主要輪郭・値テキスト
  inkSoft: "#334155", // 構造物・人・車両など第二輪郭
  inkMuted: "#475569", // 補助形状
  muted: "#64748B", // ラベル・地面線
  faint: "#94A3B8", // 補助線・淡い輪郭
  line: "#CBD5E1", // 罫線・枠
  grid: "#E2E8F0", // グリッド（chartTheme.grid.primary と同値）
  canvas: "#F8FAFC", // 図版背景（chartTheme.surface.canvas と同値）
  white: "#FFFFFF", // 白面・白縁取り
  // ブランド・電波経路
  staf: "#0071BD", // ブランド青（アンテナ・主要経路）
  stafDark: "#005A95", // 濃ブランド青（テキスト級の強調）
  path: "#0284C7", // 電波経路・リンク線（sky-600）
  // 空・環境
  skyFill: "#BAE6FD",
  skyStroke: "#38BDF8",
  skyPale: "#EFF6FF",
  skySoft: "#93C5FD",
  // 状態（chartTheme の series/seriesText/reference と同系）
  success: "#10B981",
  successDeep: "#047857",
  danger: "#E11D48",
  dangerDeep: "#BE123C",
  dangerDark: "#9F1239",
  warn: "#F97316",
  warnDeep: "#C2410C",
  amber: "#F59E0B",
  amberSoft: "#FBBF24", // 明るい黄橙（軽度警告の塗り。amber-400）
  amberDeep: "#B45309"
} as const;

export type DiagramPaletteColor = keyof typeof diagramPalette;

/**
 * 断面・2.5D図の素材ベース色（Track H6改）。等角面の陰影（iso.ts の shadeColor）にかけられる単色で、
 * 実在素材に寄せた代表色。値の根拠: 量水器/ハンドホール蓋は FCD450 ダクタイル鋳鉄（黒〜濃灰）、
 * 樹脂ボックスは淡い青灰、コンクリートは温かみのある石灰色、土は褐色、湿潤は空色系。
 */
export const diagramMaterial = {
  soil: "#A98467", // 土（褐色）
  soilDeep: "#7C5A43", // 土（深部・陰）
  concrete: "#B4AEA6", // コンクリート（石灰色）
  resin: "#9AA7B4", // 樹脂（青灰）
  metal: "#6B7480", // 金属（鋳鉄/鋼・濃灰）
  water: "#38BDF8", // 水・湿潤（空色）
  device: "#334155" // 機器筐体（NCU本体・濃スレート）
} as const;

export type DiagramMaterial = keyof typeof diagramMaterial;
