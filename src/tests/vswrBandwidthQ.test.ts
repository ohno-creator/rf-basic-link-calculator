import { describe, expect, it } from "vitest";
import {
  absoluteBandwidthMHz,
  DEFAULT_VSWR_LIMIT,
  fractionalBandwidthFromQ,
  fractionalBandwidthPercentFromQ,
  qFromFractionalBandwidth,
  qFromFractionalBandwidthPercent,
  VSWR_LIMIT_PRESETS
} from "@/lib/rf/vswrBandwidthQ";
import { RfError } from "@/lib/rf/errors";

describe("vswrBandwidthQ（G8・FBW⇔Q⇔比帯域）", () => {
  it("既定 VSWR閾値は2、プリセットは1.5/2/3", () => {
    expect(DEFAULT_VSWR_LIMIT).toBe(2);
    expect(VSWR_LIMIT_PRESETS).toEqual([1.5, 2, 3]);
  });

  it("Q=20, s=2 → FBW=3.5355%（proposal期待値）", () => {
    expect(fractionalBandwidthPercentFromQ(20, 2)).toBeCloseTo(3.5355339059, 9);
    expect(fractionalBandwidthFromQ(20, 2)).toBeCloseTo(0.035355339, 9);
  });

  it("s プリセット別: Q=20 → 1.5→2.0412% / 3→5.7735%", () => {
    expect(fractionalBandwidthPercentFromQ(20, 1.5)).toBeCloseTo(2.041241, 5);
    expect(fractionalBandwidthPercentFromQ(20, 3)).toBeCloseTo(5.773503, 5);
  });

  it("逆変換: FBW=5%, s=2 → Q≈14.142", () => {
    expect(qFromFractionalBandwidthPercent(5, 2)).toBeCloseTo(14.142135624, 8);
  });

  it("往復一致（Q起点・FBW起点とも恒等）", () => {
    expect(qFromFractionalBandwidth(fractionalBandwidthFromQ(20, 2), 2)).toBeCloseTo(20, 12);
    expect(fractionalBandwidthFromQ(qFromFractionalBandwidth(0.1, 2), 2)).toBeCloseTo(0.1, 12);
  });

  it("絶対帯域: f0=920MHz, Q=20, s=2 → BW≈32.53MHz・帯域端903.7/936.3", () => {
    const r = absoluteBandwidthMHz(920, fractionalBandwidthFromQ(20, 2));
    expect(r.bandwidthMHz).toBeCloseTo(32.5269, 4);
    expect(r.lowerMHz).toBeCloseTo(903.7365, 4);
    expect(r.upperMHz).toBeCloseTo(936.2635, 4);
  });

  it("ガード: s≤1 / Q≤0 / FBW範囲外 / f0≤0 は RfError", () => {
    expect(() => fractionalBandwidthFromQ(20, 1)).toThrowError(RfError);
    expect(() => fractionalBandwidthFromQ(0, 2)).toThrowError(RfError);
    expect(() => qFromFractionalBandwidthPercent(200, 2)).toThrowError(RfError);
    expect(() => qFromFractionalBandwidth(2, 2)).toThrowError(RfError);
    expect(() => absoluteBandwidthMHz(0, 0.03)).toThrowError(RfError);
  });
});
