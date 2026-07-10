import { describe, expect, it } from "vitest";
import { calculateIfaDimensions } from "@/lib/rf/ifaDimensions";
import { RfError, RfErrorCode } from "@/lib/rf/errors";

describe("calculateIfaDimensions", () => {
  it("920MHz・εr=4.4のIFA初期寸法を再現する", () => {
    const result = calculateIfaDimensions({
      frequencyMHz: 920,
      relativePermittivity: 4.4,
      substrateThicknessMm: 1
    });

    expect(result.freeSpaceQuarterWavelengthMm).toBeCloseTo(81.46534, 5);
    expect(result.model).toBe("simple-effective-permittivity");
    expect(result.includesSubstrateThicknessCorrection).toBe(false);
    expect(result.effectivePermittivity).toBeCloseTo(2.7, 10);
    expect(result.initialLengthMm).toBeCloseTo(49.578, 3);
    expect(result.shorteningRatio).toBeCloseTo(1 / Math.sqrt(2.7), 10);
    expect(result.feedSpacingMinMm).toBeCloseTo(result.initialLengthMm / 12, 10);
    expect(result.feedSpacingMaxMm).toBeCloseTo(result.initialLengthMm / 8, 10);
  });

  it("εr=1では初期全長が自由空間λ/4に一致する", () => {
    const result = calculateIfaDimensions({
      frequencyMHz: 1575.42,
      relativePermittivity: 1,
      substrateThicknessMm: 0.8
    });
    expect(result.initialLengthMm).toBeCloseTo(result.freeSpaceQuarterWavelengthMm, 10);
  });

  it("周波数を2倍にすると各長さが半分になる", () => {
    const low = calculateIfaDimensions({ frequencyMHz: 800, relativePermittivity: 4, substrateThicknessMm: 1 });
    const high = calculateIfaDimensions({ frequencyMHz: 1600, relativePermittivity: 4, substrateThicknessMm: 1 });
    expect(high.initialLengthMm).toBeCloseTo(low.initialLengthMm / 2, 10);
    expect(high.feedSpacingMinMm).toBeCloseTo(low.feedSpacingMinMm / 2, 10);
  });

  it("極端に大きい有限比誘電率でも有限の正値を返す", () => {
    const result = calculateIfaDimensions({
      frequencyMHz: 920,
      relativePermittivity: Number.MAX_VALUE,
      substrateThicknessMm: 1
    });
    expect(Number.isFinite(result.initialLengthMm)).toBe(true);
    expect(result.initialLengthMm).toBeGreaterThan(0);
  });

  it("周波数・比誘電率・基板厚をRfErrorで検証する", () => {
    expect(() =>
      calculateIfaDimensions({ frequencyMHz: 0, relativePermittivity: 4.4, substrateThicknessMm: 1 })
    ).toThrowError(RfError);
    expect(() =>
      calculateIfaDimensions({ frequencyMHz: 920, relativePermittivity: 0.9, substrateThicknessMm: 1 })
    ).toThrowError(RfError);
    expect(() =>
      calculateIfaDimensions({ frequencyMHz: 920, relativePermittivity: 4.4, substrateThicknessMm: 0 })
    ).toThrowError(RfError);

    try {
      calculateIfaDimensions({ frequencyMHz: 920, relativePermittivity: 0.9, substrateThicknessMm: 1 });
      expect.unreachable("RfErrorが送出されるはず");
    } catch (error) {
      expect(error).toBeInstanceOf(RfError);
      expect((error as RfError).code).toBe(RfErrorCode.BelowMinimum);
      expect((error as RfError).field).toBe("relative_permittivity");
    }
  });
});
