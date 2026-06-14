import { describe, expect, it } from "vitest";
import { calculatePropagationLoss } from "@/lib/rf/propagation";

const base = {
  frequencyMHz: 900,
  baseHeightM: 30,
  mobileHeightM: 1.5,
  distanceKm: 1
} as const;

describe("Okumura-Hata propagation loss", () => {
  it("computes urban (medium city) loss at 900MHz / 1km", () => {
    const result = calculatePropagationLoss({ ...base, area: "urbanMedium" });
    expect(result.model).toBe("Hata");
    expect(result.pathLossDb).toBeCloseTo(126.4, 1);
  });

  it("scales with distance", () => {
    const result = calculatePropagationLoss({ ...base, distanceKm: 5, area: "urbanMedium" });
    expect(result.pathLossDb).toBeCloseTo(151.0, 1);
  });

  it("applies suburban and open-area corrections", () => {
    const suburban = calculatePropagationLoss({ ...base, area: "suburban" });
    const open = calculatePropagationLoss({ ...base, area: "open" });
    expect(suburban.pathLossDb).toBeCloseTo(116.46, 1);
    expect(open.pathLossDb).toBeCloseTo(97.9, 1);
    expect(open.pathLossDb).toBeLessThan(suburban.pathLossDb);
  });

  it("uses COST 231-Hata above 1500MHz and adds the metro correction", () => {
    const medium = calculatePropagationLoss({
      ...base,
      frequencyMHz: 1800,
      area: "urbanMedium"
    });
    const large = calculatePropagationLoss({
      ...base,
      frequencyMHz: 1800,
      area: "urbanLarge"
    });
    expect(medium.model).toBe("COST231-Hata");
    expect(medium.pathLossDb).toBeCloseTo(136.2, 1);
    // 大都市はCm=3dBが上乗せされる
    expect(large.pathLossDb - medium.pathLossDb).toBeCloseTo(3, 5);
  });

  it("flags out-of-range inputs and rejects non-positive values", () => {
    const farOutside = calculatePropagationLoss({ ...base, distanceKm: 50, area: "urbanMedium" });
    expect(farOutside.outOfRange).toBe(true);
    expect(() => calculatePropagationLoss({ ...base, frequencyMHz: 0, area: "open" })).toThrow();
  });
});
