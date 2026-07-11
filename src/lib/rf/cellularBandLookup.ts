/**
 * 4G/5G バンドの周波数照合と波長の補助計算。
 *
 *   波長 λ[m] = c / f　（c = 299,792,458 m/s・自由空間）
 *   λ/2 アンテナ長の目安 [mm] = λ[mm] / 2
 *
 * 周波数照合はバンド定義レンジ（src/data/cellularBands.ts・3GPP TS 36.101 / TS 38.101-1 /
 * TS 38.101-2 由来）に対する包含判定（境界を含む）で、FDD では UL/DL のどちら側に
 * 入ったかも返す。適用条件: レンジはバンドの定義幅であり、国内で実際に割り当てられている
 * 幅はその一部（総務省 周波数割当計画による）。
 */

import {
  CELLULAR_BANDS,
  type CellularBand,
  type CellularBandRange
} from "@/data/cellularBands";
import { assertPositiveFinite } from "./errors";

/** 光速 [m/s]。 */
const SPEED_OF_LIGHT_M_PER_S = 299_792_458;

/** 周波数がバンドのどの区分に入ったか（FDD: UL/DL・TDD: 共用レンジ）。 */
export type BandSegment = "UL" | "DL" | "TDD";

export type BandMatch = {
  band: CellularBand;
  segment: BandSegment;
};

function contains(range: CellularBandRange | undefined, freqMHz: number): boolean {
  return range !== undefined && freqMHz >= range.minMHz && freqMHz <= range.maxMHz;
}

/**
 * 周波数[MHz]を含むバンドを定義順（4G→5G）で返す。該当なしは空配列。
 * FDD では UL 帯・DL 帯それぞれを判定し、入った側を segment として返す
 * （両帯は重ならないため、1バンドにつき高々1件）。
 */
export function findBandsByFrequency(freqMHz: number): BandMatch[] {
  assertPositiveFinite(freqMHz, "frequency");
  const matches: BandMatch[] = [];
  for (const band of CELLULAR_BANDS) {
    if (contains(band.tdd, freqMHz)) {
      matches.push({ band, segment: "TDD" });
    } else if (contains(band.uplink, freqMHz)) {
      matches.push({ band, segment: "UL" });
    } else if (contains(band.downlink, freqMHz)) {
      matches.push({ band, segment: "DL" });
    }
  }
  return matches;
}

/** 自由空間波長 [mm]。freqMHz > 0 が必要。 */
export function wavelengthMm(freqMHz: number): number {
  assertPositiveFinite(freqMHz, "frequency");
  // (m/s) / (MHz→Hz) = m、×1000 で mm。正の入力に対して常に正（-0は生じない）。
  return (SPEED_OF_LIGHT_M_PER_S / (freqMHz * 1e6)) * 1000;
}

/** λ/2 アンテナ長の目安 [mm]（半波長ダイポール等の当たり付け用）。 */
export function halfWavelengthMm(freqMHz: number): number {
  return wavelengthMm(freqMHz) / 2;
}

/** バンド全体の占有スパン [MHz]（FDD: UL下限〜DL上限・TDD: 定義レンジ）。 */
export function bandSpan(band: CellularBand): CellularBandRange {
  if (band.tdd) {
    return { minMHz: band.tdd.minMHz, maxMHz: band.tdd.maxMHz };
  }
  // FDD は uplink/downlink を必ず持つ（データ層の不変条件）。
  const minMHz = Math.min(band.uplink!.minMHz, band.downlink!.minMHz);
  const maxMHz = Math.max(band.uplink!.maxMHz, band.downlink!.maxMHz);
  return { minMHz, maxMHz };
}

/**
 * 波長・λ/2 表示に使う代表周波数 [MHz]。
 * FDD は端末が受ける DL 帯の中心、TDD は定義レンジの中心。
 */
export function bandRepresentativeFrequencyMHz(band: CellularBand): number {
  const range = band.tdd ?? band.downlink!;
  return (range.minMHz + range.maxMHz) / 2;
}
