/**
 * 逆F/IFAアンテナの初期寸法（Track G1）。
 *
 *   εeff = (εr + 1) / 2
 *   L[mm] ≈ λ0[mm] / (4√εeff)
 *   短絡点〜給電点間隔 ≈ L/12〜L/8
 *
 * 単位: 周波数[MHz]、基板厚・出力長[mm]、比誘電率と短縮率は無次元。
 * 適用条件: 基板上IFAの一次近似。線幅・GND・筐体・部品配置を含まないため、実測または
 * EM解析で±10〜20%程度の追い込みを行う前提の初期値としてのみ使用する。
 */

import { assertAtLeast, assertPositiveFinite } from "./errors";
import { calculateWavelengthFromMHz } from "./frequency";

export type IfaDimensionsInput = {
  frequencyMHz: number;
  relativePermittivity: number;
  substrateThicknessMm: number;
};

export type IfaDimensionsResult = {
  model: "simple-effective-permittivity";
  includesSubstrateThicknessCorrection: false;
  freeSpaceQuarterWavelengthMm: number;
  effectivePermittivity: number;
  shorteningRatio: number;
  initialLengthMm: number;
  feedSpacingMinMm: number;
  feedSpacingMaxMm: number;
};

/** IFA全長と短絡点〜給電点間隔の初期値を返す。 */
export function calculateIfaDimensions(input: IfaDimensionsInput): IfaDimensionsResult {
  assertPositiveFinite(input.frequencyMHz, "frequency");
  assertAtLeast(input.relativePermittivity, 1, "relative_permittivity");
  assertPositiveFinite(input.substrateThicknessMm, "substrate_thickness");

  const freeSpaceQuarterWavelengthMm =
    (calculateWavelengthFromMHz(input.frequencyMHz) * 1000) / 4;
  const effectivePermittivity = (input.relativePermittivity + 1) / 2;
  const shorteningRatio = 1 / Math.sqrt(effectivePermittivity);
  const initialLengthMm = freeSpaceQuarterWavelengthMm * shorteningRatio;
  assertPositiveFinite(freeSpaceQuarterWavelengthMm, "quarter_wavelength");
  assertPositiveFinite(effectivePermittivity, "effective_permittivity");
  assertPositiveFinite(shorteningRatio, "shortening_ratio");
  assertPositiveFinite(initialLengthMm, "initial_length");

  // 本簡易式では基板厚を補正項に使わない。入力検証し、後段UIで適用限界の説明に用いる。
  return {
    model: "simple-effective-permittivity",
    includesSubstrateThicknessCorrection: false,
    freeSpaceQuarterWavelengthMm,
    effectivePermittivity,
    shorteningRatio,
    initialLengthMm,
    feedSpacingMinMm: initialLengthMm / 12,
    feedSpacingMaxMm: initialLengthMm / 8
  };
}
