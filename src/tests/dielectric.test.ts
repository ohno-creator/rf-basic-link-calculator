import { describe, expect, it } from "vitest";
import {
  dielectricImpactLevel,
  relativeBandwidth,
  sizeReductionPercent,
  wavelengthShorteningFactor
} from "@/lib/rf/dielectric";

describe("dielectric loading shortening and impact", () => {
  it("halves the wavelength at εr = 4", () => {
    expect(wavelengthShorteningFactor(4)).toBeCloseTo(0.5, 4);
    expect(sizeReductionPercent(4)).toBeCloseTo(50, 4);
    expect(relativeBandwidth(4)).toBeCloseTo(0.5, 4);
  });

  it("leaves air (εr = 1) unchanged", () => {
    expect(wavelengthShorteningFactor(1)).toBeCloseTo(1, 4);
    expect(sizeReductionPercent(1)).toBeCloseTo(0, 4);
  });

  it("maps εr ranges to impact levels", () => {
    expect(dielectricImpactLevel(1)).toBe("ほぼなし");
    expect(dielectricImpactLevel(2.1)).toBe("小");
    expect(dielectricImpactLevel(4.4)).toBe("中");
    expect(dielectricImpactLevel(20)).toBe("大");
    expect(dielectricImpactLevel(40)).toBe("特大");
  });

  it("rejects an invalid dielectric constant", () => {
    expect(() => wavelengthShorteningFactor(0.5)).toThrow();
    expect(() => dielectricImpactLevel(Number.NaN)).toThrow();
  });
});
