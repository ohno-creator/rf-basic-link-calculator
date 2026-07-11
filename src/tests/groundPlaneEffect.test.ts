import { describe, expect, it } from "vitest";
import {
  calculateGroundPlaneEffect,
  groundPlaneEfficiencyDropDb,
  GROUND_PLANE_RECOMMENDED_FRACTION
} from "@/lib/rf/groundPlaneEffect";
import { GROUND_PLANE_EFFICIENCY_TABLE } from "@/data/groundPlaneEffect";
import { RfError } from "@/lib/rf/errors";

describe("groundPlaneEfficiencyDropDb", () => {
  it("returns the data-table anchor values exactly", () => {
    // 目安表（TI AN058 §3.1.2 / DN035 / EnOcean AN102 §4 の実測系目安の転記）の各アンカー点
    expect(groundPlaneEfficiencyDropDb(0)).toBeCloseTo(-20, 10);
    expect(groundPlaneEfficiencyDropDb(0.05)).toBeCloseTo(-12, 10);
    expect(groundPlaneEfficiencyDropDb(0.1)).toBeCloseTo(-6, 10);
    expect(groundPlaneEfficiencyDropDb(0.15)).toBeCloseTo(-3, 10);
    expect(groundPlaneEfficiencyDropDb(0.2)).toBeCloseTo(-1, 10);
    expect(groundPlaneEfficiencyDropDb(0.25)).toBe(0);
  });

  it("interpolates linearly between anchors (0.175 → -2.0dB)", () => {
    // 0.15(-3.0) と 0.20(-1.0) の中点 → -2.0
    expect(groundPlaneEfficiencyDropDb(0.175)).toBeCloseTo(-2.0, 10);
  });

  it("clamps to 0dB above Lg/λ=0.25 and never returns -0", () => {
    expect(groundPlaneEfficiencyDropDb(0.3)).toBe(0);
    expect(groundPlaneEfficiencyDropDb(1)).toBe(0);
    expect(Object.is(groundPlaneEfficiencyDropDb(0.25), -0)).toBe(false);
    expect(Object.is(groundPlaneEfficiencyDropDb(0.4), -0)).toBe(false);
  });

  it("is monotonically non-decreasing in Lg/λ (GNDを伸ばすほど低下量が減る)", () => {
    let previous = groundPlaneEfficiencyDropDb(0);
    for (let i = 1; i <= 35; i += 1) {
      const current = groundPlaneEfficiencyDropDb(i * 0.01);
      expect(current).toBeGreaterThanOrEqual(previous);
      previous = current;
    }
  });

  it("rejects negative Lg/λ", () => {
    expect(() => groundPlaneEfficiencyDropDb(-0.01)).toThrowError(RfError);
  });

  it("keeps the data table sorted and anchored at λ/4 → 0dB (前提の自己検証)", () => {
    const table = GROUND_PLANE_EFFICIENCY_TABLE;
    for (let i = 1; i < table.length; i += 1) {
      expect(table[i].lgOverLambda).toBeGreaterThan(table[i - 1].lgOverLambda);
      expect(table[i].efficiencyDropDb).toBeGreaterThanOrEqual(table[i - 1].efficiencyDropDb);
    }
    expect(table[table.length - 1].lgOverLambda).toBe(GROUND_PLANE_RECOMMENDED_FRACTION);
    expect(table[table.length - 1].efficiencyDropDb).toBe(0);
  });
});

describe("calculateGroundPlaneEffect", () => {
  it("920MHz (λ=325.86mm)・Lg=81.5mm → Lg/λ≈0.25 → 0dB（λ/4確保でクランプ）", () => {
    const result = calculateGroundPlaneEffect({ frequencyMHz: 920, groundLengthMm: 81.5 });
    expect(result.wavelengthMm).toBeCloseTo(325.86, 1);
    expect(result.lgOverLambda).toBeCloseTo(0.25, 3);
    expect(result.efficiencyDropDb).toBe(0);
    // 推奨GND長 = λ/4 ≈ 81.47mm
    expect(result.recommendedLengthMm).toBeCloseTo(81.47, 1);
  });

  it("920MHz・Lg=32.59mm → Lg/λ≈0.10 → 約-6.0dB", () => {
    const result = calculateGroundPlaneEffect({ frequencyMHz: 920, groundLengthMm: 32.59 });
    expect(result.lgOverLambda).toBeCloseTo(0.1, 3);
    expect(result.efficiencyDropDb).toBeCloseTo(-6.0, 2);
  });

  it("920MHz・Lg=48.88mm → Lg/λ≈0.15 → 約-3.0dB", () => {
    const result = calculateGroundPlaneEffect({ frequencyMHz: 920, groundLengthMm: 48.88 });
    expect(result.lgOverLambda).toBeCloseTo(0.15, 3);
    expect(result.efficiencyDropDb).toBeCloseTo(-3.0, 2);
  });

  it("Lg=0（GNDなし）→ -20dB", () => {
    const result = calculateGroundPlaneEffect({ frequencyMHz: 920, groundLengthMm: 0 });
    expect(result.lgOverLambda).toBe(0);
    expect(result.efficiencyDropDb).toBe(-20);
  });

  it("guards invalid inputs (周波数≤0・負のGND長・NaN)", () => {
    expect(() => calculateGroundPlaneEffect({ frequencyMHz: 0, groundLengthMm: 10 })).toThrowError(RfError);
    expect(() => calculateGroundPlaneEffect({ frequencyMHz: -920, groundLengthMm: 10 })).toThrowError(RfError);
    expect(() => calculateGroundPlaneEffect({ frequencyMHz: 920, groundLengthMm: -1 })).toThrowError(RfError);
    expect(() =>
      calculateGroundPlaneEffect({ frequencyMHz: 920, groundLengthMm: Number.NaN })
    ).toThrowError(RfError);
  });
});
