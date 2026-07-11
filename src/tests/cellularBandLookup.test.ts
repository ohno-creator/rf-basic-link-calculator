import { describe, expect, it } from "vitest";
import {
  bandRepresentativeFrequencyMHz,
  bandSpan,
  findBandsByFrequency,
  halfWavelengthMm,
  wavelengthMm
} from "@/lib/rf/cellularBandLookup";
import { CELLULAR_BANDS } from "@/data/cellularBands";
import { RfError } from "@/lib/rf/errors";

describe("findBandsByFrequency", () => {
  it("returns B8 (UL side) for 900MHz — DL帯925-960には入らない", () => {
    const matches = findBandsByFrequency(900);
    expect(matches).toHaveLength(1);
    expect(matches[0].band.key).toBe("B8");
    expect(matches[0].segment).toBe("UL");
  });

  it("returns B8 (DL side) for 940MHz", () => {
    const matches = findBandsByFrequency(940);
    expect(matches).toHaveLength(1);
    expect(matches[0].band.key).toBe("B8");
    expect(matches[0].segment).toBe("DL");
  });

  it("returns B42, n77, n78 (all TDD) for 3500MHz", () => {
    const matches = findBandsByFrequency(3500);
    expect(matches.map((m) => m.band.key)).toEqual(["B42", "n77", "n78"]);
    expect(matches.every((m) => m.segment === "TDD")).toBe(true);
  });

  it("returns B28 (UL) for 720MHz（700MHz台）", () => {
    const matches = findBandsByFrequency(720);
    expect(matches).toHaveLength(1);
    expect(matches[0].band.key).toBe("B28");
    expect(matches[0].segment).toBe("UL");
  });

  it("returns an empty array when no band contains the frequency", () => {
    expect(findBandsByFrequency(100)).toEqual([]);
    expect(findBandsByFrequency(6000)).toEqual([]);
  });

  it("treats range edges as inclusive (880MHz → B8 UL と B19 DL の両方)", () => {
    const keys = findBandsByFrequency(880).map((m) => `${m.band.key}:${m.segment}`);
    expect(keys).toContain("B8:UL");
    expect(keys).toContain("B19:DL");
  });

  it("finds the mmWave band n257 at 28000MHz", () => {
    expect(findBandsByFrequency(28000).map((m) => m.band.key)).toEqual(["n257"]);
  });

  it("guards non-positive or non-finite frequencies", () => {
    expect(() => findBandsByFrequency(0)).toThrowError(RfError);
    expect(() => findBandsByFrequency(-900)).toThrowError(RfError);
    expect(() => findBandsByFrequency(Number.NaN)).toThrowError(RfError);
  });
});

describe("wavelengthMm / halfWavelengthMm", () => {
  it("computes λ ≈ 299.79mm at 1000MHz (c = 299792458 m/s)", () => {
    expect(wavelengthMm(1000)).toBeCloseTo(299.792458, 5);
  });

  it("computes the λ/2 antenna length ≈ 166.55mm at 900MHz", () => {
    expect(halfWavelengthMm(900)).toBeCloseTo(166.5514, 3);
  });

  it("is exactly half of the full wavelength", () => {
    expect(halfWavelengthMm(2450)).toBeCloseTo(wavelengthMm(2450) / 2, 10);
  });

  it("guards non-positive frequencies and never returns -0", () => {
    expect(() => wavelengthMm(0)).toThrowError(RfError);
    expect(() => halfWavelengthMm(-1)).toThrowError(RfError);
    expect(Object.is(wavelengthMm(1e12), -0)).toBe(false);
  });
});

describe("bandSpan / bandRepresentativeFrequencyMHz", () => {
  it("spans UL start to DL end for the FDD band B28", () => {
    const b28 = CELLULAR_BANDS.find((b) => b.key === "B28")!;
    expect(bandSpan(b28)).toEqual({ minMHz: 703, maxMHz: 803 });
  });

  it("spans the single TDD range for n78", () => {
    const n78 = CELLULAR_BANDS.find((b) => b.key === "n78")!;
    expect(bandSpan(n78)).toEqual({ minMHz: 3300, maxMHz: 3800 });
  });

  it("uses the DL center as the representative frequency of an FDD band", () => {
    const b1 = CELLULAR_BANDS.find((b) => b.key === "B1")!;
    // DL 2110-2170 の中心 = 2140
    expect(bandRepresentativeFrequencyMHz(b1)).toBe(2140);
  });

  it("uses the range center as the representative frequency of a TDD band", () => {
    const n79 = CELLULAR_BANDS.find((b) => b.key === "n79")!;
    // 4400-5000 の中心 = 4700
    expect(bandRepresentativeFrequencyMHz(n79)).toBe(4700);
  });
});
