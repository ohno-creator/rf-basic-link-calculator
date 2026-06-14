import { describe, expect, it } from "vitest";
import { convertVswr } from "@/lib/rf/vswr";

describe("VSWR / return loss / reflection conversions", () => {
  it("converts a VSWR of 2.0 to the expected indicators", () => {
    const result = convertVswr("vswr", 2);

    expect(result.reflectionCoefficient).toBeCloseTo(1 / 3, 4);
    expect(result.returnLossDb).toBeCloseTo(9.54, 2);
    expect(result.reflectedPowerPercent).toBeCloseTo(11.11, 2);
    expect(result.mismatchLossDb).toBeCloseTo(0.512, 2);
  });

  it("round-trips return loss back to VSWR", () => {
    const fromVswr = convertVswr("vswr", 1.5);
    const fromRl = convertVswr("returnLoss", fromVswr.returnLossDb);

    expect(fromRl.vswr).toBeCloseTo(1.5, 4);
  });

  it("treats a perfect match as infinite return loss and VSWR of 1", () => {
    const result = convertVswr("reflection", 0);

    expect(result.vswr).toBe(1);
    expect(result.returnLossDb).toBe(Number.POSITIVE_INFINITY);
    expect(result.reflectedPowerPercent).toBe(0);
  });

  it("rejects invalid inputs", () => {
    expect(() => convertVswr("vswr", 0.5)).toThrow();
    expect(() => convertVswr("returnLoss", -1)).toThrow();
    expect(() => convertVswr("reflection", 1)).toThrow();
  });
});
