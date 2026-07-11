/**
 * アンテナ周囲のGND禁止領域（キープアウト）充足判定（Track G3）。
 *
 * W/H[mm]を各辺ごとに比較し、不足率 = max(0, required-available)/required。
 * 両辺充足はsuccess、最大不足率<20%はcaution、20%以上はdanger。
 * 寸法は線形値であり、面積比へ置換しない。一方の辺の余剰で他方の不足を相殺せず、
 * W/Hの自動回転もしない（アンテナ給電位置・基板端方向に依存するため）。
 */

import { assertNonNegative, assertPositiveFinite } from "./errors";

export type AntennaKeepoutRequirement = {
  requiredWidthMm: number;
  requiredHeightMm: number;
};

export type AntennaKeepoutStatus = "success" | "caution" | "danger";

export type AntennaKeepoutResult = {
  status: AntennaKeepoutStatus;
  widthShortfallMm: number;
  heightShortfallMm: number;
  widthShortfallRatio: number;
  heightShortfallRatio: number;
  maximumShortfallRatio: number;
};

export function evaluateAntennaKeepout(input: {
  availableWidthMm: number;
  availableHeightMm: number;
  requirement: AntennaKeepoutRequirement;
}): AntennaKeepoutResult {
  assertNonNegative(input.availableWidthMm, "available_width");
  assertNonNegative(input.availableHeightMm, "available_height");
  assertPositiveFinite(input.requirement.requiredWidthMm, "required_width");
  assertPositiveFinite(input.requirement.requiredHeightMm, "required_height");

  const widthShortfallMm = Math.max(
    0,
    input.requirement.requiredWidthMm - input.availableWidthMm
  );
  const heightShortfallMm = Math.max(
    0,
    input.requirement.requiredHeightMm - input.availableHeightMm
  );
  const widthShortfallRatio = widthShortfallMm / input.requirement.requiredWidthMm;
  const heightShortfallRatio = heightShortfallMm / input.requirement.requiredHeightMm;
  const maximumShortfallRatio = Math.max(widthShortfallRatio, heightShortfallRatio);
  const status: AntennaKeepoutStatus =
    maximumShortfallRatio === 0
      ? "success"
      : maximumShortfallRatio < 0.2
        ? "caution"
        : "danger";

  return {
    status,
    widthShortfallMm: widthShortfallMm === 0 ? 0 : widthShortfallMm,
    heightShortfallMm: heightShortfallMm === 0 ? 0 : heightShortfallMm,
    widthShortfallRatio: widthShortfallRatio === 0 ? 0 : widthShortfallRatio,
    heightShortfallRatio: heightShortfallRatio === 0 ? 0 : heightShortfallRatio,
    maximumShortfallRatio: maximumShortfallRatio === 0 ? 0 : maximumShortfallRatio
  };
}
