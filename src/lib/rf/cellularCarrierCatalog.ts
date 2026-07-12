import {
  CARRIER_PROFILES,
  CARRIER_BAND_DETAILS,
  STANDARD_BAND_RANGES,
  type CarrierProfile,
  type StandardBandRange,
  type WorldRegion
} from "@/data/cellularCarrierBands";

export type CarrierSearchSort = "country" | "carrier" | "band";

const normalized = (value: string) => value.trim().toLocaleLowerCase("ja-JP");

export function carriersForRegion(region: WorldRegion): CarrierProfile[] {
  return CARRIER_PROFILES.filter((profile) => profile.region === region);
}

export function countriesForRegion(region: WorldRegion): string[] {
  return [...new Set(carriersForRegion(region).map((profile) => profile.country))];
}

export function carriersForCountry(country: string): CarrierProfile[] {
  return CARRIER_PROFILES.filter((profile) => profile.country === country);
}

export function standardBandRange(key: string): StandardBandRange | undefined {
  return STANDARD_BAND_RANGES.find((band) => band.key.toLowerCase() === key.toLowerCase());
}

export function searchCarrierProfiles(query: string, sort: CarrierSearchSort = "country"): CarrierProfile[] {
  const needle = normalized(query);
  const matches = CARRIER_PROFILES.filter((profile) => {
    if (!needle) return true;
    const haystack = [
      profile.country,
      profile.carrier,
      profile.region,
      profile.iotSummary,
      profile.allocationNote ?? "",
      ...profile.bands.flatMap((deployment) => {
        const detail = CARRIER_BAND_DETAILS[profile.id]?.bands[deployment.band];
        return [deployment.band, detail?.allocation ?? "", detail?.role ?? deployment.positioning, ...(deployment.iot ?? [])];
      })
    ].join(" ").toLocaleLowerCase("ja-JP");
    return haystack.includes(needle);
  });

  return [...matches].sort((a, b) => {
    if (sort === "carrier") return a.carrier.localeCompare(b.carrier, "ja");
    if (sort === "band") return (a.bands[0]?.band ?? "").localeCompare(b.bands[0]?.band ?? "", "en", { numeric: true });
    return `${a.country}${a.carrier}`.localeCompare(`${b.country}${b.carrier}`, "ja");
  });
}

/** FDDは片方向の連続幅、TDDは共用レンジ幅を返す。FDDのduplex gapは帯域幅に含めない。 */
export function continuousBandwidthMHz(band: StandardBandRange): number {
  if (band.tddMHz) return band.tddMHz[1] - band.tddMHz[0];
  const downlink = band.downlinkMHz!;
  return downlink[1] - downlink[0];
}

export function representativeFrequencyMHz(band: StandardBandRange): number {
  const range = band.tddMHz ?? band.downlinkMHz!;
  return (range[0] + range[1]) / 2;
}

export function fractionalBandwidthPercent(band: StandardBandRange): number {
  return (continuousBandwidthMHz(band) / representativeFrequencyMHz(band)) * 100;
}
