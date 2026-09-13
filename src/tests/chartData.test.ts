import { describe, expect, it } from "vitest";
import {
  generateDistancePowerData,
  generateReachCurveData,
  simulateImprovements
} from "@/lib/rf/chartData";
import { defaultLinkBudgetInput } from "@/lib/rf/linkBudget";
import { solveMaxDistanceM } from "@/lib/rf/linkBudgetAdvisor";

describe("generateDistancePowerData", () => {
  const points = generateDistancePowerData(defaultLinkBudgetInput);

  it("returns one point per distance multiplier with a single current marker", () => {
    expect(points).toHaveLength(7);
    expect(points.filter((p) => p.current)).toHaveLength(1);
  });

  it("increases path loss (lower received power) with distance", () => {
    const powers = points.map((p) => p.receivedPowerDbm);
    const sorted = [...powers].sort((a, b) => b - a);
    // 距離が増えるほど受信電力は単調減少する。
    expect(powers).toEqual(sorted);
  });

  it("carries the sensitivity through to every point", () => {
    for (const p of points) {
      expect(p.sensitivityDbm).toBe(defaultLinkBudgetInput.receiverSensitivityDbm);
    }
  });
});

describe("generateReachCurveData", () => {
  const maxReachM = solveMaxDistanceM(defaultLinkBudgetInput);
  const points = generateReachCurveData(defaultLinkBudgetInput, maxReachM);

  it("距離に対してリンクマージンが単調減少する", () => {
    for (let i = 1; i < points.length; i += 1) {
      expect(points[i].distanceM).toBeGreaterThan(points[i - 1].distanceM);
      expect(points[i].linkMarginDb).toBeLessThanOrEqual(points[i - 1].linkMarginDb + 1e-6);
    }
  });

  it("到達限界（maxReachM）を範囲に含み、その付近で margin が 0 を跨ぐ", () => {
    expect(maxReachM).not.toBeNull();
    const reach = maxReachM as number;
    expect(points[0].distanceM).toBeLessThan(reach);
    expect(points[points.length - 1].distanceM).toBeGreaterThan(reach);
    const before = [...points].reverse().find((p) => p.distanceM <= reach);
    const after = points.find((p) => p.distanceM >= reach);
    expect(before && before.linkMarginDb).toBeGreaterThanOrEqual(0);
    expect(after && after.linkMarginDb).toBeLessThanOrEqual(0.5);
  });

  it("有限値のみを返す", () => {
    for (const p of points) {
      expect(Number.isFinite(p.distanceM)).toBe(true);
      expect(Number.isFinite(p.linkMarginDb)).toBe(true);
      expect(p.distanceLabel.length).toBeGreaterThan(0);
    }
  });
});

describe("simulateImprovements", () => {
  const sims = simulateImprovements(defaultLinkBudgetInput);

  it("returns the five improvement scenarios", () => {
    expect(sims).toHaveLength(5);
    for (const sim of sims) {
      expect(sim.label.length).toBeGreaterThan(0);
      expect(Number.isFinite(sim.marginDb)).toBe(true);
      expect(Number.isFinite(sim.deltaDb)).toBe(true);
    }
  });

  it("every listed improvement yields a non-negative margin delta", () => {
    // どの改善案もリンクマージンを悪化させない（+3dB利得・距離半減・感度改善など）。
    for (const sim of sims) {
      expect(sim.deltaDb).toBeGreaterThanOrEqual(0);
    }
  });

  it("matches each improvement scenario's actual margin delta", () => {
    const expectedDeltaDb = [3, 1, 3, 9.0309, 10];

    expect(sims.map((sim) => sim.deltaDb)).toEqual(
      expectedDeltaDb.map((expected) => expect.closeTo(expected, 4))
    );
  });
});
