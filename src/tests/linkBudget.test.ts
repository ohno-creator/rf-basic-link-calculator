import { describe, expect, it } from "vitest";
import { judgeLinkMargin } from "@/lib/rf/judgement";
import { calculateLinkBudget, type LinkBudgetInput } from "@/lib/rf/linkBudget";

const baseInput: LinkBudgetInput = {
  system: "LTE-M / NB-IoT",
  linkType: "cellular_base_station_to_iot_terminal",
  propagationModel: "free_space",
  pathLossExponent: 3,
  frequencyMHz: 800,
  distance: 1,
  distanceUnit: "km",
  txPowerDbm: 23,
  txAntennaGainDbi: -2,
  rxAntennaGainDbi: 0,
  txAntennaHeightM: 30,
  rxAntennaHeightM: 1.5,
  cableLossDb: 0.5,
  environmentLossDb: 10,
  groundProximityLossDb: 0,
  enclosureLossDb: 0,
  polarizationMismatchLossDb: 0,
  vehicleBodyObstructionLossDb: 0,
  installationMarginDb: 0,
  calibrationOffsetDb: 0,
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

  it("reduces margin when near-terminal losses increase", () => {
    const base = calculateLinkBudget(baseInput);
    const worse = calculateLinkBudget({ ...baseInput, groundProximityLossDb: 4, enclosureLossDb: 6 });

    expect(worse.nearTerminalLossDb).toBeCloseTo(10, 6);
    expect(worse.linkMarginDb).toBeCloseTo(base.linkMarginDb - 10, 6);
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
    expect(judgeLinkMargin(3).level).toBe("caution");
    expect(judgeLinkMargin(0).level).toBe("unstable");
    expect(judgeLinkMargin(-0.1).level).toBe("poor");
  });

  it("warns when Hata is used for low-height terminal links", () => {
    const result = calculateLinkBudget({
      ...baseInput,
      linkType: "terminal_to_terminal",
      propagationModel: "okumura_hata",
      txAntennaHeightM: 1,
      rxAntennaHeightM: 1
    });

    expect(result.warnings.some((warning) => warning.id === "low-terminal-hata")).toBe(true);
    expect(result.warnings.some((warning) => warning.id === "hata-out-of-range")).toBe(true);
  });

  it("warns when two-ray is used before the breakpoint", () => {
    const result = calculateLinkBudget({
      ...baseInput,
      linkType: "terminal_to_terminal",
      propagationModel: "two_ray",
      frequencyMHz: 2400,
      distance: 10,
      distanceUnit: "m",
      txAntennaHeightM: 1.2,
      rxAntennaHeightM: 1.2
    });

    expect(result.warnings.some((warning) => warning.id === "two-ray-before-breakpoint")).toBe(true);
  });

  it("uses the configured log-distance exponent", () => {
    const lower = calculateLinkBudget({
      ...baseInput,
      propagationModel: "log_distance",
      pathLossExponent: 2.2
    });
    const higher = calculateLinkBudget({
      ...baseInput,
      propagationModel: "log_distance",
      pathLossExponent: 3.5
    });

    expect(higher.pathLossDb).toBeGreaterThan(lower.pathLossDb);
    expect(higher.warnings.some((warning) => warning.id === "log-distance-exponent")).toBe(true);
  });
});
