/**
 * リンクバジェットの「どうすれば届くか」提案エンジン（純関数）。
 *
 * かんたんモードUIの中核。マージン不足時は不足dBを埋める具体策
 * （距離短縮・利得追加・送信電力・環境改善）を、余裕時は伸ばせる距離を返す。
 * 距離の逆算は選択中の伝搬モデルのまま calculateLinkBudget を距離だけ変えて
 * 対数グリッド走査＋二分探索で解く（モデルの局所非単調にも頑健）。
 */

import { calculateLinkBudget, type LinkBudgetInput, type LinkBudgetResult } from "./linkBudget";

export type LinkAdvice =
  | { kind: "reach_distance"; distanceM: number }
  | { kind: "add_gain"; requiredDb: number }
  | { kind: "raise_power"; toDbm: number; gainDb: number }
  | { kind: "reduce_environment"; availableDb: number }
  | { kind: "headroom"; extraDb: number; distanceM: number };

/** 探索範囲[m]。ツールの入力範囲（1m〜20km）を少し広めに覆う。 */
const SEARCH_MIN_M = 0.5;
const SEARCH_MAX_M = 40_000;
/** 送信電力提案の上限[dBm]（ツールの入力上限に一致）。 */
const TX_POWER_MAX_DBM = 30;

function marginAtDistanceM(input: LinkBudgetInput, distanceM: number): number | null {
  try {
    const result = calculateLinkBudget({ ...input, distance: distanceM, distanceUnit: "m" });
    return Number.isFinite(result.linkMarginDb) ? result.linkMarginDb : null;
  } catch {
    return null;
  }
}

/**
 * linkMargin=0 となる最大距離[m]を返す。
 * 全範囲で届かないなら null、探索上限でも届くなら上限値を返す。
 */
export function solveMaxDistanceM(input: LinkBudgetInput): number | null {
  const logMin = Math.log10(SEARCH_MIN_M);
  const logMax = Math.log10(SEARCH_MAX_M);
  const steps = 240;

  // 対数グリッドを走査し、margin>=0 の最遠点と、その直後の margin<0 点を探す。
  let lastReachable: number | null = null;
  let firstUnreachableAfter: number | null = null;
  for (let i = 0; i <= steps; i += 1) {
    const distanceM = 10 ** (logMin + ((logMax - logMin) * i) / steps);
    const margin = marginAtDistanceM(input, distanceM);
    if (margin === null) {
      continue;
    }
    if (margin >= 0) {
      lastReachable = distanceM;
      firstUnreachableAfter = null;
    } else if (lastReachable !== null && firstUnreachableAfter === null) {
      firstUnreachableAfter = distanceM;
    }
  }

  if (lastReachable === null) {
    return null;
  }
  if (firstUnreachableAfter === null) {
    return lastReachable; // 上限まで届く
  }

  // 境界を二分探索で精緻化（対数空間）。
  let lo = lastReachable;
  let hi = firstUnreachableAfter;
  for (let i = 0; i < 40; i += 1) {
    const mid = 10 ** ((Math.log10(lo) + Math.log10(hi)) / 2);
    const margin = marginAtDistanceM(input, mid);
    if (margin === null) {
      break;
    }
    if (margin >= 0) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return lo;
}

/** 現在の入力と結果から、次の一手の提案リストを返す（不足時は効果の大きい順）。 */
export function adviseLinkBudget(input: LinkBudgetInput, result: LinkBudgetResult): LinkAdvice[] {
  const margin = result.linkMarginDb;

  if (margin >= 0) {
    const maxDistance = solveMaxDistanceM(input);
    return [
      {
        kind: "headroom",
        extraDb: margin,
        distanceM: maxDistance ?? (input.distanceUnit === "km" ? input.distance * 1000 : input.distance)
      }
    ];
  }

  const deficit = -margin;
  const advices: LinkAdvice[] = [];

  const reachable = solveMaxDistanceM(input);
  if (reachable !== null) {
    advices.push({ kind: "reach_distance", distanceM: reachable });
  }

  advices.push({ kind: "add_gain", requiredDb: deficit });

  const powerHeadroom = TX_POWER_MAX_DBM - input.txPowerDbm;
  if (powerHeadroom > 0) {
    const gain = Math.min(deficit, powerHeadroom);
    advices.push({ kind: "raise_power", toDbm: input.txPowerDbm + gain, gainDb: gain });
  }

  if (input.environmentLossDb > 0) {
    advices.push({ kind: "reduce_environment", availableDb: input.environmentLossDb });
  }

  return advices;
}
