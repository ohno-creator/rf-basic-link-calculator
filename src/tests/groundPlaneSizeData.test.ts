import { describe, expect, it } from "vitest";
import {
  GROUND_PLANE_EFFICIENCY_TABLE,
  GROUND_PLANE_SIZE_DATA_CONFIDENCE,
  GROUND_PLANE_SIZE_SOURCES
} from "@/data/groundPlaneSizeData";

describe("G2出典付きGND効率テーブル", () => {
  it("6点・ratio昇順・効率変化単調非減少", () => {
    expect(GROUND_PLANE_EFFICIENCY_TABLE).toHaveLength(6);
    for (let index = 1; index < GROUND_PLANE_EFFICIENCY_TABLE.length; index += 1) {
      expect(GROUND_PLANE_EFFICIENCY_TABLE[index].ratio).toBeGreaterThan(GROUND_PLANE_EFFICIENCY_TABLE[index - 1].ratio);
      expect(GROUND_PLANE_EFFICIENCY_TABLE[index].efficiencyChangeDb).toBeGreaterThanOrEqual(GROUND_PLANE_EFFICIENCY_TABLE[index - 1].efficiencyChangeDb);
    }
  });
  it("0.1λ=-6dB、0.25λ=0dB", () => {
    expect(GROUND_PLANE_EFFICIENCY_TABLE.find((point) => point.ratio === 0.1)?.efficiencyChangeDb).toBe(-6);
    expect(GROUND_PLANE_EFFICIENCY_TABLE.at(-1)).toEqual({ ratio: 0.25, efficiencyChangeDb: 0 });
  });
  it("出典3件・確認済み", () => {
    expect(Object.keys(GROUND_PLANE_SIZE_SOURCES)).toHaveLength(3);
    expect(GROUND_PLANE_SIZE_DATA_CONFIDENCE).toBe("confirmed");
  });
});
