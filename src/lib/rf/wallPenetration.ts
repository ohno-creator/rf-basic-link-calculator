/**
 * 壁・建材の透過損失バジェット（線形加算モデル）。
 *
 *   合計透過損失[dB] = Σ_材質 ( 1枚あたり損失[dB/枚] × 枚数 )
 *
 * 1枚あたりの損失は帯域別の目安レンジ（min〜max、@/data/wallMaterials）を用い、
 * 合計も min〜max のレンジで返す。dB は電力比の対数なので、直列に並んだ壁の
 * 透過損失（電力比の掛け算）は dB の足し算になる。
 *
 * 用途: リンクバジェットの「環境損失（建物侵入損）」入力の当たり付け。
 * 適用条件: 各壁を独立な減衰体とみなす一次近似。回折・マルチパス・開口部
 * （窓・ドア・廊下）経由の回り込みは含まない。壁厚・含水率・鉄筋ピッチ・
 * 入射角で実測値は大きく変わるため、目安値・実測前提で使うこと。
 */

import {
  WALL_BANDS,
  WALL_MATERIAL_BY_ID,
  type WallBandMHz,
  type WallMaterialId
} from "@/data/wallMaterials";
import { assertFinite, RfError, RfErrorCode } from "./errors";

/** 材質と枚数の指定（count は 0 以上の整数。0 は無視される）。 */
export type WallCountInput = {
  material: WallMaterialId;
  count: number;
};

export type WallLossInput = {
  /** 帯域の中心周波数[MHz]。920 / 2400 / 5000 / 28000 のいずれか。 */
  band: WallBandMHz;
  /** 通過する壁のリスト。同一材質が複数エントリあってもよい（枚数は合算）。 */
  walls: readonly WallCountInput[];
};

/** 材質ごとの内訳（minDb/maxDb は枚数を掛けた小計[dB]）。 */
export type WallLossBreakdownRow = {
  material: WallMaterialId;
  count: number;
  minDb: number;
  maxDb: number;
};

export type WallLossResult = {
  /** 楽観側の合計透過損失[dB]（各材質の min の線形和）。 */
  totalMinDb: number;
  /** 悲観側の合計透過損失[dB]（各材質の max の線形和）。 */
  totalMaxDb: number;
  /** 材質ごとの小計（count=0 の材質は含まない。walls の出現順）。 */
  breakdown: WallLossBreakdownRow[];
};

/**
 * 壁リストの合計透過損失レンジ[dB]を返す。
 * - count=0 の材質は無視する（breakdown にも含めない）。
 * - walls が空なら totalMinDb=0 / totalMaxDb=0。
 * - band が対応帯域外、material が未知、count が負・非整数・非有限なら RfError。
 */
export function sumWallLoss(input: WallLossInput): WallLossResult {
  if (!WALL_BANDS.includes(input.band)) {
    throw new RfError(RfErrorCode.OutOfDomain, { field: "band" });
  }

  let totalMinDb = 0;
  let totalMaxDb = 0;
  const breakdown: WallLossBreakdownRow[] = [];

  for (const wall of input.walls) {
    assertFinite(wall.count, "count");
    if (wall.count < 0 || !Number.isInteger(wall.count)) {
      throw new RfError(RfErrorCode.InvalidInput, { field: "count", min: 0 });
    }

    const material = WALL_MATERIAL_BY_ID.get(wall.material);
    if (!material) {
      throw new RfError(RfErrorCode.InvalidInput, { field: "material" });
    }

    if (wall.count === 0) {
      continue;
    }

    const range = material.lossDbPerWall[input.band];
    const minDb = range.minDb * wall.count;
    const maxDb = range.maxDb * wall.count;
    totalMinDb += minDb;
    totalMaxDb += maxDb;
    breakdown.push({ material: wall.material, count: wall.count, minDb, maxDb });
  }

  return { totalMinDb, totalMaxDb, breakdown };
}
