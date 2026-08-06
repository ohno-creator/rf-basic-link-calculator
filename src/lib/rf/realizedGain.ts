/**
 * 実効（実現）利得と利得単位変換の純関数。
 *
 * データシートの「利得」が何を含むかの混乱を解消する:
 *   利得(dBi)      = 指向性(dBi) + 10log10(放射効率η)
 *   実現利得(dBi)  = 利得(dBi) − 整合損失(不整合による反射分)
 *   総合効率       = η · (1 − |Γ|²)
 * dBd は半波長ダイポール基準（dBi − 2.15）。
 */

/** dBi と dBd の差（半波長ダイポールの利得 2.15dBi）。 */
export const DBI_TO_DBD_OFFSET = 2.15;

/** VSWR → 反射係数の大きさ |Γ|。 */
export function vswrToReflectionCoefficient(vswr: number): number {
  if (!Number.isFinite(vswr) || vswr < 1) {
    throw new Error("vswr must be >= 1");
  }
  return (vswr - 1) / (vswr + 1);
}

/** VSWR → 不整合損失[dB]（正の値=損失）。 */
export function mismatchLossDb(vswr: number): number {
  const gamma = vswrToReflectionCoefficient(vswr);
  const transmitted = 1 - gamma ** 2;
  return -10 * Math.log10(transmitted);
}

export type RealizedGainInput = {
  /** 指向性[dBi]。 */
  directivityDbi: number;
  /** 放射効率[%]（0<η≤100）。 */
  efficiencyPercent: number;
  /** 入力整合の VSWR（≥1）。 */
  vswr: number;
};

export type RealizedGainResult = {
  /** 放射効率[dB]（10log10 η、負値）。 */
  efficiencyDb: number;
  /** 利得[dBi] = 指向性 + 放射効率。 */
  gainDbi: number;
  /** 反射係数の大きさ |Γ|。 */
  reflectionCoefficient: number;
  /** 不整合損失[dB]。 */
  mismatchLossDb: number;
  /** 総合効率（放射効率×整合効率、0..1）。 */
  totalEfficiency: number;
  /** 実現利得[dBi] = 利得 − 不整合損失。 */
  realizedGainDbi: number;
  /** 実現利得を dBd 換算した値。 */
  realizedGainDbd: number;
};

export function realizedGain(input: RealizedGainInput): RealizedGainResult {
  const { directivityDbi, efficiencyPercent, vswr } = input;
  if (!Number.isFinite(directivityDbi)) {
    throw new Error("directivityDbi must be finite");
  }
  if (!Number.isFinite(efficiencyPercent) || efficiencyPercent <= 0 || efficiencyPercent > 100) {
    throw new Error("efficiencyPercent must be in (0, 100]");
  }

  const eta = efficiencyPercent / 100;
  const efficiencyDb = 10 * Math.log10(eta);
  const gainDbi = directivityDbi + efficiencyDb;

  const reflectionCoefficient = vswrToReflectionCoefficient(vswr);
  const matchEfficiency = 1 - reflectionCoefficient ** 2;
  const mismatchDb = -10 * Math.log10(matchEfficiency);

  const realizedGainDbi = gainDbi - mismatchDb;

  return {
    efficiencyDb,
    gainDbi,
    reflectionCoefficient,
    mismatchLossDb: mismatchDb,
    totalEfficiency: eta * matchEfficiency,
    realizedGainDbi,
    realizedGainDbd: realizedGainDbi - DBI_TO_DBD_OFFSET
  };
}

/** dBi → dBd。 */
export function dbiToDbd(dbi: number): number {
  return dbi - DBI_TO_DBD_OFFSET;
}

/** dBd → dBi。 */
export function dbdToDbi(dbd: number): number {
  return dbd + DBI_TO_DBD_OFFSET;
}
