import {
  batteryChemistryProfiles,
  BatteryChemistryProfile
} from "@/data/batteryChemistry";
import {
  assertFinite,
  assertNonNegative,
  assertPositiveFinite,
  RfError,
  RfErrorCode
} from "./errors";

const HOURS_PER_YEAR = 365 * 24;

export interface ExpertBatteryLifeInput {
  chemistry: string;
  capacityMah: number;
  temperatureC: number;
  sleepCurrentUa: number;
  txCurrentMa: number;
  txDurationMs: number;
  txIntervalS: number;
  rxCurrentMa?: number;
  rxDurationMs?: number;
  agingYears?: number;
}

export interface ExpertBatteryLifeResult {
  lifeYears: number;
  lifeHours: number;
  dominantFactor: "sleep" | "tx" | "self_discharge" | "temperature" | "pulse";
  passivationWarning: boolean;
  exceedsTenYears: boolean;
  tempCoeff: number;
  pulseCoeff: number;
  averageCurrentUa: number;
  txAverageCurrentUa: number;
  rxAverageCurrentUa: number;
  sleepAverageCurrentUa: number;
  selfDischargeEquivalentUa: number;
  effectiveCapacityMah: number;
}

/**
 * 温度係数を線形補間する。入力温度が -20℃〜60℃ の範囲外の場合はクランプする。
 */
export function interpolateTempCoeff(temp: number, coeffs: BatteryChemistryProfile["tempCoefficients"]): number {
  if (temp <= -20) return coeffs[-20];
  if (temp >= 60) return coeffs[60];

  if (temp < 0) {
    const ratio = (temp - (-20)) / (0 - (-20));
    return coeffs[-20] + ratio * (coeffs[0] - coeffs[-20]);
  } else if (temp < 25) {
    const ratio = (temp - 0) / (25 - 0);
    return coeffs[0] + ratio * (coeffs[25] - coeffs[0]);
  } else {
    const ratio = (temp - 25) / (60 - 25);
    return coeffs[25] + ratio * (coeffs[60] - coeffs[25]);
  }
}

/**
 * 電池の実特性（自己放電、温度、パルス負荷）を考慮した電池寿命予測。
 */
