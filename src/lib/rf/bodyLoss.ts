/**
 * 人体近接による追加損失[dB]の解析（Track G5）。
 *
 * 文献レンジはリンクバジェットへ加える正の損失dBとして受け取る。
 * 参考の電力残存率[%] = 100·10^(-L[dB]/10)。
 * 人体損失は周波数・姿勢・距離・偏波で変動するため、距離や受信レベルの保証値へ変換しない。
 */
import { assertNonNegative, RfError, RfErrorCode } from "./errors";

export type BodyLossResult = {
  typicalLossDb: number;
  worstLossDb: number;
  typicalPowerRetainedPercent: number;
  worstPowerRetainedPercent: number;
};

export function analyzeBodyLoss(input: { typicalLossDb: number; worstLossDb: number }): BodyLossResult {
  assertNonNegative(input.typicalLossDb, "typical_loss");
  assertNonNegative(input.worstLossDb, "worst_loss");
  if (input.typicalLossDb > input.worstLossDb) {
    throw new RfError(RfErrorCode.InvalidInput, { field: "loss_range" });
  }
  const typicalPowerRetainedPercent = 100 * Math.pow(10, -input.typicalLossDb / 10);
  const worstPowerRetainedPercent = 100 * Math.pow(10, -input.worstLossDb / 10);
  return {
    typicalLossDb: input.typicalLossDb,
    worstLossDb: input.worstLossDb,
    typicalPowerRetainedPercent: typicalPowerRetainedPercent === 0 ? 0 : typicalPowerRetainedPercent,
    worstPowerRetainedPercent: worstPowerRetainedPercent === 0 ? 0 : worstPowerRetainedPercent
  };
}
