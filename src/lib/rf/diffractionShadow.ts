/**
 * 障害物の影への「回り込み」（単一ナイフエッジ回折）の周波数別損失。
 *
 *   v = h · √( 2·(d1+d2) / (λ·d1·d2) )                      … 回折パラメータ（無次元）
 *   J(v) = 6.9 + 20·log10( √((v−0.1)²+1) + v − 0.1 ) [dB]    … v > −0.78
 *   J(v) = 0 [dB]                                            … v ≤ −0.78（十分な見通し余裕）
 *
 * 出典: Recommendation ITU-R P.526, "Propagation by diffraction"（単一ナイフエッジの近似式）。
 * J(v) の実装は src/lib/rf/fresnel.ts の knifeEdgeDiffractionLossDb（同式）を共用する。
 *
 * 記号と単位:
 *   h  … 見通し線(LOS)から測った障害物頂点の高さ[m]。正=LOSを遮る、負=LOSより下（余裕あり）。
 *   d1 … 送信点→障害物の水平距離[m]、d2 … 障害物→受信点の水平距離[m]。
 *   λ  … 波長[m]（c=299,792,458m/s から算出）。
 *
 * 適用条件: 波長より十分薄い単一の「ナイフエッジ」障害物の一次近似。厚みのある丘・ビル群や
 * 複数障害物では損失はこれより増える（P.526の円筒・多重エッジモデルの領域）。反射・散乱の
 * 寄与は含まない。h=0（縁すれすれ）でも約6dBの損失が出る点がこのモデルの要点。
 */

import { assertFinite, assertPositiveFinite, RfError, RfErrorCode } from "./errors";
import { knifeEdgeDiffractionLossDb } from "./fresnel";
import { SPEED_OF_LIGHT_M_PER_S } from "./frequency";

/** 回折ジオメトリ（すべてメートル）。obstacleHeightAboveLosM はLOS基準の符号付き高さ。 */
export type DiffractionGeometry = {
  /** LOSから測った障害物頂点の高さ[m]（正=遮蔽、負=見通し余裕）。 */
  obstacleHeightAboveLosM: number;
  /** 送信点→障害物の距離[m]。 */
  d1M: number;
  /** 障害物→受信点の距離[m]。 */
  d2M: number;
};

/** 1周波数ぶんの回折計算結果。 */
export type BandDiffractionLoss = {
  frequencyMHz: number;
  /** 波長[m]。 */
  wavelengthM: number;
  /** 回折パラメータ v（無次元）。 */
  vParam: number;
  /** ナイフエッジ回折損失[dB]（0以上）。 */
  lossDb: number;
};

function assertGeometry(geometry: DiffractionGeometry): void {
  assertFinite(geometry.obstacleHeightAboveLosM, "obstacle_height_above_los");
  assertPositiveFinite(geometry.d1M, "d1");
  assertPositiveFinite(geometry.d2M, "d2");
}

/**
 * 回折パラメータ v = h·√(2(d1+d2)/(λ·d1·d2))。
 * h=0（-0を含む）では厳密に 0 を返す（-0は返さない）。
 */
export function diffractionParameterV(geometry: DiffractionGeometry, frequencyMHz: number): number {
  assertGeometry(geometry);
  assertPositiveFinite(frequencyMHz, "frequency");

  const { obstacleHeightAboveLosM: h, d1M, d2M } = geometry;
  if (h === 0) {
    return 0; // -0 を正規化
  }
  const wavelengthM = SPEED_OF_LIGHT_M_PER_S / (frequencyMHz * 1_000_000);
  return h * Math.sqrt((2 * (d1M + d2M)) / (wavelengthM * d1M * d2M));
}

/** 1周波数の回折損失。v と J(v)[dB]、波長[m]をまとめて返す。 */
export function diffractionShadowLoss(
  geometry: DiffractionGeometry,
  frequencyMHz: number
): BandDiffractionLoss {
  const vParam = diffractionParameterV(geometry, frequencyMHz);
  return {
    frequencyMHz,
    wavelengthM: SPEED_OF_LIGHT_M_PER_S / (frequencyMHz * 1_000_000),
    vParam,
    lossDb: knifeEdgeDiffractionLossDb(vParam)
  };
}

export type DiffractionByBandInput = DiffractionGeometry & {
  /** 比較する周波数の一覧[MHz]（1つ以上）。 */
  frequenciesMHz: readonly number[];
};

/**
 * 同一ジオメトリで複数周波数の回折損失を一括計算する（「同じ影・違う損失」の比較用）。
 * 低い周波数（長い波長）ほど v が小さく損失も小さい＝影へよく回り込む。
 */
export function diffractionLossByBand(input: DiffractionByBandInput): BandDiffractionLoss[] {
  const { frequenciesMHz, ...geometry } = input;
  assertGeometry(geometry);
  if (frequenciesMHz.length === 0) {
    throw new RfError(RfErrorCode.Empty, { field: "frequencies" });
  }
  return frequenciesMHz.map((frequencyMHz) => diffractionShadowLoss(geometry, frequencyMHz));
}
