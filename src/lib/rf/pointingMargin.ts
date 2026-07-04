/**
 * アンテナ指向誤差マージン（Pointing Margin, Track G13）。
 *
 * ビーム中心から角度 θ ずれたときの利得低下を、主ローブの放物線（二次）近似で評価する。
 *   利得低下 L(θ)[dB] = 12 · (|θ| / HPBW)²
 *   許容ずれ角 θ_allow[度] = HPBW · √(L_allow / 12)
 * θ = HPBW/2（半値角の端）で L = 3dB、θ = HPBW で L = 12dB（主ローブ端の目安）。
 *
 * dB/線形: L と allowedLossDb は dB、θ と HPBW は度（角度）。
 * 適用条件: 放物線近似は主ローブ内（|θ| ≲ HPBW）が有効域。それを超えるとサイドローブ構造が
 * 支配的になり本式は損失を過大評価し得る（3GPP では Am でクランプする）。第1段では
 * クランプせず素の放物線値を返し、主ローブ内かどうかは withinMainLobe で示す。
 *
 * 出典: 3GPP TR 36.814 Table A.2.1.1-2 のアンテナパターン A(θ) = min(12·(θ/θ3dB)², Am) の
 *       放物線近似部（本libは主ローブ内を対象とするため min クランプは持たない）。
 */

import { assertFinite, assertPositiveFinite } from "./errors";

/** 主ローブ端（θ=HPBW）での損失[dB]。放物線近似の有効域の目安。 */
export const MAIN_LOBE_EDGE_LOSS_DB = 12;

/**
 * 指向誤差 θ[度] による利得低下[dB] = 12·(|θ|/HPBW)²。
 * θ は負値（逆方向のずれ）も許容し、対称性から絶対値で評価する。
 */
export function pointingLossDb(offsetDeg: number, hpbwDeg: number): number {
  assertFinite(offsetDeg, "offset");
  assertPositiveFinite(hpbwDeg, "hpbw");
  const ratio = Math.abs(offsetDeg) / hpbwDeg;
  return MAIN_LOBE_EDGE_LOSS_DB * ratio * ratio;
}

/** 許容損失 L[dB] に収まる最大指向誤差[度] = HPBW·√(L/12)。pointingLossDb の逆関数。 */
export function allowableOffsetDeg(allowedLossDb: number, hpbwDeg: number): number {
  assertPositiveFinite(allowedLossDb, "allowed_loss");
  assertPositiveFinite(hpbwDeg, "hpbw");
  return hpbwDeg * Math.sqrt(allowedLossDb / MAIN_LOBE_EDGE_LOSS_DB);
}

export type PointingMarginRow = {
  /** 許容損失[dB]。 */
  lossDb: number;
  /** その損失に収まる最大指向誤差[度]。 */
  offsetDeg: number;
};

/** 表提示用の代表許容損失[dB]（3/1/0.5dB）。 */
const DEFAULT_LOSS_STEPS_DB: readonly number[] = [3, 1, 0.5];

/** 許容損失ごとの最大指向誤差の対応表を生成する。 */
export function buildPointingMarginTable(
  hpbwDeg: number,
  steps: readonly number[] = DEFAULT_LOSS_STEPS_DB
): PointingMarginRow[] {
  assertPositiveFinite(hpbwDeg, "hpbw");
  return steps.map((lossDb) => ({
    lossDb,
    offsetDeg: allowableOffsetDeg(lossDb, hpbwDeg)
  }));
}

export type PointingMarginInput = {
  /** 半値角 HPBW[度]。 */
  hpbwDeg: number;
  /** 許容損失[dB]（省略時 1dB）。 */
  allowedLossDb?: number;
};

export type PointingMarginResult = {
  hpbwDeg: number;
  allowedLossDb: number;
  /** 許容損失に収まる最大指向誤差[度]。 */
  allowedOffsetDeg: number;
  /** 許容ずれ角が主ローブ内（放物線近似の有効域）に収まるか。 */
  withinMainLobe: boolean;
  /** 代表許容損失（3/1/0.5dB）ごとの対応表。 */
  table: PointingMarginRow[];
};

/** HPBW と許容損失から、許容指向誤差と代表損失の対応表をまとめて求める統合API。 */
export function calculatePointingMargin(input: PointingMarginInput): PointingMarginResult {
  const { hpbwDeg, allowedLossDb = 1 } = input;
  const allowedOffsetDeg = allowableOffsetDeg(allowedLossDb, hpbwDeg);
  return {
    hpbwDeg,
    allowedLossDb,
    allowedOffsetDeg,
    // θ_allow ≤ HPBW ⇔ L_allow ≤ 12dB（主ローブ端の損失）。
    withinMainLobe: allowedLossDb <= MAIN_LOBE_EDGE_LOSS_DB,
    table: buildPointingMarginTable(hpbwDeg)
  };
}
