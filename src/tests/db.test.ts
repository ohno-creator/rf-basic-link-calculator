import { describe, expect, it } from "vitest";
import { dbmToMw, dbToDistanceRatio, dbToPowerRatio, mwToDbm, wToDbm } from "@/lib/rf/db";

describe("dB conversions", () => {
  it("converts dBm to mW", () => {
    expect(dbmToMw(0)).toBeCloseTo(1, 6);
    expect(dbmToMw(10)).toBeCloseTo(10, 6);
    expect(dbmToMw(20)).toBeCloseTo(100, 6);
    expect(dbmToMw(30)).toBeCloseTo(1000, 6);
  });

  it("converts mW and W to dBm", () => {
    expect(mwToDbm(100)).toBeCloseTo(20, 6);
    expect(wToDbm(1)).toBeCloseTo(30, 6);
  });

  it("converts dB to a power ratio (×)", () => {
    expect(dbToPowerRatio(0)).toBeCloseTo(1, 6);
    expect(dbToPowerRatio(3)).toBeCloseTo(1.995, 3); // ≈2倍
    expect(dbToPowerRatio(10)).toBeCloseTo(10, 6);
    expect(dbToPowerRatio(20)).toBeCloseTo(100, 6);
    expect(dbToPowerRatio(-6)).toBeCloseTo(0.251, 3); // ≈1/4
  });

  it("converts dB to a free-space distance ratio (×)", () => {
    expect(dbToDistanceRatio(6)).toBeCloseTo(1.995, 3); // 距離≈2倍
    expect(dbToDistanceRatio(20)).toBeCloseTo(10, 6);
    expect(dbToDistanceRatio(0)).toBeCloseTo(1, 6);
  });
});
