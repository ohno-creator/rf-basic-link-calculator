import { describe, expect, it } from "vitest";
import { estimateDetuning } from "@/lib/rf/detuningEstimator";
import { DETUNING_SCENARIOS, getDetuningScenario } from "@/data/detuningData";
import { RfError } from "@/lib/rf/errors";

describe("estimateDetuning", () => {
  it("2400MHz・-3..-5% → 2280..2328MHz", () => {
    const result = estimateDetuning({ centerFrequencyMHz: 2400, bandwidthMHz: 200, shiftMinPercent: -5, shiftMaxPercent: -3 });
    expect(result.shiftedFrequencyMinMHz).toBeCloseTo(2280, 10);
    expect(result.shiftedFrequencyMaxMHz).toBeCloseTo(2328, 10);
    expect(result.bandMinMHz).toBe(2300);
    expect(result.bandMaxMHz).toBe(2500);
    expect(result.status).toBe("partial");
  });
  it("十分広い帯域ならinside", () => {
    expect(estimateDetuning({ centerFrequencyMHz: 2400, bandwidthMHz: 400, shiftMinPercent: -5, shiftMaxPercent: -3 }).status).toBe("inside");
  });
  it("狭帯域で完全に外れればoutside", () => {
    expect(estimateDetuning({ centerFrequencyMHz: 2400, bandwidthMHz: 40, shiftMinPercent: -5, shiftMaxPercent: -3 }).status).toBe("outside");
  });
  it("境界接触はpartialとして重なりあり", () => {
    expect(estimateDetuning({ centerFrequencyMHz: 1000, bandwidthMHz: 60, shiftMinPercent: -5, shiftMaxPercent: -3 }).status).toBe("partial");
  });
  it("周波数/帯域>0、shiftMin<=shiftMaxを検証", () => {
    expect(() => estimateDetuning({ centerFrequencyMHz: 0, bandwidthMHz: 10, shiftMinPercent: -2, shiftMaxPercent: -1 })).toThrowError(RfError);
    expect(() => estimateDetuning({ centerFrequencyMHz: 1000, bandwidthMHz: 0, shiftMinPercent: -2, shiftMaxPercent: -1 })).toThrowError(RfError);
    expect(() => estimateDetuning({ centerFrequencyMHz: 1000, bandwidthMHz: 10, shiftMinPercent: -1, shiftMaxPercent: -2 })).toThrowError(RfError);
  });
});

describe("G4出典付き離調data", () => {
  it("5シナリオ、shift/VSWRレンジ整合", () => {
    expect(DETUNING_SCENARIOS).toHaveLength(5);
    for (const item of DETUNING_SCENARIOS) {
      expect(item.shiftMinPercent).toBeLessThanOrEqual(item.shiftMaxPercent);
      expect(item.vswrMin).toBeLessThanOrEqual(item.vswrMax);
      expect(item.sourceRefs.length).toBeGreaterThan(0);
    }
  });
  it("樹脂密着=-5..-3%、金属1mm=-20..-10%", () => {
    expect(getDetuningScenario("plastic_contact")).toMatchObject({ shiftMinPercent: -5, shiftMaxPercent: -3 });
    expect(getDetuningScenario("metal_1mm")).toMatchObject({ shiftMinPercent: -20, shiftMaxPercent: -10 });
  });
});
