import { describe, expect, it } from "vitest";
import {
  evaluateAntennaKeepout,
  type AntennaKeepoutRequirement
} from "@/lib/rf/antennaKeepout";
import {
  ANTENNA_KEEPOUT_REQUIREMENTS,
  getAntennaKeepoutRequirement
} from "@/data/antennaKeepoutData";
import { RfError } from "@/lib/rf/errors";

const requirement: AntennaKeepoutRequirement = {
  requiredWidthMm: 10,
  requiredHeightMm: 4
};

describe("evaluateAntennaKeepout", () => {
  it("必要寸法と同値ならsuccess", () => {
    const result = evaluateAntennaKeepout({
      availableWidthMm: 10,
      availableHeightMm: 4,
      requirement
    });
    expect(result.status).toBe("success");
    expect(result.widthShortfallMm).toBe(0);
    expect(result.heightShortfallMm).toBe(0);
  });

  it("1mm不足・不足率10%ならcaution", () => {
    const result = evaluateAntennaKeepout({
      availableWidthMm: 9,
      availableHeightMm: 4,
      requirement
    });
    expect(result.status).toBe("caution");
    expect(result.widthShortfallMm).toBe(1);
    expect(result.maximumShortfallRatio).toBeCloseTo(0.1, 12);
  });

  it("両辺不足でも各20%未満ならcaution", () => {
    expect(evaluateAntennaKeepout({
      availableWidthMm: 8.1,
      availableHeightMm: 3.3,
      requirement
    }).status).toBe("caution");
  });

  it("ちょうど20%不足はdanger", () => {
    const result = evaluateAntennaKeepout({
      availableWidthMm: 8,
      availableHeightMm: 4,
      requirement
    });
    expect(result.status).toBe("danger");
    expect(result.maximumShortfallRatio).toBeCloseTo(0.2, 12);
  });

  it("W/Hは入れ替えず各辺を独立評価する", () => {
    expect(evaluateAntennaKeepout({
      availableWidthMm: 4,
      availableHeightMm: 10,
      requirement
    }).status).toBe("danger");
  });

  it("負値・0以下の必要寸法・非有限値はRfError", () => {
    expect(() => evaluateAntennaKeepout({ availableWidthMm: -1, availableHeightMm: 4, requirement })).toThrowError(RfError);
    expect(() => evaluateAntennaKeepout({ availableWidthMm: 10, availableHeightMm: 4, requirement: { requiredWidthMm: 0, requiredHeightMm: 4 } })).toThrowError(RfError);
    expect(() => evaluateAntennaKeepout({ availableWidthMm: 10, availableHeightMm: Number.NaN, requirement })).toThrowError(RfError);
  });
});

describe("出典付きキープアウトdata", () => {
  it("4種×4帯域=16件、寸法はすべて正値", () => {
    expect(ANTENNA_KEEPOUT_REQUIREMENTS).toHaveLength(16);
    for (const item of ANTENNA_KEEPOUT_REQUIREMENTS) {
      expect(item.requiredWidthMm).toBeGreaterThan(0);
      expect(item.requiredHeightMm).toBeGreaterThan(0);
      expect(item.sourceRefs.length).toBeGreaterThan(0);
      expect(item.confidence).toBe("confirmed");
    }
  });

  it("2.4GHzチップ=10×4mm、920MHz PCB=50×15mm", () => {
    expect(getAntennaKeepoutRequirement("chip", "2400")).toMatchObject({ requiredWidthMm: 10, requiredHeightMm: 4 });
    expect(getAntennaKeepoutRequirement("pcb", "920")).toMatchObject({ requiredWidthMm: 50, requiredHeightMm: 15 });
  });

  it("未知キーはundefined", () => {
    expect(getAntennaKeepoutRequirement("unknown", "920")).toBeUndefined();
  });
});
