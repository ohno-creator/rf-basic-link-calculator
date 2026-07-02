import { describe, expect, it } from "vitest";
import { formatDb, formatDbm, formatMeters, formatNumber, formatSigned } from "@/lib/rf/format";

describe("format helpers", () => {
  it("formatNumber uses fixed digits and guards non-finite", () => {
    expect(formatNumber(12.345)).toBe("12.3");
    expect(formatNumber(12.345, 2)).toBe("12.35");
    expect(formatNumber(Number.NaN)).toBe("-");
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe("-");
  });

  it("formatSigned prefixes + for positive and keeps sign for negative/zero", () => {
    expect(formatSigned(3.2, "dB")).toBe("+3.2 dB");
    expect(formatSigned(-3.2, "dB")).toBe("-3.2 dB");
    expect(formatSigned(0, "dB")).toBe("0.0 dB");
    expect(formatSigned(Number.NaN, "dB")).toBe("- dB");
  });

  it("formatDb and formatDbm append units", () => {
    expect(formatDb(5)).toBe("5.0 dB");
    expect(formatDbm(-97)).toBe("-97.0 dBm");
    expect(formatDb(Number.NaN)).toBe("- dB");
  });

  it("formatMeters switches to cm below 1m and guards non-finite", () => {
    expect(formatMeters(2.5)).toBe("2.50m");
    expect(formatMeters(1)).toBe("1.00m");
    expect(formatMeters(0.326)).toBe("32.6cm");
    expect(formatMeters(Number.NaN)).toBe("-");
  });
});
