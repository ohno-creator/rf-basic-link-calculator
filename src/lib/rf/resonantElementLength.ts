/**
 * 共振素子長（アンテナのエレメント物理長）の純関数。
 *
 * 理想長は波長の分数（λ/4・λ/2・λ）だが、実素子は端部効果で数%短くなる。
 * 短縮率 k（既定0.95）と、被覆線の波長短縮（velocity factor VF）を掛けて
 * 物理長へ落とす。周波数のみから、実装で切る線・ホイップの目安長を出す用途。
 */

/** 真空中の光速[m/s]。 */
export const SPEED_OF_LIGHT = 299_792_458;

export type ElementType = "monopole_quarter" | "dipole_half" | "fullwave";

/** 素子タイプ→波長に対する基準分数。 */
export const elementFraction: Record<ElementType, number> = {
  monopole_quarter: 0.25,
  dipole_half: 0.5,
  fullwave: 1
};

export type ResonantLengthInput = {
  frequencyMHz: number;
  type: ElementType;
  /** 端部効果の短縮率（0<k≤1、既定0.95）。 */
  shorteningFactor: number;
  /** 被覆線・巻線の波長短縮（0<VF≤1、裸線=1）。 */
  velocityFactor: number;
};

export type ResonantLengthResult = {
  /** 自由空間波長[m]。 */
  wavelengthM: number;
  /** 基準分数（0.25/0.5/1）。 */
  fraction: number;
  /** 短縮なしの理想物理長[m]（fraction·λ）。 */
  idealLengthM: number;
  /** 短縮率・波長短縮を反映した実用物理長[m]。 */
  physicalLengthM: number;
  /** ダイポール等の左右対称素子の片側長[m]（非対称タイプは null）。 */
  armLengthM: number | null;
};

/** 周波数[MHz]から自由空間波長[m]。 */
export function freeSpaceWavelengthM(frequencyMHz: number): number {
  if (!Number.isFinite(frequencyMHz) || frequencyMHz <= 0) {
    throw new Error("frequencyMHz must be > 0");
  }
  return SPEED_OF_LIGHT / (frequencyMHz * 1e6);
}

export function resonantElementLength(input: ResonantLengthInput): ResonantLengthResult {
  const { frequencyMHz, type, shorteningFactor, velocityFactor } = input;
  if (!Number.isFinite(shorteningFactor) || shorteningFactor <= 0 || shorteningFactor > 1) {
    throw new Error("shorteningFactor must be in (0, 1]");
  }
  if (!Number.isFinite(velocityFactor) || velocityFactor <= 0 || velocityFactor > 1) {
    throw new Error("velocityFactor must be in (0, 1]");
  }

  const wavelengthM = freeSpaceWavelengthM(frequencyMHz);
  const fraction = elementFraction[type];
  const idealLengthM = fraction * wavelengthM;
  const physicalLengthM = idealLengthM * shorteningFactor * velocityFactor;
  // ダイポール（半波長=左右2本）・全波（2本）は片側が半分。モノポールは1本なので null。
  const armLengthM = type === "monopole_quarter" ? null : physicalLengthM / 2;

  return { wavelengthM, fraction, idealLengthM, physicalLengthM, armLengthM };
}
