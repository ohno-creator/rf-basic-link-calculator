/**
 * 降雨減衰（ITU-R P.838-3）と大気ガス減衰（ITU-R P.676-13）。
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
 * 大気ガス減衰は P.676-13 Annex 1 の線ごとの計算法を同じモジュールで扱う。
 *
 * 出典: Recommendation ITU-R P.838-3, Table 5 と式(1)(4)(5)、
 *       Recommendation ITU-R P.676-13, Annex 1, Table 1/2 と式(1)〜(9)。
 */

import { P838_RAIN_COEFFICIENTS } from "@/data/rainAttenuationCoefficients";
import {
  P676_OXYGEN_LINES,
  P676_WATER_VAPOUR_LINES,
  type SpectroscopicLine
} from "@/data/gaseousAttenuationSpectroscopy";
import { assertFinite, assertNonNegative, assertPositiveFinite, RfError, RfErrorCode } from "./errors";

/** P.676-13 Annex 1 の適用周波数域[GHz]。 */
export const P676_GAS_MIN_FREQ_GHZ = 1;
export const P676_GAS_MAX_FREQ_GHZ = 1000;

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

const STANDARD_TOTAL_PRESSURE_HPA = 1013.25;
const STANDARD_TEMPERATURE_K = 288.15;

function assertGasFrequency(frequencyGHz: number): void {
  if (!Number.isFinite(frequencyGHz) || frequencyGHz < P676_GAS_MIN_FREQ_GHZ) {
    throw new RfError(RfErrorCode.BelowMinimum, { field: "frequency", min: P676_GAS_MIN_FREQ_GHZ });
  }
  if (frequencyGHz > P676_GAS_MAX_FREQ_GHZ) {
    throw new RfError(RfErrorCode.TooLarge, { field: "frequency", max: P676_GAS_MAX_FREQ_GHZ });
  }
}

function lineShape(
  frequencyGHz: number,
  lineFrequencyGHz: number,
  lineWidthGHz: number,
  interferenceCorrection: number
): number {
  const lowerOffset = lineFrequencyGHz - frequencyGHz;
  const upperOffset = lineFrequencyGHz + frequencyGHz;
  return (
    (frequencyGHz / lineFrequencyGHz) *
    ((lineWidthGHz - interferenceCorrection * lowerOffset) /
      (lowerOffset ** 2 + lineWidthGHz ** 2) +
      (lineWidthGHz - interferenceCorrection * upperOffset) /
        (upperOffset ** 2 + lineWidthGHz ** 2))
  );
}

function oxygenRefractivity(
  frequencyGHz: number,
  dryAirPressureHpa: number,
  waterVapourPressureHpa: number,
  theta: number
): number {
  const lineSum = P676_OXYGEN_LINES.reduce((sum, [f0, a1, a2, a3, a4, a5, a6]: SpectroscopicLine) => {
    const strength = a1 * 1e-7 * dryAirPressureHpa * theta ** 3 * Math.exp(a2 * (1 - theta));
    const baseWidth =
      a3 *
      1e-4 *
      (dryAirPressureHpa * theta ** (0.8 - a4) + 1.1 * waterVapourPressureHpa * theta);
    const width = Math.sqrt(baseWidth ** 2 + 2.25e-6);
    const correction =
      (a5 + a6 * theta) *
      1e-4 *
      (dryAirPressureHpa + waterVapourPressureHpa) *
      theta ** 0.8;
    return sum + strength * lineShape(frequencyGHz, f0, width, correction);
  }, 0);

  // P.676-13 式(8)(9): 酸素Debyeスペクトルと圧力誘起窒素の連続吸収。
  const debyeWidth =
    5.6e-4 * (dryAirPressureHpa + waterVapourPressureHpa) * theta ** 0.8;
  const dryContinuum =
    frequencyGHz *
    dryAirPressureHpa *
    theta ** 2 *
    (6.14e-5 / (debyeWidth * (1 + (frequencyGHz / debyeWidth) ** 2)) +
      (1.4e-12 * dryAirPressureHpa * theta ** 1.5) /
        (1 + 1.9e-5 * frequencyGHz ** 1.5));
  return lineSum + dryContinuum;
}

function waterVapourRefractivity(
  frequencyGHz: number,
  dryAirPressureHpa: number,
  waterVapourPressureHpa: number,
  theta: number
): number {
  return P676_WATER_VAPOUR_LINES.reduce(
    (sum, [f0, b1, b2, b3, b4, b5, b6]: SpectroscopicLine) => {
      const strength =
        b1 * 0.1 * waterVapourPressureHpa * theta ** 3.5 * Math.exp(b2 * (1 - theta));
      const baseWidth =
        b3 *
        1e-4 *
        (dryAirPressureHpa * theta ** b4 + b5 * waterVapourPressureHpa * theta ** b6);
      const width = Math.sqrt(baseWidth ** 2 + (2.1316e-12 * f0 ** 2) / theta);
      return sum + strength * lineShape(frequencyGHz, f0, width, 0);
    },
    0
  );
}

/**
 * 標準地表条件での大気ガス特性減衰 γ_gas[dB/km]（P.676-13 Annex 1 式(1)〜(9)）。
 *
 * 全気圧=1013.25hPa、温度=288.15K（15℃）、既定水蒸気密度=7.5g/m³。
 * 一様な地上経路なら A_gas[dB] = γ_gas[dB/km] × d[km]。高度方向の気圧・温度・湿度変化を
 * 含む斜め経路には、そのまま乗算せず P.676 の高度積分を使う必要がある。
 */
export function gaseousSpecificAttenuationDbPerKm(
  frequencyGHz: number,
  waterVapourDensityGPerM3 = 7.5
): number {
  assertGasFrequency(frequencyGHz);
  assertNonNegative(waterVapourDensityGPerM3, "water_vapour_density");

  const theta = 300 / STANDARD_TEMPERATURE_K;
  // P.676-13 式(4): e[hPa] = ρ[g/m³]·T[K] / 216.7。
  const waterVapourPressureHpa =
    (waterVapourDensityGPerM3 * STANDARD_TEMPERATURE_K) / 216.7;
  if (waterVapourPressureHpa >= STANDARD_TOTAL_PRESSURE_HPA) {
    throw new RfError(RfErrorCode.TooLarge, { field: "water_vapour_density" });
  }
  const dryAirPressureHpa = STANDARD_TOTAL_PRESSURE_HPA - waterVapourPressureHpa;
  const oxygen = oxygenRefractivity(
    frequencyGHz,
    dryAirPressureHpa,
    waterVapourPressureHpa,
    theta
  );
  const waterVapour = waterVapourRefractivity(
    frequencyGHz,
    dryAirPressureHpa,
    waterVapourPressureHpa,
    theta
  );
  return 0.182 * frequencyGHz * (oxygen + waterVapour);
}

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
