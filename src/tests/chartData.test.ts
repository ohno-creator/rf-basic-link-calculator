import { describe, expect, it } from "vitest";
import { generateDistancePowerData, simulateImprovements } from "@/lib/rf/chartData";
import { defaultLinkBudgetInput } from "@/lib/rf/linkBudget";

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
});
