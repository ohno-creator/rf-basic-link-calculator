import { describe, expect, it } from "vitest";
import { mismatchRangeImpact } from "@/lib/rf/mismatchRangeImpact";
import { RfError } from "@/lib/rf/errors";

describe("mismatchRangeImpact（G9・整合ずれ→距離影響）", () => {
  it("VSWR=3 → Γ=0.5 / ML=1.25dB / 距離倍率0.866 / 影響−13.4% / 反射25%", () => {
    const r = mismatchRangeImpact(3);
    expect(r.reflectionCoefficient).toBeCloseTo(0.5, 10);
    expect(r.mismatchLossDb).toBeCloseTo(1.2494, 4);
    expect(r.distanceRatio).toBeCloseTo(0.866, 3);
    expect(r.distanceImpactPercent).toBeCloseTo(-13.4, 1);
    expect(r.reflectedPowerPercent).toBeCloseTo(25, 6);
  });

  it("VSWR=1 → 整合。ML=0 / 距離影響0% / 反射0%", () => {
    const r = mismatchRangeImpact(1);
    // ML = -10·log10(1) は -0 になり得るため toBeCloseTo で比較（値は0）。
    expect(r.mismatchLossDb).toBeCloseTo(0, 10);
    expect(r.distanceRatio).toBeCloseTo(1, 10);
    expect(r.distanceImpactPercent).toBeCloseTo(0, 10);
    expect(r.reflectedPowerPercent).toBeCloseTo(0, 10);
  });

  it("VSWR=2 → Γ≈0.333 / ML≈0.512dB / 影響−5.7%", () => {
    const r = mismatchRangeImpact(2);
    expect(r.reflectionCoefficient).toBeCloseTo(0.3333, 4);
    expect(r.mismatchLossDb).toBeCloseTo(0.5115, 4);
    expect(r.distanceImpactPercent).toBeCloseTo(-5.7, 1);
  });

  it("VSWRが大きいほど距離影響は単調に悪化", () => {
    expect(mismatchRangeImpact(5).distanceImpactPercent).toBeLessThan(
      mismatchRangeImpact(3).distanceImpactPercent
    );
  });

  it("ガード: VSWR<1 は RfError（vswr.ts のガード継承）", () => {
    expect(() => mismatchRangeImpact(0.5)).toThrowError(RfError);
    expect(() => mismatchRangeImpact(Number.NaN)).toThrowError(RfError);
  });
});
