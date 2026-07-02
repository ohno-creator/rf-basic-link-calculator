import { describe, expect, it } from "vitest";
import { calculateFsplDb } from "@/lib/rf/fspl";
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

  it("flags frequency range by the selected Hata family model", () => {
    const forcedHataAt1800 = calculatePropagationLoss({
      ...base,
      frequencyMHz: 1800,
      area: "urbanMedium",
      preferredModel: "Hata"
    });
    const forcedCostAt900 = calculatePropagationLoss({
      ...base,
      frequencyMHz: 900,
      area: "urbanMedium",
      preferredModel: "COST231-Hata"
    });
    const costAt1800 = calculatePropagationLoss({
      ...base,
      frequencyMHz: 1800,
      area: "urbanMedium",
      preferredModel: "COST231-Hata"
    });

    expect(forcedHataAt1800.model).toBe("Hata");
    expect(forcedHataAt1800.outOfRange).toBe(true);
    expect(forcedCostAt900.model).toBe("COST231-Hata");
    expect(forcedCostAt900.outOfRange).toBe(true);
    expect(costAt1800.outOfRange).toBe(false);
  });

  it("flags out-of-range inputs and rejects non-positive values", () => {
    const farOutside = calculatePropagationLoss({ ...base, distanceKm: 50, area: "urbanMedium" });
    expect(farOutside.outOfRange).toBe(true);
    expect(() => calculatePropagationLoss({ ...base, frequencyMHz: 0, area: "open" })).toThrow();
  });

  it("floors the median loss at free-space loss for short-distance extrapolation", () => {
    // 適用範囲外の近距離(1m)では、Hataの経験式が自由空間損失を下回る非物理値を返す。
    // 中央値損失は自由空間損失を下回れないため、FSPLで下限を張る。
    const fsplDb = calculateFsplDb(900, 0.001);
    const shortRange = calculatePropagationLoss({ ...base, distanceKm: 0.001, area: "urbanMedium" });
    expect(shortRange.pathLossDb).toBeCloseTo(fsplDb, 6);
    expect(shortRange.outOfRange).toBe(true);
  });

  it("keeps in-range loss unchanged (floor does not bind above 1km)", () => {
    const inRange = calculatePropagationLoss({ ...base, area: "urbanMedium" });
    const fsplDb = calculateFsplDb(900, 1);
    expect(inRange.pathLossDb).toBeGreaterThan(fsplDb);
    expect(inRange.pathLossDb).toBeCloseTo(126.4, 1);
  });
});
