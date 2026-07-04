/**
 * デセンス（受信感度劣化）と通信距離への影響（Track G16）。
 *
 * 帯域内干渉 I[dBm] が熱雑音床 N[dBm] に加算されると、実効雑音床が持ち上がり
 * 受信感度がその分だけ劣化する（デセンス）。電力加算は線形（mW）領域で行う。
 *   合成雑音床 N'[dBm] = mwToDbm(dbmToMw(N) + dbmToMw(I))
 *   デセンス   Δ[dB]   = N' − N（干渉が有限電力なら常に ≥ 0）
 * 距離への影響は経路損失指数 n（自由空間 n=2、市街地 n=3〜4 目安）を使い、
 *   距離残存比 ratio = 10^(−Δ/(10n))、  距離短縮率[%] = (1 − ratio)×100
 *
 * dB/線形: N・I・N' は dBm、Δ は dB、ratio は線形（無次元 0..1）、短縮率は %。
 * 適用条件: 干渉を白色雑音等価（雑音状）とみなす一次近似。狭帯域CWや変調干渉の
 * 実効劣化は復調器特性に依存するため、あくまでリンクバジェット上の目安。
 * 雑音床 N の導出は既存 noiseFloor.ts（-174+10log10(BW)+NF）へ委譲する。
 */

import { dbmToMw, dbToPowerRatio, mwToDbm } from "./db";
import { assertFinite, assertNonNegative, assertPositiveFinite } from "./errors";
import { calculateNoiseFloorDbm } from "./noiseFloor";

/** 合成雑音床 N'[dBm] = mwToDbm(dbmToMw(N) + dbmToMw(I))。線形（mW）領域で電力加算する。 */
export function combineNoisePowersDbm(noiseFloorDbm: number, interferenceDbm: number): number {
  assertFinite(noiseFloorDbm, "noise_floor");
  assertFinite(interferenceDbm, "interference");
  return mwToDbm(dbmToMw(noiseFloorDbm) + dbmToMw(interferenceDbm));
}

/** デセンス Δ[dB] = 合成雑音床 − 元の雑音床。I が有限電力なら常に ≥ 0。 */
export function desenseDb(noiseFloorDbm: number, interferenceDbm: number): number {
  return combineNoisePowersDbm(noiseFloorDbm, interferenceDbm) - noiseFloorDbm;
}

/**
 * デセンス Δ[dB] と経路損失指数 n から距離残存比 ratio = 10^(−Δ/(10n)) を求める。
 * Δ=0 で 1（変化なし）。n=2 が自由空間相当。
 */
export function rangeRatioFromDesenseDb(desenseDb: number, pathLossExponent: number): number {
  assertNonNegative(desenseDb, "desense");
  assertPositiveFinite(pathLossExponent, "path_loss_exponent");
  // 10^(−Δ/(10n)) = dbToPowerRatio(−Δ/n)。10^(x/10) の再実装を避け db.ts を再利用する。
  return dbToPowerRatio(-desenseDb / pathLossExponent);
}

/** 距離短縮率[%] = (1 − ratio)×100。正の値が「縮む」割合を表す。 */
export function rangeReductionPercentFromDesenseDb(
  desenseDb: number,
  pathLossExponent: number
): number {
  return (1 - rangeRatioFromDesenseDb(desenseDb, pathLossExponent)) * 100;
}

export type DesenseFromReceiverResult = {
  /** 熱雑音床 N[dBm]（-174+10log10(BW)+NF）。 */
  noiseFloorDbm: number;
  /** 干渉を電力加算した合成雑音床 N'[dBm]。 */
  combinedNoiseFloorDbm: number;
  /** デセンス Δ[dB] = N' − N。 */
  desenseDb: number;
};

/**
 * 受信機パラメータ（帯域幅BW[Hz]・雑音指数NF[dB]）と干渉電力 I[dBm] から、
 * 雑音床・合成雑音床・デセンスをまとめて求める。N の導出は noiseFloor.ts に委譲。
 */
export function desenseFromReceiver(
  bandwidthHz: number,
  noiseFigureDb: number,
  interferenceDbm: number
): DesenseFromReceiverResult {
  const noiseFloorDbm = calculateNoiseFloorDbm(bandwidthHz, noiseFigureDb);
  const combinedNoiseFloorDbm = combineNoisePowersDbm(noiseFloorDbm, interferenceDbm);
  return {
    noiseFloorDbm,
    combinedNoiseFloorDbm,
    desenseDb: combinedNoiseFloorDbm - noiseFloorDbm
  };
}
