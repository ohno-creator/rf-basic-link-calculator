import { describe, expect, it } from "vitest";
import {
  assertAtLeast,
  assertFinite,
  assertNonNegative,
  assertPositiveFinite,
  RfError,
  RfErrorCode
} from "@/lib/rf/errors";

describe("RfError guards", () => {
  it("RfError carries code/field/context and extends Error", () => {
    const error = new RfError(RfErrorCode.TooLarge, { field: "frequency", max: 100 });
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("RfError");
    expect(error.code).toBe(RfErrorCode.TooLarge);
    expect(error.field).toBe("frequency");
    expect(error.max).toBe(100);
    // message はデバッグ用の非localized文字列（日本語を含まない）。
    expect(error.message).toBe("too_large:frequency");
  });

  it("assertPositiveFinite throws NonPositive for 0/negative/non-finite", () => {
    for (const value of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => assertPositiveFinite(value, "frequency")).toThrowError(RfError);
    }
    expect(() => assertPositiveFinite(1, "frequency")).not.toThrow();
    try {
      assertPositiveFinite(0, "frequency");
    } catch (error) {
      expect((error as RfError).code).toBe(RfErrorCode.NonPositive);
      expect((error as RfError).field).toBe("frequency");
    }
  });

  it("assertFinite throws NonFinite only for non-finite values", () => {
    expect(() => assertFinite(Number.NaN, "db")).toThrowError(RfError);
    expect(() => assertFinite(-5, "db")).not.toThrow();
    expect(() => assertFinite(0, "db")).not.toThrow();
  });

  it("assertNonNegative accepts 0 but rejects negatives and non-finite", () => {
    expect(() => assertNonNegative(0, "extra_loss")).not.toThrow();
    expect(() => assertNonNegative(3, "extra_loss")).not.toThrow();
    expect(() => assertNonNegative(-0.1, "extra_loss")).toThrowError(RfError);
    expect(() => assertNonNegative(Number.NaN, "extra_loss")).toThrowError(RfError);
  });

  it("assertAtLeast enforces a minimum bound", () => {
    expect(() => assertAtLeast(1, 1, "dielectric_constant")).not.toThrow();
    expect(() => assertAtLeast(4.4, 1, "dielectric_constant")).not.toThrow();
    try {
      assertAtLeast(0.5, 1, "dielectric_constant");
    } catch (error) {
      expect((error as RfError).code).toBe(RfErrorCode.BelowMinimum);
      expect((error as RfError).min).toBe(1);
    }
  });
});
