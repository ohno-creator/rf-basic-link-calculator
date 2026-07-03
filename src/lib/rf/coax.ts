/**
 * 同軸フィードライン（ケーブル）の挿入損失を、実測データの補間で求める。
 *
 * 各品番について、複数の周波数で測定した挿入損失[dB]（正の値）を保持し、
 * 指定周波数の損失を線形補間（測定点の外側は表皮効果の √f でスケール外挿）で算出する。
 *
 *   合計損失[dB] = 1本あたり損失 × 本数
 *   残る電力[%]  = 10^(-合計損失/10) × 100
 *
 * 損失は実測値だが、個体差・コネクタ品質・曲げ・温度で多少変わる目安として扱う。
 */

import { assertAtLeast, assertPositiveFinite, RfError, RfErrorCode } from "./errors";

export type LossPoint = {
  freqMHz: number;
  lossDb: number;
};

/** 比較用の参考周波数点（測定品番と同じ周波数）。 */
const REFERENCE_FREQUENCIES_MHZ = [500, 800, 2000, 3000, 4000, 5000, 6000, 7000, 8000];

/**
 * 一般的なケーブルの参考損失カーブを生成する。
 * 表皮効果が支配的な範囲を想定し、2.4GHzの代表減衰量[dB/m]から √f でスケールする目安。
 *   loss(f)[dB] = α(2.4GHz) × √(f/2400) × 長さ[m]
 * 注: 誘電損（∝f）を無視した近似のため、数GHz以上では実損失を過小評価しうる
 *     （実リンク計算には実測補間値 cableAssemblies を使う）。
 */
export function referenceLossPoints(attenuationAt2400DbPerM: number, lengthM: number): LossPoint[] {
  assertPositiveFinite(attenuationAt2400DbPerM, "attenuation");
  assertPositiveFinite(lengthM, "length");
  return REFERENCE_FREQUENCIES_MHZ.map((freqMHz) => ({
    freqMHz,
    lossDb: attenuationAt2400DbPerM * Math.sqrt(freqMHz / 2400) * lengthM
  }));
}

/** 測定点（周波数昇順）から、指定周波数の損失[dB]を線形補間／外挿で求める。 */
export function interpolateCableLoss(points: LossPoint[], frequencyMHz: number): number {
  assertPositiveFinite(frequencyMHz, "frequency");
  if (points.length === 0) {
    throw new RfError(RfErrorCode.Empty, { field: "cable_measurements" });
  }

  const sortedPoints = [...points].sort((a, b) => a.freqMHz - b.freqMHz);
  const first = sortedPoints[0];
  const last = sortedPoints[sortedPoints.length - 1];

  // 測定範囲の外側は、表皮効果が支配的な同軸減衰の √f 物理に合わせてスケール外挿する
  // （referenceLossPoints と同じモデル。誘電損 ∝f は無視した近似で、範囲内は実測の線形補間を使う）。
  if (frequencyMHz <= first.freqMHz) {
    return Math.max(0, first.lossDb * Math.sqrt(frequencyMHz / first.freqMHz));
  }

  if (frequencyMHz >= last.freqMHz) {
    const cappedFrequencyMHz = Math.min(frequencyMHz, last.freqMHz * 2);
    return Math.max(0, last.lossDb * Math.sqrt(cappedFrequencyMHz / last.freqMHz));
  }

  for (let i = 0; i < sortedPoints.length - 1; i += 1) {
    const a = sortedPoints[i];
    const b = sortedPoints[i + 1];
    if (frequencyMHz >= a.freqMHz && frequencyMHz <= b.freqMHz) {
      const t = (frequencyMHz - a.freqMHz) / (b.freqMHz - a.freqMHz);
      return a.lossDb + t * (b.lossDb - a.lossDb);
    }
  }

  return last.lossDb;
}

export type CableLossResult = {
  perPieceDb: number;
  totalDb: number;
  powerRemainingPercent: number;
  extrapolated: boolean;
};

/** 指定品番（測定点）・周波数・本数から、合計損失と残る電力を求める。 */
export function cableAssemblyLoss(
  points: LossPoint[],
  frequencyMHz: number,
  quantity: number
): CableLossResult {
  assertAtLeast(quantity, 1, "quantity");

  const perPieceDb = interpolateCableLoss(points, frequencyMHz);
  const totalDb = perPieceDb * quantity;
  const measuredFrequenciesMHz = points.map((point) => point.freqMHz);
  const minMeasuredFrequencyMHz = Math.min(...measuredFrequenciesMHz);
  const maxMeasuredFrequencyMHz = Math.max(...measuredFrequenciesMHz);

  return {
    perPieceDb,
    totalDb,
    powerRemainingPercent: 10 ** (-totalDb / 10) * 100,
    extrapolated:
      frequencyMHz < minMeasuredFrequencyMHz || frequencyMHz > maxMeasuredFrequencyMHz
  };
}
