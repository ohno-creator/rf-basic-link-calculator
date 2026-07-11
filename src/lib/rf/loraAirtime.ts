/**
 * LoRa のパケット Time-on-Air（ToA）計算。
 *
 *   Tsym[s] = 2^SF / BW[Hz]
 *   Tpre[s] = (Npre + 4.25) · Tsym
 *   Npayload = 8 + max(
 *     ceil((8PL - 4SF + 28 + 16CRC - 20IH) / (4(SF - 2DE))) · (CR + 4),
 *     0
 *   )
 *   ToA = Tpre + Npayload · Tsym
 *
 * PL は payload bytes、CRC/IH/DE は 0 または1、CR は符号化率 4/(CR+4) の
 * CR=1..4。APIでは読み違いを避けるため codingRateDenominator=5..8 として受け取る。
 * BW は入力[kHz]から[Hz]へ変換し、結果の時間は[ms]で返す。
 *
 * 低データレート最適化 DE は、明示指定がなければ Tsym >= 16.384ms で有効にする。
 * これは BW=125kHz の SF11/12 等、長いシンボルでクロックドリフト耐性を確保する条件。
 *
 * 出典: Semtech AN1200.13, LoRa Modem Designer's Guide。
 * 適用条件: Raw LoRa PHY のパケット時間。LoRaWAN MACヘッダやアプリケーション独自の
 * オーバーヘッドは payloadBytes に含める。再送・受信窓・チャネル待ちは含まない。
 */

import {
  assertFinite,
  assertNonNegative,
  assertPositiveFinite,
  RfError,
  RfErrorCode
} from "./errors";

export type LoRaAirtimeInput = {
  /** 拡散率 SF（整数7..12）。 */
  spreadingFactor: number;
  /** 帯域幅 [kHz]。 */
  bandwidthKhz: number;
  /** ペイロード [bytes]（0以上の整数）。PHY以外のオーバーヘッドも必要に応じて含める。 */
  payloadBytes: number;
  /** 符号化率 4/5..4/8 の分母（整数5..8）。 */
  codingRateDenominator: number;
  /** プリアンブル [symbols]（整数6以上）。 */
  preambleSymbols: number;
  /** true=Explicit Header、false=Implicit Header。 */
  explicitHeader: boolean;
  /** ペイロードCRCの有無。 */
  crcEnabled: boolean;
  /** 省略時はシンボル長から自動判定。 */
  lowDataRateOptimization?: boolean;
};

export type LoRaAirtimeResult = {
  airtimeMs: number;
  symbolDurationMs: number;
  preambleDurationMs: number;
  payloadDurationMs: number;
  payloadSymbols: number;
  lowDataRateOptimization: boolean;
};

function assertIntegerInRange(value: number, min: number, max: number, field: string): void {
  assertFinite(value, field);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RfError(RfErrorCode.OutOfDomain, { field, min, max });
  }
}

function assertNonNegativeInteger(value: number, field: string): void {
  assertNonNegative(value, field);
  if (!Number.isInteger(value)) {
    throw new RfError(RfErrorCode.InvalidInput, { field });
  }
}

/** Semtech AN1200.13 のシンボル数式から Raw LoRa ToA[ms]を求める。 */
export function calculateLoRaAirtime(input: LoRaAirtimeInput): LoRaAirtimeResult {
  const spreadingFactor = input.spreadingFactor;
  const payloadBytes = input.payloadBytes;
  assertIntegerInRange(spreadingFactor, 7, 12, "spreading_factor");
  assertPositiveFinite(input.bandwidthKhz, "bandwidth");
  assertNonNegativeInteger(payloadBytes, "payload_bytes");
  assertIntegerInRange(input.codingRateDenominator, 5, 8, "coding_rate_denominator");
  assertAtLeastInteger(input.preambleSymbols, 6, "preamble_symbols");

  const symbolDurationMs = Math.pow(2, spreadingFactor) / input.bandwidthKhz;
  const lowDataRateOptimization =
    input.lowDataRateOptimization ?? symbolDurationMs >= 16.384;
  const crc = input.crcEnabled ? 1 : 0;
  const implicitHeader = input.explicitHeader ? 0 : 1;
  const de = lowDataRateOptimization ? 1 : 0;
  const codingRate = input.codingRateDenominator - 4;

  const numerator =
    8 * payloadBytes - 4 * spreadingFactor + 28 + 16 * crc - 20 * implicitHeader;
  const denominator = 4 * (spreadingFactor - 2 * de);
  const payloadSymbols =
    8 + Math.max(Math.ceil(numerator / denominator) * (codingRate + 4), 0);
  const preambleDurationMs = (input.preambleSymbols + 4.25) * symbolDurationMs;
  const payloadDurationMs = payloadSymbols * symbolDurationMs;
  const airtimeMs = preambleDurationMs + payloadDurationMs;

  return {
    airtimeMs,
    symbolDurationMs,
    preambleDurationMs,
    payloadDurationMs,
    payloadSymbols,
    lowDataRateOptimization
  };
}

