/**
 * 金属板（無限導体面）近接によるアンテナ利得変化（Track G6）。
 *
 * イメージ理論: 完全導体板の手前 d に置いたアンテナは、板の奥 d に逆位相の鏡像を持つ。
 * 直接波と反射波（鏡像波）の干渉で、正面方向の電界は自由空間比で
 *   F(x) = 2·|sin(2π·x)|          （x = d/λ、電界係数・無次元 0..2）
 *   ΔG   = 20·log10(F)  [dB]      （電界比なので 20log10。電力比なら 10log10）
 * となる。d = λ/4 でピーク F=2（ΔG = +20·log10(2) ≈ +6.02dB）、
 * d = n·λ/2（n=0,1,2,…）でヌル F=0（ΔG = −∞。板に密着 d=0 もヌル）。
 *
 * dB/線形: F は線形（電界比・無次元）、ΔG は dB。距離入力は mm、波長・距離出力は m。
 * 適用条件:
 *   - 板はアンテナから見て波長オーダー以上（λ級）に大きい平板で、アンテナと平行。
 *   - 理想反射（完全導体・反射係数 −1）を仮定。実材料・有限板では深いヌルは埋まる。
 *   - 板の正面方向（board-side broadside）のみの利得変化。他方向のパターン変形は扱わない。
 * 用途: 金属筐体・金属壁近傍にアンテナを実装する際の離隔距離の当たり付け。
 */

import { assertNonNegative, assertPositiveFinite } from "./errors";
import { calculateWavelengthFromMHz } from "./frequency";

/** 最適離隔 d=λ/4 でのピーク利得変化[dB] = 20·log10(2) ≈ +6.0206。 */
export const METAL_PLANE_OPTIMAL_GAIN_DB = 20 * Math.log10(2);

/** 表示用フロアの提案値[dB]。純関数は理論どおり −∞ を返し、UI側で「≤−40dB」等に丸める。 */
export const METAL_PLANE_GAIN_DISPLAY_FLOOR_DB = -40;

/** ヌル判定: 2x が整数（d = n·λ/2）かどうか。 */
function isNullSpacing(distanceLambda: number): boolean {
  return Number.isInteger(2 * distanceLambda);
}

/** 電界係数 F(x) = 2·|sin(2π·x)|（線形・無次元 0..2）。x = d/λ。 */
export function metalPlaneFieldFactor(distanceLambda: number): number {
  assertNonNegative(distanceLambda, "distance_lambda");
  return 2 * Math.abs(Math.sin(2 * Math.PI * distanceLambda));
}

/** 利得変化 ΔG[dB] = 20·log10(F)。ヌル（2x が整数）は明示的に −∞ を返す。 */
export function metalPlaneGainChangeDb(distanceLambda: number): number {
  assertNonNegative(distanceLambda, "distance_lambda");
  // sin(n·π) は丸め残差（~1e-16）で0にならず巨大な負dBになるため、ヌルは明示的に −∞。
  if (isNullSpacing(distanceLambda)) {
    return Number.NEGATIVE_INFINITY;
  }
  return 20 * Math.log10(metalPlaneFieldFactor(distanceLambda));
}

export type MetalPlaneEffectResult = {
  /** 波長 λ [m]。 */
  wavelengthM: number;
  /** 板からの距離の波長比 x = d/λ（無次元）。 */
  distanceLambda: number;
  /** 電界係数 F（線形・無次元 0..2）。 */
  fieldFactor: number;
  /** 利得変化 ΔG [dB]。ヌルは −∞。 */
  gainChangeDb: number;
  /** ヌル（d = n·λ/2）かどうか。 */
  isNull: boolean;
  /** 最適離隔 λ/4 [m]（ピーク +6.02dB）。 */
  optimalDistanceM: number;
  /** ヌル間隔 λ/2 [m]。 */
  nullSpacingM: number;
};

/** 周波数[MHz]と板からの距離[mm]から、金属板による利得変化一式を求める。 */
export function calculateMetalPlaneEffect(
  frequencyMHz: number,
  distanceMm: number
): MetalPlaneEffectResult {
  assertPositiveFinite(frequencyMHz, "frequency");
  assertNonNegative(distanceMm, "distance");
  const wavelengthM = calculateWavelengthFromMHz(frequencyMHz);
  const distanceLambda = distanceMm / 1000 / wavelengthM;
  return {
    wavelengthM,
    distanceLambda,
    fieldFactor: metalPlaneFieldFactor(distanceLambda),
    gainChangeDb: metalPlaneGainChangeDb(distanceLambda),
    isNull: isNullSpacing(distanceLambda),
    optimalDistanceM: wavelengthM / 4,
    nullSpacingM: wavelengthM / 2
  };
}
