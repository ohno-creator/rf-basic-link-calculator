import { describe, expect, it } from "vitest";
import {
  buildReliabilityMarginTable,
  inverseStandardNormalCdf,
  SHADOW_FADING_STD_PRESETS_DB,
  shadowingMarginDb,
  shadowingMarginDbByPercent,
  upperTailInverseNormal
} from "@/lib/rf/shadowingMargin";
import { calculateReliabilityMarginDb } from "@/lib/rf/researchDistance";
import { RfError } from "@/lib/rf/errors";

describe("inverseStandardNormalCdf（標準正規の逆累積 Φ⁻¹）", () => {
  it("Φ⁻¹(0.5)=0", () => {
    expect(inverseStandardNormalCdf(0.5)).toBe(0);
  });

  it("正典の分位点を再現（Acklam有理近似・絶対誤差<1e-8）", () => {
    expect(inverseStandardNormalCdf(0.8)).toBeCloseTo(0.841621, 5);
    expect(inverseStandardNormalCdf(0.9)).toBeCloseTo(1.281552, 5);
    expect(inverseStandardNormalCdf(0.95)).toBeCloseTo(1.644854, 5);
    expect(inverseStandardNormalCdf(0.99)).toBeCloseTo(2.326348, 5);
  });

  it("対称性: Φ⁻¹(1-p) = -Φ⁻¹(p)", () => {
    expect(inverseStandardNormalCdf(0.1)).toBeCloseTo(-inverseStandardNormalCdf(0.9), 6);
  });

  it("定義域ガード: p<=0 / p>=1 / NaN は RfError", () => {
    expect(() => inverseStandardNormalCdf(0)).toThrowError(RfError);
    expect(() => inverseStandardNormalCdf(1)).toThrowError(RfError);
    expect(() => inverseStandardNormalCdf(Number.NaN)).toThrowError(RfError);
  });
});

describe("upperTailInverseNormal（上側逆 Q⁻¹(y)=Φ⁻¹(1-y)）", () => {
  it("Q⁻¹(0.1) = Φ⁻¹(0.9) ≈ 1.2816", () => {
    expect(upperTailInverseNormal(0.1)).toBeCloseTo(1.281552, 5);
    expect(upperTailInverseNormal(0.1)).toBeCloseTo(inverseStandardNormalCdf(0.9), 12);
  });
});

describe("shadowingMarginDb（必要マージン = σ·Φ⁻¹(信頼率）", () => {
  it("信頼率50%はマージン0", () => {
    expect(shadowingMarginDb(8, 0.5)).toBe(0);
  });

  it("σ=8dB(都市), p=99% → 18.6108dB", () => {
    expect(shadowingMarginDb(8, 0.99)).toBeCloseTo(18.610783, 4);
  });

  it("百分率API: σ=8dB, 90% → 10.2524dB", () => {
    expect(shadowingMarginDbByPercent(8, 90)).toBeCloseTo(10.252413, 4);
  });

  it("百分率API: σ=4dB(開放), 95% → 6.5794dB", () => {
    expect(shadowingMarginDbByPercent(4, 95)).toBeCloseTo(6.579415, 4);
  });

  it("σ=0はマージン0（許容）", () => {
    expect(shadowingMarginDb(0, 0.99)).toBe(0);
  });

  it("ガード: σ負 / 信頼率0・1 / percent0・100 は RfError", () => {
    expect(() => shadowingMarginDb(-1, 0.9)).toThrowError(RfError);
    expect(() => shadowingMarginDb(8, 0)).toThrowError(RfError);
    expect(() => shadowingMarginDb(8, 1)).toThrowError(RfError);
    expect(() => shadowingMarginDbByPercent(8, 0)).toThrowError(RfError);
    expect(() => shadowingMarginDbByPercent(8, 100)).toThrowError(RfError);
  });
});

describe("buildReliabilityMarginTable", () => {
  it("50/80/90/95/99% の行を生成し、50%は0", () => {
    const table = buildReliabilityMarginTable(8);
    expect(table.map((r) => r.reliabilityPercent)).toEqual([50, 80, 90, 95, 99]);
    expect(table[0].marginDb).toBe(0);
    expect(table[2].marginDb).toBeCloseTo(10.252413, 4);
    expect(table[4].marginDb).toBeCloseTo(18.610783, 4);
  });
});

describe("研究距離libとの整合（丸めテーブルとは0.004dB以内で近接）", () => {
  // researchDistance.ts の RELIABILITY_Z は3桁丸めテーブルのため完全一致は不可能。
  // 精密Acklamとの差は σ=8dB で最大0.0036dB（p=90%）に収まることを固定する。
  it.each([80, 90, 95, 99] as const)("%i%% で研究距離マージンと0.004dB以内", (percent) => {
    const precise = shadowingMarginDbByPercent(8, percent);
    const rounded = calculateReliabilityMarginDb({
      reliabilityPercent: percent,
      shadowFadingStdDb: 8,
      fadeMarginDb: 0
    });
    expect(Math.abs(precise - rounded)).toBeLessThan(0.004);
  });
});

describe("シャドウイングσプリセット", () => {
  it("都市8 / 郊外6 / 開放4 dB", () => {
    expect(SHADOW_FADING_STD_PRESETS_DB.urban).toBe(8);
    expect(SHADOW_FADING_STD_PRESETS_DB.suburban).toBe(6);
    expect(SHADOW_FADING_STD_PRESETS_DB.open).toBe(4);
  });
});
