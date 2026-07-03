/**
 * 偏波不整合損失（Polarization Mismatch Loss）。
 *
 * 送受信アンテナの偏波が一致しないと、受信電力が偏波損失係数 PLF 分だけ低下する。
 *   直線-直線: PLF = cos²θ            → 損失[dB] = −10·log10(cos²θ) = −20·log10|cosθ|
 *   直線⇔円:  PLF = 1/2（角度に依存しない）→ 損失[dB] = 10·log10(2) ≈ 3.01dB
 *   円-円 同旋: PLF = 1 → 0dB ／ 逆旋: PLF = 0 → 理論上 ∞（実機は交差偏波識別度で有限）
 *
 * θ は2つの直線偏波間の傾き角[度]で、定義域は 0°〜90°。
 * dB/線形: PLF は線形（無次元 0..1）、損失は dB。
 * 適用条件: 理想偏波（軸比=∞の完全直線／完全円）を仮定した第1段。実アンテナの軸比(AR)を
 * 考慮した一般式は第2段（未実装）。逆旋円-円の「∞」は理論値で、実機は XPD 次第で20dB超程度。
 *
 * 出典: C. A. Balanis, Antenna Theory §2.12（PLF=|ρ̂_w·ρ̂_a|²）／
 *       N. Nikolova, McMaster ECE L05 Polarization（LP↔CP は角度に依らず PLF=0.5=−3dB）。
 */

import { assertFinite, RfError, RfErrorCode } from "./errors";

export type PolarizationKind = "linear" | "circular";

/** 円偏波同士の旋回の一致（co=同旋 RHCP-RHCP等 / cross=逆旋 RHCP-LHCP）。 */
export type CircularSense = "co" | "cross";

/** 直線⇔円の偏波損失[dB] = 10·log10(2)。傾き角に依らず一定。 */
export const LINEAR_CIRCULAR_MISMATCH_LOSS_DB = 10 * Math.log10(2);

/** 表示用クランプの提案値[dB]。純関数は理論どおり∞を返し、UI側で「≥40dB」等に丸める。 */
export const POLARIZATION_LOSS_DISPLAY_CAP_DB = 40;

/** 傾き角[度]が 0〜90 の有限値であることを要求する。 */
function assertPolarizationAngle(angleDeg: number): void {
  assertFinite(angleDeg, "polarization_angle");
  if (angleDeg < 0) {
    throw new RfError(RfErrorCode.Negative, { field: "polarization_angle" });
  }
  if (angleDeg > 90) {
    throw new RfError(RfErrorCode.TooLarge, { field: "polarization_angle", max: 90 });
  }
}

/** 直線-直線の偏波損失係数 PLF = cos²θ（線形・無次元 0..1）。 */
export function polarizationLossFactorLinear(angleDeg: number): number {
  assertPolarizationAngle(angleDeg);
  const cos = Math.cos((angleDeg * Math.PI) / 180);
  return cos * cos;
}

/** 直線-直線の偏波不整合損失[dB] = −20·log10|cosθ|。θ=90°は理論∞を返す。 */
export function linearLinearMismatchLossDb(angleDeg: number): number {
  assertPolarizationAngle(angleDeg);
  // cos(90°) は丸め残差 6.12e-17 となり素の式では約324dBになるため、直交は明示的に∞を返す。
  if (angleDeg === 90) {
    return Number.POSITIVE_INFINITY;
  }
  const loss = -20 * Math.log10(Math.abs(Math.cos((angleDeg * Math.PI) / 180)));
  // θ=0°で −0 になるのを +0 に正規化（-0 === 0 は true のためこの分岐で +0 を返す）。
  return loss === 0 ? 0 : loss;
}

/** 円-円の偏波不整合損失[dB]。co(同旋)=0dB、cross(逆旋)=理論∞。 */
export function circularCircularMismatchLossDb(sense: CircularSense): number {
  if (sense === "co") {
    return 0;
  }
  if (sense === "cross") {
    return Number.POSITIVE_INFINITY;
  }
  throw new RfError(RfErrorCode.InvalidInput, { field: "polarization_sense" });
}

/** 送受信の偏波組み合わせを表す入力。 */
export type PolarizationMismatchInput =
  | { tx: "linear"; rx: "linear"; angleDeg: number }
  | { tx: "linear"; rx: "circular" }
  | { tx: "circular"; rx: "linear" }
  | { tx: "circular"; rx: "circular"; sense: CircularSense };

/** 偏波組み合わせに応じた不整合損失[dB]を返す統合ディスパッチ。 */
export function calculatePolarizationMismatchLossDb(input: PolarizationMismatchInput): number {
  if (input.tx === "linear" && input.rx === "linear") {
    return linearLinearMismatchLossDb(input.angleDeg);
  }
  if (input.tx === "circular" && input.rx === "circular") {
    return circularCircularMismatchLossDb(input.sense);
  }
  // 直線⇔円（どちらの向きでも）は角度に依らず一定。
  if (
    (input.tx === "linear" && input.rx === "circular") ||
    (input.tx === "circular" && input.rx === "linear")
  ) {
    return LINEAR_CIRCULAR_MISMATCH_LOSS_DB;
  }
  throw new RfError(RfErrorCode.InvalidInput, { field: "polarization_pairing" });
}
