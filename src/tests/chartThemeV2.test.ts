import { describe, expect, it } from "vitest";
import {
  chartTheme,
  rfActiveDot,
  rfGridProps,
  rfTickProps,
  rfTooltipProps,
  seriesColor
} from "@/lib/chartTheme";

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
    // 目盛りテキストは AA 適合色（axis.label.fill）。装飾用 axis.tick.fill は使わない。
    expect(rfTickProps().fill).toBe(chartTheme.axis.label.fill);
    expect(rfTickProps().fill).not.toBe(chartTheme.axis.tick.fill);
    expect(rfTickProps().fontVariantNumeric).toBe("tabular-nums");
    const tooltip = rfTooltipProps();
    expect(tooltip.contentStyle.borderRadius).toBe(8);
    expect(tooltip.itemStyle.fontVariantNumeric).toBe("tabular-nums");
  });
});

describe("チャートのマイクロインタラクション（Track H2）", () => {
  it("cursor は AA 適合色の破線ガイド線", () => {
    const { cursor } = rfTooltipProps();
    expect(cursor.stroke).toBe(chartTheme.axis.label.fill);
    expect(cursor.strokeDasharray).toBe("4 4");
  });

  it("rfActiveDot は白ハロー付きの系列色スナップドット", () => {
    const dot = rfActiveDot(chartTheme.series.source);
    expect(dot.fill).toBe(chartTheme.series.source);
    expect(dot.stroke).toBe("#FFFFFF");
    expect(dot.strokeWidth).toBe(2);
    expect(dot.r).toBeGreaterThan(0);
  });
});
