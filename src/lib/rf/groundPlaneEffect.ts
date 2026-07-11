/**
 * GNDプレーン寸法（最長辺 Lg）によるλ/4モノポール系アンテナの効率低下。
 *
 *   Lg/λ = (Lg[mm] / 1000) / λ[m]                       （無次元）
 *   効率低下[dB] = 目安表(Lg/λ) の区分線形補間          （Lg/λ ≥ 0.25 は 0dB にクランプ）
 *   推奨GND長[mm] = λ/4
 *
 * dB/線形: 効率低下は dB（0以下。リンクバジェットではアンテナ利得または追加損失へ加算）、
 * Lg/λ は線形（無次元）、長さ入力は mm、波長は内部で m→mm 換算。
 *
 * 適用条件:
 *   - λ/4モノポール系（チップアンテナ・IFA・ワイヤ等の不平衡系）で、GNDプレーンが
 *     鏡像（アンテナの残り半分）を担う構成が対象。平衡系（ダイポール等）には適用しない。
 *   - 目安表はベンダーアプリケーションノート（TI AN058 §3.1.2 / TI DN035 / EnOcean AN102 §4、
 *     src/data/groundPlaneEffect.ts に転記）の実測系目安。一次判断用で、実機では共振ずれ・
 *     整合ずれが重なるため最終判断は実測を前提とする。
 *   - Lg/λ < 0 は入力エラー（RfError）。-0 は返さない。
 */

import { GROUND_PLANE_EFFICIENCY_TABLE } from "@/data/groundPlaneEffect";
import { assertNonNegative, assertPositiveFinite } from "./errors";
import { calculateWavelengthFromMHz } from "./frequency";

/** 効率低下が 0dB になる推奨比 Lg/λ = 0.25（GND最長辺 λ/4 確保）。 */
export const GROUND_PLANE_RECOMMENDED_FRACTION = 0.25;

/**
 * 効率低下[dB] = 目安表(Lg/λ) の区分線形補間。
 * Lg/λ ≥ 0.25 は 0dB にクランプし、-0 は返さない。Lg/λ < 0 は RfError。
 */
export function groundPlaneEfficiencyDropDb(lgOverLambda: number): number {
  assertNonNegative(lgOverLambda, "lg_over_lambda");
  const table = GROUND_PLANE_EFFICIENCY_TABLE;
  const last = table[table.length - 1];
  if (lgOverLambda >= last.lgOverLambda) {
    return 0;
  }
  for (let i = 1; i < table.length; i += 1) {
    const lower = table[i - 1];
    const upper = table[i];
    if (lgOverLambda <= upper.lgOverLambda) {
      const t = (lgOverLambda - lower.lgOverLambda) / (upper.lgOverLambda - lower.lgOverLambda);
      const dropDb = lower.efficiencyDropDb + t * (upper.efficiencyDropDb - lower.efficiencyDropDb);
      // -0 を返さない（区分線形の端点で 0 に丸まった場合）。
      return dropDb === 0 ? 0 : dropDb;
    }
  }
  return 0;
}

export type GroundPlaneEffectInput = {
  /** 周波数[MHz]（0より大きい有限値）。 */
  frequencyMHz: number;
  /** 基板でGNDが連続して確保できる最長辺 Lg[mm]（0以上）。 */
  groundLengthMm: number;
};

export type GroundPlaneEffectResult = {
  /** 波長 λ[mm]。 */
  wavelengthMm: number;
  /** GND最長辺の波長比 Lg/λ（無次元）。 */
  lgOverLambda: number;
  /** 効率低下[dB]（0以下）。Lg/λ ≥ 0.25 は 0。 */
  efficiencyDropDb: number;
  /** 推奨GND長[mm] = λ/4（この長さで低下 0dB）。 */
  recommendedLengthMm: number;
};

/** 周波数[MHz]とGND最長辺[mm]から、Lg/λ・効率低下[dB]・推奨GND長（λ/4）[mm]を求める。 */
export function calculateGroundPlaneEffect({
  frequencyMHz,
  groundLengthMm
}: GroundPlaneEffectInput): GroundPlaneEffectResult {
  assertPositiveFinite(frequencyMHz, "frequency");
  assertNonNegative(groundLengthMm, "ground_length");
  const wavelengthMm = calculateWavelengthFromMHz(frequencyMHz) * 1000;
  // +0 加算で -0 入力（Object.is(-0, groundLengthMm)）でも比が -0 にならないよう正規化する。
  const lgOverLambda = groundLengthMm / wavelengthMm + 0;
  return {
    wavelengthMm,
    lgOverLambda,
    efficiencyDropDb: groundPlaneEfficiencyDropDb(lgOverLambda),
    recommendedLengthMm: wavelengthMm * GROUND_PLANE_RECOMMENDED_FRACTION
  };
}
