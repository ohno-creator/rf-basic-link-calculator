/**
 * 対数正規シャドウイングに対するフェージング統計マージン（セルエッジ信頼率）。
 *
 *   必要マージン[dB] = σ[dB] · Φ⁻¹(信頼率)      （Φ⁻¹ は標準正規の逆累積分布）
 *
 * シャドウイング（遮蔽物による中央値まわりのばらつき）は対数正規分布に従い、その標準偏差 σ[dB]
 * に対し、目標信頼率を確保するために積むべきマージンが上式で決まる。信頼率50%で0dB、
 * 90%で約1.28σ、99%で約2.33σ。
 *
 * 適用条件: 第1段は「セルエッジ（1地点）信頼率」のみを対象とする。エリア全体の被覆率
 * （Jakes近似）は第2段として別途。dB/線形: σ と margin は dB、Φ⁻¹ の値 z は無次元。
 *
 * 出典: Φ⁻¹ は Peter J. Acklam の有理近似（公称相対誤差~1.15e-9、本libの信頼率域で絶対誤差<1e-8）。
 *       必要マージン=σ·Q⁻¹(1−p) は log-normal shadowing の標準定義（Rappaport 等）。
 *       σプリセット: 開放4/郊外6 は 3GPP TR 38.901 の σ_SF（LOS/UMa-NLOS）に対応、都市8は慣用値。
 * 注意: 既存 researchDistance.ts は同種のマージンを3桁丸めテーブル(RELIABILITY_Z)で算出しており、
 *       本libの精密値とは σ=8dB で最大0.0036dB差が出る（実害なし・完全一致は非目標）。
 */

import { assertNonNegative, RfError, RfErrorCode } from "./errors";

// Acklam 有理近似の係数（低裾/中央/高裾の3領域で共用）。
export const ACKLAM_A: readonly number[] = [
  -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2,
  -3.066479806614716e1, 2.506628277459239e0
];
export const ACKLAM_B: readonly number[] = [
  -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
  -1.328068155288572e1
];
export const ACKLAM_C: readonly number[] = [
  -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e0, -2.549732539343734e0,
  4.374664141464968e0, 2.938163982698783e0
];
export const ACKLAM_D: readonly number[] = [
  7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0, 3.754408661907416e0
];

/** Acklam 近似の裾/中央の境界（p<P_LOW は下裾、p>P_HIGH は上裾）。 */
export const ACKLAM_P_LOW = 0.02425;
export const ACKLAM_P_HIGH = 1 - ACKLAM_P_LOW;

/**
 * 標準正規の逆累積 Φ⁻¹(p)（分位関数）。Acklam の有理近似。p∈(0,1)。
 * 境界(0,1)は±∞ではなく定義域エラーとして弾く。
 */
export function inverseStandardNormalCdf(p: number): number {
  if (!Number.isFinite(p) || p <= 0 || p >= 1) {
    throw new RfError(RfErrorCode.OutOfDomain, { field: "probability", min: 0, max: 1 });
  }

  if (p < ACKLAM_P_LOW) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((ACKLAM_C[0] * q + ACKLAM_C[1]) * q + ACKLAM_C[2]) * q + ACKLAM_C[3]) * q + ACKLAM_C[4]) * q +
        ACKLAM_C[5]) /
      ((((ACKLAM_D[0] * q + ACKLAM_D[1]) * q + ACKLAM_D[2]) * q + ACKLAM_D[3]) * q + 1)
    );
  }

  if (p <= ACKLAM_P_HIGH) {
    const q = p - 0.5;
    const r = q * q;
    return (
      ((((((ACKLAM_A[0] * r + ACKLAM_A[1]) * r + ACKLAM_A[2]) * r + ACKLAM_A[3]) * r + ACKLAM_A[4]) * r +
        ACKLAM_A[5]) *
        q) /
      (((((ACKLAM_B[0] * r + ACKLAM_B[1]) * r + ACKLAM_B[2]) * r + ACKLAM_B[3]) * r + ACKLAM_B[4]) * r + 1)
    );
  }

  const q = Math.sqrt(-2 * Math.log(1 - p));
  return -(
    (((((ACKLAM_C[0] * q + ACKLAM_C[1]) * q + ACKLAM_C[2]) * q + ACKLAM_C[3]) * q + ACKLAM_C[4]) * q +
      ACKLAM_C[5]) /
    ((((ACKLAM_D[0] * q + ACKLAM_D[1]) * q + ACKLAM_D[2]) * q + ACKLAM_D[3]) * q + 1)
  );
}

/** 上側の逆 Q⁻¹(y) = Φ⁻¹(1−y)。y∈(0,1)。 */
export function upperTailInverseNormal(y: number): number {
  if (!Number.isFinite(y) || y <= 0 || y >= 1) {
    throw new RfError(RfErrorCode.OutOfDomain, { field: "probability", min: 0, max: 1 });
  }
  return inverseStandardNormalCdf(1 - y);
}

/** 必要マージン[dB] = σ[dB]·Φ⁻¹(reliability)。reliability は fraction(0<r<1)。 */
export function shadowingMarginDb(sigmaDb: number, reliability: number): number {
  assertNonNegative(sigmaDb, "shadow_fading_std");
  return sigmaDb * inverseStandardNormalCdf(reliability);
}

/** 百分率API。reliabilityPercent は 0<percent<100（assertPercentは100を許すため独自ガード）。 */
export function shadowingMarginDbByPercent(sigmaDb: number, reliabilityPercent: number): number {
  if (!Number.isFinite(reliabilityPercent) || reliabilityPercent <= 0 || reliabilityPercent >= 100) {
    throw new RfError(RfErrorCode.OutOfDomain, { field: "reliability_percent", min: 0, max: 100 });
  }
  return shadowingMarginDb(sigmaDb, reliabilityPercent / 100);
}

export type ReliabilityMarginRow = {
  reliabilityPercent: number;
  z: number;
  marginDb: number;
};

/** 表提示用の代表信頼率（50/80/90/95/99%）。 */
const RELIABILITY_TABLE_PERCENTS = [50, 80, 90, 95, 99] as const;

/** 信頼率 50/80/90/95/99% の必要マージン表を生成する。 */
export function buildReliabilityMarginTable(sigmaDb: number): ReliabilityMarginRow[] {
  assertNonNegative(sigmaDb, "shadow_fading_std");
  return RELIABILITY_TABLE_PERCENTS.map((reliabilityPercent) => {
    const z = inverseStandardNormalCdf(reliabilityPercent / 100);
    return { reliabilityPercent, z, marginDb: sigmaDb * z };
  });
}

export type ShadowFadingEnvironment = "urban" | "suburban" | "open";

/** シャドウイング標準偏差 σ[dB] の環境別プリセット。 */
export const SHADOW_FADING_STD_PRESETS_DB: Record<ShadowFadingEnvironment, number> = {
  urban: 8,
  suburban: 6,
  open: 4
};
