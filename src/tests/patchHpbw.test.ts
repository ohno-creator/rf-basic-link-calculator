import { describe, expect, it } from "vitest";
import { approximateDirectivityDbi, coverageDiameterM } from "@/lib/rf/patchHpbw";
import { RfError } from "@/lib/rf/errors";

describe("patch HPBW helpers", () => {
  it("derives the floor coverage diameter from the full HPBW", () => {
    expect(coverageDiameterM(3, 65)).toBeCloseTo(3.8224, 4);
    expect(coverageDiameterM(6, 65)).toBeCloseTo(7.6448, 4);
    expect(coverageDiameterM(3, 90)).toBeCloseTo(6, 10);
  });

  it("estimates directivity from E/H beamwidths", () => {
    expect(approximateDirectivityDbi(65, 65)).toBeCloseTo(9.896, 3);
    expect(approximateDirectivityDbi(65, 70)).toBeCloseTo(9.5744, 4);
  });

  it("rejects nonphysical height and HPBW", () => {
    expect(() => coverageDiameterM(0, 65)).toThrowError(RfError);
    expect(() => coverageDiameterM(3, 0)).toThrowError(RfError);
    expect(() => coverageDiameterM(3, 180)).toThrowError(RfError);
  });
});
