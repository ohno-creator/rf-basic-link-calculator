import { assertFinite, assertPositiveFinite, RfError, RfErrorCode } from "./errors";

/**
 * 天井高h[m]と半値全角HPBW[deg]から、床面の-3dBカバー直径[m]を返す。
 * 直径 = 2h·tan(HPBW/2)。水平床・真下向き・平坦な地面を仮定する幾何学モデル。
 */
export function coverageDiameterM(heightM: number, hpbwDeg: number): number {
  assertPositiveFinite(heightM, "height");
  assertFinite(hpbwDeg, "hpbw");
  if (hpbwDeg <= 0 || hpbwDeg >= 180) {
    throw new RfError(RfErrorCode.OutOfDomain, { field: "hpbw", min: 0, max: 180 });
  }
  return 2 * heightM * Math.tan((hpbwDeg * Math.PI) / 360);
}

/** E面・H面HPBWからの概算指向性[dBi]。D≈41253/(θE·θH)。 */
export function approximateDirectivityDbi(ePlaneHpbwDeg: number, hPlaneHpbwDeg: number): number {
  assertPositiveFinite(ePlaneHpbwDeg, "e_plane_hpbw");
  assertPositiveFinite(hPlaneHpbwDeg, "h_plane_hpbw");
  const linear = 41253 / (ePlaneHpbwDeg * hPlaneHpbwDeg);
  return 10 * Math.log10(linear);
}
