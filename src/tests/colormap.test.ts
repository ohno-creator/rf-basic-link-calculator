import { describe, expect, it } from "vitest";
import {
  colormapLegendStops,
  colormapTextColor,
  normalizeToUnit,
  relativeLuminance,
  viridisColor,
  VIRIDIS_STOPS
} from "@/lib/ui/colormap";

describe("viridisColor（知覚均等カラーマップ・Track H5）", () => {
  it("端点はアンカー色と一致（t=0 紫 / t=1 黄）", () => {
    expect(viridisColor(0)).toBe("#440154");
    expect(viridisColor(1)).toBe("#FDE725");
  });

  it("中点はアンカー中央の青緑", () => {
    expect(viridisColor(0.5)).toBe("#21918C");
  });

  it("範囲外はクランプ・非有限は t=0 扱い", () => {
    expect(viridisColor(-1)).toBe("#440154");
    expect(viridisColor(2)).toBe("#FDE725");
    expect(viridisColor(Number.NaN)).toBe("#440154");
  });

  it("アンカーは9点・すべて一意", () => {
    expect(VIRIDIS_STOPS).toHaveLength(9);
    expect(new Set(VIRIDIS_STOPS).size).toBe(9);
  });

  it("輝度は t に対して単調増加（知覚順序の担保）", () => {
    let prev = -1;
    for (let i = 0; i <= 10; i += 1) {
      const lum = relativeLuminance(viridisColor(i / 10));
      expect(lum).toBeGreaterThan(prev);
      prev = lum;
    }
  });
});

describe("normalizeToUnit", () => {
  it("min/max で正規化しクランプ", () => {
    expect(normalizeToUnit(-90, -100, -60)).toBeCloseTo(0.25, 10);
    expect(normalizeToUnit(-120, -100, -60)).toBe(0);
    expect(normalizeToUnit(0, -100, -60)).toBe(1);
  });

  it("min===max は 0.5、非有限は 0", () => {
    expect(normalizeToUnit(5, 5, 5)).toBe(0.5);
    expect(normalizeToUnit(Number.NaN, 0, 1)).toBe(0);
  });
});

describe("colormapTextColor（可読テキスト色）", () => {
  it("暗い側（紫・青）は白文字、明るい側（黄）は墨文字", () => {
    expect(colormapTextColor(viridisColor(0))).toBe("#FFFFFF");
    expect(colormapTextColor(viridisColor(0.3))).toBe("#FFFFFF");
    expect(colormapTextColor(viridisColor(1))).toBe("#0F172A");
  });
});

describe("colormapLegendStops（凡例グラデ）", () => {
  it("両端を含む n 個の停止点を返す", () => {
    const stops = colormapLegendStops(5);
    expect(stops).toHaveLength(5);
    expect(stops[0]).toEqual({ t: 0, color: "#440154" });
    expect(stops[4]).toEqual({ t: 1, color: "#FDE725" });
  });

  it("n<2 は 2 にクランプ", () => {
    expect(colormapLegendStops(1)).toHaveLength(2);
  });
});
