/**
 * 電測（受信レベル測定）の必要サンプル数と Lee 基準のサンプリング設計。
 *
 *   両側z値:      z = Φ⁻¹((1+c)/2)                     （c は信頼水準 fraction、Φ⁻¹ は標準正規の逆累積）
 *   必要点数:     n_exact = (z·σ/E)² 、 n = max(1, ceil(n_exact))
 *   Lee窓長:      L = 40λ = 40·(c0/f) [m]               （c0 は光速、f は周波数）
 *   窓内間隔:     Δ = 40λ/50 = 0.8λ [m]
 *
 * 平均受信レベルを許容誤差 ±E[dB]・信頼水準 c で推定するのに必要な独立サンプル数を求め、
 * あわせて Lee の局所平均基準（窓長40λ・窓内50点）による測定窓長とサンプル間隔を返す。
 *
 * 適用条件: n の式は各サンプルが独立（相関距離以上の間隔で取得）で、シャドウイングが
 * 対数正規（dB値が正規分布、標準偏差 σ[dB]）に従うことを前提とする。相関のあるサンプル
 * では実効サンプル数が減るため n は過小評価になる。
 * dB/線形の別: σ・E は dB、z・n は無次元、L・Δ は m（線形長）。
 *
 * 出典: Φ⁻¹ は shadowingMargin.ts の Acklam 有理近似を再利用。窓長40λ・50点は
 *       W.C.Y. Lee の局所平均推定基準（Lee criterion）の慣用値。
 */

import { assertNonNegative, assertPositiveFinite, RfError, RfErrorCode } from "./errors";
import { inverseStandardNormalCdf } from "./shadowingMargin";
import { calculateWavelengthFromMHz } from "./frequency";

/** Lee 基準の測定窓長（波長数）。窓長 L = 40λ。 */
export const LEE_WINDOW_WAVELENGTHS = 40;

/** Lee 基準の窓内サンプル数。間隔 Δ = 40λ/50 = 0.8λ。 */
export const LEE_SAMPLES_PER_WINDOW = 50;

/** 信頼水準 c ∈ (0,1) のガード（両端は定義域エラー）。 */
function assertConfidence(confidence: number): void {
  if (!Number.isFinite(confidence) || confidence <= 0 || confidence >= 1) {
    throw new RfError(RfErrorCode.OutOfDomain, { field: "confidence", min: 0, max: 1 });
  }
}

/** 両側信頼水準 c に対する z 値 = Φ⁻¹((1+c)/2)。c は fraction (0<c<1)。 */
export function zForTwoSidedConfidence(confidence: number): number {
  assertConfidence(confidence);
  return inverseStandardNormalCdf((1 + confidence) / 2);
}

/**
 * 必要サンプル数の連続値 n_exact = (z·σ/E)²。
 * σ[dB]: シャドウイング標準偏差、E[dB]: 平均推定の許容誤差（±E）、c: 信頼水準 fraction。
 * 独立サンプル前提。
 */
export function requiredSampleCountExact(
  sigmaDb: number,
  toleranceDb: number,
  confidence: number
): number {
  assertNonNegative(sigmaDb, "shadow_fading_std");
  assertPositiveFinite(toleranceDb, "tolerance");
  const z = zForTwoSidedConfidence(confidence);
  const ratio = (z * sigmaDb) / toleranceDb;
  return ratio * ratio;
}

/** 必要サンプル数（整数）: n = max(1, ceil(n_exact))。独立サンプル前提。 */
export function requiredSampleCount(
  sigmaDb: number,
  toleranceDb: number,
  confidence: number
): number {
  return Math.max(1, Math.ceil(requiredSampleCountExact(sigmaDb, toleranceDb, confidence)));
}

/** Lee 窓長 L = 40λ [m]。frequencyMHz は MHz。 */
export function leeWindowLengthM(frequencyMHz: number): number {
  return LEE_WINDOW_WAVELENGTHS * calculateWavelengthFromMHz(frequencyMHz);
}

/** Lee 窓内サンプル間隔 Δ = 40λ/50 = 0.8λ [m]。frequencyMHz は MHz。 */
export function leeSampleSpacingM(frequencyMHz: number): number {
  return leeWindowLengthM(frequencyMHz) / LEE_SAMPLES_PER_WINDOW;
}
