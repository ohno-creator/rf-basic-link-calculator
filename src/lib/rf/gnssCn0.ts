/**
 * GNSS受信系の搬送波対雑音密度比 C/N0 バジェット（Track G20）。
 *
 * 受動系:
 *   C/N0[dB-Hz] = Pr[dBm] + Gant[dBi] - Lpre[dB] - (-174[dBm/Hz] + NFrx[dB])
 * アクティブ系（LNA→ケーブル→受信機、入力換算Friis）:
 *   Fsys = Flna + (Lcable-1)/Glna + (Frx-1)·Lcable/Glna
 *
 * 単位: 電力[dBm]、利得/損失/NF[dB]、C/N0[dB-Hz]、線形F/G/Lは無次元。
 * 適用条件: 290Kの熱雑音密度-174dBm/Hz、整合した線形受信系。フィルタ損失や
 * アンテナ前置損失はLpreへ含め、LNA後のケーブル損失はFriis縦続で扱う。
 */

import { assertFinite, assertNonNegative, assertPositiveFinite } from "./errors";
import { THERMAL_NOISE_DENSITY_DBM_PER_HZ } from "./noiseFloor";

export type GnssCn0Quality = "good" | "usable" | "difficult";

export type GnssCn0Result = {
  mode: "passive" | "active";
  cn0DbHz: number;
  systemNoiseFigureDb: number;
  quality: GnssCn0Quality;
};

export type GnssCn0Input = {
  receivedPowerDbm: number;
  antennaGainDbi: number;
  preLnaLossDb: number;
  receiverNoiseFigureDb: number;
};

export type ActiveGnssCn0Input = GnssCn0Input & {
  lnaGainDb: number;
  lnaNoiseFigureDb: number;
  postLnaLossDb: number;
};

function normalizeZero(value: number): number {
  return value === 0 ? 0 : value;
}

/** 一般的な受信機目安: >40良好、35〜40使用可、<35厳しい。 */
export function classifyGnssCn0(cn0DbHz: number): GnssCn0Quality {
  assertFinite(cn0DbHz, "cn0");
  if (cn0DbHz > 40) return "good";
  if (cn0DbHz >= 35) return "usable";
  return "difficult";
}

function validateCommon(input: GnssCn0Input): void {
  assertFinite(input.receivedPowerDbm, "received_power");
  assertFinite(input.antennaGainDbi, "antenna_gain");
  assertNonNegative(input.preLnaLossDb, "pre_lna_loss");
  assertNonNegative(input.receiverNoiseFigureDb, "receiver_noise_figure");
}

function cn0FromSystemNoiseFigure(
  input: GnssCn0Input,
  systemNoiseFigureDb: number,
  mode: GnssCn0Result["mode"]
): GnssCn0Result {
  const cn0DbHz = normalizeZero(
    input.receivedPowerDbm +
      input.antennaGainDbi -
      input.preLnaLossDb -
      (THERMAL_NOISE_DENSITY_DBM_PER_HZ + systemNoiseFigureDb)
  );
  const normalizedNoiseFigureDb = normalizeZero(systemNoiseFigureDb);
  return {
    mode,
    cn0DbHz,
    systemNoiseFigureDb: normalizedNoiseFigureDb,
    quality: classifyGnssCn0(cn0DbHz)
  };
}

/** LNAなしの受動アンテナ系C/N0を返す。 */
export function calculateGnssCn0(input: GnssCn0Input): GnssCn0Result {
  validateCommon(input);
  return cn0FromSystemNoiseFigure(input, input.receiverNoiseFigureDb, "passive");
}

/** LNA→後段ケーブル→受信機のFriis縦続NFと入力換算C/N0を返す。 */
export function calculateActiveGnssCn0(input: ActiveGnssCn0Input): GnssCn0Result {
  validateCommon(input);
  assertNonNegative(input.lnaGainDb, "lna_gain");
  assertNonNegative(input.lnaNoiseFigureDb, "lna_noise_figure");
  assertNonNegative(input.postLnaLossDb, "post_lna_loss");

  const lnaGainLinear = 10 ** (input.lnaGainDb / 10);
  const lnaNoiseFactor = 10 ** (input.lnaNoiseFigureDb / 10);
  const postLnaLossLinear = 10 ** (input.postLnaLossDb / 10);
  const receiverNoiseFactor = 10 ** (input.receiverNoiseFigureDb / 10);
  assertPositiveFinite(lnaGainLinear, "lna_gain_linear");
  assertPositiveFinite(lnaNoiseFactor, "lna_noise_factor");
  assertPositiveFinite(postLnaLossLinear, "post_lna_loss_linear");
  assertPositiveFinite(receiverNoiseFactor, "receiver_noise_factor");

  const systemNoiseFactor =
    lnaNoiseFactor +
    (postLnaLossLinear - 1) / lnaGainLinear +
    ((receiverNoiseFactor - 1) * postLnaLossLinear) / lnaGainLinear;
  assertPositiveFinite(systemNoiseFactor, "system_noise_factor");
  const systemNoiseFigureDb = 10 * Math.log10(systemNoiseFactor);
  return cn0FromSystemNoiseFigure(input, systemNoiseFigureDb, "active");
}
