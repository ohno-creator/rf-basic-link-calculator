import { describe, expect, it } from "vitest";
import {
  bendSignificance,
  guidedWavelengthMm,
  isMiterFormulaApplicable,
  microstripImpedance,
  miterCutbackMm,
  optimalMiterPercent,
  recommendedBendRadiusMm
} from "@/lib/rf/microstrip";

describe("microstrip impedance", () => {
  it("computes ~50Ω for a 3.0mm trace on 1.6mm FR4", () => {
    const result = microstripImpedance(3.0, 1.6, 4.4);
    expect(result.impedanceOhms).toBeCloseTo(50.8, 0);
    expect(result.effectiveDielectric).toBeCloseTo(3.33, 1);
    expect(result.velocityFactor).toBeCloseTo(1 / Math.sqrt(result.effectiveDielectric), 5);
  });

  it("gives a higher impedance for a narrower trace", () => {
    const narrow = microstripImpedance(1.0, 1.6, 4.4);
    const wide = microstripImpedance(3.0, 1.6, 4.4);
    expect(narrow.impedanceOhms).toBeGreaterThan(wide.impedanceOhms);
  });

  it("rejects invalid inputs", () => {
    expect(() => microstripImpedance(0, 1.6, 4.4)).toThrow();
    expect(() => microstripImpedance(3, 1.6, 0.5)).toThrow();
  });
});

describe("microstrip mitered bend", () => {
  it("computes the Douville-James optimal miter for a 90° bend", () => {
    expect(optimalMiterPercent(3.0, 1.6)).toBeCloseTo(57.2, 1);
  });

  it("flags when the miter formula is out of its validity range", () => {
    expect(isMiterFormulaApplicable(3.0, 1.6, 4.4)).toBe(true);
    expect(isMiterFormulaApplicable(0.3, 1.6, 4.4)).toBe(false); // W/h < 0.25
    expect(isMiterFormulaApplicable(3.0, 1.6, 30)).toBe(false); // εr > 25
  });

  it("derives the diagonal cutback length and curved-bend radius", () => {
    expect(miterCutbackMm(2.0, 50)).toBeCloseTo(2.0 * 0.5 * Math.SQRT2, 5);
    expect(recommendedBendRadiusMm(3.0)).toBeCloseTo(9.0, 5);
  });
});

describe("does the bend matter (frequency-based)", () => {
  it("computes the guided wavelength", () => {
    expect(guidedWavelengthMm(2400, 4)).toBeCloseTo(62.46, 1);
  });

  it("classifies bend significance by W / λg", () => {
    expect(bendSignificance(3, 100)).toBe("negligible"); // ratio 0.03
    expect(bendSignificance(3, 40)).toBe("minor"); // ratio 0.075
    expect(bendSignificance(3, 20)).toBe("significant"); // ratio 0.15
  });
});
