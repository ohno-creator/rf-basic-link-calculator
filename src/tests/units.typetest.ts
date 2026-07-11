/* eslint-disable @typescript-eslint/no-unused-vars */
import { db, dbm, dbi, mhz, meters, addDb, subDb, addDbi, diffDbm, Db, Dbm, Dbi, MHz, Meters } from "../lib/rf/units";
import { combinePowersDbm, dbiToDbd, dbdToDbi } from "../lib/rf/dbFamily";

// ── 正常系 (型が正しく適合すること) ──

const myDb: Db = db(10);
const myDbm: Dbm = dbm(20);
const myDbi: Dbi = dbi(3);
const myMHz: MHz = mhz(920);
const myMeters: Meters = meters(1.5);

// 演算の正常系
const addedPower: Dbm = addDb(myDbm, myDb);
const subbedPower: Dbm = subDb(myDbm, myDb);
const addedGain: Dbi = addDbi(myDbi, myDb);
const powerDiff: Db = diffDbm(dbm(30), dbm(20));

// dbFamily のオーバーロード正常系
const combined: Dbm = combinePowersDbm(dbm(10), dbm(20));
const lossFromDbi: number = dbiToDbd(myDbi);
const gainFromDbd: Dbi = dbdToDbi(5);

// ── 異常系 (tsc でコンパイルエラーになるべき箇所) ──

// @ts-expect-error - number型は直接Db型に代入できない (ブランドによる保護)
const invalidDb: Db = 10;

// @ts-expect-error - Db型はDbm型に代入できない
const mismatchedDbm: Dbm = myDb;

// @ts-expect-error - addDb の結果は Dbm なので Db に代入できない
const badAddAssign: Db = addDb(myDbm, myDb);

// @ts-expect-error - dBm同士の直接加算結果 (number) は Dbm に直接代入できない
const directAddAssign: Dbm = myDbm + myDbm;

// @ts-expect-error - addDb の第1引数に Db は渡せない
const badAdd1 = addDb(myDb, myDb);

// @ts-expect-error - addDb の第2引数に Dbm は渡せない
const badAdd2 = addDb(myDbm, myDbm);

// @ts-expect-error - dbiToDbd の戻り値は number なので Dbi には代入できない
const badDbiToDbdAssign: Dbi = dbiToDbd(myDbi);

// @ts-expect-error - combinePowersDbm に number (非ブランド型) を渡したときの戻り値は number なので Dbm に代入できない
const badCombineAssign: Dbm = combinePowersDbm(10, 20);
