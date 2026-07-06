import { describe, expect, it } from "vitest";
import { calculateAntennaIsolation } from "@/lib/rf/antennaIsolation";
import { RfError } from "@/lib/rf/errors";

describe("calculateAntennaIsolation", () => {
  it("d=λ/2・2.15dBi×2でS21≈-11.7dBを再現する", () => {
    const wavelengthMm = 299_792.458 / 920;
    const result = calculateAntennaIsolation({
      frequencyMHz: 920,
      spacingMm: wavelengthMm / 2,
      antenna1GainDbi: 2.15,
      antenna2GainDbi: 2.15
    });
    expect(result.couplingDb).toBeCloseTo(-11.6636, 4);
    expect(result.isNearFieldEstimate).toBe(false);
    expect(result.quality).toBe("caution");
    expect(result.spacingWavelengths).toBeCloseTo(0.5, 10);
  });

  it("間隔を2倍にすると結合が約6.02dB小さくなる", () => {
    const near = calculateAntennaIsolation({
      frequencyMHz: 2400,
      spacingMm: 100,
      antenna1GainDbi: 0,
      antenna2GainDbi: 0
    });
    const far = calculateAntennaIsolation({
      frequencyMHz: 2400,
      spacingMm: 200,
      antenna1GainDbi: 0,
      antenna2GainDbi: 0
    });
    expect(far.couplingDb - near.couplingDb).toBeCloseTo(-6.0206, 4);
  });

  it("-15dB達成推奨間隔を式へ戻すと-15dBになる", () => {
    const result = calculateAntennaIsolation({
      frequencyMHz: 920,
      spacingMm: 200,
      antenna1GainDbi: 2.15,
      antenna2GainDbi: 2.15,
      targetCouplingDb: -15
    });
    const atRecommendation = calculateAntennaIsolation({
      frequencyMHz: 920,
      spacingMm: result.recommendedSpacingMm,
      antenna1GainDbi: 2.15,
      antenna2GainDbi: 2.15,
      targetCouplingDb: -15
    });
    expect(atRecommendation.couplingDb).toBeCloseTo(-15, 10);
    expect(atRecommendation.quality).toBe("good");
  });

  it("d<λ/2を近傍界の参考値としてフラグする", () => {
    const result = calculateAntennaIsolation({
      frequencyMHz: 920,
      spacingMm: 10,
      antenna1GainDbi: -3,
      antenna2GainDbi: -3
    });
    expect(result.isNearFieldEstimate).toBe(true);
  });

  it("極端に大きい有限間隔でも有限の結合量を返す", () => {
    const result = calculateAntennaIsolation({
      frequencyMHz: 920,
      spacingMm: Number.MAX_VALUE,
      antenna1GainDbi: 0,
      antenna2GainDbi: 0
    });
    expect(Number.isFinite(result.couplingDb)).toBe(true);
    expect(Number.isFinite(result.spacingWavelengths)).toBe(true);
  });

  it("非正周波数・間隔と非有限利得を拒否する", () => {
    expect(() =>
      calculateAntennaIsolation({ frequencyMHz: 0, spacingMm: 100, antenna1GainDbi: 0, antenna2GainDbi: 0 })
    ).toThrowError(RfError);
    expect(() =>
      calculateAntennaIsolation({ frequencyMHz: 920, spacingMm: 0, antenna1GainDbi: 0, antenna2GainDbi: 0 })
    ).toThrowError(RfError);
    expect(() =>
      calculateAntennaIsolation({ frequencyMHz: 920, spacingMm: 100, antenna1GainDbi: Number.NaN, antenna2GainDbi: 0 })
    ).toThrowError(RfError);
    expect(() =>
      calculateAntennaIsolation({
        frequencyMHz: 920,
        spacingMm: 100,
        antenna1GainDbi: 0,
        antenna2GainDbi: 0,
        targetCouplingDb: -Number.MAX_VALUE
      })
    ).toThrowError(RfError);
  });
});
