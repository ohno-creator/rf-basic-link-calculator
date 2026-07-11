import { describe, expect, it } from "vitest";
import {
  analyzeGroundPlaneSize,
  interpolateGroundPlaneEfficiencyChange,
  type GroundPlaneEfficiencyPoint
} from "@/lib/rf/groundPlaneSize";
import { RfError } from "@/lib/rf/errors";

const table: readonly GroundPlaneEfficiencyPoint[] = [
  { ratio: 0, efficiencyChangeDb: -20 },
  { ratio: 0.05, efficiencyChangeDb: -12 },
  { ratio: 0.1, efficiencyChangeDb: -6 },
  { ratio: 0.15, efficiencyChangeDb: -3 },
  { ratio: 0.2, efficiencyChangeDb: -1 },
  { ratio: 0.25, efficiencyChangeDb: 0 }
];

describe("GND長/λの区分線形補間", () => {
  it("端点一致と上下クランプ", () => {
    expect(interpolateGroundPlaneEfficiencyChange(0.1, table)).toBe(-6);
    expect(interpolateGroundPlaneEfficiencyChange(0, table)).toBe(-20);
    expect(interpolateGroundPlaneEfficiencyChange(0.4, table)).toBe(0);
  });

  it("ratio=0.125 → -4.5dB", () => {
    expect(interpolateGroundPlaneEfficiencyChange(0.125, table)).toBeCloseTo(-4.5, 12);
  });

  it("補間値はratio増加に対して単調非減少", () => {
    const values = Array.from({ length: 26 }, (_, index) =>
      interpolateGroundPlaneEfficiencyChange(index / 100, table)
    );
    for (let index = 1; index < values.length; index += 1) {
      expect(values[index]).toBeGreaterThanOrEqual(values[index - 1]);
    }
  });

  it("不正テーブルと負ratioはRfError", () => {
    expect(() => interpolateGroundPlaneEfficiencyChange(-0.1, table)).toThrowError(RfError);
    expect(() => interpolateGroundPlaneEfficiencyChange(0.1, [])).toThrowError(RfError);
    expect(() => interpolateGroundPlaneEfficiencyChange(0.1, [table[1], table[0]])).toThrowError(RfError);
  });
});

describe("analyzeGroundPlaneSize", () => {
  it("920MHz・λ/4相当なら変化0dB", () => {
    const quarterWavelengthMm = (299_792_458 / (920 * 1_000_000) / 4) * 1000;
    const result = analyzeGroundPlaneSize({ frequencyMHz: 920, groundLengthMm: quarterWavelengthMm, table });
    expect(result.groundToWavelengthRatio).toBeCloseTo(0.25, 4);
    expect(result.efficiencyChangeDb).toBe(0);
    expect(result.recommendedGroundLengthMm).toBeCloseTo(81.4653, 3);
  });

  it("GND長0mmはテーブル下端へクランプ", () => {
    const result = analyzeGroundPlaneSize({ frequencyMHz: 920, groundLengthMm: 0, table });
    expect(result.efficiencyChangeDb).toBe(-20);
  });

  it("周波数<=0・GND長<0はRfError", () => {
    expect(() => analyzeGroundPlaneSize({ frequencyMHz: 0, groundLengthMm: 10, table })).toThrowError(RfError);
    expect(() => analyzeGroundPlaneSize({ frequencyMHz: 920, groundLengthMm: -1, table })).toThrowError(RfError);
  });
});
