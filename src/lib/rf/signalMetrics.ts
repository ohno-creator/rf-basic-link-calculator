/**
 * LTE信号品質指標（RSSI/RSRP/RSRQ/SINR）の相互変換（Track G15）。
 *
 * 全リソースブロック送信（フルロード）を仮定した換算:
 *   補正[dB]   = 10·log10(12·N_RB)        （RB内サブキャリア12本 × N_RB）
 *   RSRP[dBm]  = RSSI[dBm] − 10·log10(12·N_RB)
 *   RSRQ[dB]   = 10·log10(N_RB) + RSRP[dBm] − RSSI[dBm]   （3GPP TS 36.214 定義の対数形）
 * RSRQ ⇔ SINR（フルロード・干渉+雑音をRSSI残余とみなす一次近似）:
 *   ρ = 12·10^(RSRQ/10),  SINR[dB] = 10·log10(ρ/(1−ρ))    （ρ<1 が定義域）
 *   s = 10^(SINR/10),     RSRQ[dB] = 10·log10(s/(12·(1+s)))
 *
 * dB/線形: RSSI・RSRP は dBm（絶対電力）、RSRQ・SINR は dB（比）。ρ・s は線形（無次元）。
 * 適用条件: フルロード（全REでデータ送信）仮定の換算。部分負荷ではRSSIが下がるため
 * RSRP換算・SINR換算は悲観/楽観にずれる。良否判定の閾値はdata層が持ち、本libは変換のみ。
 * 出典: 3GPP TS 36.214 §5.1（RSRP/RSRQ定義）。
 */

import { dbToPowerRatio } from "./db";
import { assertFinite, assertPositiveFinite, RfError, RfErrorCode } from "./errors";

/** 1リソースブロック内のサブキャリア本数（LTE: 15kHz間隔×12本）。 */
export const SUBCARRIERS_PER_RESOURCE_BLOCK = 12;

/** フルロード時のRSRQ理論上限[dB] = −10·log10(12) ≈ −10.79dB。 */
export const FULL_LOAD_RSRQ_DB = -10 * Math.log10(SUBCARRIERS_PER_RESOURCE_BLOCK);

export type LteBandwidthEntry = {
  bandwidthMhz: number;
  resourceBlocks: number;
};

/** LTEチャネル帯域幅[MHz]とリソースブロック数の対応表（3GPP TS 36.101）。 */
export const LTE_RESOURCE_BLOCKS: readonly LteBandwidthEntry[] = [
  { bandwidthMhz: 1.4, resourceBlocks: 6 },
  { bandwidthMhz: 3, resourceBlocks: 15 },
  { bandwidthMhz: 5, resourceBlocks: 25 },
  { bandwidthMhz: 10, resourceBlocks: 50 },
  { bandwidthMhz: 15, resourceBlocks: 75 },
  { bandwidthMhz: 20, resourceBlocks: 100 }
];

/** LTE帯域幅[MHz] → リソースブロック数。表にない帯域幅は InvalidInput。 */
export function resourceBlocksForLteBandwidthMhz(bandwidthMhz: number): number {
  const entry = LTE_RESOURCE_BLOCKS.find((row) => row.bandwidthMhz === bandwidthMhz);
  if (!entry) {
    throw new RfError(RfErrorCode.InvalidInput, { field: "lte_bandwidth" });
  }
  return entry.resourceBlocks;
}

/** フルロード補正[dB] = 10·log10(12·N_RB)。RSSI→RSRP の差分。 */
export function fullLoadCorrectionDb(resourceBlocks: number): number {
  assertPositiveFinite(resourceBlocks, "resource_blocks");
  return 10 * Math.log10(SUBCARRIERS_PER_RESOURCE_BLOCK * resourceBlocks);
}

/** RSRP[dBm] = RSSI[dBm] − 10·log10(12·N_RB)（フルロード仮定）。 */
export function rsrpFromRssi(rssiDbm: number, resourceBlocks: number): number {
  assertFinite(rssiDbm, "rssi");
  return rssiDbm - fullLoadCorrectionDb(resourceBlocks);
}

/** RSSI[dBm] = RSRP[dBm] + 10·log10(12·N_RB)（フルロード仮定・逆変換）。 */
export function rssiFromRsrp(rsrpDbm: number, resourceBlocks: number): number {
  assertFinite(rsrpDbm, "rsrp");
  return rsrpDbm + fullLoadCorrectionDb(resourceBlocks);
}

/** RSRQ[dB] = 10·log10(N_RB) + RSRP[dBm] − RSSI[dBm]（実測値からの定義式）。 */
export function rsrqFromMeasurements(
  rsrpDbm: number,
  rssiDbm: number,
  resourceBlocks: number
): number {
  assertFinite(rsrpDbm, "rsrp");
  assertFinite(rssiDbm, "rssi");
  assertPositiveFinite(resourceBlocks, "resource_blocks");
  return 10 * Math.log10(resourceBlocks) + rsrpDbm - rssiDbm;
}

/**
 * RSRQ[dB] → SINR[dB]（フルロード近似）。ρ = 12·10^(RSRQ/10) が 1 以上
 * （RSRQ ≥ −10.79dB）では干渉+雑音が非正となり定義域外（OutOfDomain）。
 */
export function sinrFromRsrq(rsrqDb: number): number {
  assertFinite(rsrqDb, "rsrq");
  const rho = SUBCARRIERS_PER_RESOURCE_BLOCK * dbToPowerRatio(rsrqDb);
  if (rho >= 1) {
    throw new RfError(RfErrorCode.OutOfDomain, { field: "rsrq", max: FULL_LOAD_RSRQ_DB });
  }
  return 10 * Math.log10(rho / (1 - rho));
}

/** SINR[dB] → RSRQ[dB]（フルロード近似）。常に −10.79dB 未満を返す。 */
export function rsrqFromSinr(sinrDb: number): number {
  assertFinite(sinrDb, "sinr");
  const s = dbToPowerRatio(sinrDb);
  return 10 * Math.log10(s / (SUBCARRIERS_PER_RESOURCE_BLOCK * (1 + s)));
}
