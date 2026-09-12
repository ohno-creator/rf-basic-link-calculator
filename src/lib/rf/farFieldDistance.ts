/**
 * 遠方界距離（測定距離の目安）の純関数。
 *
 * アンテナ最大寸法 D と波長 λ から、電磁界の3領域境界を出す:
 *  - 反応近傍界の上限:      r < 0.62·√(D³/λ)
 *  - 放射近傍界（フレネル）: 0.62·√(D³/λ) ≤ r < 2D²/λ
 *  - 遠方界（フラウンホーファ）: r ≥ 2D²/λ
 * ただし遠方界は 2D²/λ に加え r≫λ・r≫D も要件で、電気的に小さいアンテナ
 * （D<λ）では 2D²/λ が過小になり、実質 r≳数λ が支配的になる。ここでは
 * 実用の測定距離目安を max(2D²/λ, 3λ, 反応近傍上限) として返す。
 */

import { freeSpaceWavelengthM } from "./resonantElementLength";

export type FarFieldInput = {
  frequencyMHz: number;
  /** アンテナの最大寸法 D[m]。 */
  dimensionM: number;
};

export type FarFieldResult = {
  wavelengthM: number;
  /** 反応近傍界の上限 0.62·√(D³/λ)[m]。 */
  reactiveNearFieldLimitM: number;
  /** 遠方界の開始 2D²/λ[m]（生値）。 */
  fraunhoferDistanceM: number;
  /** 実用の測定距離目安 max(2D²/λ, 3λ, 反応近傍上限)[m]。 */
  recommendedFarFieldM: number;
  /** D<λ の電気的に小さいアンテナか。 */
  electricallySmall: boolean;
  /** 実用目安を決めた支配要因。 */
  dominantCriterion: "fraunhofer" | "wavelength" | "reactive";
};

export function farFieldDistance(input: FarFieldInput): FarFieldResult {
  const { frequencyMHz, dimensionM } = input;
  if (!Number.isFinite(dimensionM) || dimensionM <= 0) {
    throw new Error("dimensionM must be > 0");
  }
  const wavelengthM = freeSpaceWavelengthM(frequencyMHz);

  const reactiveNearFieldLimitM = 0.62 * Math.sqrt((dimensionM ** 3) / wavelengthM);
  const fraunhoferDistanceM = (2 * dimensionM ** 2) / wavelengthM;
  const wavelengthFloorM = 3 * wavelengthM;

  const recommendedFarFieldM = Math.max(fraunhoferDistanceM, wavelengthFloorM, reactiveNearFieldLimitM);
  let dominantCriterion: FarFieldResult["dominantCriterion"] = "fraunhofer";
  if (recommendedFarFieldM === reactiveNearFieldLimitM) {
    dominantCriterion = "reactive";
  } else if (recommendedFarFieldM === wavelengthFloorM) {
    dominantCriterion = "wavelength";
  }

  return {
    wavelengthM,
    reactiveNearFieldLimitM,
    fraunhoferDistanceM,
    recommendedFarFieldM,
    electricallySmall: dimensionM < wavelengthM,
    dominantCriterion
  };
}
