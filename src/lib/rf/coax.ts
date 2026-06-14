/**
 * 同軸線路の特性インピーダンスと波長短縮率（速度係数）の計算。
 *
 *   Z0[Ω] = (138 / √εr) × log10(D / d)
 *   速度係数 VF = 1 / √εr
 *
 * D = 外部導体の内径、d = 内部導体の外径、εr = 誘電体の比誘電率。
 * 比誘電率の例：空気 1.0、PTFE(テフロン) 約2.1、ポリエチレン 約2.3。
 */

function assertPositiveFinite(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label}は0より大きい値を入力してください。`);
  }
}

export type CoaxResult = {
  impedanceOhms: number;
  velocityFactor: number;
};

export function calculateCoaxImpedance(
  outerInnerDiameter: number,
  innerOuterDiameter: number,
  dielectricConstant: number
): CoaxResult {
  assertPositiveFinite(outerInnerDiameter, "外部導体の内径");
  assertPositiveFinite(innerOuterDiameter, "内部導体の外径");

  if (!Number.isFinite(dielectricConstant) || dielectricConstant < 1) {
    throw new Error("比誘電率は1以上の値を入力してください。");
  }

  if (outerInnerDiameter <= innerOuterDiameter) {
    throw new Error("外部導体の内径は内部導体の外径より大きくしてください。");
  }

  const impedanceOhms =
    (138 / Math.sqrt(dielectricConstant)) * Math.log10(outerInnerDiameter / innerOuterDiameter);

  return {
    impedanceOhms,
    velocityFactor: 1 / Math.sqrt(dielectricConstant)
  };
}
