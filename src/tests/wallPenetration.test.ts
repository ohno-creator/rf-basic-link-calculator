import { describe, expect, it } from "vitest";
import {
  calculateWallPenetrationLoss,
  type WallPenetrationItem
} from "@/lib/rf/wallPenetration";
import {
  WALL_PENETRATION_DATA,
  getWallPenetrationRange
} from "@/data/wallPenetrationData";
import { RfError } from "@/lib/rf/errors";

describe("calculateWallPenetrationLoss（dB領域加算）", () => {
  it("2.4GHz: drywall 2枚 + concrete 1枚 → 15..26dB", () => {
    const items: WallPenetrationItem[] = [
      { count: 2, lossMinDbPerWall: 1.5, lossMaxDbPerWall: 3 },
      { count: 1, lossMinDbPerWall: 12, lossMaxDbPerWall: 20 }
    ];
    expect(calculateWallPenetrationLoss(items)).toEqual({
      minimumLossDb: 15,
      maximumLossDb: 26,
      wallCount: 3
    });
  });

  it("空配列は0dB・0枚（-0なし）", () => {
    expect(calculateWallPenetrationLoss([])).toEqual({ minimumLossDb: 0, maximumLossDb: 0, wallCount: 0 });
  });

  it("枚数0は合計へ影響しない", () => {
    expect(calculateWallPenetrationLoss([{ count: 0, lossMinDbPerWall: 10, lossMaxDbPerWall: 20 }])).toEqual({ minimumLossDb: 0, maximumLossDb: 0, wallCount: 0 });
  });

  it("負損失・min>max・非整数枚数はRfError", () => {
    expect(() => calculateWallPenetrationLoss([{ count: 1, lossMinDbPerWall: -1, lossMaxDbPerWall: 2 }])).toThrowError(RfError);
    expect(() => calculateWallPenetrationLoss([{ count: 1, lossMinDbPerWall: 3, lossMaxDbPerWall: 2 }])).toThrowError(RfError);
    expect(() => calculateWallPenetrationLoss([{ count: 1.5, lossMinDbPerWall: 1, lossMaxDbPerWall: 2 }])).toThrowError(RfError);
  });
});

describe("出典付き建材data", () => {
  it("7材質×4帯域=28件、全レンジmin<=max", () => {
    expect(WALL_PENETRATION_DATA).toHaveLength(28);
    for (const item of WALL_PENETRATION_DATA) {
      expect(item.minimumLossDb).toBeGreaterThanOrEqual(0);
      expect(item.maximumLossDb).toBeGreaterThanOrEqual(item.minimumLossDb);
      expect(item.sourceRefs.length).toBeGreaterThan(0);
    }
  });

  it("2.4GHz鉄筋コンクリート=20..35dB、28GHz Low-E=30..45dB", () => {
    expect(getWallPenetrationRange("reinforced_concrete", "2400")).toMatchObject({ minimumLossDb: 20, maximumLossDb: 35 });
    expect(getWallPenetrationRange("low_e_glass", "28000")).toMatchObject({ minimumLossDb: 30, maximumLossDb: 45 });
  });

  it("未知キーはundefined", () => {
    expect(getWallPenetrationRange("unknown", "2400")).toBeUndefined();
  });
});
