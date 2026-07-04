/**
 * VSWR帯域幅 ⇔ Q ⇔ 比帯域の相互変換（Track G8）。
 *
 * 整合済み（tuned）アンテナの、VSWR≤s を満たす比帯域（fractional bandwidth, FBW）と Q の関係:
 *   FBW(VSWR≤s) = (s − 1) / (Q·√s)          （単共振近似）
 *   Q          = (s − 1) / (FBW·√s)          （厳密な逆関数）
 *
 * dB/線形: Q・FBW・s はすべて無次元（dB量なし）。FBW は fraction（%APIは×100）。
 * 適用条件: 単一共振（single RLC）近似・整合済み前提。狭帯域（FBW≲20%目安）で精度良好、
 * 広帯域では近似が崩れる。small-antenna-limit（Chu限界）のQと同一sで比較すると意味が揃う。
 * 出典: Yaghjian & Best, "Impedance, Bandwidth, and Q of Antennas", IEEE Trans. AP, 53(4), 2005。
 */

import { assertPositiveFinite, RfError, RfErrorCode } from "./errors";

/** VSWR閾値の既定と選択肢（業界慣用）。 */
export const DEFAULT_VSWR_LIMIT = 2;
export const VSWR_LIMIT_PRESETS: readonly number[] = [1.5, 2, 3];

function assertVswrLimit(vswrLimit: number): void {
  // s=1 は帯域0の退化・逆変換Q=∞のため等号も除外（vswr.ts の min:1 等号許可とは意図的に異なる）。
  if (!Number.isFinite(vswrLimit) || vswrLimit <= 1) {
    throw new RfError(RfErrorCode.OutOfDomain, { field: "vswr_limit", min: 1 });
  }
}

/** Q → 比帯域 FBW(VSWR≤s)（fraction・無次元）。 */
export function fractionalBandwidthFromQ(q: number, vswrLimit: number = DEFAULT_VSWR_LIMIT): number {
  assertPositiveFinite(q, "q_factor");
  assertVswrLimit(vswrLimit);
  return (vswrLimit - 1) / (q * Math.sqrt(vswrLimit));
}

/** Q → 比帯域[%]（primary出力用）。 */
export function fractionalBandwidthPercentFromQ(q: number, vswrLimit: number = DEFAULT_VSWR_LIMIT): number {
  return fractionalBandwidthFromQ(q, vswrLimit) * 100;
}

/** 比帯域 FBW（fraction）→ Q。 */
export function qFromFractionalBandwidth(
  fractionalBandwidth: number,
  vswrLimit: number = DEFAULT_VSWR_LIMIT
): number {
  // f_low = f0(1−FBW/2) > 0 の物理制約から 0 < FBW < 2。
  if (!Number.isFinite(fractionalBandwidth) || fractionalBandwidth <= 0 || fractionalBandwidth >= 2) {
    throw new RfError(RfErrorCode.OutOfDomain, { field: "fractional_bandwidth", min: 0, max: 2 });
  }
  assertVswrLimit(vswrLimit);
  return (vswrLimit - 1) / (fractionalBandwidth * Math.sqrt(vswrLimit));
}

/** 比帯域[%] → Q。 */
export function qFromFractionalBandwidthPercent(
  fractionalBandwidthPercent: number,
  vswrLimit: number = DEFAULT_VSWR_LIMIT
): number {
  if (
    !Number.isFinite(fractionalBandwidthPercent) ||
    fractionalBandwidthPercent <= 0 ||
    fractionalBandwidthPercent >= 200
  ) {
    throw new RfError(RfErrorCode.OutOfDomain, { field: "fractional_bandwidth_percent", min: 0, max: 200 });
  }
  return qFromFractionalBandwidth(fractionalBandwidthPercent / 100, vswrLimit);
}

export type AbsoluteBandwidthResult = {
  bandwidthMHz: number;
  lowerMHz: number;
  upperMHz: number;
};

/** 中心周波数と比帯域から、絶対帯域幅と帯域端[MHz]（算術中心）を求める。 */
export function absoluteBandwidthMHz(
  centerFrequencyMHz: number,
  fractionalBandwidth: number
): AbsoluteBandwidthResult {
  assertPositiveFinite(centerFrequencyMHz, "frequency");
  if (!Number.isFinite(fractionalBandwidth) || fractionalBandwidth <= 0 || fractionalBandwidth >= 2) {
    throw new RfError(RfErrorCode.OutOfDomain, { field: "fractional_bandwidth", min: 0, max: 2 });
  }
  return {
    bandwidthMHz: centerFrequencyMHz * fractionalBandwidth,
    lowerMHz: centerFrequencyMHz * (1 - fractionalBandwidth / 2),
    upperMHz: centerFrequencyMHz * (1 + fractionalBandwidth / 2)
  };
}
