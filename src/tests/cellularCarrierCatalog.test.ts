import { describe, expect, it } from "vitest";
import {
  carriersForCountry,
  carriersForRegion,
  continuousBandwidthMHz,
  fractionalBandwidthPercent,
  searchCarrierProfiles,
  standardBandRange
} from "@/lib/rf/cellularCarrierCatalog";
import { CARRIER_PROFILES } from "@/data/cellularCarrierBands";

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

  it("keeps revoked Korean 28GHz as history, not a current band", () => {
    for (const profile of carriersForCountry("韓国")) {
      expect(profile.bands.find((band) => band.band === "n257")?.status).toBe("revoked");
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
