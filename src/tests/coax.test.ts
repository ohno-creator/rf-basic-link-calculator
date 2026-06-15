import { describe, expect, it } from "vitest";
import { coaxCableLoss } from "@/lib/rf/coax";

describe("coaxial feedline loss", () => {
  it("computes total loss at the reference frequency", () => {
    // RG-316 (1.2 dB/m @2.4GHz), 2m, 2 connectors @0.15dB
    const result = coaxCableLoss(1.2, 2400, 2, 2);
    expect(result.perMeterDb).toBeCloseTo(1.2, 5);
    expect(result.cableDb).toBeCloseTo(2.4, 5);
    expect(result.connectorDb).toBeCloseTo(0.3, 5);
    expect(result.totalDb).toBeCloseTo(2.7, 5);
    expect(result.powerRemainingPercent).toBeCloseTo(53.7, 1);
  });

  it("scales attenuation with the square root of frequency", () => {
    // 600MHz = 2400/4 -> sqrt = 0.5
    const result = coaxCableLoss(1.2, 600, 1, 0);
    expect(result.perMeterDb).toBeCloseTo(0.6, 5);
    expect(result.totalDb).toBeCloseTo(0.6, 5);
  });

  it("maps a 3dB loss to about half the power remaining", () => {
    const result = coaxCableLoss(3, 2400, 1, 0);
    expect(result.powerRemainingPercent).toBeCloseTo(50.1, 1);
  });

  it("rejects invalid inputs", () => {
    expect(() => coaxCableLoss(0, 2400, 2, 2)).toThrow();
    expect(() => coaxCableLoss(1.2, 2400, 0, 2)).toThrow();
    expect(() => coaxCableLoss(1.2, 2400, 2, -1)).toThrow();
  });
});
