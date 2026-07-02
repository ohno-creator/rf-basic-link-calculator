import { describe, expect, it } from "vitest";
import { calculateSimulation, defaultNamiGateInput } from "@/lib/rf/namiGate";

describe("NamiGate simulation", () => {
  it("changes absolute receive levels by glass loss while keeping provisional improvement constant", () => {
    const standard = calculateSimulation({ ...defaultNamiGateInput, glassType: "standard" });
    const reinforced = calculateSimulation({ ...defaultNamiGateInput, glassType: "reinforced" });

    expect(reinforced.offStats.avg).toBeCloseTo(standard.offStats.avg - 12, 5);
    expect(reinforced.onStats.avg).toBeCloseTo(standard.onStats.avg - 12, 5);
    expect(reinforced.diffStats.avg).toBeCloseTo(standard.diffStats.avg, 8);
  });
});
