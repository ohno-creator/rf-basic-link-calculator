import { SPEED_OF_LIGHT_M_PER_S } from "./frequency";

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

/** Douville-James の式が妥当な範囲か（W/h 0.25〜2.75、εr ≤ 25）。 */
export function isMiterFormulaApplicable(
  widthMm: number,
  heightMm: number,
  dielectricConstant: number
): boolean {
  const u = widthMm / heightMm;
  return u >= 0.25 && u <= 2.75 && dielectricConstant <= 25;
}

/** マイクロストリップ中の導波波長 λg[mm] = c / (f · √εeff)。 */
export function guidedWavelengthMm(frequencyMHz: number, effectiveDielectric: number): number {
  assertPositiveFinite(frequencyMHz, "周波数");
  if (!Number.isFinite(effectiveDielectric) || effectiveDielectric < 1) {
    throw new Error("実効比誘電率は1以上である必要があります。");
  }
  const wavelengthM =
    SPEED_OF_LIGHT_M_PER_S / (frequencyMHz * 1_000_000 * Math.sqrt(effectiveDielectric));
  return wavelengthM * 1000;
}

export type BendSignificance = "negligible" | "minor" | "significant";

/**
 * 曲げ（不連続）が電気的に効くかの目安。線路幅Wと導波波長λgの比で判定する。
 * λg/20より小さければほぼ無視でき、λg/10を超えると無視できない。
 */
export function bendSignificance(
  widthMm: number,
  guidedWavelengthValueMm: number
): BendSignificance {
  assertPositiveFinite(widthMm, "線路幅 W");
  assertPositiveFinite(guidedWavelengthValueMm, "導波波長 λg");
  const ratio = widthMm / guidedWavelengthValueMm;
  if (ratio < 0.05) return "negligible";
  if (ratio < 0.1) return "minor";
  return "significant";
}

/** 円弧（R）曲げの推奨最小半径[mm]の目安。中心線で線路幅の約3倍。 */
export function recommendedBendRadiusMm(widthMm: number): number {
  assertPositiveFinite(widthMm, "線路幅 W");
  return 3 * widthMm;
}

/** マイターで角から斜めに切り取る対角方向の長さ[mm]。 */
export function miterCutbackMm(widthMm: number, miterPercent: number): number {
  assertPositiveFinite(widthMm, "線路幅 W");
  return (miterPercent / 100) * widthMm * Math.SQRT2;
}

/** 物理長[mm]を電気長[度]に換算（λgは導波波長[mm]）。1波長=360度。 */
export function electricalLengthDegrees(lengthMm: number, guidedWavelengthValueMm: number): number {
  assertPositiveFinite(lengthMm, "線路長 L");
  assertPositiveFinite(guidedWavelengthValueMm, "導波波長 λg");
  return (360 * lengthMm) / guidedWavelengthValueMm;
}

/**
 * グラウンドのスティッチングビア（スルーホール）の推奨最大ピッチ[mm]。
 * 共振・漏れを抑えるため、ピッチは導波波長 λg の数分の1以下にする。
 * fraction = 0.1 で λg/10（目安）、0.05 で λg/20（より安全側）。
 */
export function stitchingViaPitchMm(guidedWavelengthValueMm: number, fraction: number): number {
  assertPositiveFinite(guidedWavelengthValueMm, "導波波長 λg");
  if (!Number.isFinite(fraction) || fraction <= 0) {
    throw new Error("分数は0より大きい値で指定してください。");
  }
  return guidedWavelengthValueMm * fraction;
}