export function estimateExpertBatteryLife(input: ExpertBatteryLifeInput): ExpertBatteryLifeResult {
  const profile = batteryChemistryProfiles[input.chemistry];
  if (!profile) {
    throw new RfError(RfErrorCode.InvalidInput, { field: "chemistry" });
  }

  assertPositiveFinite(input.capacityMah, "capacity");
  assertFinite(input.temperatureC, "temperature");
  assertNonNegative(input.sleepCurrentUa, "sleep_current");
  assertNonNegative(input.txCurrentMa, "tx_current");
  assertNonNegative(input.txDurationMs, "tx_duration");
  assertPositiveFinite(input.txIntervalS, "interval");

  const rxCurrentMa = input.rxCurrentMa ?? 0;
  const rxDurationMs = input.rxDurationMs ?? 0;
  const agingYears = input.agingYears ?? 0;

  assertNonNegative(rxCurrentMa, "rx_current");
  assertNonNegative(rxDurationMs, "rx_duration");
  assertNonNegative(agingYears, "aging_years");

  // 送受信の合計動作時間が周期を超えていないかチェック
  const activeDurationSeconds = (input.txDurationMs + rxDurationMs) / 1000;
  if (!Number.isFinite(activeDurationSeconds) || activeDurationSeconds > input.txIntervalS) {
    throw new RfError(RfErrorCode.InvalidInput, { field: "active_duration" });
  }

  // 1. 各平均電流の計算
  const txAverageCurrentMa = (input.txCurrentMa * (input.txDurationMs / 1000)) / input.txIntervalS;
  const rxAverageCurrentMa = (rxCurrentMa * (rxDurationMs / 1000)) / input.txIntervalS;
  const sleepAverageCurrentMa = input.sleepCurrentUa / 1000;

  const averageCurrentMa = txAverageCurrentMa + rxAverageCurrentMa + sleepAverageCurrentMa;
  if (averageCurrentMa <= 0) {
    throw new RfError(RfErrorCode.NonPositive, { field: "average_current" });
  }

  // 2. 経年劣化（保存自己放電）による容量減少
  // 経年後の公称容量
  const capacityAgedMah = Math.max(0, input.capacityMah * (1 - profile.selfDischargeRatePerYear * agingYears));

  // 3. 温度ディレーティング係数
  const tempCoeff = interpolateTempCoeff(input.temperatureC, profile.tempCoefficients);

  // 4. パルスディレーティング係数
  // ピーク電流
  const peakCurrentMa = Math.max(input.txCurrentMa, rxCurrentMa, sleepAverageCurrentMa);
  const pulseRatio = averageCurrentMa > 0 ? peakCurrentMa / averageCurrentMa : 1;

  let pulseCoeff = 1.0;
  if (pulseRatio < 10) {
    pulseCoeff = profile.pulseCoefficients.low;
  } else if (pulseRatio <= 100) {
    pulseCoeff = profile.pulseCoefficients.medium;
  } else {
    pulseCoeff = profile.pulseCoefficients.high;
  }

  // 5. 実効容量
  const effectiveCapacityMah = capacityAgedMah * tempCoeff * pulseCoeff;

  // 6. 自己放電との連立一次方程式を解く
  // 実効容量 = 使用消費 + 初期定格 × 自己放電率 × 寿命年
  // C_eff = (I_avg * 8760 * L) + (C_nominal * r * L)
  // L = C_eff / (I_avg * 8760 + C_nominal * r)
  const annualSelfDischargeMah = input.capacityMah * profile.selfDischargeRatePerYear;
  const denominator = averageCurrentMa * HOURS_PER_YEAR + annualSelfDischargeMah;

  let lifeYears = 0;
  if (denominator > 0) {
    lifeYears = effectiveCapacityMah / denominator;
  }
  const lifeHours = lifeYears * HOURS_PER_YEAR;

  // 7. 支配要因 (dominantFactor) の決定
  // 寿命期間 L (years) に消費・損失した容量 (mAh) の内訳を算出して最大値を選ぶ
  // - sleep: I_sleep * 8760 * L
  // - tx: I_tx_avg * 8760 * L
  // - self_discharge: C_nominal * r * L
  // - temperature: C_nominal_aged * (1 - tempCoeff)
  // - pulse: C_nominal_aged * tempCoeff * (1 - pulseCoeff)
  const consumedSleep = sleepAverageCurrentMa * HOURS_PER_YEAR * lifeYears;
  const consumedTx = txAverageCurrentMa * HOURS_PER_YEAR * lifeYears;
  const consumedSelfDischarge = annualSelfDischargeMah * lifeYears;
  const lostTemperature = capacityAgedMah * (1 - tempCoeff);
  const lostPulse = capacityAgedMah * tempCoeff * (1 - pulseCoeff);

  const factorValues = {
    sleep: consumedSleep,
    tx: consumedTx,
    self_discharge: consumedSelfDischarge,
    temperature: lostTemperature,
    pulse: lostPulse
  };

  let dominantFactor: "sleep" | "tx" | "self_discharge" | "temperature" | "pulse" = "sleep";
  let maxVal = -1;
  for (const [key, val] of Object.entries(factorValues)) {
    if (val > maxVal) {
      maxVal = val;
      dominantFactor = key as typeof dominantFactor;
    }
  }

  // 8. 不動態化（Passivation）注意フラグ
  // 塩化チオニルリチウム（ボビン・スパイラル）で、長期スリープ (間隔が1時間以上、またはスリープ電流が10µA未満)
  const passivationWarning =
    profile.passivationRisk && (input.txIntervalS >= 3600 || input.sleepCurrentUa < 10);

  // 9. 10年超フラグ
  const exceedsTenYears = lifeYears > 10;

  // 自己放電の等価平均電流 (uA)
  const selfDischargeEquivalentUa = (annualSelfDischargeMah * 1000) / HOURS_PER_YEAR;

  return {
    lifeYears,
    lifeHours,
    dominantFactor,
    passivationWarning,
    exceedsTenYears,
    tempCoeff,
    pulseCoeff,
    averageCurrentUa: averageCurrentMa * 1000,
    txAverageCurrentUa: txAverageCurrentMa * 1000,
    rxAverageCurrentUa: rxAverageCurrentMa * 1000,
    sleepAverageCurrentUa: input.sleepCurrentUa,
    selfDischargeEquivalentUa,
    effectiveCapacityMah
  };
}
