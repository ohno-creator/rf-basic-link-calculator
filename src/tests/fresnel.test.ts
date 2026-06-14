import { describe, expect, it } from "vitest";
import { calculateFresnel, fresnelRadiusM } from "@/lib/rf/fresnel";

describe("Fresnel zone radius", () => {
  it("computes the first zone radius at the midpoint", () => {
    // 2.4GHz, 1km, midpoint → r ≈ 8.66 * sqrt(D[km]/f[GHz]) ≈ 5.59 m
    const result = calculateFresnel(2400, 1);

    expect(result.firstZoneRadiusM).toBeCloseTo(5.59, 1);
    expect(result.clearance60M).toBeCloseTo(result.firstZoneRadiusM * 0.6, 4);
  });

  it("is largest at the midpoint and smaller toward an endpoint", () => {
    const mid = fresnelRadiusM(920, 0.5, 0.5, 1);
    const offset = fresnelRadiusM(920, 0.1, 0.9, 1);

    expect(mid).toBeGreaterThan(offset);
  });

  it("rejects invalid inputs", () => {
    expect(() => calculateFresnel(0, 1)).toThrow();
    expect(() => calculateFresnel(2400, 1, 0)).toThrow();
    expect(() => calculateFresnel(2400, 1, 1)).toThrow();
  });
});
