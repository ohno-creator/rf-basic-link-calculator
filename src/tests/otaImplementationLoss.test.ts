import { describe, expect, it } from "vitest";
import {
  analyzeOtaBand,
  classifyDesense,
  DESENSE_CAUTION_MAX_DB,
  DESENSE_CLEAN_MAX_DB
} from "@/lib/rf/otaImplementationLoss";
import { RfError } from "@/lib/rf/errors";

describe("analyzeOtaBand", () => {
  it("separates tx/rx gaps and desense (Pc=23, Sc=-108, η=-3, TRP=19, TIS=-101)", () => {
    const result = analyzeOtaBand({
      conductedPowerDbm: 23,
      conductedSensitivityDbm: -108,
      antennaEfficiencyDb: -3,
      trpDbm: 19,
      tisDbm: -101
    });
    expect(result.expectedTrpDbm).toBeCloseTo(20, 10);
    expect(result.trpGapDb).toBeCloseTo(1.0, 10);
    expect(result.expectedTisDbm).toBeCloseTo(-105, 10);
    expect(result.tisGapDb).toBeCloseTo(4.0, 10);
    expect(result.desenseDb).toBeCloseTo(3.0, 10);
    // 境界: デセンス3.0dBは「caution」側（>3で初めてnoisy）
    expect(result.verdict).toBe("caution");
  });

  it("returns all-zero gaps and clean verdict when OTA equals conducted (η=0)", () => {
    const result = analyzeOtaBand({
      conductedPowerDbm: 23,
      conductedSensitivityDbm: -108,
      antennaEfficiencyDb: 0,
      trpDbm: 23,
      tisDbm: -108
    });
    expect(result.expectedTrpDbm).toBeCloseTo(23, 10);
    expect(result.trpGapDb).toBe(0);
    expect(result.expectedTisDbm).toBeCloseTo(-108, 10);
    expect(result.tisGapDb).toBe(0);
    expect(result.desenseDb).toBe(0);
    expect(result.verdict).toBe("clean");
  });

  it("never returns -0 for zero gaps", () => {
    const result = analyzeOtaBand({
      conductedPowerDbm: 23,
      conductedSensitivityDbm: -108,
      antennaEfficiencyDb: 0,
      trpDbm: 23,
      tisDbm: -108
    });
    expect(Object.is(result.trpGapDb, -0)).toBe(false);
    expect(Object.is(result.tisGapDb, -0)).toBe(false);
    expect(Object.is(result.desenseDb, -0)).toBe(false);
  });

  it("allows negative gaps (measurement better than expected) and stays clean", () => {
    const result = analyzeOtaBand({
      conductedPowerDbm: 23,
      conductedSensitivityDbm: -108,
      antennaEfficiencyDb: -3,
      trpDbm: 20.5,
      tisDbm: -106
    });
    expect(result.trpGapDb).toBeCloseTo(-0.5, 10);
    expect(result.tisGapDb).toBeCloseTo(-1.0, 10);
    expect(result.desenseDb).toBeCloseTo(-0.5, 10);
    expect(result.verdict).toBe("clean");
  });

  it("guards non-finite inputs and positive efficiency (>100%)", () => {
    const base = {
      conductedPowerDbm: 23,
      conductedSensitivityDbm: -108,
      antennaEfficiencyDb: -3,
      trpDbm: 19,
      tisDbm: -101
    };
    expect(() => analyzeOtaBand({ ...base, conductedPowerDbm: Number.NaN })).toThrowError(RfError);
    expect(() => analyzeOtaBand({ ...base, conductedSensitivityDbm: Number.POSITIVE_INFINITY })).toThrowError(RfError);
    expect(() => analyzeOtaBand({ ...base, antennaEfficiencyDb: Number.NaN })).toThrowError(RfError);
    expect(() => analyzeOtaBand({ ...base, trpDbm: Number.NaN })).toThrowError(RfError);
    expect(() => analyzeOtaBand({ ...base, tisDbm: Number.NaN })).toThrowError(RfError);
    // 放射効率は電力比≤1（dBで≤0）。正のdBは物理的にあり得ないため拒否する。
    expect(() => analyzeOtaBand({ ...base, antennaEfficiencyDb: 0.5 })).toThrowError(RfError);
  });
});

describe("classifyDesense", () => {
  it("uses ≤1dB clean / ≤3dB caution / >3dB noisy boundaries", () => {
    expect(DESENSE_CLEAN_MAX_DB).toBe(1);
    expect(DESENSE_CAUTION_MAX_DB).toBe(3);
    expect(classifyDesense(-2)).toBe("clean");
    expect(classifyDesense(0)).toBe("clean");
    expect(classifyDesense(1)).toBe("clean");
    expect(classifyDesense(1.01)).toBe("caution");
    expect(classifyDesense(3)).toBe("caution");
    expect(classifyDesense(3.01)).toBe("noisy");
    expect(classifyDesense(10)).toBe("noisy");
  });

  it("guards a non-finite desense", () => {
    expect(() => classifyDesense(Number.NaN)).toThrowError(RfError);
  });
});
