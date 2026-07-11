/**
 * λ/4系アンテナのGND最長辺と効率変化の出典付きテーブル補間（Track G2）。
 *
 * ratio = Lg / λ0、λ0[m] = c / f。
 * テーブル点間は区分線形補間し、範囲外は端点へクランプする。
 * efficiencyChangeDb はdB領域の変化量で、0dB以下（負値ほど悪化）。
 * 実装・筐体・整合の影響を分離できない経験値なので、絶対効率への変換は行わない。
 */

import { assertFinite, assertNonNegative, RfError, RfErrorCode } from "./errors";
import { calculateWavelengthFromMHz } from "./frequency";

export type GroundPlaneEfficiencyPoint = {
  /** GND最長辺/自由空間波長（無次元）。 */
  ratio: number;
  /** 基準状態からの効率変化[dB]。0以下。 */
  efficiencyChangeDb: number;
};

function validateTable(table: readonly GroundPlaneEfficiencyPoint[]): void {
  if (table.length < 2) {
    throw new RfError(RfErrorCode.Empty, { field: "efficiency_table" });
  }
  for (let index = 0; index < table.length; index += 1) {
    const point = table[index];
    assertNonNegative(point.ratio, "ground_to_wavelength_ratio");
    assertFinite(point.efficiencyChangeDb, "efficiency_change");
    if (point.efficiencyChangeDb > 0) {
      throw new RfError(RfErrorCode.OutOfDomain, { field: "efficiency_change", max: 0 });
    }
    if (index > 0 && point.ratio <= table[index - 1].ratio) {
      throw new RfError(RfErrorCode.InvalidInput, { field: "efficiency_table" });
    }
    if (index > 0 && point.efficiencyChangeDb < table[index - 1].efficiencyChangeDb) {
      throw new RfError(RfErrorCode.InvalidInput, { field: "efficiency_table" });
    }
  }
}

/** ratioに対する効率変化[dB]を区分線形補間する。 */
export function interpolateGroundPlaneEfficiencyChange(
  ratio: number,
  table: readonly GroundPlaneEfficiencyPoint[]
): number {
  assertNonNegative(ratio, "ground_to_wavelength_ratio");
  validateTable(table);
  if (ratio <= table[0].ratio) return table[0].efficiencyChangeDb;
  const last = table[table.length - 1];
  if (ratio >= last.ratio) return last.efficiencyChangeDb;

  for (let index = 1; index < table.length; index += 1) {
    const upper = table[index];
    if (ratio <= upper.ratio) {
      const lower = table[index - 1];
      const fraction = (ratio - lower.ratio) / (upper.ratio - lower.ratio);
      const value = lower.efficiencyChangeDb +
        fraction * (upper.efficiencyChangeDb - lower.efficiencyChangeDb);
      return value === 0 ? 0 : value;
    }
  }
  return last.efficiencyChangeDb;
}

export type GroundPlaneSizeResult = {
  wavelengthMm: number;
  groundToWavelengthRatio: number;
  recommendedGroundLengthMm: number;
  efficiencyChangeDb: number;
};

/** 周波数[MHz]・GND最長辺[mm]からλ比と効率変化目安を返す。 */
export function analyzeGroundPlaneSize(input: {
  frequencyMHz: number;
  groundLengthMm: number;
  table: readonly GroundPlaneEfficiencyPoint[];
}): GroundPlaneSizeResult {
  assertNonNegative(input.groundLengthMm, "ground_length");
  const wavelengthMm = calculateWavelengthFromMHz(input.frequencyMHz) * 1000;
  const groundToWavelengthRatio = input.groundLengthMm / wavelengthMm;
  return {
    wavelengthMm,
    groundToWavelengthRatio,
    recommendedGroundLengthMm: wavelengthMm / 4,
    efficiencyChangeDb: interpolateGroundPlaneEfficiencyChange(
      groundToWavelengthRatio,
      input.table
    )
  };
}
