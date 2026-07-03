import { describe, expect, it } from "vitest";
import { calculateFsplDb } from "@/lib/rf/fspl";
import { calculatePropagationLoss } from "@/lib/rf/propagation";
import {
  type PropagationLossParams,
  calculatePropagationLossCurveDb,
  calculatePropagationLossResult,
  comparePropagationModels,
  geometricPropagationModels,
  twoRayBreakpointM,
  twoRayInterferencePathLossDb
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
    expect(hata.flooredByFspl).toBe(reference.flooredByFspl);
  });

  it("forwards the FSPL-floor flag for Hata and keeps other models false", () => {
    const extremeOpen = {
      ...baseParams,
      frequencyMHz: 1500,
      txHeightM: 200,
      rxHeightM: 10,
      area: "open" as const
    };

    expect(calculatePropagationLossResult("cost231_hata", extremeOpen).flooredByFspl).toBe(true);
    expect(calculatePropagationLossResult("free_space", extremeOpen).flooredByFspl).toBe(false);
  });

  it("forces COST231-Hata even below 1500MHz when selected", () => {
    const cost = calculatePropagationLossResult("cost231_hata", baseParams);
    const hata = calculatePropagationLossResult("okumura_hata", baseParams);
    // 別式なので一致しない（COST231は46.3+33.9log f 系）
    expect(cost.pathLossDb).not.toBeCloseTo(hata.pathLossDb, 1);
    expect(cost.outOfRange).toBe(true);
    expect(hata.outOfRange).toBe(false);
  });

  it("flags forced Okumura-Hata above its frequency range", () => {
    const hata = calculatePropagationLossResult("okumura_hata", {
      ...baseParams,
      frequencyMHz: 1800
    });
    const cost = calculatePropagationLossResult("cost231_hata", {
      ...baseParams,
      frequencyMHz: 1800
    });

    expect(hata.outOfRange).toBe(true);
    expect(cost.outOfRange).toBe(false);
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

describe("two-ray interference model", () => {
  const f = 920;
  const ht = 30;
  const hr = 1.5;

  it("uses the interference calculation for two-ray chart curves", () => {
    const distanceKm = 0.1;
    const curve = calculatePropagationLossCurveDb("two_ray", {
      ...baseParams,
      frequencyMHz: f,
      distanceKm,
      txHeightM: ht,
      rxHeightM: hr
    });
    const smoothed = calculatePropagationLossResult("two_ray", {
      ...baseParams,
      frequencyMHz: f,
      distanceKm,
      txHeightM: ht,
      rxHeightM: hr
    }).pathLossDb;

    expect(curve).toBeCloseTo(twoRayInterferencePathLossDb(f, distanceKm, ht, hr), 6);
    expect(Math.abs(curve - smoothed)).toBeGreaterThan(3);
  });

  it("has a constructive peak below free-space loss (the +6dB gain region)", () => {
    // ブレークポイント付近では直接波と反射波が強め合い、FSPLより小さい損失（利得）になる。
    const distances = Array.from({ length: 400 }, (_, i) => 0.02 + i * 0.005); // 20m〜2km
    const minDeltaVsFspl = Math.min(
      ...distances.map((d) => twoRayInterferencePathLossDb(f, d, ht, hr) - calculateFsplDb(f, d))
    );
    expect(minDeltaVsFspl).toBeLessThan(-3); // 明確な山が存在する
  });

  it("oscillates (deep nulls) before the breakpoint", () => {
    const breakpointKm = twoRayBreakpointM(f, ht, hr) / 1000;
    const distances = Array.from({ length: 300 }, (_, i) => 0.02 + (i * (breakpointKm - 0.02)) / 299);
    const deltas = distances.map((d) => twoRayInterferencePathLossDb(f, d, ht, hr) - calculateFsplDb(f, d));
    // ブレークポイント内側では、山（負）と谷（大きな正）の両方が現れる＝波打つ。
    expect(Math.min(...deltas)).toBeLessThan(-3);
    expect(Math.max(...deltas)).toBeGreaterThan(5);
  });

  it("converges to the smoothed two-ray envelope far beyond the breakpoint", () => {
    const farKm = 5;
    const full = twoRayInterferencePathLossDb(f, farKm, ht, hr);
    const smoothed = calculatePropagationLossResult("two_ray", {
      ...baseParams,
      frequencyMHz: f,
      txHeightM: ht,
      rxHeightM: hr,
      distanceKm: farKm
    }).pathLossDb;
    expect(Math.abs(full - smoothed)).toBeLessThan(2);
  });

  it("caps the deep nulls at FSPL + maxFadeDb", () => {
    const distances = Array.from({ length: 500 }, (_, i) => 0.02 + i * 0.004);
    for (const d of distances) {
      const pl = twoRayInterferencePathLossDb(f, d, ht, hr, -1, 40);
      expect(pl).toBeLessThanOrEqual(calculateFsplDb(f, d) + 40 + 1e-6);
    }
  });

  it("rejects invalid two-ray geometry inputs", () => {
    expect(() => twoRayBreakpointM(0, ht, hr)).toThrow();
    expect(() => twoRayBreakpointM(f, 0, hr)).toThrow();
    expect(() => twoRayInterferencePathLossDb(f, 1, ht, 0)).toThrow();
    expect(() => twoRayInterferencePathLossDb(f, 1, ht, hr, Number.NaN)).toThrow();
  });
});
