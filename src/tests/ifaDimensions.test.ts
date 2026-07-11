import { describe, expect, it } from "vitest";
import { calculateIfaDimensions } from "@/lib/rf/ifaDimensions";
import { RfError, RfErrorCode } from "@/lib/rf/errors";

describe("calculateIfaDimensions（G1・逆F/IFA初期寸法）", () => {
  it("920MHz・εr=4.4 → λ/4=81.465mm、εeff=2.7、全長≈49.58mm", () => {
    const result = calculateIfaDimensions({
      frequencyMHz: 920,
      relativePermittivity: 4.4,
      substrateThicknessMm: 1
    });

    expect(result.freeSpaceQuarterWavelengthMm).toBeCloseTo(81.46534, 5);
    expect(result.effectivePermittivity).toBeCloseTo(2.7, 12);
    expect(result.initialLengthMm).toBeCloseTo(49.57823, 5);
    expect(result.shorteningRatio).toBeCloseTo(1 / Math.sqrt(2.7), 12);
    expect(result.feedSpacingMinMm).toBeCloseTo(result.initialLengthMm / 12, 12);
    expect(result.feedSpacingMaxMm).toBeCloseTo(result.initialLengthMm / 8, 12);
  });

  it("εr=1では実効比誘電率1となり、全長が自由空間λ/4に一致する", () => {
    const result = calculateIfaDimensions({
      frequencyMHz: 1575,
      relativePermittivity: 1,
      substrateThicknessMm: 0.8
    });
    expect(result.effectivePermittivity).toBe(1);
    expect(result.shorteningRatio).toBe(1);
    expect(result.initialLengthMm).toBeCloseTo(result.freeSpaceQuarterWavelengthMm, 12);
  });

  it("板厚は簡易式の寸法値を変えない（入力妥当性と適用条件のため保持）", () => {
    const thin = calculateIfaDimensions({
      frequencyMHz: 2400,
      relativePermittivity: 4.4,
      substrateThicknessMm: 0.2
    });
    const thick = calculateIfaDimensions({
      frequencyMHz: 2400,
      relativePermittivity: 4.4,
      substrateThicknessMm: 2
    });
    expect(thin.initialLengthMm).toBeCloseTo(thick.initialLengthMm, 12);
  });

  it("ガード: 周波数100..6000MHz、εr>=1、板厚>0", () => {
    expect(() =>
      calculateIfaDimensions({ frequencyMHz: 99, relativePermittivity: 4.4, substrateThicknessMm: 1 })
    ).toThrowError(RfError);
    expect(() =>
      calculateIfaDimensions({ frequencyMHz: 6001, relativePermittivity: 4.4, substrateThicknessMm: 1 })
    ).toThrowError(RfError);
    expect(() =>
      calculateIfaDimensions({ frequencyMHz: 920, relativePermittivity: 0.9, substrateThicknessMm: 1 })
    ).toThrowError(RfError);
    expect(() =>
      calculateIfaDimensions({ frequencyMHz: 920, relativePermittivity: 4.4, substrateThicknessMm: 0 })
    ).toThrowError(RfError);

    try {
      calculateIfaDimensions({ frequencyMHz: 99, relativePermittivity: 4.4, substrateThicknessMm: 1 });
      expect.unreachable("RfError が送出されるはず");
    } catch (error) {
      expect(error).toBeInstanceOf(RfError);
      expect((error as RfError).code).toBe(RfErrorCode.BelowMinimum);
      expect((error as RfError).field).toBe("frequency");
    }
  });
});
