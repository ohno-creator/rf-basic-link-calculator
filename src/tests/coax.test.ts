import { describe, expect, it } from "vitest";
import { calculateCoaxImpedance } from "@/lib/rf/coax";

describe("coaxial line impedance", () => {
  it("computes impedance and velocity factor for an air line", () => {
    const result = calculateCoaxImpedance(2.3, 1, 1);

    // Z0 = 138 * log10(2.3) ≈ 49.9 Ω, air → VF = 1
    expect(result.impedanceOhms).toBeCloseTo(49.9, 1);
    expect(result.velocityFactor).toBeCloseTo(1, 4);
  });

  it("applies the dielectric constant to impedance and velocity factor", () => {
    const result = calculateCoaxImpedance(2.3, 1, 2.1);

    expect(result.impedanceOhms).toBeCloseTo(49.9 / Math.sqrt(2.1), 1);
    expect(result.velocityFactor).toBeCloseTo(0.69, 2);
  });

  it("rejects invalid geometry or dielectric constant", () => {
    expect(() => calculateCoaxImpedance(1, 2, 2.1)).toThrow();
    expect(() => calculateCoaxImpedance(2.3, 1, 0.5)).toThrow();
    expect(() => calculateCoaxImpedance(0, 1, 2.1)).toThrow();
  });
});
