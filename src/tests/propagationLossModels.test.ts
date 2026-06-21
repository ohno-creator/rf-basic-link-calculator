import { describe, expect, it } from "vitest";
import { calculateFsplDb } from "@/lib/rf/fspl";
import { calculatePropagationLoss } from "@/lib/rf/propagation";
import {
  type PropagationLossParams,
  calculatePropagationLossResult,
  comparePropagationModels,
  geometricPropagationModels
} from "@/lib/rf/propagationLossModels";

const baseParams: PropagationLossParams = {
  frequencyMHz: 920,
  distanceKm: 1,
  txHeightM: 30,
  rxHeightM: 1.5,
  area: "urbanMedium",
  pathLossExponent: 3
};

describe("propagation loss models", () => {
  it("matches calculateFsplDb for free space", () => {
    const result = calculatePropagationLossResult("free_space", baseParams);
    expect(result.pathLossDb).toBeCloseTo(calculateFsplDb(920, 1), 6);
  });

  it("reduces log-distance (n=2) exactly to free-space loss", () => {
    const free = calculatePropagationLossResult("free_space", baseParams);
    const log2 = calculatePropagationLossResult("log_distance", {
      ...baseParams,
      pathLossExponent: 2
    });
    expect(log2.pathLossDb).toBeCloseTo(free.pathLossDb, 6);
  });

  it("never returns less than free-space loss for the two-ray model", () => {
    const free = calculatePropagationLossResult("free_space", baseParams);
    const twoRay = calculatePropagationLossResult("two_ray", baseParams);
    expect(twoRay.pathLossDb).toBeGreaterThanOrEqual(free.pathLossDb - 1e-9);
  });

  it("matches calculatePropagationLoss for the Hata family", () => {
    const hata = calculatePropagationLossResult("okumura_hata", baseParams);
    const reference = calculatePropagationLoss({
      frequencyMHz: 920,
      baseHeightM: 30,
      mobileHeightM: 1.5,
      distanceKm: 1,
      area: "urbanMedium",
      preferredModel: "Hata"
    });
    expect(hata.pathLossDb).toBeCloseTo(reference.pathLossDb, 6);
    expect(hata.outOfRange).toBe(reference.outOfRange);
  });

  it("forces COST231-Hata even below 1500MHz when selected", () => {
    const cost = calculatePropagationLossResult("cost231_hata", baseParams);
    const hata = calculatePropagationLossResult("okumura_hata", baseParams);
    // 別式なので一致しない（COST231は46.3+33.9log f 系）
    expect(cost.pathLossDb).not.toBeCloseTo(hata.pathLossDb, 1);
  });

  it("predicts more urban loss than free space at 1km", () => {
    const free = calculatePropagationLossResult("free_space", baseParams);
    const hata = calculatePropagationLossResult("okumura_hata", baseParams);
    expect(hata.pathLossDb).toBeGreaterThan(free.pathLossDb);
  });

  it("sorts compared models by ascending path loss", () => {
    const sorted = comparePropagationModels(geometricPropagationModels, baseParams);
    expect(sorted.length).toBe(geometricPropagationModels.length);
    for (let index = 1; index < sorted.length; index += 1) {
      expect(sorted[index].pathLossDb).toBeGreaterThanOrEqual(sorted[index - 1].pathLossDb);
    }
  });
});
