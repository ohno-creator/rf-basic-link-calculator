/**
 * ミスマッチ損失が通信距離に与える影響（Track G9）。
 *
 * 整合ずれ（VSWR）による反射でミスマッチ損失 ML[dB] が生じ、その分だけ実効的な到達距離が縮む。
 * 自由空間（FSPL ∝ d²）では、電力損失 ML[dB] は距離倍率 10^(−ML/20) に対応する。
 *   距離倍率 = 10^(−ML/20)、  距離影響[%] = (距離倍率 − 1)×100
 *
 * dB/線形: ML は dB、距離倍率・反射電力率は線形（無次元）。
 * 適用条件: 自由空間伝搬（距離2倍で6dB）を前提とした一次目安。実環境（多重波・遮蔽）では
 * 距離指数が2から外れるため、あくまで整合改善の価値を距離%で示す営業・設計の目安。
 * 既存 vswr.ts（Γ/ML導出）と db.ts（dB→距離倍率）の薄い組合せで、新規の物理式は持たない。
 */

import { dbToDistanceRatio } from "./db";
import { convertVswr } from "./vswr";

export type MismatchRangeImpact = {
  /** 反射係数 Γ（無次元 0..1）。 */
  reflectionCoefficient: number;
  /** ミスマッチ損失[dB]。 */
  mismatchLossDb: number;
  /** 反射電力[%]。 */
  reflectedPowerPercent: number;
  /** 自由空間での到達距離倍率（1未満＝縮む）。 */
  distanceRatio: number;
  /** 到達距離の変化[%]（負＝縮む）。 */
  distanceImpactPercent: number;
};

/**
 * VSWR から、ミスマッチ損失と自由空間での到達距離影響を求める。
 * VSWR<1 は vswr.ts のガード（BelowMinimum）で弾かれる。
 */
export function mismatchRangeImpact(vswr: number): MismatchRangeImpact {
  const { reflectionCoefficient, mismatchLossDb, reflectedPowerPercent } = convertVswr("vswr", vswr);
  // ML は損失(正のdB)。距離倍率は電力減少に対する距離縮小なので −ML を渡す。
  const distanceRatio = dbToDistanceRatio(-mismatchLossDb);
  return {
    reflectionCoefficient,
    mismatchLossDb,
    reflectedPowerPercent,
    distanceRatio,
    distanceImpactPercent: (distanceRatio - 1) * 100
  };
}