function assertAtLeastInteger(value: number, min: number, field: string): void {
  assertFinite(value, field);
  if (!Number.isInteger(value) || value < min) {
    throw new RfError(RfErrorCode.BelowMinimum, { field, min });
  }
}

/**
 * 地域・無線局区分ごとに data 層から渡す送信時間制限。
 * lib層は規格改定に依存する数値を保持しない。
 */
export type LoRaTransmissionLimits = {
  /** 1送信の上限 [ms]。 */
  maxContinuousMs: number;
  /** 上限内だが実務上注意を出す境界 [ms]。 */
  boundaryWarningMs: number;
  /** 1時間の累積送信時間上限 [ms]。 */
  maxHourlyAirtimeMs: number;
  /** 送信後の最小休止時間 [ms]。 */
  minimumIntermissionMs: number;
};

export type LoRaTransmissionStatus = "compliant" | "boundary" | "noncompliant";

export type LoRaTransmissionLimitResult = {
  status: LoRaTransmissionStatus;
  continuousTransmissionPass: boolean;
  hourlyAirtimePass: boolean;
  intermissionPass: boolean;
  hourlyAirtimeMs: number;
  requiredIntermissionMs: number;
  maximumTransmissionsPerHour: number;
};

/**
 * ToAと運用条件を、外部から渡された連続送信・時間総量・休止時間の制限に照合する。
 * 時間はすべて線形値[ms]であり、dB量は扱わない。
 */
export function evaluateLoRaTransmissionLimits(input: {
  airtimeMs: number;
  transmissionsPerHour: number;
  intermissionMs: number;
  limits: LoRaTransmissionLimits;
}): LoRaTransmissionLimitResult {
  assertPositiveFinite(input.airtimeMs, "airtime");
  assertNonNegativeInteger(input.transmissionsPerHour, "transmissions_per_hour");
  assertNonNegative(input.intermissionMs, "intermission");
  assertPositiveFinite(input.limits.maxContinuousMs, "max_continuous");
  assertNonNegative(input.limits.boundaryWarningMs, "boundary_warning");
  assertPositiveFinite(input.limits.maxHourlyAirtimeMs, "max_hourly_airtime");
  assertNonNegative(input.limits.minimumIntermissionMs, "minimum_intermission");

  if (input.limits.boundaryWarningMs > input.limits.maxContinuousMs) {
    throw new RfError(RfErrorCode.InvalidInput, { field: "boundary_warning" });
  }

  const hourlyAirtimeMs = input.airtimeMs * input.transmissionsPerHour;
  const requiredIntermissionMs = input.limits.minimumIntermissionMs;
  const continuousTransmissionPass = input.airtimeMs <= input.limits.maxContinuousMs;
  const hourlyAirtimePass = hourlyAirtimeMs <= input.limits.maxHourlyAirtimeMs;
  const intermissionPass = input.intermissionMs >= requiredIntermissionMs;
  const maximumTransmissionsPerHour = Math.floor(
    input.limits.maxHourlyAirtimeMs / input.airtimeMs
  );

  const status: LoRaTransmissionStatus =
    !continuousTransmissionPass || !hourlyAirtimePass || !intermissionPass
      ? "noncompliant"
      : input.airtimeMs > input.limits.boundaryWarningMs
        ? "boundary"
        : "compliant";

  return {
    status,
    continuousTransmissionPass,
    hourlyAirtimePass,
    intermissionPass,
    hourlyAirtimeMs,
    requiredIntermissionMs,
    maximumTransmissionsPerHour
  };
}
