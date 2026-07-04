import { describe, expect, it } from "vitest";
import {
  calculateMetalPlaneEffect,
  METAL_PLANE_GAIN_DISPLAY_FLOOR_DB,
  METAL_PLANE_OPTIMAL_GAIN_DB,
  metalPlaneFieldFactor,
  metalPlaneGainChangeDb
} from "@/lib/rf/metalPlaneEffect";
import { calculateWavelengthFromMHz } from "@/lib/rf/frequency";
import { RfError } from "@/lib/rf/errors";

describe("metalPlaneEffect（G6・金属板近接の利得変化）", () => {
  it("定数: ピーク+6.0206dB・表示フロア-40dB", () => {
    expect(METAL_PLANE_OPTIMAL_GAIN_DB).toBeCloseTo(6.0205999133, 9);
    expect(METAL_PLANE_GAIN_DISPLAY_FLOOR_DB).toBe(-40);
  });

  it("920MHz, d=λ/4(81.46534mm) → +6.0206dB・F=2・x=0.25・isNull=false", () => {
    const r = calculateMetalPlaneEffect(920, 81.46534);
    expect(r.wavelengthM).toBeCloseTo(0.3258613674, 9);
    expect(r.distanceLambda).toBeCloseTo(0.25, 7);
    expect(r.fieldFactor).toBeCloseTo(2, 7);
    expect(r.gainChangeDb).toBeCloseTo(6.0206, 4);
    expect(r.isNull).toBe(false);
    expect(r.optimalDistanceM).toBeCloseTo(0.0814653418, 9);
    expect(r.nullSpacingM).toBeCloseTo(0.1629306837, 9);
  });

  it("920MHz, d=λ/8(40.73267mm) → +3.0103dB・F=1.41421", () => {
    const r = calculateMetalPlaneEffect(920, 40.73267);
    expect(r.distanceLambda).toBeCloseTo(0.125, 7);
    expect(r.fieldFactor).toBeCloseTo(1.41421, 5);
    expect(r.gainChangeDb).toBeCloseTo(3.0103, 4);
    expect(r.isNull).toBe(false);
  });

  it("d=λ/2（exact）はヌル: isNull=true・ΔG=-∞・F≈0", () => {
    const wavelengthM = calculateWavelengthFromMHz(920);
    const r = calculateMetalPlaneEffect(920, (wavelengthM / 2) * 1000);
    expect(r.isNull).toBe(true);
    expect(r.gainChangeDb).toBe(Number.NEGATIVE_INFINITY);
    expect(r.fieldFactor).toBeCloseTo(0, 10);
  });

  it("d=0（板に密着）もヌル: isNull=true・ΔG=-∞", () => {
    const r = calculateMetalPlaneEffect(920, 0);
    expect(r.distanceLambda).toBeCloseTo(0, 10);
    expect(r.isNull).toBe(true);
    expect(r.gainChangeDb).toBe(Number.NEGATIVE_INFINITY);
    expect(r.fieldFactor).toBeCloseTo(0, 10);
  });

  it("単体関数: F(0.25)=2 / ΔG(0.125)=+3.0103 / ΔG(0.5)=-∞", () => {
    expect(metalPlaneFieldFactor(0.25)).toBeCloseTo(2, 12);
    expect(metalPlaneGainChangeDb(0.25)).toBeCloseTo(6.0205999133, 9);
    expect(metalPlaneGainChangeDb(0.125)).toBeCloseTo(3.0102999566, 9);
    expect(metalPlaneGainChangeDb(0.5)).toBe(Number.NEGATIVE_INFINITY);
    expect(metalPlaneGainChangeDb(1)).toBe(Number.NEGATIVE_INFINITY);
  });

  it("ガード: 周波数≤0 / 距離<0 / x<0 は RfError", () => {
    expect(() => calculateMetalPlaneEffect(0, 10)).toThrowError(RfError);
    expect(() => calculateMetalPlaneEffect(920, -1)).toThrowError(RfError);
    expect(() => calculateMetalPlaneEffect(Number.NaN, 10)).toThrowError(RfError);
    expect(() => metalPlaneFieldFactor(-0.1)).toThrowError(RfError);
    expect(() => metalPlaneGainChangeDb(-0.1)).toThrowError(RfError);
  });
});
