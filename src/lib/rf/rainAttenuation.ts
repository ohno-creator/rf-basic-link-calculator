/**
 * 降雨減衰（ITU-R P.838-3 簡易）。
 *
 *   特性降雨減衰 γ_R[dB/km] = k · R^α          （R は降雨強度[mm/h]）
 *   全経路減衰   A_rain[dB]  = γ_R · d[km] · r  （r は実効距離係数、簡易では r=1）
 *
 * k, α は周波数・偏波で決まる係数（P.838-3 Table 5、data層に一次転記）。偏波（水平/垂直/円）と
 * 経路仰角は式(4)(5)で実効 k, α に合成する。周波数間は P.838 の補間規則（k は log-log、α は
 * log(周波数)-線形）で補間する。
 *
 * dB/線形: γ_R・A_rain は dB（リンクバジェットに加算）、R・d は線形、k・α は無次元。
 * 適用条件: 5GHz以上が主対象。3GHz未満（Sub-GHz IoT/LoRa等）では降雨減衰は実質ゼロ
 * （1GHz/R=25mm/hで約0.0006dB/km）。P.838-3 の適用域は 1〜1000 GHz。
 * 大気ガス減衰（P.676）は本モジュール対象外（別途）。
 *
 * 出典: Recommendation ITU-R P.838-3, Table 5 と式(1)(4)(5)。
 */

import { P838_RAIN_COEFFICIENTS } from "@/data/rainAttenuationCoefficients";
import { assertFinite, assertNonNegative, assertPositiveFinite, RfError, RfErrorCode } from "./errors";

/** P.838-3 の適用周波数域[GHz]。 */
export const P838_RAIN_MIN_FREQ_GHZ = 1;
export const P838_RAIN_MAX_FREQ_GHZ = 1000;

export type RainPolarization = "horizontal" | "vertical" | "circular";

export type RainCoefficients = { k: number; alpha: number };

export type RainGeometry = {
  /** 偏波（既定は水平）。tiltDeg 指定時はそちらが優先。 */
  polarization?: RainPolarization;
  /** 偏波傾斜角[度]（水平基準）。水平=0, 垂直=90, 円=45。 */
  tiltDeg?: number;
  /** 経路仰角[度]（既定0）。 */
  elevationDeg?: number;
};

type BaseCoefficients = { kH: number; alphaH: number; kV: number; alphaV: number };

function assertRainFrequency(frequencyGHz: number): void {
  if (!Number.isFinite(frequencyGHz) || frequencyGHz < P838_RAIN_MIN_FREQ_GHZ) {
    throw new RfError(RfErrorCode.BelowMinimum, { field: "frequency", min: P838_RAIN_MIN_FREQ_GHZ });
  }
  if (frequencyGHz > P838_RAIN_MAX_FREQ_GHZ) {
    throw new RfError(RfErrorCode.TooLarge, { field: "frequency", max: P838_RAIN_MAX_FREQ_GHZ });
  }
}

/**
 * Table 5 を周波数補間した基礎係数（kH, αH, kV, αV）。
 * 補間規則: k は log-log、α は log(周波数)-線形。表に存在する周波数は厳密一致。
 */
