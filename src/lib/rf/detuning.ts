/**
 * 筐体・近接物によるアンテナ離調（detuning）の推定。
 *
 *   シフト量[MHz]         = 中心周波数[MHz] × シフト率[%] / 100（負値=低周波側）
 *   シフト後中心[MHz]     = 中心周波数 × (1 + シフト率/100)
 *   元のVSWR≤2帯域[MHz]  = 中心周波数 ± 帯域幅/2
 *
 * 帯域内判定 staysInBand:
 *   - "yes"     … 最小シフトでも最大シフトでも、シフト後の中心周波数が元の帯域内（端を含む）
 *   - "partial" … 最小シフトでは収まるが、最大シフトでは帯域外
 *   - "no"      … 最小シフトの時点で帯域外
 *
 * シナリオ別のシフト率・劣化後VSWRは @/data/detuningScenarios の公開資料転記値
 * （Antenova / Laird Connectivity / 査読論文2024）。あくまで**目安レンジ（実測前提）**であり、
 * 実際の離調は筐体材質・厚み・離隔・GND寸法・部品配置に依存する。
 *
 * 適用条件: 単共振の小形アンテナ（モノポール/IFA/チップ等）が誘電体・人体・金属に
 * 近接する一次近似。多共振・広帯域アンテナや整合回路での再調整後は本表の範囲外。
 */

import { assertPositiveFinite, RfError, RfErrorCode } from "./errors";
import { findDetuningScenario, type DetuningScenarioId } from "@/data/detuningScenarios";

export type DetuningEstimateInput = {
  /** アンテナ単体（自由空間）で調整済みの中心周波数[MHz]。0より大きい有限値。 */
  centerFrequencyMHz: number;
  /** 元のVSWR≤2帯域幅[MHz]（中心周波数を挟んで対称とみなす）。0より大きい有限値。 */
  vswr2BandwidthMHz: number;
  /** 近接物シナリオ（@/data/detuningScenarios のID）。 */
  scenario: DetuningScenarioId;
};

export type DetuningEstimate = {
  /** 想定シフトの下限側[MHz]（絶対値が小さい側・負値）。 */
  shiftMinMHz: number;
  /** 想定シフトの上限側[MHz]（絶対値が大きい側・負値）。 */
  shiftMaxMHz: number;
  /** 劣化後VSWRの典型レンジ [min, max]。 */
  vswrRange: [number, number];
  /** シフト後の中心周波数が元のVSWR≤2帯域に収まるかの判定。 */
  staysInBand: "yes" | "partial" | "no";
};

/** -0 を +0 に正規化する（表示・比較の揺れを防ぐ）。 */
function normalizeZero(value: number): number {
  return value === 0 ? 0 : value;
}

/**
 * 筐体・近接物による離調（共振周波数シフトとVSWR劣化）を推定し、
 * シフト後の中心周波数が元のVSWR≤2帯域に収まるかを判定する。
 */
export function estimateDetuning(input: DetuningEstimateInput): DetuningEstimate {
  const { centerFrequencyMHz, vswr2BandwidthMHz } = input;
  assertPositiveFinite(centerFrequencyMHz, "center_frequency");
  assertPositiveFinite(vswr2BandwidthMHz, "vswr2_bandwidth");

  const scenario = findDetuningScenario(input.scenario);
  if (!scenario) {
    throw new RfError(RfErrorCode.InvalidInput, { field: "scenario" });
  }

  const shiftMinMHz = normalizeZero(centerFrequencyMHz * (scenario.shiftMinPercent / 100));
  const shiftMaxMHz = normalizeZero(centerFrequencyMHz * (scenario.shiftMaxPercent / 100));

  // シフト後中心 = center + shift が band = center ± BW/2 に入る条件は |shift| ≤ BW/2。
  const halfBandMHz = vswr2BandwidthMHz / 2;
  const minInBand = Math.abs(shiftMinMHz) <= halfBandMHz;
  const maxInBand = Math.abs(shiftMaxMHz) <= halfBandMHz;
  const staysInBand: DetuningEstimate["staysInBand"] =
    minInBand && maxInBand ? "yes" : minInBand ? "partial" : "no";

  return {
    shiftMinMHz,
    shiftMaxMHz,
    vswrRange: [scenario.vswrMin, scenario.vswrMax],
    staysInBand
  };
}
