import { describe, expect, it } from "vitest";
import { estimateExpertBatteryLife, interpolateTempCoeff } from "@/lib/rf/batteryLifeExpert";
import { RfError } from "@/lib/rf/errors";

describe("estimateExpertBatteryLife（電池寿命エキスパートモード）", () => {
  it("温度係数補間のテスト", () => {
    const coeffs = {
      [-20]: 0.50,
      [0]: 0.80,
      [25]: 1.00,
      [60]: 0.95
    };

    // クランプテスト
    expect(interpolateTempCoeff(-30, coeffs)).toBe(0.50);
    expect(interpolateTempCoeff(70, coeffs)).toBe(0.95);

    // 代表点
    expect(interpolateTempCoeff(-20, coeffs)).toBe(0.50);
    expect(interpolateTempCoeff(0, coeffs)).toBe(0.80);
    expect(interpolateTempCoeff(25, coeffs)).toBe(1.00);
    expect(interpolateTempCoeff(60, coeffs)).toBe(0.95);

    // 補間点
    // -10℃は -20℃(0.5) と 0℃(0.8) の中間 → 0.65
    expect(interpolateTempCoeff(-10, coeffs)).toBeCloseTo(0.65, 5);
    // 12.5℃は 0℃(0.8) と 25℃(1.0) の中間 → 0.90
    expect(interpolateTempCoeff(12.5, coeffs)).toBeCloseTo(0.90, 5);
    // 42.5℃は 25℃(1.0) と 60℃(0.95) の中間 → 0.975
    expect(interpolateTempCoeff(42.5, coeffs)).toBeCloseTo(0.975, 5);
  });

  it("ER14505 AA Li-SOCl2 ボビン型テスト (大パルス・パルスロス支配)", () => {
    const result = estimateExpertBatteryLife({
      chemistry: "lisocl2_bobbin",
      capacityMah: 2400,
      temperatureC: 25,
      sleepCurrentUa: 5,
      txCurrentMa: 45,
      txDurationMs: 50,
      txIntervalS: 3600,
      rxCurrentMa: 0,
      rxDurationMs: 0,
      agingYears: 0
    });

    // 手計算検証値:
    // txAverageCurrentMa = 45 * 0.05 / 3600 = 0.000625 mA
    // sleepAverageCurrentMa = 0.005 mA
    // averageCurrentMa = 0.005625 mA
    // pulseRatio = 45 / 0.005625 = 8000 (> 100x -> pulseCoeff = 0.40)
    // effectiveCapacity = 2400 * 1.0 * 0.4 = 960 mAh
    // annualSelfDischarge = 2400 * 0.01 = 24 mAh/year
    // denominator = 0.005625 * 8760 + 24 = 49.275 + 24 = 73.275 mAh/year
    // lifeYears = 960 / 73.275 = 13.10133... years
    expect(result.averageCurrentUa).toBeCloseTo(5.625, 5);
    expect(result.tempCoeff).toBe(1.00);
    expect(result.pulseCoeff).toBe(0.40);
    expect(result.effectiveCapacityMah).toBe(960);
    expect(result.lifeYears).toBeCloseTo(13.10133, 4);
    expect(result.exceedsTenYears).toBe(true);
    expect(result.passivationWarning).toBe(true);
    expect(result.dominantFactor).toBe("pulse"); // pulse lost = 1440 mAh, consumed self discharge = 314 mAh
  });

  it("Alkaline AA 低温・高パルス・温度ロス支配テスト", () => {
    const result = estimateExpertBatteryLife({
      chemistry: "alkaline_aa",
      capacityMah: 2800,
      temperatureC: -20,
      sleepCurrentUa: 10,
      txCurrentMa: 15,
      txDurationMs: 10,
      txIntervalS: 10,
      rxCurrentMa: 0,
      rxDurationMs: 0,
      agingYears: 0
    });

    // 手計算値:
    // txAverage = 15 * 0.01 / 10 = 0.015 mA
    // sleepAverage = 0.01 mA
    // average = 0.025 mA
    // tempCoeff = 0.30, pulseCoeff = 0.50 (ratio = 15 / 0.025 = 600 > 100x)
    // effectiveCapacity = 2800 * 0.30 * 0.50 = 420 mAh
    // annualSelfDischarge = 2800 * 0.025 = 70 mAh/year
    // denominator = 0.025 * 8760 + 70 = 219 + 70 = 289 mAh/year
    // lifeYears = 420 / 289 = 1.453287... years
    expect(result.averageCurrentUa).toBe(25);
    expect(result.tempCoeff).toBe(0.30);
    expect(result.pulseCoeff).toBe(0.50);
    expect(result.effectiveCapacityMah).toBe(420);
    expect(result.lifeYears).toBeCloseTo(1.453287, 4);
    expect(result.dominantFactor).toBe("temperature"); // lost temp = 2800 * 0.7 = 1960 mAh
  });

  it("CR2032 極低消費電力・自己放電支配テスト", () => {
    const result = estimateExpertBatteryLife({
      chemistry: "cr2032",
      capacityMah: 225,
      temperatureC: 25,
      sleepCurrentUa: 0.1,
      txCurrentMa: 0.001, // 非常に小さいので比が小さくpulseCoeffはlowの0.90になる
      txDurationMs: 10,
      txIntervalS: 3600,
      rxCurrentMa: 0,
      rxDurationMs: 0,
      agingYears: 0
    });

    // ほとんど自己放電 (年1% = 2.25 mAh/year) とスリープ (0.1uA = 0.876 mAh/year) で消費
    expect(result.dominantFactor).toBe("self_discharge");
  });

  it("経年 (agingYears) ありテスト", () => {
    const withoutAging = estimateExpertBatteryLife({
      chemistry: "limno2",
      capacityMah: 1500,
      temperatureC: 25,
      sleepCurrentUa: 5,
      txCurrentMa: 45,
      txDurationMs: 50,
      txIntervalS: 3600,
      rxCurrentMa: 0,
      rxDurationMs: 0,
      agingYears: 0
    });

    const withAging5Years = estimateExpertBatteryLife({
      chemistry: "limno2",
      capacityMah: 1500,
      temperatureC: 25,
      sleepCurrentUa: 5,
      txCurrentMa: 45,
      txDurationMs: 50,
      txIntervalS: 3600,
      rxCurrentMa: 0,
      rxDurationMs: 0,
      agingYears: 5
    });

    // 5年経年により 1500 * (1 - 0.01 * 5) = 1425 mAh の公称容量になるため、寿命も低下するはず
    expect(withAging5Years.effectiveCapacityMah).toBeLessThan(withoutAging.effectiveCapacityMah);
    expect(withAging5Years.lifeYears).toBeLessThan(withoutAging.lifeYears);
  });

  it("異常・境界値エラーチェック", () => {
    // 存在しない化学タイプ
    expect(() => estimateExpertBatteryLife({
      chemistry: "nonexistent",
      capacityMah: 1000,
      temperatureC: 25,
      sleepCurrentUa: 5,
      txCurrentMa: 10,
      txDurationMs: 10,
      txIntervalS: 60
    })).toThrowError(RfError);

    // 動作時間が周期を超える
    expect(() => estimateExpertBatteryLife({
      chemistry: "limno2",
      capacityMah: 1500,
      temperatureC: 25,
      sleepCurrentUa: 5,
      txCurrentMa: 10,
      txDurationMs: 5000,
      txIntervalS: 4,
      rxCurrentMa: 5,
      rxDurationMs: 0
    })).toThrowError(RfError);
  });
});
