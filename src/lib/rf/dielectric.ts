/**
 * 誘電体装荷による波長短縮と、小型化に伴う特性への影響（目安）。
 *
 *   誘電体中の波長     λg = λ0 / √εr
 *   波長短縮率         λg/λ0 = 1 / √εr
 *   サイズ短縮率       1 − 1/√εr
 *
 * 帯域・効率の劣化は形状や材料損失で変わるため、ここでは「電気的に小さくなるほど
 * 帯域は狭くなる」という性質を、寸法縮小に比例する簡易目安として扱う。
 */

export type DielectricImpact = "ほぼなし" | "小" | "中" | "大" | "特大";

function assertDielectricConstant(er: number) {
  if (!Number.isFinite(er) || er < 1) {
    throw new Error("比誘電率は1以上の値を入力してください。");
  }
}

/** 波長短縮率 λg/λ0 = 1/√εr（誘電体中で波長は何倍になるか） */
export function wavelengthShorteningFactor(er: number): number {
  assertDielectricConstant(er);
  return 1 / Math.sqrt(er);
}

/** サイズがどれだけ小さくなるか（%）。εr=4 なら 50%。 */
export function sizeReductionPercent(er: number): number {
  assertDielectricConstant(er);
  return (1 - 1 / Math.sqrt(er)) * 100;
}

/** 帯域の簡易目安（空気=1.0 を100%とした相対値）。寸法縮小に比例させた目安。 */
export function relativeBandwidth(er: number): number {
  assertDielectricConstant(er);
  return 1 / Math.sqrt(er);
}

/** εrの大きさから、特性への影響の度合いを段階で表す目安。 */
export function dielectricImpactLevel(er: number): DielectricImpact {
  assertDielectricConstant(er);
  if (er < 2) return "ほぼなし";
  if (er < 4) return "小";
  if (er < 10) return "中";
  if (er < 30) return "大";
  return "特大";
}
