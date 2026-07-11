/**
 * 単位ブランド型: dB (対数比・相対値)
 */
export type Db = number & { readonly __brand: "dB" };

/**
 * 単位ブランド型: dBm (絶対電力・1mW基準の対数電力レベル)
 */
export type Dbm = number & { readonly __brand: "dBm" };

/**
 * 単位ブランド型: dBi (アンテナの絶対利得・等方性アンテナ基準の対数利得)
 */
export type Dbi = number & { readonly __brand: "dBi" };

/**
 * 単位ブランド型: MHz (メガヘルツ・周波数)
 */
export type MHz = number & { readonly __brand: "MHz" };

/**
 * 単位ブランド型: Meters (メートル・距離や波長などの長さ)
 */
export type Meters = number & { readonly __brand: "m" };

// ── コンストラクタ関数 (Number.isFiniteガード付き) ──

/**
 * 任意の数値を Db 型に変換します。値が有限数でない場合はエラーをスローします。
 */
export function db(val: number): Db {
  if (!Number.isFinite(val)) {
    throw new TypeError("Value must be a finite number");
  }
  return val as Db;
}

/**
 * 任意の数値を Dbm 型に変換します。値が有限数でない場合はエラーをスローします。
 */
export function dbm(val: number): Dbm {
  if (!Number.isFinite(val)) {
    throw new TypeError("Value must be a finite number");
  }
  return val as Dbm;
}

/**
 * 任意の数値を dbi 型に変換します。値が有限数でない場合はエラーをスローします。
 */
export function dbi(val: number): Dbi {
  if (!Number.isFinite(val)) {
    throw new TypeError("Value must be a finite number");
  }
  return val as Dbi;
}

/**
 * 任意の数値を MHz 型に変換します。値が有限数でない場合はエラーをスローします。
 */
export function mhz(val: number): MHz {
  if (!Number.isFinite(val)) {
    throw new TypeError("Value must be a finite number");
  }
  return val as MHz;
}

/**
 * 任意の数値を Meters 型に変換します。値が有限数でない場合はエラーをスローします。
 */
export function meters(val: number): Meters {
  if (!Number.isFinite(val)) {
    throw new TypeError("Value must be a finite number");
  }
  return val as Meters;
}

// ── 型安全演算 ──

/**
 * 送信電力や受信レベル (dBm) に対し、損失や利得 (dB) を加算して新しい電力を得ます。
 *
 * 【設計意図】
 * dBm同士の加算 (dBm + dBm) は物理的・数式的に意味をなさない（電力比の積ではなく絶対値同士の積になってしまう）ため、
 * 型システム上で禁止し、dBm ＋ dB (相対的な変動値) のみを許可しています。
 */
export function addDb(base: Dbm, delta: Db): Dbm {
  return (base + delta) as Dbm;
}

/**
 * 送信電力や受信レベル (dBm) から、損失 (dB) を減算して新しい電力を得ます。
 */
export function subDb(base: Dbm, delta: Db): Dbm {
  return (base - delta) as Dbm;
}

/**
 * アンテナの絶対利得 (dBi) に対し、利得 of 変動 (dB) を加算して新しい利得を得ます。
 */
export function addDbi(base: Dbi, delta: Db): Dbi {
  return (base + delta) as Dbi;
}

/**
 * 2つの絶対電力値 (dBm) の差分を計算し、相対的な電力比 (dB) を得ます。
 * dBm同士の減算は、一方に対する他方の相対比率を表すため、安全に Db (相対値) を返します。
 */
export function diffDbm(a: Dbm, b: Dbm): Db {
  return (a - b) as Db;
}
