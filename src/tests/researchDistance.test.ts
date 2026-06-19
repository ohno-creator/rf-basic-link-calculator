import { describe, expect, it } from "vitest";
import {
  calculateAllowedMedianPathLossDb,
  calculateResearchDistance,
  calculateResearchPathLossDb,
  defaultResearchDistanceInput
} from "@/lib/rf/researchDistance";

describe("research distance calculations", () => {
  it("solves CI distance from the allowed median path loss", () => {
    const input = {
      ...defaultResearchDistanceInput,
      model: "ci" as const,
      frequencyGHz: 1,
      pathLossExponent: 2,
      txPowerDbm: 30,
      txAntennaGainDbi: 0,
      rxAntennaGainDbi: 0,
      cableLossDb: 0,
      clutterLossDb: 0,
      nearTerminalLossDb: 0,
      calibrationOffsetDb: 0,
      receiverSensitivityDbm: -70,
      shadowFadingStdDb: 0,
      reliabilityPercent: 50 as const,
      fadeMarginDb: 0,
      maxDistanceKm: 10
    };

    const result = calculateResearchDistance(input);

    expect(calculateAllowedMedianPathLossDb(input)).toBeCloseTo(100, 6);
    expect(result.maximumDistanceM).toBeCloseTo(2388, 0);
  });

  it("reduces maximum distance when target reliability increases", () => {
    const base = {
      ...defaultResearchDistanceInput,
      model: "ci" as const,
      shadowFadingStdDb: 7,
      fadeMarginDb: 0,
      reliabilityPercent: 50 as const
    };
    const median = calculateResearchDistance(base);
    const reliable = calculateResearchDistance({ ...base, reliabilityPercent: 95 as const });

    expect(reliable.maximumDistanceM).not.toBeNull();
    expect(median.maximumDistanceM).not.toBeNull();
    expect(reliable.maximumDistanceM ?? 0).toBeLessThan(median.maximumDistanceM ?? 0);
    expect(reliable.reliabilityMarginDb).toBeGreaterThan(median.reliabilityMarginDb);
  });

  it("calculates higher loss for 3GPP UMi NLOS than UMi LOS", () => {
    const losInput = {
      ...defaultResearchDistanceInput,
      model: "tr38901_umi_los" as const,
      frequencyGHz: 3.5,
      txAntennaHeightM: 10,
      rxAntennaHeightM: 1.5
    };
    const nlosInput = { ...losInput, model: "tr38901_umi_nlos" as const };
    const distanceM = 500;

    expect(calculateResearchPathLossDb(nlosInput, distanceM)).toBeGreaterThan(
      calculateResearchPathLossDb(losInput, distanceM)
    );
  });

  it("warns when 3GPP UMa is used outside height assumptions", () => {
    const result = calculateResearchDistance({
      ...defaultResearchDistanceInput,
      model: "tr38901_uma_nlos",
      txAntennaHeightM: 2,
      rxAntennaHeightM: 1
    });

    expect(result.warnings.some((warning) => warning.id === "tr38901-uma-base-height")).toBe(true);
    expect(result.warnings.some((warning) => warning.id === "tr38901-terminal-height")).toBe(true);
    expect(result.warnings.some((warning) => warning.id === "low-height-3gpp")).toBe(true);
  });
});
