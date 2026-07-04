import { describe, expect, it } from "vitest";
import { chartTheme, rfGridProps, rfTickProps, rfTooltipProps, seriesColor } from "@/lib/chartTheme";

describe("chartTheme v2（Track H1）", () => {
  it("後方互換: 既存の semantic 系列色は不変", () => {
    expect(chartTheme.series.source).toBe("#0071BD");
    expect(chartTheme.series.gain).toBe("#10B981");
    expect(chartTheme.series.loss).toBe("#FB7185");
    expect(chartTheme.series.total).toBe("#1E293B");
  });

  it("カテゴリカルパレットは Okabe-Ito 基調の8色・重複なし", () => {
    expect(chartTheme.categorical).toHaveLength(8);
    expect(new Set(chartTheme.categorical).size).toBe(8);
    // 原典の代表値（blue/orange/green/vermillion）を含む
    expect(chartTheme.categorical).toContain("#0072B2");
    expect(chartTheme.categorical).toContain("#E69F00");
    expect(chartTheme.categorical).toContain("#009E73");
    expect(chartTheme.categorical).toContain("#D55E00");
  });

  it("seriesColor はパレットを巡回し負インデックスも安全", () => {
    expect(seriesColor(0)).toBe(chartTheme.categorical[0]);
    expect(seriesColor(8)).toBe(chartTheme.categorical[0]);
    expect(seriesColor(9)).toBe(chartTheme.categorical[1]);
    expect(seriesColor(-1)).toBe(chartTheme.categorical[7]);
  });

  it("prop ファクトリはテーマ値を反映する", () => {
    expect(rfGridProps().stroke).toBe(chartTheme.grid.primary);
    expect(rfTickProps().fontSize).toBe(chartTheme.axis.tick.fontSize);
    expect(rfTickProps().fontVariantNumeric).toBe("tabular-nums");
    const tooltip = rfTooltipProps();
    expect(tooltip.contentStyle.borderRadius).toBe(8);
    expect(tooltip.itemStyle.fontVariantNumeric).toBe("tabular-nums");
    expect(tooltip.cursor.stroke).toBe(chartTheme.grid.secondary);
  });
});
