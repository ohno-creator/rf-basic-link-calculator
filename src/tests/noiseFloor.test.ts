import { describe, expect, it } from "vitest";
import {
  calculateNoiseFloorDbm,
  calculateNoiseSensitivity,
  calculateSensitivityDbm,
  THERMAL_NOISE_DENSITY_DBM_PER_HZ
} from "@/lib/rf/noiseFloor";
import { RfError } from "@/lib/rf/errors";

describe("calculateNoiseFloorDbm", () => {
  it("returns the thermal density at 1Hz with NF=0", () => {
    expect(calculateNoiseFloorDbm(1, 0)).toBeCloseTo(THERMAL_NOISE_DENSITY_DBM_PER_HZ, 10);
    expect(THERMAL_NOISE_DENSITY_DBM_PER_HZ).toBe(-174);
  });

  it("adds 10log10(BW) and the noise figure", () => {
    // -174 + 10log10(125000) + 6
    expect(calculateNoiseFloorDbm(125000, 6)).toBeCloseTo(-117.031, 3);
  });

  it("is linear in the noise figure (加算性)", () => {
    expect(calculateNoiseFloorDbm(125000, 6) + 3).toBeCloseTo(calculateNoiseFloorDbm(125000, 9), 10);
  });

  it("rises ~3.01dB when the bandwidth doubles", () => {
    expect(calculateNoiseFloorDbm(250000, 6) - calculateNoiseFloorDbm(125000, 6)).toBeCloseTo(3.0103, 3);
  });

  it("guards non-positive bandwidth and non-finite noise figure", () => {
    expect(() => calculateNoiseFloorDbm(0, 6)).toThrowError(RfError);
    expect(() => calculateNoiseFloorDbm(-1, 6)).toThrowError(RfError);
    expect(() => calculateNoiseFloorDbm(125000, Number.NaN)).toThrowError(RfError);
  });
});

describe("calculateSensitivityDbm", () => {
  it("reproduces the LoRa SF12 sensitivity (125kHz, NF6, SNR -20 → ≈ -137dBm)", () => {
    expect(calculateSensitivityDbm(125000, 6, -20)).toBeCloseTo(-137.031, 3);
  });

  it("adds the required SNR to the noise floor", () => {
    const bw = 200000;
    const nf = 8;
    const snr = 10;
    expect(calculateSensitivityDbm(bw, nf, snr)).toBeCloseTo(calculateNoiseFloorDbm(bw, nf) + snr, 10);
  });

  it("guards a non-finite required SNR", () => {
    expect(() => calculateSensitivityDbm(125000, 6, Number.NaN)).toThrowError(RfError);
  });
});

describe("calculateNoiseSensitivity", () => {
  it("returns both the noise floor and the sensitivity", () => {
    const result = calculateNoiseSensitivity(125000, 6, -20);
    expect(result.noiseFloorDbm).toBeCloseTo(-117.031, 3);
    expect(result.sensitivityDbm).toBeCloseTo(-137.031, 3);
  });
});