export function rainBaseCoefficients(frequencyGHz: number): BaseCoefficients {
  assertRainFrequency(frequencyGHz);
  const table = P838_RAIN_COEFFICIENTS;

  // 端点・厳密一致。
  if (frequencyGHz <= table[0].frequencyGHz) {
    const r = table[0];
    return { kH: r.kH, alphaH: r.alphaH, kV: r.kV, alphaV: r.alphaV };
  }
  const last = table[table.length - 1];
  if (frequencyGHz >= last.frequencyGHz) {
    return { kH: last.kH, alphaH: last.alphaH, kV: last.kV, alphaV: last.alphaV };
  }

  // 表に存在する周波数は補間の丸め誤差を避けて厳密一致を返す。
  const exact = table.find((r) => r.frequencyGHz === frequencyGHz);
  if (exact) {
    return { kH: exact.kH, alphaH: exact.alphaH, kV: exact.kV, alphaV: exact.alphaV };
  }

  let lo = table[0];
  let hi = last;
  for (let i = 0; i < table.length - 1; i += 1) {
    if (frequencyGHz >= table[i].frequencyGHz && frequencyGHz <= table[i + 1].frequencyGHz) {
      lo = table[i];
      hi = table[i + 1];
      break;
    }
  }

  // 周波数は log スケールで内挿点 t を取る。
  const t = (Math.log(frequencyGHz) - Math.log(lo.frequencyGHz)) / (Math.log(hi.frequencyGHz) - Math.log(lo.frequencyGHz));
  const logLerp = (a: number, b: number) => Math.exp(Math.log(a) + t * (Math.log(b) - Math.log(a)));
  const lerp = (a: number, b: number) => a + t * (b - a);
  return {
    kH: logLerp(lo.kH, hi.kH),
    alphaH: lerp(lo.alphaH, hi.alphaH),
    kV: logLerp(lo.kV, hi.kV),
    alphaV: lerp(lo.alphaV, hi.alphaV)
  };
}

/** 偏波→傾斜角[度]（水平=0, 垂直=90, 円=45）。 */
const POLARIZATION_TILT_DEG: Record<RainPolarization, number> = {
  horizontal: 0,
  vertical: 90,
  circular: 45
};

function resolveTiltDeg(geometry?: RainGeometry): number {
  if (geometry?.tiltDeg !== undefined) {
    assertFinite(geometry.tiltDeg, "tilt");
    return geometry.tiltDeg;
  }
  const polarization = geometry?.polarization ?? "horizontal";
  const tilt = POLARIZATION_TILT_DEG[polarization];
  if (tilt === undefined) {
    throw new RfError(RfErrorCode.InvalidInput, { field: "polarization" });
  }
  return tilt;
}

/**
 * 偏波・仰角を適用した実効係数 k, α（P.838-3 式(4)(5)）。
 *   k = [kH + kV + (kH−kV)·cos²θ·cos2τ] / 2
 *   α = [kH·αH + kV·αV + (kH·αH − kV·αV)·cos²θ·cos2τ] / (2k)
 */
export function rainCoefficients(frequencyGHz: number, geometry?: RainGeometry): RainCoefficients {
  const { kH, alphaH, kV, alphaV } = rainBaseCoefficients(frequencyGHz);
  const tiltDeg = resolveTiltDeg(geometry);
  const elevationDeg = geometry?.elevationDeg ?? 0;
  assertFinite(elevationDeg, "elevation");

  const theta = (elevationDeg * Math.PI) / 180;
  const tau = (tiltDeg * Math.PI) / 180;
  const factor = Math.cos(theta) ** 2 * Math.cos(2 * tau);

  const k = (kH + kV + (kH - kV) * factor) / 2;
  const alpha = (kH * alphaH + kV * alphaV + (kH * alphaH - kV * alphaV) * factor) / (2 * k);
  return { k, alpha };
}

/** 特性降雨減衰 γ_R[dB/km] = k·R^α。R=0 は 0 を返す。 */
export function rainSpecificAttenuationDbPerKm(
  rainRateMmPerH: number,
  frequencyGHz: number,
  geometry?: RainGeometry
): number {
  assertNonNegative(rainRateMmPerH, "rain_rate");
  const { k, alpha } = rainCoefficients(frequencyGHz, geometry);
  return k * Math.pow(rainRateMmPerH, alpha);
}

/** 全経路降雨減衰 A_rain[dB] = γ_R·d·r。effectiveDistanceFactor 既定=1（実距離）。 */
export function rainPathAttenuationDb(
  rainRateMmPerH: number,
  frequencyGHz: number,
  distanceKm: number,
  options?: RainGeometry & { effectiveDistanceFactor?: number }
): number {
  assertPositiveFinite(distanceKm, "distance");
  const factor = options?.effectiveDistanceFactor ?? 1;
  assertPositiveFinite(factor, "effective_distance_factor");
  return rainSpecificAttenuationDbPerKm(rainRateMmPerH, frequencyGHz, options) * distanceKm * factor;
}
