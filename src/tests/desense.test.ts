import { describe, expect, it } from "vitest";
import {
  combineNoisePowersDbm,
  desenseDb,
  desenseFromReceiver,
  rangeRatioFromDesenseDb,
  rangeReductionPercentFromDesenseDb
} from "@/lib/rf/desense";
import { RfError } from "@/lib/rf/errors";

describe("desense（G16・干渉によるデセンスと距離影響）", () => {
  it("I=N（同電力）→ Δ=3.0103dB", () => {
    expect(desenseDb(-100, -100)).toBeCloseTo(3.0103, 4);
    expect(combineNoisePowersDbm(-100, -100)).toBeCloseTo(-96.9897, 4);
  });

  it("Δ=3.0103dB, n=2 → ratio=0.7071 / 距離−29.289%", () => {
    const delta = desenseDb(-100, -100);
    expect(rangeRatioFromDesenseDb(delta, 2)).toBeCloseTo(0.7071, 4);
    expect(rangeReductionPercentFromDesenseDb(delta, 2)).toBeCloseTo(29.289, 3);
  });

  it("I=N−10dB → Δ=0.4139dB（干渉が10dB低ければ影響は小さい）", () => {
    expect(desenseDb(-100, -110)).toBeCloseTo(0.4139, 4);
  });

  it("I=N+6dB → Δ=6.9732dB / n=2 で距離−55.194%", () => {
    const delta = desenseDb(-100, -94);
    expect(delta).toBeCloseTo(6.9732, 4);
    expect(rangeReductionPercentFromDesenseDb(delta, 2)).toBeCloseTo(55.194, 3);
  });

  it("Δ=3.0103dB, n=3（市街地寄り）→ 距離−20.630%（nが大きいほど距離影響は緩和）", () => {
    const delta = desenseDb(-100, -100);
    expect(rangeReductionPercentFromDesenseDb(delta, 3)).toBeCloseTo(20.63, 2);
  });

  it("BW=1MHz + NF=6dB → N=−108dBm、I=N で合成−104.99dBm / Δ=3.0103dB", () => {
    const r = desenseFromReceiver(1e6, 6, -108);
    expect(r.noiseFloorDbm).toBeCloseTo(-108, 10);
    expect(r.combinedNoiseFloorDbm).toBeCloseTo(-104.99, 2);
    expect(r.desenseDb).toBeCloseTo(3.0103, 4);
  });

  it("Δ=0 → ratio=1 / 短縮0%（-0になり得るため toBeCloseTo で比較）", () => {
    expect(rangeRatioFromDesenseDb(0, 2)).toBeCloseTo(1, 10);
    expect(rangeReductionPercentFromDesenseDb(0, 2)).toBeCloseTo(0, 10);
  });

  it("干渉が強いほどデセンスは単調に悪化", () => {
    expect(desenseDb(-100, -94)).toBeGreaterThan(desenseDb(-100, -100));
    expect(desenseDb(-100, -100)).toBeGreaterThan(desenseDb(-100, -110));
  });

  it("ガード: N/I が非有限、n≤0、Δ<0 は RfError", () => {
    expect(() => combineNoisePowersDbm(Number.NaN, -100)).toThrowError(RfError);
    expect(() => combineNoisePowersDbm(-100, Number.POSITIVE_INFINITY)).toThrowError(RfError);
    expect(() => rangeRatioFromDesenseDb(3, 0)).toThrowError(RfError);
    expect(() => rangeRatioFromDesenseDb(3, -2)).toThrowError(RfError);
    expect(() => rangeRatioFromDesenseDb(-1, 2)).toThrowError(RfError);
    expect(() => desenseFromReceiver(0, 6, -108)).toThrowError(RfError);
  });
});
