import { describe, expect, it } from "vitest";
import { areaCoverageFraction, buildAreaCoverageTable, standardNormalCdf, upperTailNormal } from "@/lib/rf/areaCoverage";
import { RfError } from "@/lib/rf/errors";

describe("standard normal CDF", () => {
  it.each([[0, .5], [1, .841345], [-1, .158655], [1.6449, .9500048]])("Φ(%s)≈%s", (x, expected) => {
    expect(standardNormalCdf(x)).toBeCloseTo(expected, 6);
  });
  it("keeps Q complementary", () => expect(upperTailNormal(1)).toBeCloseTo(1 - standardNormalCdf(1), 14));
});

describe("area coverage fraction", () => {
  it.each([
    [.50, 8, 3.5, 75.45], [.80, 8, 3.5, 92.28], [.90, 8, 3.5, 96.57],
    [.95, 8, 3.5, 98.43], [.99, 8, 3.5, 99.73], [.75, 6, 3, 90.73], [.95, 4, 2, 98.58]
  ])("edge=%s σ=%s n=%s -> %s%%", (edge, sigma, n, expectedPercent) => {
    expect(areaCoverageFraction(edge, sigma, n) * 100).toBeCloseTo(expectedPercent, 2);
  });

  it("builds the same five reliability rows", () => {
    const rows = buildAreaCoverageTable(8, 3.5);
    expect(rows.map((row) => row.reliabilityPercent)).toEqual([50, 80, 90, 95, 99]);
    expect(rows.map((row) => row.areaCoveragePercent)).toEqual(expect.arrayContaining([expect.closeTo(96.57, 2)]));
  });

  it("rejects probability boundaries and nonpositive model inputs", () => {
    expect(() => areaCoverageFraction(0, 8, 3.5)).toThrowError(RfError);
    expect(() => areaCoverageFraction(1, 8, 3.5)).toThrowError(RfError);
    expect(() => areaCoverageFraction(.9, 0, 3.5)).toThrowError(RfError);
    expect(() => areaCoverageFraction(.9, 8, 0)).toThrowError(RfError);
  });
});
