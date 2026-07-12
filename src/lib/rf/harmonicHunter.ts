import { assertFinite, assertPositiveFinite, RfError, RfErrorCode } from "./errors";

export type HarmonicClock = { name: string; freqMHz: number };
/** UI側との後方互換名。 */
export type ClockInput = HarmonicClock;
export type HarmonicRxBand = { band: string; rxLowMHz: number; rxHighMHz: number };
export type HarmonicHit = {
  clockName: string;
  order: number;
  harmonicMHz: number;
  band: string;
  offsetFromEdgeMHz: number;
};

export function findHarmonicHits({
  clocks,
  bands,
  maxHarmonic = 200,
  marginMHz = 0
}: {
  clocks: readonly HarmonicClock[];
  bands: readonly HarmonicRxBand[];
  maxHarmonic?: number;
  marginMHz?: number;
}): HarmonicHit[] {
  if (!Number.isInteger(maxHarmonic) || maxHarmonic < 1) {
    throw new RfError(RfErrorCode.TooSmall, { field: "max_harmonic", min: 1 });
  }
  assertFinite(marginMHz, "margin");
  if (marginMHz < 0) throw new RfError(RfErrorCode.TooSmall, { field: "margin", min: 0 });

  const hits: HarmonicHit[] = [];
  for (const clock of clocks) {
    assertPositiveFinite(clock.freqMHz, "clock_frequency");
    for (const band of bands) {
      assertPositiveFinite(band.rxLowMHz, "rx_low");
      assertPositiveFinite(band.rxHighMHz, "rx_high");
      if (band.rxHighMHz < band.rxLowMHz) {
        throw new RfError(RfErrorCode.InvalidRange, { field: "rx_band" });
      }
      for (let order = 1; order <= maxHarmonic; order += 1) {
        const harmonicMHz = clock.freqMHz * order;
        if (harmonicMHz < band.rxLowMHz - marginMHz || harmonicMHz > band.rxHighMHz + marginMHz) continue;
        // 帯域内は近い端からの距離を正、margin内の帯域外は負で返す。
        const offsetFromEdgeMHz = harmonicMHz < band.rxLowMHz
          ? harmonicMHz - band.rxLowMHz
          : harmonicMHz > band.rxHighMHz
            ? band.rxHighMHz - harmonicMHz
            : Math.min(harmonicMHz - band.rxLowMHz, band.rxHighMHz - harmonicMHz);
        hits.push({
          clockName: clock.name,
          order,
          harmonicMHz: harmonicMHz === 0 ? 0 : harmonicMHz,
          band: band.band,
          offsetFromEdgeMHz: offsetFromEdgeMHz === 0 ? 0 : offsetFromEdgeMHz
        });
      }
    }
  }
  return hits.sort((a, b) =>
    a.band.localeCompare(b.band, undefined, { numeric: true }) || a.order - b.order || a.clockName.localeCompare(b.clockName)
  );
}
