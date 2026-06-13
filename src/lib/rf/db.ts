function assertPositiveFinite(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label}は0より大きい数値を入力してください。`);
  }
}

export function dbmToMw(dbm: number): number {
  if (!Number.isFinite(dbm)) {
    throw new Error("dBmは数値で入力してください。");
  }

  return 10 ** (dbm / 10);
}

export function mwToDbm(mw: number): number {
  assertPositiveFinite(mw, "mW");
  return 10 * Math.log10(mw);
}

export function mwToW(mw: number): number {
  assertPositiveFinite(mw, "mW");
  return mw / 1000;
}

export function wToMw(w: number): number {
  assertPositiveFinite(w, "W");
  return w * 1000;
}

export function wToDbm(w: number): number {
  return mwToDbm(wToMw(w));
}
