import { describe, expect, it } from "vitest";
import { findHarmonicHits } from "@/lib/rf/harmonicHunter";

describe("findHarmonicHits", () => {
  const bands = [{ band: "B8", rxLowMHz: 925, rxHighMHz: 960 }, { band: "B1", rxLowMHz: 2110, rxHighMHz: 2170 }];

  it("uses the terminal RX band and finds the fixed harmonic examples", () => {
    const hits = findHarmonicHits({ clocks: [{ name: "TCXO", freqMHz: 26 }, { name: "USB", freqMHz: 48 }], bands });
    expect(hits).toContainEqual({ clockName: "TCXO", order: 36, harmonicMHz: 936, band: "B8", offsetFromEdgeMHz: 11 });
    expect(hits).not.toEqual(expect.arrayContaining([expect.objectContaining({ clockName: "TCXO", order: 35, band: "B8" })]));
    expect(hits).toContainEqual({ clockName: "USB", order: 45, harmonicMHz: 2160, band: "B1", offsetFromEdgeMHz: 10 });
    expect(hits).not.toEqual(expect.arrayContaining([expect.objectContaining({ clockName: "USB", order: 41, band: "B1" })]));
  });

  it("returns no low-clock hit within maxHarmonic and never returns -0", () => {
    const hits = findHarmonicHits({ clocks: [{ name: "RTC", freqMHz: 0.032768 }], bands, maxHarmonic: 200 });
    expect(hits).toEqual([]);
    const edge = findHarmonicHits({ clocks: [{ name: "edge", freqMHz: 185 }], bands: [bands[0]], maxHarmonic: 5 });
    expect(edge[0].offsetFromEdgeMHz).toBe(0);
    expect(Object.is(edge[0].offsetFromEdgeMHz, -0)).toBe(false);
  });
});
