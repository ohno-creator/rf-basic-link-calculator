import { describe, expect, it } from "vitest";
import {
  allowableOffsetDeg,
  buildPointingMarginTable,
  calculatePointingMargin,
  MAIN_LOBE_EDGE_LOSS_DB,
  pointingLossDb
} from "@/lib/rf/pointingMargin";
import { RfError } from "@/lib/rf/errors";

describe("pointingLossDb（指向誤差による利得低下 L=12·(θ/HPBW)²）", () => {
  it("θ=0 は損失0dB", () => {
    expect(pointingLossDb(0, 30)).toBeCloseTo(0, 10);
  });

  it("θ=HPBW/2（半値角の端, HPBW=30でθ=15）で3dB", () => {
    expect(pointingLossDb(15, 30)).toBeCloseTo(3, 12);
  });

  it("θ=HPBW（主ローブ端）で12dB", () => {
    expect(pointingLossDb(30, 30)).toBeCloseTo(12, 12);
    expect(pointingLossDb(70, 70)).toBeCloseTo(12, 12);
  });

  it("対称性: 負のθも絶対値で評価する", () => {
    expect(pointingLossDb(-15, 30)).toBeCloseTo(pointingLossDb(15, 30), 12);
  });

  it("ガード: θ非有限 / HPBW≤0 は RfError", () => {
    expect(() => pointingLossDb(Number.NaN, 30)).toThrowError(RfError);
    expect(() => pointingLossDb(Number.POSITIVE_INFINITY, 30)).toThrowError(RfError);
    expect(() => pointingLossDb(5, 0)).toThrowError(RfError);
    expect(() => pointingLossDb(5, -30)).toThrowError(RfError);
  });
});

describe("allowableOffsetDeg（許容ずれ角 θ_allow=HPBW·√(L/12)）", () => {
  it("HPBW=30°, 許容1dB → 8.660254°", () => {
    expect(allowableOffsetDeg(1, 30)).toBeCloseTo(8.660254, 6);
  });

  it("HPBW=70°, 許容1dB → 20.207259°", () => {
    expect(allowableOffsetDeg(1, 70)).toBeCloseTo(20.207259, 6);
  });

  it("許容12dB（主ローブ端）で θ_allow=HPBW", () => {
    expect(allowableOffsetDeg(MAIN_LOBE_EDGE_LOSS_DB, 30)).toBeCloseTo(30, 12);
  });

  it("往復整合: pointingLossDb(allowableOffsetDeg(L)) = L", () => {
    for (const lossDb of [0.5, 1, 3, 6, 12]) {
      expect(pointingLossDb(allowableOffsetDeg(lossDb, 30), 30)).toBeCloseTo(lossDb, 12);
    }
  });

  it("ガード: 許容損失≤0 / 非有限 / HPBW≤0 は RfError", () => {
    expect(() => allowableOffsetDeg(0, 30)).toThrowError(RfError);
    expect(() => allowableOffsetDeg(-1, 30)).toThrowError(RfError);
    expect(() => allowableOffsetDeg(Number.NaN, 30)).toThrowError(RfError);
    expect(() => allowableOffsetDeg(1, 0)).toThrowError(RfError);
  });
});

describe("MAIN_LOBE_EDGE_LOSS_DB（主ローブ端の損失定数）", () => {
  it("12dB", () => {
    expect(MAIN_LOBE_EDGE_LOSS_DB).toBe(12);
  });
});

describe("buildPointingMarginTable（代表許容損失3/1/0.5dBの対応表）", () => {
  it("HPBW=30°: [{3,15},{1,8.660254},{0.5,6.123724}]", () => {
    const table = buildPointingMarginTable(30);
    expect(table.map((row) => row.lossDb)).toEqual([3, 1, 0.5]);
    expect(table[0].offsetDeg).toBeCloseTo(15, 12);
    expect(table[1].offsetDeg).toBeCloseTo(8.660254, 6);
    expect(table[2].offsetDeg).toBeCloseTo(6.123724, 6);
  });

  it("steps 指定で任意の許容損失の表を生成できる", () => {
    const table = buildPointingMarginTable(30, [12]);
    expect(table).toHaveLength(1);
    expect(table[0].lossDb).toBe(12);
    expect(table[0].offsetDeg).toBeCloseTo(30, 12);
  });

  it("ガード: HPBW≤0 は RfError", () => {
    expect(() => buildPointingMarginTable(0)).toThrowError(RfError);
  });
});

describe("calculatePointingMargin（統合API）", () => {
  it("HPBW=30°, 許容1dB(既定) → θ_allow=8.660254°・主ローブ内", () => {
    const result = calculatePointingMargin({ hpbwDeg: 30 });
    expect(result.hpbwDeg).toBe(30);
    expect(result.allowedLossDb).toBe(1);
    expect(result.allowedOffsetDeg).toBeCloseTo(8.660254, 6);
    expect(result.withinMainLobe).toBe(true);
    expect(result.table.map((row) => row.lossDb)).toEqual([3, 1, 0.5]);
    expect(result.table[0].offsetDeg).toBeCloseTo(15, 12);
  });

  it("HPBW=70°, 許容1dB → θ_allow=20.207259°", () => {
    const result = calculatePointingMargin({ hpbwDeg: 70, allowedLossDb: 1 });
    expect(result.allowedOffsetDeg).toBeCloseTo(20.207259, 6);
    expect(result.withinMainLobe).toBe(true);
  });

  it("許容損失>12dB は主ローブ外（withinMainLobe=false）", () => {
    const result = calculatePointingMargin({ hpbwDeg: 30, allowedLossDb: 20 });
    expect(result.withinMainLobe).toBe(false);
    expect(result.allowedOffsetDeg).toBeGreaterThan(30);
  });

  it("ガード: HPBW≤0 / 許容損失≤0 は RfError", () => {
    expect(() => calculatePointingMargin({ hpbwDeg: 0 })).toThrowError(RfError);
    expect(() => calculatePointingMargin({ hpbwDeg: 30, allowedLossDb: 0 })).toThrowError(RfError);
  });
});
