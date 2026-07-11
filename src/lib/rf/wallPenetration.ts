/**
 * 複数の壁・建材による透過損失レンジの合算（Track G14）。
 *
 * 各壁の透過損失L[dB/枚]はリンクバジェット上の経路損失なので、枚数nとの積を
 * dB領域で加算する: Ltotal,min=Σn·Lmin、Ltotal,max=Σn·Lmax。
 * 線形電力の合成ではなく、直列に通過する独立損失の積を対数表現で加算している。
 */

import { assertNonNegative, RfError, RfErrorCode } from "./errors";

export type WallPenetrationItem = {
  count: number;
  lossMinDbPerWall: number;
  lossMaxDbPerWall: number;
};

export type WallPenetrationResult = {
  minimumLossDb: number;
  maximumLossDb: number;
  wallCount: number;
};

export function calculateWallPenetrationLoss(
  items: readonly WallPenetrationItem[]
): WallPenetrationResult {
  let minimumLossDb = 0;
  let maximumLossDb = 0;
  let wallCount = 0;

  for (const item of items) {
    assertNonNegative(item.count, "wall_count");
    assertNonNegative(item.lossMinDbPerWall, "minimum_loss");
    assertNonNegative(item.lossMaxDbPerWall, "maximum_loss");
    if (!Number.isInteger(item.count)) {
      throw new RfError(RfErrorCode.InvalidInput, { field: "wall_count" });
    }
    if (item.lossMinDbPerWall > item.lossMaxDbPerWall) {
      throw new RfError(RfErrorCode.InvalidInput, { field: "loss_range" });
    }
    minimumLossDb += item.count * item.lossMinDbPerWall;
    maximumLossDb += item.count * item.lossMaxDbPerWall;
    wallCount += item.count;
  }

  return {
    minimumLossDb: minimumLossDb === 0 ? 0 : minimumLossDb,
    maximumLossDb: maximumLossDb === 0 ? 0 : maximumLossDb,
    wallCount
  };
}
