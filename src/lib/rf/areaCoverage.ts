/**
 * 円形セル内の対数正規シャドウイング面積被覆率（Jakes型の閉形式）。
 * Fu = Φ(a) + exp(2a/b + 2/b²) Q(a + 2/b)
 * a=Φ⁻¹(edgeReliability), b=10n/(σ ln10)。
 */
import { assertFinite, assertPositiveFinite, RfError, RfErrorCode } from "./errors";
import { inverseStandardNormalCdf } from "./shadowingMargin";

const P = 0.2316419;
const B = [0.319381530, -0.356563782, 1.781477937, -1.821255978, 1.330274429] as const;

/** 標準正規分布のCDF Φ(x)。A&S 26.2.17（最大絶対誤差約7.5×10⁻⁸）。 */
export function standardNormalCdf(x: number): number {
  assertFinite(x, "normal_argument");
  if (x === 0) return 0.5;
  const z = Math.abs(x);
  const t = 1 / (1 + P * z);
  const polynomial = t * (B[0] + t * (B[1] + t * (B[2] + t * (B[3] + t * B[4]))));
  const density = Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI);
  const positive = 1 - density * polynomial;
  return x > 0 ? positive : 1 - positive;
}

export function upperTailNormal(x: number): number {
  return 1 - standardNormalCdf(x);
}

export function areaCoverageFraction(edgeReliability: number, sigmaDb: number, pathLossExponentN: number): number {
  if (!Number.isFinite(edgeReliability) || edgeReliability <= 0 || edgeReliability >= 1) {
    throw new RfError(RfErrorCode.OutOfDomain, { field: "edge_reliability", min: 0, max: 1 });
  }
  assertPositiveFinite(sigmaDb, "shadow_fading_std");
  assertPositiveFinite(pathLossExponentN, "path_loss_exponent");
  const a = inverseStandardNormalCdf(edgeReliability);
  const b = (10 * pathLossExponentN) / (sigmaDb * Math.LN10);
  const coverage = standardNormalCdf(a) + Math.exp((2 * a) / b + 2 / (b * b)) * upperTailNormal(a + 2 / b);
  return Math.min(1, Math.max(0, coverage));
}

export type AreaCoverageRow = { reliabilityPercent: number; areaCoveragePercent: number };
const RELIABILITIES = [50, 80, 90, 95, 99] as const;

export function buildAreaCoverageTable(sigmaDb: number, pathLossExponentN: number): AreaCoverageRow[] {
  assertPositiveFinite(sigmaDb, "shadow_fading_std");
  assertPositiveFinite(pathLossExponentN, "path_loss_exponent");
  return RELIABILITIES.map((reliabilityPercent) => ({
    reliabilityPercent,
    areaCoveragePercent: areaCoverageFraction(reliabilityPercent / 100, sigmaDb, pathLossExponentN) * 100
  }));
}
