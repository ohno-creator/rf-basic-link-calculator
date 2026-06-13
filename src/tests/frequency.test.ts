import { describe, expect, it } from "vitest";
import {
  calculateWavelengthFractions,
  calculateWavelengthFromMHz
} from "@/lib/rf/frequency";

describe("frequency calculations", () => {
  it("calculates the wavelength for 920MHz", () => {
    expect(calculateWavelengthFromMHz(920)).toBeCloseTo(0.326, 3);
  });

  it("calculates the wavelength for 2.4GHz", () => {
    expect(calculateWavelengthFromMHz(2400)).toBeCloseTo(0.125, 3);
  });

  it("calculates quarter wavelength", () => {
    const result = calculateWavelengthFractions(920);

    expect(result.quarterM).toBeCloseTo(result.wavelengthM / 4, 8);
  });
});
