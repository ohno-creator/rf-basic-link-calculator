/**
 * 自由空間に置いた2アンテナ間の結合量目安（Track G11）。
 *
 *   S21[dB] ≈ 20log10(λ/(4πd)) + G1[dBi] + G2[dBi]
 *   d_target = λ / (4π·10^((S21_target-G1-G2)/20))
 *
 * 単位: 周波数[MHz]、間隔・波長[mm]、利得と結合量[dB/dBi]。
 * 適用条件: 自由空間・偏波平行・整合済みアンテナの遠方界近似（目安 d≥λ/2）。
 * 共有GND、筐体、近傍界、偏波ずれ、ケーブル結合を含まないため、実装時は実測が必要。
 */

import { assertFinite, assertPositiveFinite } from "./errors";
import { calculateWavelengthFromMHz } from "./frequency";

export type AntennaIsolationInput = {
  frequencyMHz: number;
  spacingMm: number;
  antenna1GainDbi: number;
  antenna2GainDbi: number;
  targetCouplingDb?: number;
};

export type AntennaIsolationQuality = "good" | "caution" | "insufficient";

export type AntennaIsolationResult = {
  couplingDb: number;
  quality: AntennaIsolationQuality;
  wavelengthMm: number;
  spacingWavelengths: number;
  recommendedSpacingMm: number;
  isNearFieldEstimate: boolean;
};

/** 閾値上の再計算で判定が反転しないための浮動小数点許容値[dB]。 */
const CLASSIFICATION_EPSILON_DB = 1e-9;

function classifyIsolation(couplingDb: number): AntennaIsolationQuality {
  if (couplingDb <= -15 + CLASSIFICATION_EPSILON_DB) return "good";
  if (couplingDb <= -10 + CLASSIFICATION_EPSILON_DB) return "caution";
  return "insufficient";
}

/** 2アンテナ間のS21と目標結合量を満たす自由空間距離を返す。 */
export function calculateAntennaIsolation(
  input: AntennaIsolationInput
): AntennaIsolationResult {
  assertPositiveFinite(input.frequencyMHz, "frequency");
  assertPositiveFinite(input.spacingMm, "spacing");
  assertFinite(input.antenna1GainDbi, "antenna_1_gain");
  assertFinite(input.antenna2GainDbi, "antenna_2_gain");
  const targetCouplingDb = input.targetCouplingDb ?? -15;
  assertFinite(targetCouplingDb, "target_coupling");

  const wavelengthMm = calculateWavelengthFromMHz(input.frequencyMHz) * 1000;
  const gainSumDb = input.antenna1GainDbi + input.antenna2GainDbi;
  assertPositiveFinite(wavelengthMm, "wavelength");
  assertFinite(gainSumDb, "gain_sum");
  const couplingDb =
    20 *
      (Math.log10(wavelengthMm) - Math.log10(4 * Math.PI) - Math.log10(input.spacingMm)) +
    gainSumDb;
  assertFinite(couplingDb, "coupling");
  const targetOffsetDb = targetCouplingDb - gainSumDb;
  assertFinite(targetOffsetDb, "target_coupling_offset");
  const recommendedSpacingLog10 =
    Math.log10(wavelengthMm) - Math.log10(4 * Math.PI) - targetOffsetDb / 20;
  assertFinite(recommendedSpacingLog10, "recommended_spacing_log10");
  const recommendedSpacingMm = 10 ** recommendedSpacingLog10;
  const spacingWavelengths = input.spacingMm / wavelengthMm;
  assertPositiveFinite(recommendedSpacingMm, "recommended_spacing");
  assertPositiveFinite(spacingWavelengths, "spacing_wavelengths");

  return {
    couplingDb,
    quality: classifyIsolation(couplingDb),
    wavelengthMm,
    spacingWavelengths,
    recommendedSpacingMm,
    isNearFieldEstimate: spacingWavelengths < 0.5
  };
}
