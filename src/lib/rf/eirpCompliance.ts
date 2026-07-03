/**
 * EIRP（等価等方輻射電力）の算出と、規格上限に対する合否・余裕の判定エンジン。
 *
 *   EIRP[dBm] = Ptx[dBm] + Gant[dBi] − Lcable[dB]
 *   余裕[dB]  = 上限[dBm] − EIRP[dBm]        （余裕 ≥ 0 で合格＝上限以下）
 *
 * 920MHz帯（ARIB STD-T108）等の空中線電力・EIRP区分との照合に使う計算エンジン。
 * dB/線形: EIRP・余裕・上限は dB(dBm)、mW↔dBm 変換のみ線形を経由する。
 *
 * 適用条件: 本モジュールは純粋な算術エンジンであり、規格の上限値そのもの（区分・キャリアセンス・
 * 送信時間等）は持たない。規格数値は出典付きで data 層に分離し、eirpLimitDbm として渡す設計とする
 * （改定追随・一次規格確認を data 層に閉じるため）。
 */

import { assertFinite, assertNonNegative, assertPositiveFinite } from "./errors";

/** 電力[mW] → [dBm]。dBm = 10·log10(mW)。 */
export function dbmFromMilliwatt(milliwatt: number): number {
  assertPositiveFinite(milliwatt, "antenna_power");
  return 10 * Math.log10(milliwatt);
}

/** 電力[dBm] → [mW]。mW = 10^(dBm/10)。 */
export function milliwattFromDbm(dbm: number): number {
  assertFinite(dbm, "power_dbm");
  return Math.pow(10, dbm / 10);
}

/** EIRP[dBm] = Ptx[dBm] + Gant[dBi] − Lcable[dB]。 */
export function calculateEirpDbm(ptxDbm: number, antennaGainDbi: number, cableLossDb: number): number {
  assertFinite(ptxDbm, "ptx");
  assertFinite(antennaGainDbi, "antenna_gain");
  assertNonNegative(cableLossDb, "cable_loss");
  return ptxDbm + antennaGainDbi - cableLossDb;
}

/** 上限との余裕[dB]と合否（余裕≥0＝上限以下で合格）。 */
export function checkEirpCompliance(eirpDbm: number, eirpLimitDbm: number): { marginDb: number; pass: boolean } {
  assertFinite(eirpDbm, "eirp");
  assertFinite(eirpLimitDbm, "eirp_limit");
  const marginDb = eirpLimitDbm - eirpDbm;
  return { marginDb, pass: marginDb >= 0 };
}

export type EirpComplianceResult = {
  eirpDbm: number;
  eirpLimitDbm: number;
  marginDb: number;
  pass: boolean;
};

/** 送信電力・利得・損失・規格上限から EIRP・余裕・合否をまとめて評価する。 */
export function evaluateEirpCompliance(input: {
  ptxDbm: number;
  antennaGainDbi: number;
  cableLossDb: number;
  eirpLimitDbm: number;
}): EirpComplianceResult {
  const eirpDbm = calculateEirpDbm(input.ptxDbm, input.antennaGainDbi, input.cableLossDb);
  const { marginDb, pass } = checkEirpCompliance(eirpDbm, input.eirpLimitDbm);
  return { eirpDbm, eirpLimitDbm: input.eirpLimitDbm, marginDb, pass };
}
