import { describe, expect, it } from "vitest";
import { combinePowersDbm, dbdToDbi, dbiToDbd, DIPOLE_GAIN_DBI } from "@/lib/rf/dbFamily";

describe("dB family conversions", () => {
  it("converts dBi to dBd and round-trips back", () => {
    // dBd = dBi − 2.15（IEEE Std 145 / 半波長ダイポールの指向性1.64=2.15dB）
    expect(dbiToDbd(6)).toBeCloseTo(3.85, 6);
    expect(dbiToDbd(0)).toBeCloseTo(-DIPOLE_GAIN_DBI, 6);
    expect(dbdToDbi(dbiToDbd(6))).toBeCloseTo(6, 10);
    expect(dbiToDbd(dbdToDbi(-1.2))).toBeCloseTo(-1.2, 10);
  });

  it("maps 0dBd to 2.15dBi (half-wave dipole reference)", () => {
    expect(dbdToDbi(0)).toBeCloseTo(DIPOLE_GAIN_DBI, 6);
    expect(dbiToDbd(DIPOLE_GAIN_DBI)).toBeCloseTo(0, 6);
  });

  it("combines equal powers into +3.01dB (power sum, not 10+10=20)", () => {
    // 10dBm(10mW) + 10dBm(10mW) = 20mW = 13.0103dBm
    expect(combinePowersDbm(10, 10)).toBeCloseTo(13.0103, 3);
  });

  it("keeps the total unchanged when adding a vanishingly small power", () => {
    // -1000dBm は 10^-100 mW（実質ゼロ・-∞相当の極小）。合成しても 0dBm のまま。
    expect(combinePowersDbm(0, -1000)).toBeCloseTo(0, 6);
  });

  it("never returns -0", () => {
    expect(Object.is(dbiToDbd(DIPOLE_GAIN_DBI), -0)).toBe(false);
    expect(Object.is(dbdToDbi(-DIPOLE_GAIN_DBI), -0)).toBe(false);
    // 0.5mW + 0.5mW = 1mW → ちょうど 0dBm（-0 ではなく +0 を返す）
    const halfMwDbm = 10 * Math.log10(0.5);
    expect(Object.is(combinePowersDbm(halfMwDbm, halfMwDbm), -0)).toBe(false);
    expect(combinePowersDbm(halfMwDbm, halfMwDbm)).toBeCloseTo(0, 10);
  });
});
