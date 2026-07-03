import { describe, expect, it } from "vitest";
import {
  analyzeObstacle,
  calculateFresnel,
  fresnelRadiusM,
  knifeEdgeDiffractionLossDb
} from "@/lib/rf/fresnel";
import { RfError, RfErrorCode } from "@/lib/rf/errors";

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

describe("knife-edge diffraction loss", () => {
  it("is ~0 dB when well below the line of sight (v <= -0.78)", () => {
    expect(knifeEdgeDiffractionLossDb(-1)).toBe(0);
    expect(knifeEdgeDiffractionLossDb(-0.78)).toBe(0);
  });

  it("is ~6 dB at grazing (obstacle exactly on the LOS, v = 0)", () => {
    expect(knifeEdgeDiffractionLossDb(0)).toBeCloseTo(6.0, 1);
  });

  it("increases as the obstacle rises above the LOS", () => {
    expect(knifeEdgeDiffractionLossDb(1)).toBeGreaterThan(knifeEdgeDiffractionLossDb(0));
  });

  it("rejects NaN with a coded non-finite error", () => {
    let thrown: unknown;
    try {
      knifeEdgeDiffractionLossDb(Number.NaN);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(RfError);
    expect((thrown as RfError).code).toBe(RfErrorCode.NonFinite);
    expect((thrown as RfError).field).toBe("diffraction_parameter");
  });
});

describe("obstacle analysis (Fresnel clearance + diffraction)", () => {
  // 2.4GHz, 1km, midpoint, both antennas 10m → r1 ≈ 5.59 m, LOS height = 10 m
  it("treats a 60% clearance as clear with negligible diffraction", () => {
    const r1 = calculateFresnel(2400, 1).firstZoneRadiusM;
    const obstacleHeight = 10 - 0.6 * r1; // ちょうど60%クリアランス
    const a = analyzeObstacle(2400, 1, 0.5, 10, 10, obstacleHeight);

    expect(a.clearanceRatio).toBeCloseTo(0.6, 2);
    expect(a.verdict).toBe("clear");
    expect(a.diffractionLossDb).toBeCloseTo(0, 1);
  });

  it("flags an obstacle that touches the LOS as caution (~6 dB)", () => {
    const a = analyzeObstacle(2400, 1, 0.5, 10, 10, 10);

    expect(a.clearanceM).toBeCloseTo(0, 6);
    expect(a.verdict).toBe("caution");
    expect(a.diffractionLossDb).toBeCloseTo(6.0, 1);
  });

  it("flags an obstacle above the LOS as blocked with large loss", () => {
    const a = analyzeObstacle(2400, 1, 0.5, 10, 10, 13);

    expect(a.clearanceM).toBeLessThan(0);
    expect(a.verdict).toBe("blocked");
    expect(a.diffractionLossDb).toBeGreaterThan(6);
  });

  it("keeps v = -(clearance/r1)*sqrt(2) consistent with the 60% rule", () => {
    const a = analyzeObstacle(920, 2, 0.5, 10, 10, 8);
    expect(a.diffractionParamV).toBeCloseTo(-a.clearanceRatio * Math.SQRT2, 6);
  });

  it("rejects invalid heights", () => {
    expect(() => analyzeObstacle(2400, 1, 0.5, -1, 10, 5)).toThrow();
    expect(() => analyzeObstacle(2400, 1, 0.5, 10, 10, -1)).toThrow();
  });
});
