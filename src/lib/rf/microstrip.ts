/**
 * 基板上のマイクロストリップ線路の特性インピーダンスと、直角曲げのマイター（角の斜めカット）設計。
 *
 * 特性インピーダンス（Hammerstad-Wheeler の近似式、薄い導体を仮定）：
 *   u = W / h
 *   実効比誘電率 εeff:
 *     u ≥ 1 : εeff = (εr+1)/2 + (εr-1)/2 · (1 + 12/u)^(-1/2)
 *     u < 1 : εeff = (εr+1)/2 + (εr-1)/2 · [(1 + 12/u)^(-1/2) + 0.04(1-u)^2]
 *   Z0:
 *     u ≤ 1 : Z0 = (60/√εeff) · ln(8/u + u/4)
 *     u ≥ 1 : Z0 = (120π/√εeff) / [u + 1.393 + 0.667·ln(u + 1.444)]
 *
 * 直角曲げのマイター率（Douville & James、W/h ≥ 0.25 で妥当）：
 *   M[%] = 52 + 65 · exp(-1.35 · W/h)
 */

function assertPositiveFinite(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label}は0より大きい値を入力してください。`);
  }
}

export type MicrostripResult = {
  impedanceOhms: number;
  effectiveDielectric: number;
  velocityFactor: number;
};

export function microstripImpedance(
  widthMm: number,
  heightMm: number,
  dielectricConstant: number
): MicrostripResult {
  assertPositiveFinite(widthMm, "線路幅 W");
  assertPositiveFinite(heightMm, "基板厚 h");
  if (!Number.isFinite(dielectricConstant) || dielectricConstant < 1) {
    throw new Error("比誘電率は1以上の値を入力してください。");
  }

  const u = widthMm / heightMm;
  const er = dielectricConstant;

  const base = (er + 1) / 2;
  const delta = (er - 1) / 2;
  const fringe = (1 + 12 / u) ** -0.5;
  const effectiveDielectric =
    u >= 1 ? base + delta * fringe : base + delta * (fringe + 0.04 * (1 - u) ** 2);

  const sqrtEeff = Math.sqrt(effectiveDielectric);
  const impedanceOhms =
    u <= 1
      ? (60 / sqrtEeff) * Math.log(8 / u + u / 4)
      : (120 * Math.PI) / (sqrtEeff * (u + 1.393 + 0.667 * Math.log(u + 1.444)));

  return {
    impedanceOhms,
    effectiveDielectric,
    velocityFactor: 1 / sqrtEeff
  };
}

/** 直角（90°）曲げの最適マイター率[%]（Douville-James）。 */
export function optimalMiterPercent(widthMm: number, heightMm: number): number {
  assertPositiveFinite(widthMm, "線路幅 W");
  assertPositiveFinite(heightMm, "基板厚 h");
  return 52 + 65 * Math.exp(-1.35 * (widthMm / heightMm));
}

/**
 * 任意の曲げ角度に対する推奨マイター率[%]の目安。
 * 90°の最適値を、曲げ角度（直進=0°, 直角=90°）に比例させた簡易目安。
 */
export function recommendedMiterPercent(
  widthMm: number,
  heightMm: number,
  angleDeg: number
): number {
  if (!Number.isFinite(angleDeg) || angleDeg < 0) {
    throw new Error("曲げ角度は0以上で入力してください。");
  }
  const scaled = optimalMiterPercent(widthMm, heightMm) * (Math.min(angleDeg, 90) / 90);
  return Math.min(100, Math.max(0, scaled));
}

/** マイターで角から斜めに切り取る対角方向の長さ[mm]。 */
export function miterCutbackMm(widthMm: number, miterPercent: number): number {
  assertPositiveFinite(widthMm, "線路幅 W");
  return (miterPercent / 100) * widthMm * Math.SQRT2;
}
