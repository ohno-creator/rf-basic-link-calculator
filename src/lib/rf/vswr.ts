/**
 * VSWR・リターンロス・反射係数の相互変換。
 * いずれか1つを与えると、反射係数Γを基準に他の指標を導出する。
 *
 *   Γ = (VSWR - 1) / (VSWR + 1)
 *   VSWR = (1 + Γ) / (1 - Γ)
 *   リターンロス RL[dB] = -20 log10(Γ)
 *   反射電力[%] = Γ^2 × 100
 *   ミスマッチ損失 ML[dB] = -10 log10(1 - Γ^2)
 */

export type VswrSourceKind = "vswr" | "returnLoss" | "reflection";

export type VswrResult = {
  reflectionCoefficient: number;
  vswr: number;
  returnLossDb: number;
  reflectedPowerPercent: number;
  mismatchLossDb: number;
};

function reflectionFromSource(kind: VswrSourceKind, value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("数値を入力してください。");
  }

  if (kind === "vswr") {
    if (value < 1) {
      throw new Error("VSWRは1以上の値を入力してください。");
    }
    return (value - 1) / (value + 1);
  }

  if (kind === "returnLoss") {
    if (value < 0) {
      throw new Error("リターンロスは0以上のdB値を入力してください。");
    }
    return 10 ** (-value / 20);
  }

  // reflection coefficient
  if (value < 0 || value >= 1) {
    throw new Error("反射係数は0以上1未満の値を入力してください。");
  }
  return value;
}

export function convertVswr(kind: VswrSourceKind, value: number): VswrResult {
  const reflection = reflectionFromSource(kind, value);

  const vswr = reflection < 1 ? (1 + reflection) / (1 - reflection) : Number.POSITIVE_INFINITY;
  const returnLossDb = reflection > 0 ? -20 * Math.log10(reflection) : Number.POSITIVE_INFINITY;
  const reflectedPowerPercent = reflection ** 2 * 100;
  const mismatchLossDb =
    reflection < 1 ? -10 * Math.log10(1 - reflection ** 2) : Number.POSITIVE_INFINITY;

  return {
    reflectionCoefficient: reflection,
    vswr,
    returnLossDb,
    reflectedPowerPercent,
    mismatchLossDb
  };
}
