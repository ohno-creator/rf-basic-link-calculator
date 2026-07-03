import { assertNonNegative, assertPositiveFinite, RfError, RfErrorCode } from "./errors";
import { SPEED_OF_LIGHT_M_PER_S } from "./frequency";

/** IUGG 平均地球半径[m]（曲率降下・電波見通し距離の基準）。 */
export const EARTH_RADIUS_M = 6_371_000;

/**
 * 電波見通し距離の慣用係数[km/√m]。d[km] = 4.12·(√h1[m]+√h2[m])。
 * 4.12 = √(2·(4/3)·R_earth)/1000 の慣用丸め値（標準大気 k=4/3）。幾何見通し(k=1)は 3.57。
 */
const RADIO_HORIZON_COEFF_KM = 4.12;

/**
 * フレネルゾーン半径の計算。
 *
 *   r_n = sqrt( n × λ × d1 × d2 / (d1 + d2) )   [m]
 *
 * λは波長[m]、d1/d2は障害物位置から送受信点までの距離[m]。
 * 見通し通信では第1フレネルゾーン（n=1）の60%以上を障害物から空けることが目安。
 */

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
  assertPositiveFinite(frequencyMHz, "frequency");
  assertPositiveFinite(totalDistanceKm, "distance");

  if (!Number.isFinite(positionRatio) || positionRatio <= 0 || positionRatio >= 1) {
    throw new RfError(RfErrorCode.OutOfDomain, { field: "position_ratio" });
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
  /** 障害物位置での見通し線(LOS)の地上高[m]。曲率補正時は降下分を控除済み。 */
  losHeightM: number;
  /** 地球曲率による見通し線の降下[m]。options.earthCurvatureK 未指定時は 0。 */
  curvatureDropM: number;
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

/** 地球曲率補正のオプション。 */
export type EarthCurvatureOptions = {
  /** 等価地球半径係数 k（標準大気は 4/3）。未指定なら曲率補正なし（従来動作）。 */
  earthCurvatureK?: number;
};

/**
 * options.earthCurvatureK 指定時のみ、地球曲率による見通し線の降下[m]を返す（未指定は0）。
 *   降下 ≈ d1·d2 / (2·k·R_earth)   （弦-弧近似、R_eff = k·R_earth）
 */
function resolveCurvatureDropM(d1Km: number, d2Km: number, options?: EarthCurvatureOptions): number {
  if (options?.earthCurvatureK === undefined) {
    return 0;
  }
  assertPositiveFinite(options.earthCurvatureK, "earth_curvature_k");
  const d1M = d1Km * 1000;
  const d2M = d2Km * 1000;
  return (d1M * d2M) / (2 * options.earthCurvatureK * EARTH_RADIUS_M);
}

/**
 * 送受信アンテナ高と障害物の高さ・位置から、第1フレネルゾーンへの食い込み具合と
 * ナイフエッジ回折損失を求める。
 *
 * 設計上の整合性: v = -(clearance/r1)×√2 が成り立つため、
 *   「60%クリアランス(ratio=0.6)」⇔「v≈-0.85」⇔「回折損失≈0dB」
 * とフレネルゾーンの実務則と回折モデルが一致する。
 *
 * options.earthCurvatureK を渡すと地球曲率による見通し線の降下を控除する（長距離モード）。
 * 未指定時は従来どおり曲率補正なし（後方互換）。
 */
export function analyzeObstacle(
  frequencyMHz: number,
  totalDistanceKm: number,
  positionRatio: number,
  txHeightM: number,
  rxHeightM: number,
  obstacleHeightM: number,
  options?: EarthCurvatureOptions
): ObstacleAnalysis {
  assertPositiveFinite(frequencyMHz, "frequency");
  assertPositiveFinite(totalDistanceKm, "distance");

  if (!Number.isFinite(positionRatio) || positionRatio <= 0 || positionRatio >= 1) {
    throw new RfError(RfErrorCode.OutOfDomain, { field: "position_ratio" });
  }
  assertNonNegative(txHeightM, "tx_height");
  assertNonNegative(rxHeightM, "rx_height");
  assertNonNegative(obstacleHeightM, "obstacle_height");

  const d1Km = totalDistanceKm * positionRatio;
  const d2Km = totalDistanceKm * (1 - positionRatio);
  const firstZoneRadiusM = fresnelRadiusM(frequencyMHz, d1Km, d2Km, 1);

  const curvatureDropM = resolveCurvatureDropM(d1Km, d2Km, options);
  const losHeightM = txHeightM + (rxHeightM - txHeightM) * positionRatio - curvatureDropM;
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
    curvatureDropM,
    obstacleHeightM,
    clearanceM,
    clearanceRatio,
    diffractionParamV,
    diffractionLossDb,
    verdict
  };
}

/**
 * 電波見通し距離[km]。標準大気(k=4/3)での2アンテナ間の見通し限界。
 *   d[km] = 4.12·(√h1[m] + √h2[m])
 * 幾何見通し（屈折なし k=1）なら係数は 3.57。フレネルゾーン確保とは別の「幾何的に届くか」の目安。
 */
export function radioHorizonKm(antennaHeight1M: number, antennaHeight2M: number): number {
  assertNonNegative(antennaHeight1M, "antenna_height_1");
  assertNonNegative(antennaHeight2M, "antenna_height_2");
  return RADIO_HORIZON_COEFF_KM * (Math.sqrt(antennaHeight1M) + Math.sqrt(antennaHeight2M));
}
