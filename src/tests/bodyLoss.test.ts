import { describe, expect, it } from "vitest";
import { lookupBodyLoss } from "@/lib/rf/bodyLoss";
import { RfError } from "@/lib/rf/errors";
import { BODY_LOSS_BANDS, BODY_LOSS_SCENARIOS, BODY_LOSS_SOURCES } from "@/data/bodyLoss";

describe("lookupBodyLoss", () => {
  it("returns the handheld 920MHz literature values (typ 3.0 / worst 6.0 dB)", () => {
    const result = lookupBodyLoss({ band: "920", scenario: "handheld" });
    expect(result).not.toBeNull();
    expect(result!.typicalDb).toBeCloseTo(3.0, 10);
    expect(result!.worstDb).toBeCloseTo(6.0, 10);
  });

  it("returns the body-shadowing 2.4GHz values (typ 18 / worst 30 dB)", () => {
    const result = lookupBodyLoss({ band: "2400", scenario: "bodyShadow" });
    expect(result).not.toBeNull();
    expect(result!.typicalDb).toBeCloseTo(18.0, 10);
    expect(result!.worstDb).toBeCloseTo(30.0, 10);
  });

  it("returns null for the GNSS L1 x head-proximity combination (文献データなし)", () => {
    expect(lookupBodyLoss({ band: "1575", scenario: "head" })).toBeNull();
  });

  it("keeps typ <= worst for every band x scenario combination", () => {
    for (const scenario of BODY_LOSS_SCENARIOS) {
      for (const band of BODY_LOSS_BANDS) {
        const result = lookupBodyLoss({ band: band.id, scenario: scenario.id });
        if (result === null) {
          continue;
        }
        expect(result.typicalDb).toBeGreaterThan(0);
        expect(result.typicalDb).toBeLessThanOrEqual(result.worstDb);
        // -0 を返さない（正の実数のみ）
        expect(Object.is(result.typicalDb, -0)).toBe(false);
        expect(Object.is(result.worstDb, -0)).toBe(false);
      }
    }
  });

  it("covers all 5 scenarios x 4 bands with exactly one missing cell", () => {
    let missing = 0;
    for (const scenario of BODY_LOSS_SCENARIOS) {
      for (const band of BODY_LOSS_BANDS) {
        if (lookupBodyLoss({ band: band.id, scenario: scenario.id }) === null) {
          missing += 1;
        }
      }
    }
    expect(BODY_LOSS_SCENARIOS.length).toBe(5);
    expect(BODY_LOSS_BANDS.length).toBe(4);
    expect(missing).toBe(1);
  });

  it("guards unknown band / scenario keys at runtime", () => {
    expect(() =>
      lookupBodyLoss({ band: "5800" as never, scenario: "handheld" })
    ).toThrowError(RfError);
    expect(() =>
      lookupBodyLoss({ band: "920", scenario: "pocket" as never })
    ).toThrowError(RfError);
  });

  it("has traceable sources on the data layer", () => {
    expect(BODY_LOSS_SOURCES.length).toBeGreaterThanOrEqual(3);
    for (const source of BODY_LOSS_SOURCES) {
      expect(source.label.length).toBeGreaterThan(0);
      expect(source.href.startsWith("https://")).toBe(true);
    }
  });
});
