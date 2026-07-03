/**
 * 雑音床（熱雑音）と受信感度の導出。
 *
 *   雑音床[dBm]   = -174 + 10·log10(BW[Hz]) + NF[dB]
 *   受信感度[dBm] = 雑音床 + 所要SNR[dB]
 *
 * -174 は温度 T=290K における熱雑音電力密度 kTB[dBm/Hz]（厳密には約 -173.975）の慣用値。
 * 所要SNRは変調・符号化で決まり、LoRa の高SF等では負値（雑音以下でも復調可）になる。
 *
 * 用途: リンクバジェットの「受信感度」入力の物理的な妥当性チェックに使う。
 * 適用条件: 加法的白色ガウス雑音を前提とした一次近似。実機は実装損失・干渉で悪化する。
 */

import { assertFinite, assertPositiveFinite } from "./errors";

/** 290K の熱雑音電力密度 kTB [dBm/Hz]（慣用値）。 */
export const THERMAL_NOISE_DENSITY_DBM_PER_HZ = -174;

/** 雑音床[dBm] = -174 + 10·log10(BW[Hz]) + NF[dB]。 */
export function calculateNoiseFloorDbm(bandwidthHz: number, noiseFigureDb: number): number {
  assertPositiveFinite(bandwidthHz, "bandwidth");
  assertFinite(noiseFigureDb, "noise_figure");
  return THERMAL_NOISE_DENSITY_DBM_PER_HZ + 10 * Math.log10(bandwidthHz) + noiseFigureDb;
}

/** 受信感度[dBm] = 雑音床 + 所要SNR[dB]。 */
export function calculateSensitivityDbm(
  bandwidthHz: number,
  noiseFigureDb: number,
  requiredSnrDb: number
): number {
  assertFinite(requiredSnrDb, "required_snr");
  return calculateNoiseFloorDbm(bandwidthHz, noiseFigureDb) + requiredSnrDb;
}

export type NoiseSensitivity = {
  noiseFloorDbm: number;
  sensitivityDbm: number;
};

/** 雑音床と受信感度をまとめて返す。 */
export function calculateNoiseSensitivity(
  bandwidthHz: number,
  noiseFigureDb: number,
  requiredSnrDb: number
): NoiseSensitivity {
  const noiseFloorDbm = calculateNoiseFloorDbm(bandwidthHz, noiseFigureDb);
  assertFinite(requiredSnrDb, "required_snr");
  return { noiseFloorDbm, sensitivityDbm: noiseFloorDbm + requiredSnrDb };
}
