import { describe, expect, it } from "vitest";
import {
  calculateAntennaSpacing,
  calculateApertureAntenna,
  calculateEffectiveAperture,
  calculateGratingLobes,
  calculatePatchAntenna,
  calculateRadiationResistance,
  calculateSmallAntennaLimit,
  dbiToDbd
} from "@/lib/rf/antenna";

describe("antenna calculations", () => {
  it("converts dBi to dBd", () => {
    expect(dbiToDbd(2.15)).toBeCloseTo(0, 3);
  });

  it("calculates effective aperture from gain", () => {
    const result = calculateEffectiveAperture(920, 2.15);

    expect(result.areaM2).toBeCloseTo(0.0135, 3);
    expect(result.gainLinear).toBeCloseTo(1.64, 2);
  });

  it("calculates aperture antenna gain and beamwidth", () => {
    const result = calculateApertureAntenna({
      frequencyMHz: 60000,
      diameterM: 0.05,
      efficiencyPercent: 60
    });

    expect(result.gainDbi).toBeGreaterThan(25);
    expect(result.hpbwDeg).toBeLessThan(8);
  });

  it("normalizes antenna spacing by wavelength", () => {
    const result = calculateAntennaSpacing(2400, 0.0625);

    expect(result.spacingLambda).toBeCloseTo(0.5, 1);
  });

  it("detects visible grating lobes for wide spacing", () => {
    const result = calculateGratingLobes({
      frequencyMHz: 4800,
      spacingM: 0.06,
      scanAngleDeg: 45
    });

    expect(result.hasVisibleGratingLobe).toBe(true);
  });

  it("estimates rectangular patch dimensions", () => {
    const result = calculatePatchAntenna({
      frequencyMHz: 2400,
      dielectricConstant: 4.3,
      substrateHeightMm: 1.6
    });

    expect(result.widthM).toBeGreaterThan(0.035);
    expect(result.lengthM).toBeGreaterThan(0.025);
  });

  it("shows short antennas are sensitive to loss resistance", () => {
    const result = calculateRadiationResistance({
      frequencyMHz: 920,
      lengthMm: 30,
      lossResistanceOhm: 2,
      kind: "monopole"
    });

    expect(result.radiationResistanceOhm).toBeLessThan(4);
    expect(result.efficiencyPercent).toBeLessThan(70);
  });

  it("calculates small antenna Chu-limit quantities", () => {
    const result = calculateSmallAntennaLimit({
      frequencyMHz: 920,
      radiusMm: 20,
      targetBandwidthPercent: 2
    });

    expect(result.ka).toBeLessThan(0.5);
    expect(result.chuQ).toBeGreaterThan(10);
  });
});
