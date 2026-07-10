/**
 * 周期動作する無線端末の平均電流と電池寿命（Track G19）。
 *
 *   Iavg[mA] = Itx·ttx/T + Irx·trx/T + Isleep
 *   life[h] = capacity[mAh]·derate / Iavg[mA]
 *
 * 単位: 容量[mAh]、動作電流[mA]、スリープ電流[µA]、時間[ms/s]、寿命[h/year]。
 * 適用条件: 各状態の電流を一定とした時間平均。自己放電、温度、パルス負荷時の電圧降下、
 * 経年劣化はderateへ集約する一次見積りで、10年超は電池特性の実測評価が支配的となる。
 */

import {
  assertFinite,
  assertNonNegative,
  assertPositiveFinite,
  RfError,
  RfErrorCode
} from "./errors";

const HOURS_PER_YEAR = 365 * 24;

export type BatteryLifeInput = {
  capacityMah: number;
  txCurrentMa: number;
  txDurationMs: number;
  rxCurrentMa?: number;
  rxDurationMs?: number;
  intervalSeconds: number;
  sleepCurrentUa: number;
  deratingFactor: number;
};

export type BatteryLifeResult = {
  txAverageCurrentUa: number;
  rxAverageCurrentUa: number;
  sleepCurrentUa: number;
  averageCurrentUa: number;
  lifetimeHours: number;
  lifetimeYears: number;
  exceedsTenYears: boolean;
};

function normalizeZero(value: number): number {
  return value === 0 ? 0 : value;
}

function assertDeratingFactor(value: number): void {
  assertFinite(value, "derating_factor");
  if (value <= 0 || value > 1) {
    throw new RfError(RfErrorCode.OutOfDomain, {
      field: "derating_factor",
      min: 0,
      max: 1
    });
  }
}

/** 送信・受信・スリープの時間平均から電池寿命を返す。 */
export function calculateBatteryLife(input: BatteryLifeInput): BatteryLifeResult {
  assertPositiveFinite(input.capacityMah, "capacity");
  assertNonNegative(input.txCurrentMa, "tx_current");
  assertNonNegative(input.txDurationMs, "tx_duration");
  assertPositiveFinite(input.intervalSeconds, "interval");
  assertNonNegative(input.sleepCurrentUa, "sleep_current");
  assertDeratingFactor(input.deratingFactor);

  const rxCurrentMa = input.rxCurrentMa ?? 0;
  const rxDurationMs = input.rxDurationMs ?? 0;
  assertNonNegative(rxCurrentMa, "rx_current");
  assertNonNegative(rxDurationMs, "rx_duration");

  const activeDurationSeconds = (input.txDurationMs + rxDurationMs) / 1000;
  if (!Number.isFinite(activeDurationSeconds) || activeDurationSeconds > input.intervalSeconds) {
    throw new RfError(RfErrorCode.InvalidInput, { field: "active_duration" });
  }

  const txAverageCurrentMa =
    (input.txCurrentMa * (input.txDurationMs / 1000)) / input.intervalSeconds;
  const rxAverageCurrentMa =
    (rxCurrentMa * (rxDurationMs / 1000)) / input.intervalSeconds;
  const averageCurrentMa =
    txAverageCurrentMa + rxAverageCurrentMa + input.sleepCurrentUa / 1000;
  assertPositiveFinite(averageCurrentMa, "average_current");

  const lifetimeHours =
    (input.capacityMah * input.deratingFactor) / averageCurrentMa;
  const lifetimeYears = lifetimeHours / HOURS_PER_YEAR;
  assertPositiveFinite(lifetimeHours, "lifetime_hours");
  assertPositiveFinite(lifetimeYears, "lifetime_years");

  return {
    txAverageCurrentUa: normalizeZero(txAverageCurrentMa * 1000),
    rxAverageCurrentUa: normalizeZero(rxAverageCurrentMa * 1000),
    sleepCurrentUa: normalizeZero(input.sleepCurrentUa),
    averageCurrentUa: normalizeZero(averageCurrentMa * 1000),
    lifetimeHours,
    lifetimeYears,
    exceedsTenYears: lifetimeYears > 10
  };
}
