import { describe, expect, it } from "vitest";
import {
  calculateLoRaAirtime,
  evaluateLoRaTransmissionLimits,
  type LoRaAirtimeInput
} from "@/lib/rf/loraAirtime";
import { RfError } from "@/lib/rf/errors";

const baseInput: Omit<LoRaAirtimeInput, "payloadBytes" | "spreadingFactor"> = {
  bandwidthKhz: 125,
  codingRateDenominator: 5,
  preambleSymbols: 8,
  explicitHeader: true,
  crcEnabled: true
};

describe("calculateLoRaAirtime（Semtech AN1200.13）", () => {
  it.each([
    [10, 7, 41.2],
    [10, 10, 288.8],
    [10, 12, 991.2],
    [50, 7, 97.5],
    [50, 10, 616.4],
    [50, 12, 2302.0],
    [100, 7, 174.3],
    [100, 10, 1026.0],
    [100, 12, 3940.4]
  ])("%i bytes・SF%i → %f ms", (payloadBytes, spreadingFactor, expectedMs) => {
    const result = calculateLoRaAirtime({
      ...baseInput,
      payloadBytes,
      spreadingFactor
    });

    expect(result.airtimeMs).toBeCloseTo(expectedMs, 1);
  });

  it("SF12・BW125kHzでは低データレート最適化を自動適用する", () => {
    const result = calculateLoRaAirtime({
      ...baseInput,
      payloadBytes: 50,
      spreadingFactor: 12
    });

    expect(result.lowDataRateOptimization).toBe(true);
    expect(result.payloadSymbols).toBe(58);
    expect(result.symbolDurationMs).toBeCloseTo(32.768, 12);
  });

  it("SF7・BW125kHzでは低データレート最適化を適用しない", () => {
    const result = calculateLoRaAirtime({
      ...baseInput,
      payloadBytes: 10,
      spreadingFactor: 7
    });

    expect(result.lowDataRateOptimization).toBe(false);
    expect(result.payloadSymbols).toBe(28);
    expect(result.preambleDurationMs).toBeCloseTo(12.544, 12);
  });

  it("ガード: SF/BW/CR/ペイロード/プリアンブルの定義域外は RfError", () => {
    expect(() => calculateLoRaAirtime({ ...baseInput, payloadBytes: 10, spreadingFactor: 6 })).toThrowError(RfError);
    expect(() => calculateLoRaAirtime({ ...baseInput, payloadBytes: 10, spreadingFactor: 13 })).toThrowError(RfError);
    expect(() => calculateLoRaAirtime({ ...baseInput, payloadBytes: 10, spreadingFactor: 7, bandwidthKhz: 0 })).toThrowError(RfError);
    expect(() => calculateLoRaAirtime({ ...baseInput, payloadBytes: 10, spreadingFactor: 7, codingRateDenominator: 9 })).toThrowError(RfError);
    expect(() => calculateLoRaAirtime({ ...baseInput, payloadBytes: -1, spreadingFactor: 7 })).toThrowError(RfError);
    expect(() => calculateLoRaAirtime({ ...baseInput, payloadBytes: 10.5, spreadingFactor: 7 })).toThrowError(RfError);
    expect(() => calculateLoRaAirtime({ ...baseInput, payloadBytes: 10, spreadingFactor: 7, preambleSymbols: 5 })).toThrowError(RfError);
  });
});

describe("evaluateLoRaTransmissionLimits（規制値はdata層から注入）", () => {
  const limits = {
    maxContinuousMs: 4000,
    boundaryWarningMs: 3900,
    maxHourlyAirtimeMs: 360_000,
    minimumIntermissionMs: 50
  };

  it("3940.352msは4秒以内だが3.9秒超の境界警告", () => {
    const result = evaluateLoRaTransmissionLimits({
      airtimeMs: 3940.352,
      transmissionsPerHour: 1,
      intermissionMs: 50,
      limits
    });

    expect(result.status).toBe("boundary");
    expect(result.continuousTransmissionPass).toBe(true);
    expect(result.hourlyAirtimePass).toBe(true);
    expect(result.intermissionPass).toBe(true);
    expect(result.maximumTransmissionsPerHour).toBe(91);
  });

  it("4秒超は不適合", () => {
    const result = evaluateLoRaTransmissionLimits({
      airtimeMs: 4000.1,
      transmissionsPerHour: 1,
      intermissionMs: 50,
      limits
    });

    expect(result.status).toBe("noncompliant");
    expect(result.continuousTransmissionPass).toBe(false);
  });

  it("累積送信時間または休止時間が不足すれば不適合", () => {
    const result = evaluateLoRaTransmissionLimits({
      airtimeMs: 1000,
      transmissionsPerHour: 361,
      intermissionMs: 49,
      limits
    });

    expect(result.status).toBe("noncompliant");
    expect(result.hourlyAirtimePass).toBe(false);
    expect(result.intermissionPass).toBe(false);
    expect(result.requiredIntermissionMs).toBe(50);
  });

  it("ちょうど各上限・下限なら適合", () => {
    const result = evaluateLoRaTransmissionLimits({
      airtimeMs: 1000,
      transmissionsPerHour: 360,
      intermissionMs: 50,
      limits
    });

    expect(result.status).toBe("compliant");
    expect(result.hourlyAirtimeMs).toBe(360_000);
  });

  it("ガード: 制限値と運用値の不正入力は RfError", () => {
    expect(() => evaluateLoRaTransmissionLimits({ airtimeMs: 0, transmissionsPerHour: 1, intermissionMs: 1, limits })).toThrowError(RfError);
    expect(() => evaluateLoRaTransmissionLimits({ airtimeMs: 1, transmissionsPerHour: -1, intermissionMs: 1, limits })).toThrowError(RfError);
    expect(() => evaluateLoRaTransmissionLimits({ airtimeMs: 1, transmissionsPerHour: 1.5, intermissionMs: 1, limits })).toThrowError(RfError);
    expect(() => evaluateLoRaTransmissionLimits({ airtimeMs: 1, transmissionsPerHour: 1, intermissionMs: 1, limits: { ...limits, boundaryWarningMs: 4001 } })).toThrowError(RfError);
  });
});
