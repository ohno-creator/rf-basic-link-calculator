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

/**
 * ナイフエッジ回折損失[dB]（ITU-R P.526 の近似式）。
 * v は回折パラメータ。v<=-0.78 ではほぼ損失なし。
 */
export function knifeEdgeDiffractionLossDb(v: number): number {
  if (!Number.isFinite(v) || v <= -0.78) {
    return 0;
  }
  const loss = 6.9 + 20 * Math.log10(Math.sqrt((v - 0.1) ** 2 + 1) + v - 0.1);
  return Math.max(0, loss);
}

export type ObstacleVerdict = "clear" | "caution" | "blocked";

export type ObstacleAnalysis = {
  d1Km: number;
  d2Km: number;
  firstZoneRadiusM: number;
  /** 障害物位置での見通し線(LOS)の地上高[m]。 */
  losHeightM: number;
  obstacleHeightM: number;
  /** LOS高 − 障害物高[m]（正＝障害物はLOSより下）。 */
  clearanceM: number;
  /** クリアランス ÷ 第1フレネル半径（0.6以上で実務上クリア）。 */
  clearanceRatio: number;
  /** ナイフエッジ回折パラメータ v。 */
  diffractionParamV: number;
  diffractionLossDb: number;
  verdict: ObstacleVerdict;
};

/**
 * 送受信アンテナ高と障害物の高さ・位置から、第1フレネルゾーンへの食い込み具合と
 * ナイフエッジ回折損失を求める。
 *
 * 設計上の整合性: v = -(clearance/r1)×√2 が成り立つため、
 *   「60%クリアランス(ratio=0.6)」⇔「v≈-0.85」⇔「回折損失≈0dB」
 * とフレネルゾーンの実務則と回折モデルが一致する。
 */
export function analyzeObstacle(
  frequencyMHz: number,
  totalDistanceKm: number,
  positionRatio: number,
  txHeightM: number,
  rxHeightM: number,
  obstacleHeightM: number
): ObstacleAnalysis {
  assertPositiveFinite(frequencyMHz, "周波数");
  assertPositiveFinite(totalDistanceKm, "通信距離");

  if (!Number.isFinite(positionRatio) || positionRatio <= 0 || positionRatio >= 1) {
    throw new Error("障害物の位置は0より大きく1未満の割合で指定してください。");
  }
  if (!Number.isFinite(txHeightM) || txHeightM < 0) {
    throw new Error("送信アンテナ高は0以上で入力してください。");
  }
  if (!Number.isFinite(rxHeightM) || rxHeightM < 0) {
    throw new Error("受信アンテナ高は0以上で入力してください。");
  }
  if (!Number.isFinite(obstacleHeightM) || obstacleHeightM < 0) {
    throw new Error("障害物の高さは0以上で入力してください。");
  }

  const d1Km = totalDistanceKm * positionRatio;
  const d2Km = totalDistanceKm * (1 - positionRatio);
  const firstZoneRadiusM = fresnelRadiusM(frequencyMHz, d1Km, d2Km, 1);

  const losHeightM = txHeightM + (rxHeightM - txHeightM) * positionRatio;
  const clearanceM = losHeightM - obstacleHeightM;
  const clearanceRatio = clearanceM / firstZoneRadiusM;
  const diffractionParamV = -clearanceRatio * Math.SQRT2;
  const diffractionLossDb = knifeEdgeDiffractionLossDb(diffractionParamV);

  let verdict: ObstacleVerdict;
  if (clearanceRatio >= 0.6) {
    verdict = "clear";
  } else if (clearanceRatio >= 0) {
    verdict = "caution";
  } else {
    verdict = "blocked";
  }

  return {
    d1Km,
    d2Km,
    firstZoneRadiusM,
    losHeightM,
    obstacleHeightM,
    clearanceM,
    clearanceRatio,
    diffractionParamV,
    diffractionLossDb,
    verdict
  };
}
