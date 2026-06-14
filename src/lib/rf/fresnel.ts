import { SPEED_OF_LIGHT_M_PER_S } from "./frequency";

/**
 * フレネルゾーン半径の計算。
 *
 *   r_n = sqrt( n × λ × d1 × d2 / (d1 + d2) )   [m]
 *
 * λは波長[m]、d1/d2は障害物位置から送受信点までの距離[m]。
 * 見通し通信では第1フレネルゾーン（n=1）の60%以上を障害物から空けることが目安。
 */

function assertPositiveFinite(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label}は0より大きい値を入力してください。`);
  }
}

export function fresnelRadiusM(
  frequencyMHz: number,
  d1Km: number,
  d2Km: number,
  zone = 1
): number {
  assertPositiveFinite(frequencyMHz, "周波数");
  assertPositiveFinite(d1Km, "送信側までの距離");
  assertPositiveFinite(d2Km, "受信側までの距離");
  assertPositiveFinite(zone, "フレネルゾーン次数");

  const wavelengthM = SPEED_OF_LIGHT_M_PER_S / (frequencyMHz * 1_000_000);
  const d1M = d1Km * 1000;
  const d2M = d2Km * 1000;

  return Math.sqrt((zone * wavelengthM * d1M * d2M) / (d1M + d2M));
}

export type FresnelResult = {
  wavelengthM: number;
  firstZoneRadiusM: number;
  clearance60M: number;
};

/**
 * 全距離と障害物位置（送信側からの割合 0〜1）から、その地点の
 * 第1フレネルゾーン半径と60%クリアランスを求める。
 */
export function calculateFresnel(
  frequencyMHz: number,
  totalDistanceKm: number,
  positionRatio = 0.5
): FresnelResult {
  assertPositiveFinite(frequencyMHz, "周波数");
  assertPositiveFinite(totalDistanceKm, "通信距離");

  if (!Number.isFinite(positionRatio) || positionRatio <= 0 || positionRatio >= 1) {
    throw new Error("障害物の位置は0より大きく1未満の割合で指定してください。");
  }

  const d1Km = totalDistanceKm * positionRatio;
  const d2Km = totalDistanceKm * (1 - positionRatio);
  const firstZoneRadiusM = fresnelRadiusM(frequencyMHz, d1Km, d2Km, 1);

  return {
    wavelengthM: SPEED_OF_LIGHT_M_PER_S / (frequencyMHz * 1_000_000),
    firstZoneRadiusM,
    clearance60M: firstZoneRadiusM * 0.6
  };
}
