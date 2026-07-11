/**
 * 2ブランチ選択ダイバーシティのアウテージ利得推定（Track G12）。
 *
 * レイリー包絡・平均電力で正規化した単一ブランチ:
 *   Pout,1 = 1 - exp(-x)
 * 独立Nブランチの選択合成:
 *   Pout,N = (1 - exp(-x))^N
 * 指定アウテージpでのしきい値比をdB化:
 *   Gdiv[dB] = 10log10{ -ln(1-p^(1/N)) / -ln(1-p) }
 *
 * 一様な方位角から波が到来するClarkeモデルの近似:
 *   ρe ≈ J0²(2πd/λ)
 * 相関補正（設計目安）:
 *   Gcorr[dB] ≈ Gdiv[dB]·√(1-ρe)
 *
 * d/λ・ρe・pは無次元、利得はdB。相関補正は厳密な合成CDFではなく、
 * Vaughan & Andersen系の設計目安として用いる。偏波・パターン不一致、結合損失、
 * 不均一な到来角分布は含まないため、最終値は実測ECC・OTA評価で確認する。
 */

import { assertFinite, assertNonNegative, RfError, RfErrorCode } from "./errors";

function assertOpenPercent(value: number, field: string): void {
  assertFinite(value, field);
  if (value <= 0 || value >= 100) {
    throw new RfError(RfErrorCode.OutOfDomain, { field, min: 0, max: 100 });
  }
}

function assertPositiveInteger(value: number, field: string): void {
  assertFinite(value, field);
  if (!Number.isInteger(value) || value < 1) {
    throw new RfError(RfErrorCode.OutOfDomain, { field, min: 1 });
  }
}

function assertCorrelation(value: number): void {
  assertFinite(value, "correlation_coefficient");
  if (value < 0 || value > 1) {
    throw new RfError(RfErrorCode.OutOfDomain, {
      field: "correlation_coefficient",
      min: 0,
      max: 1
    });
  }
}

/** 指定アウテージ率[%]での独立Nブランチ選択合成利得[dB]。 */
export function selectionDiversityGainDb(outagePercent: number, branches = 2): number {
  assertOpenPercent(outagePercent, "outage_percent");
  assertPositiveInteger(branches, "branches");
  if (branches === 1) return 0;

  const p = outagePercent / 100;
  const singleThreshold = -Math.log1p(-p);
  const selectionThreshold = -Math.log1p(-Math.pow(p, 1 / branches));
  const gainDb = 10 * Math.log10(selectionThreshold / singleThreshold);
  return gainDb === 0 ? 0 : gainDb;
}

/**
 * 第1種Bessel関数 J0(x)。
 * |x|≤20はべき級数、外側は第1項の漸近式を使う。G12の代表入力d≤数λでは級数域。
 */
export function besselJ0(x: number): number {
  assertFinite(x, "bessel_argument");
  const ax = Math.abs(x);
  if (ax === 0) return 1;
  if (ax > 20) {
    return Math.sqrt(2 / (Math.PI * ax)) * Math.cos(ax - Math.PI / 4);
  }

  const quarterSquare = -(ax * ax) / 4;
  let sum = 1;
  let term = 1;
  for (let k = 1; k <= 100; k += 1) {
    term *= quarterSquare / (k * k);
    sum += term;
    if (Math.abs(term) <= Math.abs(sum) * Number.EPSILON) break;
  }
  return sum === 0 ? 0 : sum;
}

/** アンテナ間隔[d/λ]から ρe≈J0²(2πd/λ) を推定する。 */
export function correlationFromSpacing(spacingWavelengths: number): number {
  assertNonNegative(spacingWavelengths, "spacing_wavelengths");
  const j0 = besselJ0(2 * Math.PI * spacingWavelengths);
  const correlation = j0 * j0;
  return Math.min(1, Math.max(0, correlation));
}

/** 設計近似 Gcorr[dB]=Gdiv[dB]·√(1-ρe)。 */
export function applyCorrelationToDiversityGain(
  independentGainDb: number,
  correlationCoefficient: number
): number {
  assertNonNegative(independentGainDb, "independent_gain");
  assertCorrelation(correlationCoefficient);
  const corrected = independentGainDb * Math.sqrt(1 - correlationCoefficient);
  return corrected === 0 ? 0 : corrected;
}

export type DiversityGainResult = {
  independentGainDb: number;
  correctedGainDb: number;
  correlationCoefficient: number;
  correlationAssessment: "effective" | "correlated";
};

/** 2ブランチ選択合成の独立利得・相関補正利得・ECC判定をまとめて返す。 */
export function calculateDiversityGain(input: {
  outagePercent: number;
  spacingWavelengths: number;
  correlationCoefficient?: number;
}): DiversityGainResult {
  const independentGainDb = selectionDiversityGainDb(input.outagePercent, 2);
  const correlationCoefficient =
    input.correlationCoefficient ?? correlationFromSpacing(input.spacingWavelengths);
  assertCorrelation(correlationCoefficient);
  const correctedGainDb = applyCorrelationToDiversityGain(
    independentGainDb,
    correlationCoefficient
  );
  return {
    independentGainDb,
    correctedGainDb,
    correlationCoefficient,
    correlationAssessment: correlationCoefficient < 0.5 ? "effective" : "correlated"
  };
}
