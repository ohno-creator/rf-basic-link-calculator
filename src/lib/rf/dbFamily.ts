import { assertFinite } from "./errors";
import { dbmToMw, mwToDbm } from "./db";
import { Dbm, Dbi } from "./units";

/**
 * dBの仲間（dB/dBm/dBi/dBd）の相互変換。
 *
 * dB/dBi/dBd は「比率」（単位のない倍率の対数）、dBm だけが 1mW 基準の「絶対値」。
 * dB⇔倍率・dBm⇔mW の変換は既存の db.ts（dbToPowerRatio / dbmToMw / mwToDbm）を再利用し、
 * 本ファイルはアンテナ利得の基準差（dBi⇔dBd）と電力合成だけを担う。
 */

/**
 * 半波長ダイポールの絶対利得 [dBi]。
 * 出典: IEEE Std 145 (IEEE Standard for Definitions of Terms for Antennas) — dBd は
 * 半波長ダイポール基準の利得。半波長ダイポールの指向性は 1.64（10·log10(1.64) ≈ 2.15dB。
 * C.A. Balanis, Antenna Theory 参照）なので、dBi = dBd + 2.15。
 */
export const DIPOLE_GAIN_DBI = 2.15;

/** IEEE 754 の -0 を +0 に正規化する（表示で「-0.0」と出るのを防ぐ）。 */
function normalizeZero(value: number): number {
  return value === 0 ? 0 : value;
}

/** アンテナ利得 dBi（等方基準）→ dBd（半波長ダイポール基準）。dBd = dBi − 2.15。 */
export function dbiToDbd(dbi: Dbi): number;
export function dbiToDbd(dbi: number): number;
export function dbiToDbd(dbi: number): number {
  assertFinite(dbi, "dbi");
  return normalizeZero(dbi - DIPOLE_GAIN_DBI);
}

/** アンテナ利得 dBd（半波長ダイポール基準）→ dBi（等方基準）。dBi = dBd + 2.15。 */
export function dbdToDbi(dbd: number): Dbi;
export function dbdToDbi(dbd: number): number;
export function dbdToDbi(dbd: number): number {
  assertFinite(dbd, "dbd");
  return (normalizeZero(dbd + DIPOLE_GAIN_DBI)) as Dbi;
}

/**
 * 2つの電力 [dBm] の合成（無相関な2波の電力和）。
 * dBm + dBm の「足し算」は物理的に無意味（対数の和＝電力の積）。正しくは線形（mW）に
 * 戻して加算する: 10·log10(10^(P1/10) + 10^(P2/10))。同じ値同士なら +3.01dB になる。
 */
export function combinePowersDbm(p1Dbm: Dbm, p2Dbm: Dbm): Dbm;
export function combinePowersDbm(p1Dbm: number, p2Dbm: number): number;
export function combinePowersDbm(p1Dbm: number, p2Dbm: number): number {
  return normalizeZero(mwToDbm(dbmToMw(p1Dbm) + dbmToMw(p2Dbm)));
}
