import { describe, expect, it } from "vitest";
import { calculateBatteryLife } from "@/lib/rf/batteryLife";
import { RfError, RfErrorCode } from "@/lib/rf/errors";

describe("calculateBatteryLife（G19・電池寿命）", () => {
  it("2400mAh・TX45mA×50ms/h・sleep5µA → 平均5.625µA・48.67年", () => {
    const result = calculateBatteryLife({
      capacityMah: 2400,
      txCurrentMa: 45,
      txDurationMs: 50,
      intervalSeconds: 3600,
      sleepCurrentUa: 5,
      deratingFactor: 1
    });
    expect(result.txAverageCurrentUa).toBeCloseTo(0.625, 12);
    expect(result.rxAverageCurrentUa).toBe(0);
    expect(result.sleepCurrentUa).toBe(5);
    expect(result.averageCurrentUa).toBeCloseTo(5.625, 12);
    expect(result.lifetimeHours).toBeCloseTo(426_666.6667, 3);
    expect(result.lifetimeYears).toBeCloseTo(48.706, 3);
    expect(result.exceedsTenYears).toBe(true);
  });

  it("derate=0.7で寿命だけが0.7倍になり平均電流は不変", () => {
    const full = calculateBatteryLife({
      capacityMah: 2400,
      txCurrentMa: 45,
      txDurationMs: 50,
      intervalSeconds: 3600,
      sleepCurrentUa: 5,
      deratingFactor: 1
    });
    const derated = calculateBatteryLife({
      capacityMah: 2400,
      txCurrentMa: 45,
      txDurationMs: 50,
      intervalSeconds: 3600,
      sleepCurrentUa: 5,
      deratingFactor: 0.7
    });
    expect(derated.averageCurrentUa).toBeCloseTo(full.averageCurrentUa, 12);
    expect(derated.lifetimeHours).toBeCloseTo(full.lifetimeHours * 0.7, 10);
  });

  it("RX電流を任意入力でき、TX/RX/sleepの平均電流和に一致する", () => {
    const result = calculateBatteryLife({
      capacityMah: 1000,
      txCurrentMa: 30,
      txDurationMs: 100,
      rxCurrentMa: 10,
      rxDurationMs: 200,
      intervalSeconds: 10,
      sleepCurrentUa: 2,
      deratingFactor: 0.7
    });
    expect(result.txAverageCurrentUa).toBeCloseTo(300, 12);
    expect(result.rxAverageCurrentUa).toBeCloseTo(200, 12);
    expect(result.averageCurrentUa).toBeCloseTo(502, 12);
  });

  it("0電流の各区間は-0を返さない", () => {
    const result = calculateBatteryLife({
      capacityMah: 1000,
      txCurrentMa: 0,
      txDurationMs: 0,
      intervalSeconds: 60,
      sleepCurrentUa: 1,
      deratingFactor: 0.7
    });
    expect(Object.is(result.txAverageCurrentUa, -0)).toBe(false);
    expect(Object.is(result.rxAverageCurrentUa, -0)).toBe(false);
  });

  it("ガード: 容量/周期>0、各電流/時間>=0、0<derate<=1、duty合計<=100%", () => {
    expect(() => calculateBatteryLife({ capacityMah: 0, txCurrentMa: 1, txDurationMs: 1, intervalSeconds: 1, sleepCurrentUa: 1, deratingFactor: 0.7 })).toThrowError(RfError);
    expect(() => calculateBatteryLife({ capacityMah: 1, txCurrentMa: -1, txDurationMs: 1, intervalSeconds: 1, sleepCurrentUa: 1, deratingFactor: 0.7 })).toThrowError(RfError);
    expect(() => calculateBatteryLife({ capacityMah: 1, txCurrentMa: 1, txDurationMs: 1001, intervalSeconds: 1, sleepCurrentUa: 1, deratingFactor: 0.7 })).toThrowError(RfError);
    expect(() => calculateBatteryLife({ capacityMah: 1, txCurrentMa: 1, txDurationMs: 1, intervalSeconds: 1, sleepCurrentUa: 1, deratingFactor: 0 })).toThrowError(RfError);
    expect(() => calculateBatteryLife({ capacityMah: 1, txCurrentMa: 1, txDurationMs: 1, intervalSeconds: 1, sleepCurrentUa: 1, deratingFactor: 1.1 })).toThrowError(RfError);
    expect(() => calculateBatteryLife({ capacityMah: 1, txCurrentMa: 0, txDurationMs: 0, intervalSeconds: 1, sleepCurrentUa: 0, deratingFactor: 0.7 })).toThrowError(RfError);

    try {
      calculateBatteryLife({ capacityMah: 1, txCurrentMa: 1, txDurationMs: 1001, intervalSeconds: 1, sleepCurrentUa: 1, deratingFactor: 0.7 });
      expect.unreachable("RfError が送出されるはず");
    } catch (error) {
      expect(error).toBeInstanceOf(RfError);
      expect((error as RfError).code).toBe(RfErrorCode.InvalidInput);
      expect((error as RfError).field).toBe("active_duration");
    }
  });
});
