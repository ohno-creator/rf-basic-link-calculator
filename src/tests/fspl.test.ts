import { describe, expect, it } from "vitest";
import { calculateFsplDb } from "@/lib/rf/fspl";

describe("FSPL calculations", () => {
  it("calculates FSPL for 920MHz at 1km", () => {
    expect(calculateFsplDb(920, 1)).toBeCloseTo(91.7, 1);
  });

  it("calculates FSPL for 2400MHz at 0.01km", () => {
    expect(calculateFsplDb(2400, 0.01)).toBeCloseTo(60.0, 1);
  });

  it("throws when frequency or distance is not positive", () => {
    expect(() => calculateFsplDb(0, 1)).toThrow();
    expect(() => calculateFsplDb(920, 0)).toThrow();
  });
});
