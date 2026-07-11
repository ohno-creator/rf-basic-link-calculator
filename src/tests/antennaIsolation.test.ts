import { describe, expect, it } from "vitest";
import {
  calculateAntennaIsolation
} from "@/lib/rf/antennaIsolation";
import { RfError } from "@/lib/rf/errors";

describe("antennaIsolation（G11・遠方界Friis結合目安）", () => {
  it("d=λ/2・G1=G2=2.15dBi → S21≈-11.66dB、近傍界境界内", () => {
    const wavelengthMm = 299_792_458 / (920 * 1e6) * 1000;
    const result = calculateAntennaIsolation({
      frequencyMHz: 920,
      spacingMm: wavelengthMm / 2,
      antenna1GainDbi: 2.15,
      antenna2GainDbi: 2.15
    });
    expect(result.couplingDb).toBeCloseTo(-11.6636, 4);
    expect(result.quality).toBe("caution");
    expect(result.isNearFieldEstimate).toBe(false);
    expect(result.spacingWavelengths).toBeCloseTo(0.5, 12);
  });

  it("距離2倍で結合が約6.0206dB低下する", () => {
    const at100 = calculateAntennaIsolation({ frequencyMHz: 920, spacingMm: 100, antenna1GainDbi: 0, antenna2GainDbi: 0 });
    const at200 = calculateAntennaIsolation({ frequencyMHz: 920, spacingMm: 200, antenna1GainDbi: 0, antenna2GainDbi: 0 });
    expect(at200.couplingDb - at100.couplingDb).toBeCloseTo(-6.0206, 4);
  });

  it("-15dB達成距離の逆算は元式と往復一致する", () => {
    const initial = calculateAntennaIsolation({ frequencyMHz: 920, spacingMm: 100, antenna1GainDbi: 2.15, antenna2GainDbi: 2.15 });
    const distanceMm = initial.recommendedSpacingMm;
    const atTarget = calculateAntennaIsolation({ frequencyMHz: 920, spacingMm: distanceMm, antenna1GainDbi: 2.15, antenna2GainDbi: 2.15 });
    expect(atTarget.couplingDb).toBeCloseTo(-15, 12);
    expect(distanceMm).toBeGreaterThan((299_792_458 / (920 * 1e6) * 1000) / 2);
  });

  it("判定境界: -15dB以下=good、-10dB超=insufficient", () => {
    const base = calculateAntennaIsolation({ frequencyMHz: 920, spacingMm: 100, antenna1GainDbi: 0, antenna2GainDbi: 0 });
    const good = calculateAntennaIsolation({ frequencyMHz: 920, spacingMm: base.recommendedSpacingMm, antenna1GainDbi: 0, antenna2GainDbi: 0 });
    const poor = calculateAntennaIsolation({ frequencyMHz: 920, spacingMm: base.recommendedSpacingMm, antenna1GainDbi: 5.01, antenna2GainDbi: 0 });
    expect(good.quality).toBe("good");
    expect(poor.quality).toBe("insufficient");
  });

  it("d<λ/2では参考値フラグを立て、無効入力はRfError", () => {
    const wavelengthMm = 299_792_458 / (920 * 1e6) * 1000;
    expect(calculateAntennaIsolation({
      frequencyMHz: 920,
      spacingMm: wavelengthMm / 2 - 0.001,
      antenna1GainDbi: 0,
      antenna2GainDbi: 0
    }).isNearFieldEstimate).toBe(true);
    expect(() => calculateAntennaIsolation({ frequencyMHz: 0, spacingMm: 100, antenna1GainDbi: 0, antenna2GainDbi: 0 })).toThrowError(RfError);
    expect(() => calculateAntennaIsolation({ frequencyMHz: 920, spacingMm: 0, antenna1GainDbi: 0, antenna2GainDbi: 0 })).toThrowError(RfError);
    expect(() => calculateAntennaIsolation({ frequencyMHz: 920, spacingMm: 100, antenna1GainDbi: Number.NaN, antenna2GainDbi: 0 })).toThrowError(RfError);
    expect(() => calculateAntennaIsolation({ frequencyMHz: 920, spacingMm: 100, antenna1GainDbi: 0, antenna2GainDbi: 0, targetCouplingDb: Number.POSITIVE_INFINITY })).toThrowError(RfError);
  });
});
