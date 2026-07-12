import { describe, expect, it } from "vitest";
import { efficiencyDbToPercent, efficiencyPercentToDb, efficiencyToRangeFactor } from "@/lib/rf/radiationEfficiency";
import { RfError } from "@/lib/rf/errors";

describe("radiation efficiency conversion", () => {
  it.each([[100, 0], [50, -3.01029995664], [10, -10], [1, -20]])("converts %s%% to %sdB and back", (percent, db) => {
    expect(efficiencyPercentToDb(percent)).toBeCloseTo(db, 9);
    expect(efficiencyDbToPercent(db)).toBeCloseTo(percent, 9);
  });

  it("round-trips representative efficiencies", () => {
    for (const percent of [3, 15, 37.5, 82]) {
      expect(efficiencyDbToPercent(efficiencyPercentToDb(percent))).toBeCloseTo(percent, 10);
    }
  });

  it("translates 50% efficiency into the free-space range factor", () => {
    expect(efficiencyToRangeFactor(efficiencyPercentToDb(50))).toBeCloseTo(0.70710678, 7);
  });

  it("normalizes zero and rejects nonphysical domains", () => {
    expect(efficiencyPercentToDb(100)).toBe(0);
    expect(Object.is(efficiencyPercentToDb(100), -0)).toBe(false);
    expect(() => efficiencyPercentToDb(0)).toThrowError(RfError);
    expect(() => efficiencyPercentToDb(101)).toThrowError(RfError);
    expect(() => efficiencyDbToPercent(0.1)).toThrowError(RfError);
    expect(() => efficiencyToRangeFactor(1)).toThrowError(RfError);
  });
});
