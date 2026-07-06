import { describe, expect, it } from "vitest";
import { calculateBatteryLife } from "@/lib/rf/batteryLife";
import { RfError, RfErrorCode } from "@/lib/rf/errors";

describe("calculateBatteryLife", () => {
  it("2400mAh・45mA×50ms/h・sleep5µAで平均5.625µA・48.7年になる", () => {
    const result = calculateBatteryLife({
      capacityMah: 2400,
      txCurrentMa: 45,
      txDurationMs: 50,
      intervalSeconds: 3600,
      sleepCurrentUa: 5,
      deratingFactor: 1
    });
    expect(result.txAverageCurrentUa).toBeCloseTo(0.625, 10);
    expect(result.averageCurrentUa).toBeCloseTo(5.625, 10);
    expect(result.lifetimeHours).toBeCloseTo(426_666.6667, 3);
    expect(result.lifetimeYears).toBeCloseTo(48.7, 1);
    expect(result.exceedsTenYears).toBe(true);
  });

  it("derate=0.7で寿命が0.7倍になる", () => {
    const base = calculateBatteryLife({
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
    expect(derated.lifetimeHours).toBeCloseTo(base.lifetimeHours * 0.7, 10);
  });

  it("受信時間の平均電流寄与も加算する", () => {
    const result = calculateBatteryLife({
      capacityMah: 1000,
      txCurrentMa: 20,
      txDurationMs: 100,
      rxCurrentMa: 10,
      rxDurationMs: 200,
      intervalSeconds: 10,
      sleepCurrentUa: 100,
      deratingFactor: 1
    });
    expect(result.txAverageCurrentUa).toBeCloseTo(200, 10);
    expect(result.rxAverageCurrentUa).toBeCloseTo(200, 10);
    expect(result.averageCurrentUa).toBeCloseTo(500, 10);
  });

  it("0の活動時間を許容し、-0を返さない", () => {
    const result = calculateBatteryLife({
      capacityMah: 100,
      txCurrentMa: 10,
      txDurationMs: 0,
      intervalSeconds: 60,
      sleepCurrentUa: 10,
      deratingFactor: 1
    });
    expect(result.txAverageCurrentUa).toBe(0);
    expect(Object.is(result.txAverageCurrentUa, -0)).toBe(false);
  });

  it("無効な容量・負電流・derate・活動時間超過をRfErrorで拒否する", () => {
    expect(() =>
      calculateBatteryLife({ capacityMah: 0, txCurrentMa: 1, txDurationMs: 1, intervalSeconds: 1, sleepCurrentUa: 1, deratingFactor: 1 })
    ).toThrowError(RfError);
    expect(() =>
      calculateBatteryLife({ capacityMah: 1, txCurrentMa: -1, txDurationMs: 1, intervalSeconds: 1, sleepCurrentUa: 1, deratingFactor: 1 })
    ).toThrowError(RfError);
    expect(() =>
      calculateBatteryLife({ capacityMah: 1, txCurrentMa: 1, txDurationMs: 1, intervalSeconds: 1, sleepCurrentUa: 1, deratingFactor: 1.1 })
    ).toThrowError(RfError);
    expect(() =>
      calculateBatteryLife({
        capacityMah: Number.MAX_VALUE,
        txCurrentMa: 0,
        txDurationMs: 0,
        intervalSeconds: 1,
        sleepCurrentUa: 1,
        deratingFactor: 1
      })
    ).toThrowError(RfError);
    try {
      calculateBatteryLife({
        capacityMah: 1,
        txCurrentMa: 1,
        txDurationMs: 800,
        rxCurrentMa: 1,
        rxDurationMs: 300,
        intervalSeconds: 1,
        sleepCurrentUa: 1,
        deratingFactor: 1
      });
      expect.unreachable("RfErrorが送出されるはず");
    } catch (error) {
      expect(error).toBeInstanceOf(RfError);
      expect((error as RfError).code).toBe(RfErrorCode.InvalidInput);
      expect((error as RfError).field).toBe("active_duration");
    }
  });
});
