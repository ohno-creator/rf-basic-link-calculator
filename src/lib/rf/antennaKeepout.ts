/**
 * アンテナ・キープアウト（実装禁止領域）の充足判定。
 *
 *   不足量[mm]  = max(0, 必要寸法 − 確保寸法)   （W/H それぞれ）
 *   不足率      = 不足量 ÷ 必要寸法
 *   判定        = 両辺充足 → success
 *                 不足があり、全ての不足辺で不足率 < 20% → caution
 *                 いずれかの辺で不足率 ≥ 20% → danger
 *
 * 単位: すべて mm。W=基板端に沿った幅・H=基板内側への奥行き（基板面内の2次元評価）。
 * 適用条件: 必要寸法は各社レイアウトガイドの代表値（@/data/antennaKeepout）で、目安である。
 * 採用製品のデータシート指定が常に優先。筐体・電池・ネジ等の三次元的な近接物、
 * GNDプレーン全体の大きさ（特に920MHz帯）の影響は含まないため、最終判断は実測を前提とする。
 */

import {
  KEEPOUT_REQUIREMENTS,
  type KeepoutAntennaType,
  type KeepoutBand
} from "@/data/antennaKeepout";
import { assertPositiveFinite, RfError, RfErrorCode } from "./errors";

/** この不足率（20%）以上の辺が1つでもあれば danger。 */
export const KEEPOUT_DANGER_SHORTFALL_RATIO = 0.2;

export type KeepoutVerdict = "success" | "caution" | "danger";

export type KeepoutInput = {
  antennaType: KeepoutAntennaType;
  band: KeepoutBand;
  /** 基板上に確保できたキープアウト幅 [mm]（0より大きい有限値）。 */
  availableWidthMm: number;
  /** 基板上に確保できたキープアウト奥行き [mm]（0より大きい有限値）。 */
  availableHeightMm: number;
};

export type KeepoutJudgement = {
  /** 必要キープアウト幅 [mm]（データ表の値）。 */
  requiredWidthMm: number;
  /** 必要キープアウト奥行き [mm]（データ表の値）。 */
  requiredHeightMm: number;
  verdict: KeepoutVerdict;
  /** 幅方向の不足量 [mm]（充足時は 0。-0 は返さない）。 */
  shortfallWidthMm: number;
  /** 奥行き方向の不足量 [mm]（充足時は 0。-0 は返さない）。 */
  shortfallHeightMm: number;
};

/** 確保領域が必要キープアウトを満たすかを判定する。 */
export function judgeKeepout(input: KeepoutInput): KeepoutJudgement {
  const byBand = KEEPOUT_REQUIREMENTS[input.antennaType];
  if (!byBand) {
    throw new RfError(RfErrorCode.InvalidInput, { field: "antenna_type" });
  }
  const required = byBand[input.band];
  if (!required) {
    throw new RfError(RfErrorCode.InvalidInput, { field: "band" });
  }
  assertPositiveFinite(input.availableWidthMm, "available_width");
  assertPositiveFinite(input.availableHeightMm, "available_height");

  // Math.max(0, x) は x ≤ 0 のとき常に +0 を返すため -0 にはならない。
  const shortfallWidthMm = Math.max(0, required.widthMm - input.availableWidthMm);
  const shortfallHeightMm = Math.max(0, required.heightMm - input.availableHeightMm);

  let verdict: KeepoutVerdict;
  if (shortfallWidthMm === 0 && shortfallHeightMm === 0) {
    verdict = "success";
  } else if (
    shortfallWidthMm / required.widthMm >= KEEPOUT_DANGER_SHORTFALL_RATIO ||
    shortfallHeightMm / required.heightMm >= KEEPOUT_DANGER_SHORTFALL_RATIO
  ) {
    verdict = "danger";
  } else {
    verdict = "caution";
  }

  return {
    requiredWidthMm: required.widthMm,
    requiredHeightMm: required.heightMm,
    verdict,
    shortfallWidthMm,
    shortfallHeightMm
  };
}
