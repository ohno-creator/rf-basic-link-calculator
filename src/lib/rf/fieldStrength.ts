/**
 * 電界強度・電力密度の純関数（遠方界・自由空間）。
 *
 * 送信源の EIRP と距離 r から、その地点の電力密度 S と電界強度 E を出す:
 *   S = EIRP / (4π r²)            [W/m²]
 *   E = √(η0 · S) = √(30·EIRP_W)/r [V/m]   (η0=376.73Ω)
 *   E[dBμV/m] = 20log10(E / 1e-6)
 * 周波数と受信アンテナ利得が分かれば受信電力も:
 *   Aeff = G λ²/(4π),  Prx = S · Aeff
 */

import { freeSpaceWavelengthM } from "./resonantElementLength";

/** 自由空間の固有インピーダンス[Ω]。 */
export const FREE_SPACE_IMPEDANCE = 376.730313668;

/** EIRP[dBm] → [W]。 */
export function eirpDbmToWatt(eirpDbm: number): number {
  if (!Number.isFinite(eirpDbm)) {
    throw new Error("eirpDbm must be finite");
  }
  return 10 ** ((eirpDbm - 30) / 10);
}

export type FieldStrengthInput = {
  eirpDbm: number;
  distanceM: number;
  /** 受信電力を出す場合のみ指定。 */
  frequencyMHz?: number;
  rxGainDbi?: number;
};

export type FieldStrengthResult = {
  /** 電力密度[W/m²]。 */
  powerDensityWm2: number;
  /** 電力密度[mW/cm²]（規制でよく使う単位）。 */
  powerDensityMwCm2: number;
  /** 電界強度[V/m]。 */
  eFieldVm: number;
  /** 電界強度[dBμV/m]。 */
  eFieldDbuVm: number;
  /** 受信電力[dBm]（周波数・受信利得を与えたときのみ）。 */
  receivedPowerDbm: number | null;
};

export function fieldStrengthAtDistance(input: FieldStrengthInput): FieldStrengthResult {
  const { eirpDbm, distanceM, frequencyMHz, rxGainDbi } = input;
  if (!Number.isFinite(distanceM) || distanceM <= 0) {
    throw new Error("distanceM must be > 0");
  }

  const eirpW = eirpDbmToWatt(eirpDbm);
  const powerDensityWm2 = eirpW / (4 * Math.PI * distanceM ** 2);
  const powerDensityMwCm2 = powerDensityWm2 * 1000 /* W→mW */ / 10_000 /* m²→cm² */;

  const eFieldVm = Math.sqrt(FREE_SPACE_IMPEDANCE * powerDensityWm2);
  const eFieldDbuVm = 20 * Math.log10(eFieldVm / 1e-6);

  let receivedPowerDbm: number | null = null;
  if (
    frequencyMHz !== undefined &&
    Number.isFinite(frequencyMHz) &&
    frequencyMHz > 0 &&
    rxGainDbi !== undefined &&
    Number.isFinite(rxGainDbi)
  ) {
    const wavelengthM = freeSpaceWavelengthM(frequencyMHz);
    const gainLinear = 10 ** (rxGainDbi / 10);
    const effectiveApertureM2 = (gainLinear * wavelengthM ** 2) / (4 * Math.PI);
    const receivedW = powerDensityWm2 * effectiveApertureM2;
    receivedPowerDbm = 10 * Math.log10(receivedW / 1e-3);
  }

  return {
    powerDensityWm2,
    powerDensityMwCm2,
    eFieldVm,
    eFieldDbuVm,
    receivedPowerDbm
  };
}
