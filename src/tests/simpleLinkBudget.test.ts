import { describe, expect, it } from "vitest";
import { calculateSimpleLinkBudget } from "@/lib/rf/simpleLinkBudget";

describe("simple link budget calculations", () => {
  it("calculates free-space received power and margin", () => {
    const result = calculateSimpleLinkBudget({
      frequencyMHz: 920,
      distance: 1,
      distanceUnit: "km",
      txPowerDbm: 13,
      antennaGainTotalDbi: 0,
      extraLossDb: 10,
      receiverSensitivityDbm: -120
    });

    expect(result.fsplDb).toBeCloseTo(91.7, 1);
    expect(result.receivedPowerDbm).toBeCloseTo(-88.7, 1);
    expect(result.linkMarginDb).toBeCloseTo(31.3, 1);
    expect(result.judgement.level).toBe("excellent");
  });

  it("handles meter distances and gain/loss adjustments", () => {
    const result = calculateSimpleLinkBudget({
      frequencyMHz: 2400,
      distance: 10,
      distanceUnit: "m",
      txPowerDbm: 0,
      antennaGainTotalDbi: -2,
      extraLossDb: 8,
      receiverSensitivityDbm: -95
    });

    expect(result.distanceKm).toBeCloseTo(0.01, 6);
    expect(result.fsplDb).toBeCloseTo(60.0, 1);
    expect(result.receivedPowerDbm).toBeCloseTo(-70.0, 1);
    expect(result.linkMarginDb).toBeCloseTo(25.0, 1);
  });

  it("rejects negative extra loss", () => {
    expect(() =>
      calculateSimpleLinkBudget({
        frequencyMHz: 920,
        distance: 1,
        distanceUnit: "km",
        txPowerDbm: 13,
        antennaGainTotalDbi: 0,
        extraLossDb: -1,
        receiverSensitivityDbm: -120
      })
    ).toThrow("追加損失は0以上");
  });
});
