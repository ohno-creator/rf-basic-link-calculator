/**
 * 同軸フィードライン（ケーブル）の挿入損失を、実測データの補間で求める。
 *
 * 各品番について、複数の周波数で測定した挿入損失[dB]（正の値）を保持し、
 * 指定周波数の損失を線形補間（測定点の外側は線形外挿）で算出する。
 *
 *   合計損失[dB] = 1本あたり損失 × 本数
 *   残る電力[%]  = 10^(-合計損失/10) × 100
 *
 * 損失は実測値だが、個体差・コネクタ品質・曲げ・温度で多少変わる目安として扱う。
 */

export type LossPoint = {
  freqMHz: number;
  lossDb: number;
};

function assertPositiveFinite(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label}は0より大きい値を入力してください。`);
  }
}

/** 比較用の参考周波数点（測定品番と同じ周波数）。 */
const REFERENCE_FREQUENCIES_MHZ = [500, 800, 2000, 3000, 4000, 5000, 6000, 7000, 8000];

/**
 * 一般的なケーブルの参考損失カーブを生成する。
 * 表皮効果が支配的な範囲を想定し、2.4GHzの代表減衰量[dB/m]から √f でスケールする目安。
 *   loss(f)[dB] = α(2.4GHz) × √(f/2400) × 長さ[m]
 */
export function referenceLossPoints(attenuationAt2400DbPerM: number, lengthM: number): LossPoint[] {
  assertPositiveFinite(attenuationAt2400DbPerM, "代表減衰量");
  assertPositiveFinite(lengthM, "長さ");
  return REFERENCE_FREQUENCIES_MHZ.map((freqMHz) => ({
    freqMHz,
    lossDb: attenuationAt2400DbPerM * Math.sqrt(freqMHz / 2400) * lengthM
  }));
}

/** 測定点（周波数昇順）から、指定周波数の損失[dB]を線形補間／外挿で求める。 */
export function interpolateCableLoss(points: LossPoint[], frequencyMHz: number): number {
  assertPositiveFinite(frequencyMHz, "周波数");
  if (points.length === 0) {
    throw new Error("測定データがありません。");
  }

  const first = points[0];
  const last = points[points.length - 1];

  if (frequencyMHz <= first.freqMHz) {
    if (points.length === 1) {
      return Math.max(0, first.lossDb);
    }
    const slope = (points[1].lossDb - first.lossDb) / (points[1].freqMHz - first.freqMHz);
    return Math.max(0, first.lossDb + slope * (frequencyMHz - first.freqMHz));
  }

  if (frequencyMHz >= last.freqMHz) {
    const prev = points[points.length - 2];
    const slope = (last.lossDb - prev.lossDb) / (last.freqMHz - prev.freqMHz);
    return Math.max(0, last.lossDb + slope * (frequencyMHz - last.freqMHz));
  }

  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
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
};

/** 指定品番（測定点）・周波数・本数から、合計損失と残る電力を求める。 */
export function cableAssemblyLoss(
  points: LossPoint[],
  frequencyMHz: number,
  quantity: number
): CableLossResult {
  if (!Number.isFinite(quantity) || quantity < 1) {
    throw new Error("本数は1以上で入力してください。");
  }

  const perPieceDb = interpolateCableLoss(points, frequencyMHz);
  const totalDb = perPieceDb * quantity;

  return {
    perPieceDb,
    totalDb,
    powerRemainingPercent: 10 ** (-totalDb / 10) * 100
  };
}
