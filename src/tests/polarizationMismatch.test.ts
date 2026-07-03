import { describe, expect, it } from "vitest";
import {
  calculatePolarizationMismatchLossDb,
  circularCircularMismatchLossDb,
  LINEAR_CIRCULAR_MISMATCH_LOSS_DB,
  linearLinearMismatchLossDb,
  polarizationLossFactorLinear,
  POLARIZATION_LOSS_DISPLAY_CAP_DB
} from "@/lib/rf/polarizationMismatch";
import { RfError } from "@/lib/rf/errors";

describe("polarizationLossFactorLinear (PLF = cos²θ)", () => {
  it("θ=0° → 整合 PLF=1", () => {
    expect(polarizationLossFactorLinear(0)).toBeCloseTo(1, 10);
  });

  it("θ=45° → PLF=0.5（LP-CP整合=3dBの根拠）", () => {
    expect(polarizationLossFactorLinear(45)).toBeCloseTo(0.5, 10);
  });

  it("θ=90° → 直交 PLF=0", () => {
    expect(polarizationLossFactorLinear(90)).toBeCloseTo(0, 10);
  });
});

describe("linearLinearMismatchLossDb (-20log10|cosθ|)", () => {
  it("θ=0° → 0dB（-0ではなく+0で返す）", () => {
    const loss = linearLinearMismatchLossDb(0);
    expect(loss).toBe(0);
    expect(Object.is(loss, -0)).toBe(false);
  });

  it("θ=30° → 1.2494dB", () => {
    expect(linearLinearMismatchLossDb(30)).toBeCloseTo(1.2494, 4);
  });

  it("θ=45° → 3.0103dB", () => {
    expect(linearLinearMismatchLossDb(45)).toBeCloseTo(3.0103, 4);
  });

  it("θ=60° → 6.0206dB", () => {
    expect(linearLinearMismatchLossDb(60)).toBeCloseTo(6.0206, 4);
  });

  it("θ=90° → ∞（丸め残差の約324dBではなく明示Infinity）", () => {
    expect(linearLinearMismatchLossDb(90)).toBe(Number.POSITIVE_INFINITY);
  });

  it("定義域ガード: NaN/負/90超で RfError", () => {
    expect(() => linearLinearMismatchLossDb(Number.NaN)).toThrowError(RfError);
    expect(() => linearLinearMismatchLossDb(-1)).toThrowError(RfError);
    expect(() => linearLinearMismatchLossDb(90.1)).toThrowError(RfError);
  });
});

describe("直線⇔円 / 円⇔円", () => {
  it("直線⇔円 = 10log10(2) = 3.0103dB（角度に依らず一定）", () => {
    expect(LINEAR_CIRCULAR_MISMATCH_LOSS_DB).toBeCloseTo(3.010299956639812, 12);
    expect(LINEAR_CIRCULAR_MISMATCH_LOSS_DB).toBeCloseTo(3.0103, 4);
  });

  it("円-円 同旋(co) → 0dB（+0で返す）", () => {
    const loss = circularCircularMismatchLossDb("co");
    expect(loss).toBe(0);
    expect(Object.is(loss, -0)).toBe(false);
  });

  it("円-円 逆旋(cross) → ∞（理想・実機はXPDで有限）", () => {
    expect(circularCircularMismatchLossDb("cross")).toBe(Number.POSITIVE_INFINITY);
  });

  it("不正な旋回センスは RfError", () => {
    // @ts-expect-error 実行時ガードの検証
    expect(() => circularCircularMismatchLossDb("rhcp")).toThrowError(RfError);
  });
});

describe("calculatePolarizationMismatchLossDb（統合ディスパッチ）", () => {
  it("直線-直線 θ=45° → 3.0103dB", () => {
    expect(calculatePolarizationMismatchLossDb({ tx: "linear", rx: "linear", angleDeg: 45 })).toBeCloseTo(3.0103, 4);
  });

  it("直線→円 / 円→直線 はどちらも 3.0103dB", () => {
    expect(calculatePolarizationMismatchLossDb({ tx: "linear", rx: "circular" })).toBeCloseTo(3.0103, 4);
    expect(calculatePolarizationMismatchLossDb({ tx: "circular", rx: "linear" })).toBeCloseTo(3.0103, 4);
  });

  it("円-円 同旋=0 / 逆旋=∞", () => {
    expect(calculatePolarizationMismatchLossDb({ tx: "circular", rx: "circular", sense: "co" })).toBe(0);
    expect(calculatePolarizationMismatchLossDb({ tx: "circular", rx: "circular", sense: "cross" })).toBe(
      Number.POSITIVE_INFINITY
    );
  });

  it("表示クランプ提案値は 40dB", () => {
    expect(POLARIZATION_LOSS_DISPLAY_CAP_DB).toBe(40);
  });
});
