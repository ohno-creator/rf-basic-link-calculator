/**
 * 電気長・位相長の相互変換（Track G10）。
 *
 * 伝送線路（同軸・マイクロストリップ等）内の管内波長 λg と、物理長 L の位相換算:
 *   λg[mm]        = VF · λ0[mm] = VF · (c / f) · 1000
 *   電気長 N[λ]    = L / λg
 *   位相 φ[deg]    = 360 · L / λg
 *   1mmあたり位相  = 360 / λg [deg/mm]
 *   長さ差→位相差  = Δφ = 360 · ΔL / λg（符号保持）
 *   許容位相→許容長 = ΔL_tol = λg · Δφ_tol / 360
 *   wrapped位相    = φ mod 360 を [0, 360) に正規化
 *
 * dB/線形: すべて線形量（dB量なし）。単位は f[MHz]・長さ[mm]・位相[deg]・VFは無次元(0..1]。
 * 適用条件: TEM/準TEM近似で VF が周波数に依らず一定とみなせる線路（同軸・短いマイクロストリップ等）。
 * 分散性の強い導波管等では VF が周波数依存となり本式は適用外。
 * 用途: 位相整合給電線・遅延線・分配器の等長配線設計と、長さ公差→位相誤差の見積り。
 */

import { assertFinite, assertNonNegative, assertPositiveFinite, RfError, RfErrorCode } from "./errors";
import { calculateWavelengthFromMHz } from "./frequency";

/** 速度係数 VF が 0 < vf ≤ 1 の有限値であることを要求する。 */
function assertVelocityFactor(velocityFactor: number): void {
  if (!Number.isFinite(velocityFactor) || velocityFactor <= 0 || velocityFactor > 1) {
    throw new RfError(RfErrorCode.OutOfDomain, { field: "velocity_factor", min: 0, max: 1 });
  }
}

/** 管内波長 λg[mm] = VF · (c / f) · 1000。 */
export function guidedWavelengthMm(frequencyMHz: number, velocityFactor: number): number {
  assertPositiveFinite(frequencyMHz, "frequency");
  assertVelocityFactor(velocityFactor);
  return velocityFactor * calculateWavelengthFromMHz(frequencyMHz) * 1000;
}

/** 1mm あたりの位相回転 [deg/mm] = 360 / λg。 */
export function phasePerMmDeg(frequencyMHz: number, velocityFactor: number): number {
  return 360 / guidedWavelengthMm(frequencyMHz, velocityFactor);
}

/** 物理長 L[mm] → 位相 φ[deg] = 360 · L / λg（wrapしない総位相）。 */
export function physicalLengthToPhaseDeg(
  lengthMm: number,
  frequencyMHz: number,
  velocityFactor: number
): number {
  assertNonNegative(lengthMm, "length");
  return (360 * lengthMm) / guidedWavelengthMm(frequencyMHz, velocityFactor);
}

/** 物理長 L[mm] → 電気長 N[λ] = L / λg。 */
export function physicalLengthToElectricalLengthLambda(
  lengthMm: number,
  frequencyMHz: number,
  velocityFactor: number
): number {
  assertNonNegative(lengthMm, "length");
  return lengthMm / guidedWavelengthMm(frequencyMHz, velocityFactor);
}

/** 位相 φ[deg] → 物理長 L[mm] = λg · φ / 360。 */
export function phaseDegToPhysicalLengthMm(
  phaseDeg: number,
  frequencyMHz: number,
  velocityFactor: number
): number {
  assertFinite(phaseDeg, "phase");
  return (guidedWavelengthMm(frequencyMHz, velocityFactor) * phaseDeg) / 360;
}

/** 長さ差 ΔL[mm] → 位相差 Δφ[deg] = 360 · ΔL / λg（符号保持）。 */
export function lengthDiffToPhaseDiffDeg(
  lengthDiffMm: number,
  frequencyMHz: number,
  velocityFactor: number
): number {
  assertFinite(lengthDiffMm, "length_diff");
  return (360 * lengthDiffMm) / guidedWavelengthMm(frequencyMHz, velocityFactor);
}

/** 許容位相誤差 Δφ_tol[deg] → 許容長さ公差 ΔL_tol[mm] = λg · Δφ_tol / 360。 */
export function phaseToleranceToLengthToleranceMm(
  phaseToleranceDeg: number,
  frequencyMHz: number,
  velocityFactor: number
): number {
  assertNonNegative(phaseToleranceDeg, "phase_tolerance");
  return (guidedWavelengthMm(frequencyMHz, velocityFactor) * phaseToleranceDeg) / 360;
}

/** 位相[deg]を [0, 360) に正規化する（負値・360超も扱う。-0 は +0 に正規化）。 */
export function wrappedPhaseDeg(phaseDeg: number): number {
  assertFinite(phaseDeg, "phase");
  const wrapped = ((phaseDeg % 360) + 360) % 360;
  // -0 を +0 に正規化（例: phase=-360 → (-0+360)%360 = 0 だが、防御的に統一する）。
  return wrapped === 0 ? 0 : wrapped;
}
