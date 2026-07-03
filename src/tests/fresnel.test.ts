import { describe, expect, it } from "vitest";
import {
  analyzeObstacle,
  calculateFresnel,
  EARTH_RADIUS_M,
  fresnelRadiusM,
  knifeEdgeDiffractionLossDb,
  radioHorizonKm
} from "@/lib/rf/fresnel";
import { RfError } from "@/lib/rf/errors";

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

describe("地球曲率モード（E6 / A3a）", () => {
  it("options未指定は従来動作（curvatureDropM=0・losHeight不変）＝後方互換", () => {
    const a = analyzeObstacle(2400, 1, 0.5, 10, 10, 5);
    expect(a.curvatureDropM).toBe(0);
    expect(a.losHeightM).toBe(10);
  });

  it("k=4/3・全長10km中点で曲率降下 ≈ 1.4715m", () => {
    const a = analyzeObstacle(2400, 10, 0.5, 50, 50, 5, { earthCurvatureK: 4 / 3 });
    expect(a.curvatureDropM).toBeCloseTo(1.4715, 4);
    // 降下分だけLOS高が下がる（従来50m→約48.53m）。
    expect(a.losHeightM).toBeCloseTo(50 - 1.4715, 4);
  });

  it("全長1km中点では曲率降下は3cm未満（微小）", () => {
    const a = analyzeObstacle(2400, 1, 0.5, 10, 10, 5, { earthCurvatureK: 4 / 3 });
    expect(a.curvatureDropM).toBeCloseTo(0.014715, 5);
    expect(a.curvatureDropM).toBeLessThan(0.03);
  });

  it("earthCurvatureK が 0/負/NaN は RfError", () => {
    expect(() => analyzeObstacle(2400, 10, 0.5, 50, 50, 5, { earthCurvatureK: 0 })).toThrowError(RfError);
    expect(() => analyzeObstacle(2400, 10, 0.5, 50, 50, 5, { earthCurvatureK: -1 })).toThrowError(RfError);
    expect(() =>
      analyzeObstacle(2400, 10, 0.5, 50, 50, 5, { earthCurvatureK: Number.NaN })
    ).toThrowError(RfError);
  });
});

describe("radioHorizonKm（電波見通し距離）", () => {
  it("h1=h2=10m → 約26.06km（k=4/3, 4.12·(√h1+√h2)）", () => {
    expect(radioHorizonKm(10, 10)).toBeCloseTo(26.06, 2);
  });

  it("高さ0は許容（√0=0）、負値は RfError", () => {
    expect(radioHorizonKm(0, 0)).toBe(0);
    expect(() => radioHorizonKm(-1, 10)).toThrowError(RfError);
  });

  it("地球半径定数は 6371km", () => {
    expect(EARTH_RADIUS_M).toBe(6_371_000);
  });
});
