// 知覚均等カラーマップ（Track H5）。ヒートマップの離散ストップ配色を、
// 値の大小が明度の単調変化として知覚される viridis 系の連続配色へ置き換えるための純ロジック。
// React 非依存・vitest 検証可能。色覚多様性でも順序が保たれるのが viridis の採用理由。

/** viridis のアンカー色（matplotlib 準拠の9点・t=0(最小)→t=1(最大)）。 */
export const VIRIDIS_STOPS: readonly string[] = [
  "#440154",
  "#472D7B",
  "#3B528B",
  "#2C728E",
  "#21918C",
  "#28AE80",
  "#5EC962",
  "#ADDC30",
  "#FDE725"
];

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).padStart(6, "0").toUpperCase()}`;
}

/** t∈[0,1] を viridis 色へ（範囲外はクランプ・非有限は t=0 扱い）。アンカー間は線形RGB補間。 */
export function viridisColor(t: number): string {
  const clamped = Number.isFinite(t) ? Math.max(0, Math.min(1, t)) : 0;
  const scaled = clamped * (VIRIDIS_STOPS.length - 1);
  const lower = Math.floor(scaled);
  const upper = Math.min(lower + 1, VIRIDIS_STOPS.length - 1);
  const frac = scaled - lower;
  const [r1, g1, b1] = hexToRgb(VIRIDIS_STOPS[lower]);
  const [r2, g2, b2] = hexToRgb(VIRIDIS_STOPS[upper]);
  return rgbToHex(r1 + (r2 - r1) * frac, g1 + (g2 - g1) * frac, b1 + (b2 - b1) * frac);
}

/** 値を [min,max] で正規化した t を返す（min===max は 0.5、範囲外クランプ、非有限は 0）。 */
export function normalizeToUnit(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) return 0;
  if (min === max) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/** WCAG 相対輝度（sRGB）。 */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * カラーマップ背景の上に置くテキスト色。輝度がしきい値未満（暗い紫〜青緑）は白、
 * 明るい黄緑〜黄は墨色を返す（どちらも実用コントラストを確保）。
 */
export function colormapTextColor(backgroundHex: string): string {
  return relativeLuminance(backgroundHex) < 0.35 ? "#FFFFFF" : "#0F172A";
}

/** 凡例カラーバー用に n 分割のグラデ停止点 [{t, color}] を返す（n>=2）。 */
export function colormapLegendStops(n = 9): Array<{ t: number; color: string }> {
  const count = Math.max(2, Math.floor(n));
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    return { t, color: viridisColor(t) };
  });
}
