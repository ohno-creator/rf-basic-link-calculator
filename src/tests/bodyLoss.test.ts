import { describe, expect, it } from "vitest";
import { analyzeBodyLoss } from "@/lib/rf/bodyLoss";
import { BODY_LOSS_DATA, getBodyLossData } from "@/data/bodyLossData";
import { RfError } from "@/lib/rf/errors";

describe("analyzeBodyLoss", () => {
  it("5/10dB → 電力残存率31.62%/10%", () => {
    const result = analyzeBodyLoss({ typicalLossDb: 5, worstLossDb: 10 });
    expect(result.typicalPowerRetainedPercent).toBeCloseTo(31.6228, 3);
    expect(result.worstPowerRetainedPercent).toBeCloseTo(10, 10);
  });
  it("0dBなら100%、-0なし", () => {
    const result = analyzeBodyLoss({ typicalLossDb: 0, worstLossDb: 0 });
    expect(result.typicalPowerRetainedPercent).toBe(100);
    expect(Object.is(result.typicalPowerRetainedPercent, -0)).toBe(false);
  });
  it("負値・typical>worstはRfError", () => {
    expect(() => analyzeBodyLoss({ typicalLossDb: -1, worstLossDb: 2 })).toThrowError(RfError);
    expect(() => analyzeBodyLoss({ typicalLossDb: 3, worstLossDb: 2 })).toThrowError(RfError);
  });
});

describe("G5出典付きボディロスdata", () => {
  it("5シナリオ×4帯域からGNSS頭部欠損を除く19件", () => {
    expect(BODY_LOSS_DATA).toHaveLength(19);
    for (const item of BODY_LOSS_DATA) {
      expect(item.typicalLossDb).toBeGreaterThanOrEqual(0);
      expect(item.worstLossDb).toBeGreaterThanOrEqual(item.typicalLossDb);
      expect(item.sourceRefs.length).toBeGreaterThan(0);
    }
  });
  it("2.4GHz手持ち=5/10dB、920MHz体表密着=10/18dB", () => {
    expect(getBodyLossData("handheld", "2400")).toMatchObject({ typicalLossDb: 5, worstLossDb: 10 });
    expect(getBodyLossData("torso", "920")).toMatchObject({ typicalLossDb: 10, worstLossDb: 18 });
  });
  it("GNSS頭部近接はデータなし", () => {
    expect(getBodyLossData("head", "1575")).toBeUndefined();
  });
});
