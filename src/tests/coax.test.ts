import { describe, expect, it } from "vitest";
import {
  cableAssemblyLoss,
  interpolateCableLoss,
  type LossPoint,
  referenceLossPoints
} from "@/lib/rf/coax";

const points: LossPoint[] = [
  { freqMHz: 500, lossDb: 1.39 },
  { freqMHz: 2000, lossDb: 2.97 },
  { freqMHz: 3000, lossDb: 3.72 },
  { freqMHz: 8000, lossDb: 6.77 }
];

describe("measured cable loss interpolation", () => {
  it("returns the exact value at a measured point", () => {
    expect(interpolateCableLoss(points, 2000)).toBeCloseTo(2.97, 5);
  });

  it("linearly interpolates between measured points", () => {
    // halfway 2000->3000: (2.97 + 3.72)/2 = 3.345
    expect(interpolateCableLoss(points, 2500)).toBeCloseTo(3.345, 3);
  });

  it("sorts reversed measurement points before interpolation", () => {
    expect(interpolateCableLoss([...points].reverse(), 2500)).toBeCloseTo(
      interpolateCableLoss(points, 2500),
      5
    );
  });

  it("extrapolates below and above the measured range", () => {
    expect(interpolateCableLoss(points, 9000)).toBeGreaterThan(6.77);
    expect(interpolateCableLoss(points, 100)).toBeGreaterThanOrEqual(0);
    expect(interpolateCableLoss(points, 100)).toBeLessThan(1.39);
  });

  it("caps high-frequency extrapolation at twice the final measured frequency", () => {
    expect(interpolateCableLoss(points, 24_000)).toBeCloseTo(
      interpolateCableLoss(points, 16_000),
      5
    );
  });

  it("rejects an invalid frequency", () => {
    expect(() => interpolateCableLoss(points, 0)).toThrow();
  });
});

describe("cable assembly loss with quantity", () => {
  it("multiplies the per-piece loss by the number of pieces", () => {
    const result = cableAssemblyLoss(points, 2000, 2);
    expect(result.perPieceDb).toBeCloseTo(2.97, 5);
    expect(result.totalDb).toBeCloseTo(5.94, 5);
    expect(result.extrapolated).toBe(false);
    // 10^(-0.594) ≈ 25.5%
    expect(result.powerRemainingPercent).toBeCloseTo(25.5, 1);
  });

  it("marks frequencies above the measured range as extrapolated", () => {
    expect(cableAssemblyLoss(points, 9000, 1).extrapolated).toBe(true);
  });

  it("rejects a quantity below 1", () => {
    expect(() => cableAssemblyLoss(points, 2000, 0)).toThrow();
  });
});

describe("reference cable loss curve", () => {
  it("generates √f-scaled points at the standard frequencies", () => {
    const ref = referenceLossPoints(1.2, 1);
    expect(ref).toHaveLength(9);
    const at2000 = ref.find((p) => p.freqMHz === 2000);
    // 1.2 * sqrt(2000/2400) * 1 ≈ 1.095
    expect(at2000?.lossDb).toBeCloseTo(1.095, 2);
    // loss increases with frequency
    expect(ref[ref.length - 1].lossDb).toBeGreaterThan(ref[0].lossDb);
  });

  it("rejects invalid inputs", () => {
    expect(() => referenceLossPoints(0, 1)).toThrow();
    expect(() => referenceLossPoints(1.2, 0)).toThrow();
  });
});
