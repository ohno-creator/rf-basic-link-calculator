import { describe, expect, it } from "vitest";
import { estimateDetuning } from "@/lib/rf/detuning";
import { RfError } from "@/lib/rf/errors";
import { DETUNING_SCENARIOS, DETUNING_SOURCES } from "@/data/detuningScenarios";

describe("estimateDetuning", () => {
  it("920MHz・BW40MHz・樹脂カバー密着 → シフト-27.6〜-46.0MHzで最小シフトでも帯域外 (no)", () => {
    const result = estimateDetuning({
      centerFrequencyMHz: 920,
      vswr2BandwidthMHz: 40,
      scenario: "resin-cover-contact"
    });
    // シフト量 = 920 × (-3.0〜-5.0)/100
    expect(result.shiftMinMHz).toBeCloseTo(-27.6, 6);
    expect(result.shiftMaxMHz).toBeCloseTo(-46.0, 6);
    expect(result.vswrRange).toEqual([2.5, 4.0]);
    // 帯域端は center±20MHz。最小シフト-27.6MHzでも下端(-20MHz)を超えて外れる。
    expect(result.staysInBand).toBe("no");
  });

  it("920MHz・BW100MHz・樹脂カバー3mm → シフト-4.6〜-9.2MHzで±50MHz内 (yes)", () => {
    const result = estimateDetuning({
      centerFrequencyMHz: 920,
      vswr2BandwidthMHz: 100,
      scenario: "resin-cover-3mm"
    });
    expect(result.shiftMinMHz).toBeCloseTo(-4.6, 6);
    expect(result.shiftMaxMHz).toBeCloseTo(-9.2, 6);
    expect(result.vswrRange).toEqual([1.6, 2.0]);
    expect(result.staysInBand).toBe("yes");
  });

  it("境界: BW55.2MHz・樹脂カバー密着 → 最小シフト(-27.6MHz)がちょうど帯域端(±27.6MHz)で partial", () => {
    // |最小シフト| = 27.6 = BW/2 ちょうど（帯域端は「収まる」扱い）。最大シフト-46.0MHzは外れる。
    const result = estimateDetuning({
      centerFrequencyMHz: 920,
      vswr2BandwidthMHz: 55.2,
      scenario: "resin-cover-contact"
    });
    expect(result.staysInBand).toBe("partial");
  });

  it("境界の内側: BW55.0MHz・樹脂カバー密着 → 最小シフトでも帯域端(±27.5MHz)を超えて no", () => {
    const result = estimateDetuning({
      centerFrequencyMHz: 920,
      vswr2BandwidthMHz: 55,
      scenario: "resin-cover-contact"
    });
    expect(result.staysInBand).toBe("no");
  });

  it("手把持: 920MHz・BW80MHz → 最小-36.8MHzは帯域内・最大-73.6MHzは帯域外で partial", () => {
    const result = estimateDetuning({
      centerFrequencyMHz: 920,
      vswr2BandwidthMHz: 80,
      scenario: "hand-grip"
    });
    expect(result.shiftMinMHz).toBeCloseTo(-36.8, 6);
    expect(result.shiftMaxMHz).toBeCloseTo(-73.6, 6);
    expect(result.vswrRange).toEqual([3.5, 6.0]);
    expect(result.staysInBand).toBe("partial");
  });

  it("金属面近接1mm: 920MHz・BW40MHz → シフト-92〜-184MHzで大きく帯域外 (no)", () => {
    const result = estimateDetuning({
      centerFrequencyMHz: 920,
      vswr2BandwidthMHz: 40,
      scenario: "metal-plane-1mm"
    });
    expect(result.shiftMinMHz).toBeCloseTo(-92, 6);
    expect(result.shiftMaxMHz).toBeCloseTo(-184, 6);
    expect(result.vswrRange).toEqual([5.0, 10.0]);
    expect(result.staysInBand).toBe("no");
  });

  it("シフトは常に低周波側（負値）で、-0 を返さない", () => {
    for (const scenario of DETUNING_SCENARIOS) {
      const result = estimateDetuning({
        centerFrequencyMHz: 2450,
        vswr2BandwidthMHz: 100,
        scenario: scenario.id
      });
      expect(result.shiftMinMHz).toBeLessThan(0);
      expect(result.shiftMaxMHz).toBeLessThanOrEqual(result.shiftMinMHz);
      expect(Object.is(result.shiftMinMHz, -0)).toBe(false);
      expect(Object.is(result.shiftMaxMHz, -0)).toBe(false);
    }
  });

  it("guards non-positive inputs and unknown scenarios", () => {
    expect(() =>
      estimateDetuning({ centerFrequencyMHz: 0, vswr2BandwidthMHz: 40, scenario: "hand-grip" })
    ).toThrowError(RfError);
    expect(() =>
      estimateDetuning({ centerFrequencyMHz: -920, vswr2BandwidthMHz: 40, scenario: "hand-grip" })
    ).toThrowError(RfError);
    expect(() =>
      estimateDetuning({ centerFrequencyMHz: 920, vswr2BandwidthMHz: 0, scenario: "hand-grip" })
    ).toThrowError(RfError);
    expect(() =>
      estimateDetuning({
        centerFrequencyMHz: Number.NaN,
        vswr2BandwidthMHz: 40,
        scenario: "hand-grip"
      })
    ).toThrowError(RfError);
    expect(() =>
      estimateDetuning({
        centerFrequencyMHz: 920,
        vswr2BandwidthMHz: 40,
        // @ts-expect-error 未知のシナリオIDはコンパイルエラーかつ実行時 RfError
        scenario: "unknown-scenario"
      })
    ).toThrowError(RfError);
  });
});

describe("DETUNING_SCENARIOS data integrity", () => {
  it("has the 5 published scenarios with negative shifts (小さい絶対値→大きい絶対値の順)", () => {
    expect(DETUNING_SCENARIOS).toHaveLength(5);
    for (const scenario of DETUNING_SCENARIOS) {
      expect(scenario.shiftMinPercent).toBeLessThan(0);
      expect(scenario.shiftMaxPercent).toBeLessThanOrEqual(scenario.shiftMinPercent);
      expect(scenario.vswrMin).toBeGreaterThanOrEqual(1);
      expect(scenario.vswrMax).toBeGreaterThanOrEqual(scenario.vswrMin);
    }
  });

  it("keeps unique ids and cites at least one source", () => {
    const ids = DETUNING_SCENARIOS.map((scenario) => scenario.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(DETUNING_SOURCES.length).toBeGreaterThanOrEqual(3);
    for (const source of DETUNING_SOURCES) {
      expect(source.label.length).toBeGreaterThan(0);
      expect(source.note.length).toBeGreaterThan(0);
    }
  });
});
