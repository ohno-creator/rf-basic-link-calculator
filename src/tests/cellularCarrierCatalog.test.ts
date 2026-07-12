import { describe, expect, it } from "vitest";
import {
  carriersForCountry,
  carriersForRegion,
  continuousBandwidthMHz,
  fractionalBandwidthPercent,
  searchCarrierProfiles,
  standardBandRange
} from "@/lib/rf/cellularCarrierCatalog";
import { CARRIER_BAND_DETAILS, CARRIER_PROFILES } from "@/data/cellularCarrierBands";

describe("cellular carrier catalog", () => {
  it("drills down from region to country and carrier", () => {
    expect(carriersForRegion("japan")).toHaveLength(4);
    expect(carriersForCountry("韓国").map((profile) => profile.carrier)).toEqual(["SK Telecom", "KT", "LG U+"]);
    expect(carriersForCountry("日本").find((profile) => profile.id === "jp-rakuten")?.bands.map((band) => band.band)).toEqual([
      "B3", "B28", "n77", "n257"
    ]);
  });

  it("searches across band, carrier and IoT text", () => {
    expect(searchCarrierProfiles("楽天").map((profile) => profile.id)).toEqual(["jp-rakuten"]);
    expect(searchCarrierProfiles("NB-IoT").length).toBeGreaterThan(5);
    expect(searchCarrierProfiles("B14").map((profile) => profile.id)).toContain("us-att");
  });

  it("has a standard 3GPP range for every deployed band", () => {
    for (const profile of CARRIER_PROFILES) {
      for (const deployment of profile.bands) {
        expect(standardBandRange(deployment.band), `${profile.id}:${deployment.band}`).toBeDefined();
      }
    }
  });

  it("has carrier-specific allocation and role text for every deployed band", () => {
    for (const profile of CARRIER_PROFILES) {
      for (const deployment of profile.bands) {
        const detail = CARRIER_BAND_DETAILS[profile.id]?.bands[deployment.band];
        expect(detail, `${profile.id}:${deployment.band}`).toBeDefined();
        expect(detail!.allocation.length).toBeGreaterThan(8);
        expect(detail!.role.length, `${profile.id}:${deployment.band}`).toBeGreaterThan(15);
      }
    }
  });

  it("does not substitute the standard Band range when the operator endpoints vary or are unpublished", () => {
    expect(CARRIER_BAND_DETAILS["us-att"].bands.B2.allocation).toContain("市場");
    expect(CARRIER_BAND_DETAILS["cn-mobile"].bands.B8.allocation).toContain("端点");
    expect(CARRIER_BAND_DETAILS["in-jio"].bands.B3.allocation).toContain("LSA");
    expect(CARRIER_BAND_DETAILS["kr-skt"].bands.n78.allocation).toBe("TDD 3600–3700 MHz");
  });

  it("keeps revoked Korean bands as history, not a current band", () => {
    for (const profile of carriersForCountry("韓国")) {
      expect(profile.bands.find((band) => band.band === "n257")?.status).toBe("revoked");
    }
    const kt = carriersForCountry("韓国").find((p) => p.id === "kr-kt")!;
    expect(kt.bands.find((b) => b.band === "B26")?.status).toBe("revoked");
    const lgu = carriersForCountry("韓国").find((p) => p.id === "kr-lgu")!;
    expect(lgu.bands.find((b) => b.band === "B3")?.status).toBe("revoked");
  });

  it("has confirmed status for active Korean LTE/5G bands", () => {
    const skt = carriersForCountry("韓国").find((p) => p.id === "kr-skt")!;
    for (const band of ["B5", "B3", "B1", "B7"]) {
      expect(skt.bands.find((b) => b.band === band)?.status).toBe("confirmed-current");
    }
    const kt = carriersForCountry("韓国").find((p) => p.id === "kr-kt")!;
    for (const band of ["B8", "B3", "B1"]) {
      expect(kt.bands.find((b) => b.band === band)?.status).toBe("confirmed-current");
    }
    const lgu = carriersForCountry("韓国").find((p) => p.id === "kr-lgu")!;
    for (const band of ["B5", "B1", "B7"]) {
      expect(lgu.bands.find((b) => b.band === band)?.status).toBe("confirmed-current");
    }
  });

  it("marks India's allocation as region-dependent", () => {
    expect(carriersForCountry("インド").every((profile) => profile.allocationNote?.includes("LSA"))).toBe(true);
  });

  it("computes continuous and fractional bandwidth without counting an FDD duplex gap", () => {
    const b28 = standardBandRange("B28")!;
    expect(continuousBandwidthMHz(b28)).toBe(45);
    expect(fractionalBandwidthPercent(b28)).toBeCloseTo((45 / 780.5) * 100, 8);
    expect(continuousBandwidthMHz(standardBandRange("n78")!)).toBe(500);
  });
});
