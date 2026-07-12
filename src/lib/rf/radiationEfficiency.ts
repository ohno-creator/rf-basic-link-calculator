/**
 * 放射効率の線形[%]とdBの相互変換。
 * 効率は電力比なので η[dB]=10log10(η[%]/100)。物理上 0<η≤100%。
 */
import { dbToDistanceRatio } from "./db";
import { assertFinite, RfError, RfErrorCode } from "./errors";

export function efficiencyPercentToDb(percent: number): number {
  assertFinite(percent, "efficiency_percent");
  if (percent <= 0 || percent > 100) {
    throw new RfError(RfErrorCode.OutOfDomain, { field: "efficiency_percent", min: 0, max: 100 });
  }
  const db = 10 * Math.log10(percent / 100);
  return db === 0 ? 0 : db;
}

export function efficiencyDbToPercent(db: number): number {
  assertFinite(db, "efficiency_db");
  if (db > 0) {
    throw new RfError(RfErrorCode.TooLarge, { field: "efficiency_db", max: 0 });
  }
  const percent = 100 * 10 ** (db / 10);
  return percent === 0 ? 0 : percent;
}

/** 自由空間（伝搬指数n=2）で、効率損失dBが到達距離へ与える倍率。 */
export function efficiencyToRangeFactor(db: number): number {
  assertFinite(db, "efficiency_db");
  if (db > 0) throw new RfError(RfErrorCode.TooLarge, { field: "efficiency_db", max: 0 });
  return dbToDistanceRatio(db);
}
