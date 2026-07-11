import { describe, expect, it } from "vitest";
import { sumWallLoss } from "@/lib/rf/wallPenetration";
import { RfError } from "@/lib/rf/errors";
import { WALL_BANDS, WALL_MATERIALS } from "@/data/wallMaterials";

describe("sumWallLoss", () => {
  it("sums plasterboard x2 + interior concrete x1 at 920MHz (1.0×2+8.0=10.0 / 2.0×2+15.0=19.0)", () => {
    const result = sumWallLoss({
      band: 920,
      walls: [
        { material: "plasterboard", count: 2 },
        { material: "concrete-interior", count: 1 }
      ]
    });
    expect(result.totalMinDb).toBeCloseTo(10.0, 10);
    expect(result.totalMaxDb).toBeCloseTo(19.0, 10);
    expect(result.breakdown).toEqual([
      { material: "plasterboard", count: 2, minDb: 2.0, maxDb: 4.0 },
      { material: "concrete-interior", count: 1, minDb: 8.0, maxDb: 15.0 }
    ]);
  });

  it("returns 0/0 with an empty breakdown for an empty wall list", () => {
    const result = sumWallLoss({ band: 920, walls: [] });
    expect(result.totalMinDb).toBe(0);
    expect(result.totalMaxDb).toBe(0);
    expect(result.breakdown).toEqual([]);
    // -0 を返さない（Object.is で符号まで確認）
    expect(Object.is(result.totalMinDb, -0)).toBe(false);
    expect(Object.is(result.totalMaxDb, -0)).toBe(false);
  });

  it("returns the Low-E double glazing range 20-30dB at 2400MHz", () => {
    const result = sumWallLoss({ band: 2400, walls: [{ material: "low-e-glass", count: 1 }] });
    expect(result.totalMinDb).toBeCloseTo(20.0, 10);
    expect(result.totalMaxDb).toBeCloseTo(30.0, 10);
  });

  it("is linear: n walls cost n times one wall, and totals add across materials", () => {
    const one = sumWallLoss({ band: 5000, walls: [{ material: "brick", count: 1 }] });
    const three = sumWallLoss({ band: 5000, walls: [{ material: "brick", count: 3 }] });
    expect(three.totalMinDb).toBeCloseTo(3 * one.totalMinDb, 10);
    expect(three.totalMaxDb).toBeCloseTo(3 * one.totalMaxDb, 10);

    const glass = sumWallLoss({ band: 5000, walls: [{ material: "single-glass", count: 2 }] });
    const combined = sumWallLoss({
      band: 5000,
      walls: [
        { material: "brick", count: 3 },
        { material: "single-glass", count: 2 }
      ]
    });
    expect(combined.totalMinDb).toBeCloseTo(three.totalMinDb + glass.totalMinDb, 10);
    expect(combined.totalMaxDb).toBeCloseTo(three.totalMaxDb + glass.totalMaxDb, 10);
  });

  it("ignores materials with count=0 (excluded from totals and breakdown)", () => {
    const result = sumWallLoss({
      band: 920,
      walls: [
        { material: "rc-exterior", count: 0 },
        { material: "wood-door", count: 1 }
      ]
    });
    expect(result.totalMinDb).toBeCloseTo(1.5, 10);
    expect(result.totalMaxDb).toBeCloseTo(3.0, 10);
    expect(result.breakdown).toHaveLength(1);
    expect(result.breakdown[0].material).toBe("wood-door");
  });

  it("guards an unsupported band, unknown material and invalid counts", () => {
    expect(() => sumWallLoss({ band: 1800 as never, walls: [] })).toThrowError(RfError);
    expect(() =>
      sumWallLoss({ band: 920, walls: [{ material: "aerogel" as never, count: 1 }] })
    ).toThrowError(RfError);
    expect(() =>
      sumWallLoss({ band: 920, walls: [{ material: "plasterboard", count: -1 }] })
    ).toThrowError(RfError);
    expect(() =>
      sumWallLoss({ band: 920, walls: [{ material: "plasterboard", count: 1.5 }] })
    ).toThrowError(RfError);
    expect(() =>
      sumWallLoss({ band: 920, walls: [{ material: "plasterboard", count: Number.NaN }] })
    ).toThrowError(RfError);
  });
});

describe("wall material data table", () => {
  it("keeps min <= max for every material and band", () => {
    for (const material of WALL_MATERIALS) {
      for (const band of WALL_BANDS) {
        const range = material.lossDbPerWall[band];
        expect(range.minDb).toBeGreaterThan(0);
        expect(range.maxDb).toBeGreaterThanOrEqual(range.minDb);
      }
    }
  });

  it("loss never decreases as the frequency rises (920→2400→5000→28000)", () => {
    for (const material of WALL_MATERIALS) {
      for (let i = 1; i < WALL_BANDS.length; i += 1) {
        const lower = material.lossDbPerWall[WALL_BANDS[i - 1]];
        const higher = material.lossDbPerWall[WALL_BANDS[i]];
        expect(higher.minDb).toBeGreaterThanOrEqual(lower.minDb);
        expect(higher.maxDb).toBeGreaterThanOrEqual(lower.maxDb);
      }
    }
  });
});
