import { assertFinite, assertPositiveFinite } from "./errors";

export function dbmToMw(dbm: number): number {
  assertFinite(dbm, "dbm");
  return 10 ** (dbm / 10);
}

export function mwToDbm(mw: number): number {
  assertPositiveFinite(mw, "milliwatts");
  return 10 * Math.log10(mw);
}

export function mwToW(mw: number): number {
  assertPositiveFinite(mw, "milliwatts");
  return mw / 1000;
}

export function wToMw(w: number): number {
  assertPositiveFinite(w, "watts");
  return w * 1000;
}

export function wToDbm(w: number): number {
  return mwToDbm(wToMw(w));
}

/** dB（相対値）を電力の倍率に変換。+10dB=10倍、+3dB≈2倍、-6dB=1/4。 */
export function dbToPowerRatio(db: number): number {
  assertFinite(db, "db");
  return 10 ** (db / 10);
}

/**
 * dB（リンク余裕の増減）を到達距離の倍率に変換（自由空間の目安）。
 * 自由空間損失は距離の2乗（20log10）で効くため、+6dB=距離2倍、+20dB=距離10倍。
 */
export function dbToDistanceRatio(db: number): number {
  assertFinite(db, "db");
  return 10 ** (db / 20);
}
