import { describe, expect, it } from "vitest";
import { judgeLinkMargin } from "@/lib/rf/judgement";
import { calculateLinkBudget, type LinkBudgetInput } from "@/lib/rf/linkBudget";

const baseInput: LinkBudgetInput = {
  system: "LTE-M / NB-IoT",
  frequencyMHz: 800,
  distance: 1,
  distanceUnit: "km",
  txPowerDbm: 23,
  txAntennaGainDbi: -2,
  rxAntennaGainDbi: 0,
  cableLossDb: 0.5,
  environmentLossDb: 10,
  receiverSensitivityDbm: -105
};

describe("link budget calculations", () => {
  it("calculates received power and link margin", () => {
    const result = calculateLinkBudget(baseInput);

    expect(result.fsplDb).toBeCloseTo(90.5, 1);
    expect(result.receivedPowerDbm).toBeCloseTo(-80.0, 1);
    expect(result.linkMarginDb).toBeCloseTo(25.0, 1);
  });

  it("reduces margin when losses increase", () => {
    const base = calculateLinkBudget(baseInput);
    const worse = calculateLinkBudget({ ...baseInput, environmentLossDb: 20 });

    expect(worse.linkMarginDb).toBeLessThan(base.linkMarginDb);
  });

  it("increases margin when antenna gain improves", () => {
    const base = calculateLinkBudget(baseInput);
    const improved = calculateLinkBudget({
      ...baseInput,
      txAntennaGainDbi: baseInput.txAntennaGainDbi + 3
    });

    expect(improved.linkMarginDb).toBeCloseTo(base.linkMarginDb + 3, 6);
  });

  it("judges margins by the required thresholds", () => {
    expect(judgeLinkMargin(20).level).toBe("excellent");
    expect(judgeLinkMargin(10).level).toBe("good");
    expect(judgeLinkMargin(0).level).toBe("caution");
    expect(judgeLinkMargin(-0.1).level).toBe("poor");
  });
});
