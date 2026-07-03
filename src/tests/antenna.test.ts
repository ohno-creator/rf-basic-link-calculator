import { describe, expect, it } from "vitest";
import {
  calculateAntennaSpacing,
  calculateApertureAntenna,
  calculateEffectiveAperture,
  calculateGratingLobes,
  calculatePatchAntenna,
  calculateRadiationResistance,
  calculateReflectorRisEffect,
  calculateSmallAntennaLimit,
  dbiToDbd
} from "@/lib/rf/antenna";
import { calculateFsplDb } from "@/lib/rf/fspl";

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

  it("uses total dipole length for short-dipole radiation resistance", () => {
    const result = calculateRadiationResistance({
      frequencyMHz: 920,
      lengthMm: 60,
      lossResistanceOhm: 2,
      kind: "dipole"
    });
    const expectedResistanceOhm = 20 * Math.PI ** 2 * (result.lengthM / result.wavelengthM) ** 2;

    expect(result.radiationResistanceOhm).toBeCloseTo(expectedResistanceOhm, 8);
    expect(result.efficiency).toBeCloseTo(
      expectedResistanceOhm / (expectedResistanceOhm + 2),
      8
    );
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

  it("applies aperture gain to both legs of a passive reflector path", () => {
    const result = calculateReflectorRisEffect({
      frequencyMHz: 4800,
      widthM: 1,
      heightM: 1,
      txDistanceM: 30,
      rxDistanceM: 30,
      efficiencyPercent: 50
    });
    const expectedLossDb =
      calculateFsplDb(4800, 0.03) +
      calculateFsplDb(4800, 0.03) -
      2 * result.apertureGainDbi;

    expect(result.twoHopLossUpperBoundDb).toBeCloseTo(expectedLossDb, 8);
    expect(result.clampedToMirrorLimit).toBe(false);
  });

  it("clamps the passive reflector loss at the mirror limit FSPL(d1+d2)", () => {
    const result = calculateReflectorRisEffect({
      frequencyMHz: 4800,
      widthM: 2,
      heightM: 2,
      txDistanceM: 30,
      rxDistanceM: 30,
      efficiencyPercent: 50
    });
    const mirrorLimitDb = calculateFsplDb(4800, 0.06);

    expect(result.twoHopLossUpperBoundDb).toBeCloseTo(mirrorLimitDb, 8);
    expect(result.excessVsDirectDb).toBeCloseTo(0, 8);
    expect(result.clampedToMirrorLimit).toBe(true);
  });
});
