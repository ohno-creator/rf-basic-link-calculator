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

/** dB（相対値）を電力の倍率に変換。+10dB=10倍、+3dB≈2倍、-6dB=1/4。 */
export function dbToPowerRatio(db: number): number {
  if (!Number.isFinite(db)) {
    throw new Error("dBは数値で入力してください。");
  }
  return 10 ** (db / 10);
}

/**
 * dB（リンク余裕の増減）を到達距離の倍率に変換（自由空間の目安）。
 * 自由空間損失は距離の2乗（20log10）で効くため、+6dB=距離2倍、+20dB=距離10倍。
 */
export function dbToDistanceRatio(db: number): number {
  if (!Number.isFinite(db)) {
    throw new Error("dBは数値で入力してください。");
  }
  return 10 ** (db / 20);
}
