import { describe, expect, it } from "vitest";
import {
  LEE_SAMPLES_PER_WINDOW,
  LEE_WINDOW_WAVELENGTHS,
  leeSampleSpacingM,
  leeWindowLengthM,
  requiredSampleCount,
  requiredSampleCountExact,
  zForTwoSidedConfidence
} from "@/lib/rf/measurementSampling";
import { RfError } from "@/lib/rf/errors";

describe("zForTwoSidedConfidence（両側 z = Φ⁻¹((1+c)/2)）", () => {
  it("95% → z=1.959964", () => {
    expect(zForTwoSidedConfidence(0.95)).toBeCloseTo(1.959964, 5);
  });

  it("90% → z=1.644854", () => {
    expect(zForTwoSidedConfidence(0.9)).toBeCloseTo(1.644854, 5);
  });

  it("ガード: c<=0 / c>=1 / NaN は RfError", () => {
    expect(() => zForTwoSidedConfidence(0)).toThrowError(RfError);
    expect(() => zForTwoSidedConfidence(1)).toThrowError(RfError);
    expect(() => zForTwoSidedConfidence(Number.NaN)).toThrowError(RfError);
  });
});

describe("requiredSampleCountExact（n_exact = (z·σ/E)²・独立サンプル前提）", () => {
  it("σ=8dB, ±2dB, 95% → 61.4633", () => {
    expect(requiredSampleCountExact(8, 2, 0.95)).toBeCloseTo(61.4633, 3);
  });

  it("σ=6dB, ±1dB, 90% → 97.3996", () => {
    expect(requiredSampleCountExact(6, 1, 0.9)).toBeCloseTo(97.3996, 3);
  });

  it("σ=0dB なら 0（-0対策で toBeCloseTo）", () => {
    expect(requiredSampleCountExact(0, 1, 0.95)).toBeCloseTo(0, 10);
  });

  it("ガード: σ負 / E<=0 は RfError", () => {
    expect(() => requiredSampleCountExact(-1, 2, 0.95)).toThrowError(RfError);
    expect(() => requiredSampleCountExact(8, 0, 0.95)).toThrowError(RfError);
    expect(() => requiredSampleCountExact(8, -2, 0.95)).toThrowError(RfError);
  });
});

describe("requiredSampleCount（n = max(1, ceil(n_exact))）", () => {
  it("σ=8dB, ±2dB, 95% → 62", () => {
    expect(requiredSampleCount(8, 2, 0.95)).toBe(62);
  });

  it("σ=6dB, ±1dB, 90% → 98", () => {
    expect(requiredSampleCount(6, 1, 0.9)).toBe(98);
  });

  it("σ=4dB, ±1.5dB, 99% → 48", () => {
    expect(requiredSampleCount(4, 1.5, 0.99)).toBe(48);
  });

  it("σ=8dB, ±3dB, 90% → 20", () => {
    expect(requiredSampleCount(8, 3, 0.9)).toBe(20);
  });

  it("下限: σ=0.5dB, ±5dB, 95% → 1", () => {
    expect(requiredSampleCount(0.5, 5, 0.95)).toBe(1);
  });
});

describe("Lee 基準（窓長40λ・窓内50点）", () => {
  it("定数: 40λ / 50点", () => {
    expect(LEE_WINDOW_WAVELENGTHS).toBe(40);
    expect(LEE_SAMPLES_PER_WINDOW).toBe(50);
  });

  it("920MHz → 窓長 13.0345m", () => {
    expect(leeWindowLengthM(920)).toBeCloseTo(13.0345, 3);
  });

  it("920MHz → 間隔 0.260689m（=0.8λ）", () => {
    expect(leeSampleSpacingM(920)).toBeCloseTo(0.260689, 5);
    expect(leeSampleSpacingM(920)).toBeCloseTo(leeWindowLengthM(920) / 50, 12);
  });

  it("ガード: f<=0 / NaN は RfError", () => {
    expect(() => leeWindowLengthM(0)).toThrowError(RfError);
    expect(() => leeWindowLengthM(-920)).toThrowError(RfError);
    expect(() => leeSampleSpacingM(Number.NaN)).toThrowError(RfError);
  });
});
