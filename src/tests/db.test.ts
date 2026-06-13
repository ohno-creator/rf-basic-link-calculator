import { describe, expect, it } from "vitest";
import { dbmToMw, mwToDbm, wToDbm } from "@/lib/rf/db";

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
});
