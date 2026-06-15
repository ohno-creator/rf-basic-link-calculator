import { describe, expect, it } from "vitest";
import {
  microstripImpedance,
  miterCutbackMm,
  optimalMiterPercent,
  recommendedMiterPercent
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

  it("scales the recommended miter with the bend angle", () => {
    const full = recommendedMiterPercent(3.0, 1.6, 90);
    const half = recommendedMiterPercent(3.0, 1.6, 45);
    expect(full).toBeCloseTo(optimalMiterPercent(3.0, 1.6), 5);
    expect(half).toBeCloseTo(full / 2, 5);
  });

  it("derives the diagonal cutback length", () => {
    expect(miterCutbackMm(2.0, 50)).toBeCloseTo(2.0 * 0.5 * Math.SQRT2, 5);
  });
});
