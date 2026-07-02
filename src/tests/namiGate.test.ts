import { describe, expect, it } from "vitest";
import {
  calculateFsplDb,
  calculateSimulation,
  defaultNamiGateInput,
  normalizeNamiGateInput
} from "@/lib/rf/namiGate";

describe("NamiGate simulation", () => {
  it("changes absolute receive levels by glass loss while keeping provisional improvement constant", () => {
    const standard = calculateSimulation({ ...defaultNamiGateInput, glassType: "standard" });
    const reinforced = calculateSimulation({ ...defaultNamiGateInput, glassType: "reinforced" });

    expect(reinforced.offStats.avg).toBeCloseTo(standard.offStats.avg - 12, 5);
    expect(reinforced.onStats.avg).toBeCloseTo(standard.onStats.avg - 12, 5);
    expect(reinforced.diffStats.avg).toBeCloseTo(standard.diffStats.avg, 8);
  });

  it.each([0, -4, Number.NaN])(
    "keeps all outputs finite for invalid frequency %s GHz",
    (frequencyGHz) => {
      const sim = calculateSimulation({ ...defaultNamiGateInput, frequencyGHz });

      expect(Number.isFinite(sim.offStats.avg)).toBe(true);
      expect(Number.isFinite(sim.onStats.avg)).toBe(true);
      expect(Number.isFinite(sim.diffStats.avg)).toBe(true);
      expect(Number.isFinite(sim.derived.outdoorLossDb)).toBe(true);
    }
  );

  it("falls back to defaults for non-positive distances and room size", () => {
    const sim = calculateSimulation({
      ...defaultNamiGateInput,
      outdoorDistanceM: Number.NaN,
      roomWidthM: 0,
      roomDepthM: -3
    });
    const baseline = calculateSimulation(defaultNamiGateInput);

    expect(sim.offStats.avg).toBeCloseTo(baseline.offStats.avg, 5);
    expect(sim.diffStats.avg).toBeCloseTo(baseline.diffStats.avg, 5);
  });

  it("guards calculateFsplDb against zero/NaN inputs", () => {
    expect(Number.isFinite(calculateFsplDb(10, 0))).toBe(true);
    expect(Number.isFinite(calculateFsplDb(10, -4))).toBe(true);
    expect(Number.isFinite(calculateFsplDb(Number.NaN, 4.8))).toBe(true);
  });

  it("uses the same default-distance fallback as input normalization", () => {
    const defaultLossDb = calculateFsplDb(defaultNamiGateInput.outdoorDistanceM, 4.8);

    expect(calculateFsplDb(0, 4.8)).toBeCloseTo(defaultLossDb, 8);
    expect(calculateFsplDb(Number.NaN, 4.8)).toBeCloseTo(defaultLossDb, 8);
    // 有効な小距離は既定値へ戻さず、0.1mの物理床のみ適用する。
    expect(calculateFsplDb(0.05, 4.8)).toBeCloseTo(calculateFsplDb(0.1, 4.8), 8);
  });

  it("normalizes invalid input fields to defaults while keeping valid ones", () => {
    const normalized = normalizeNamiGateInput({
      ...defaultNamiGateInput,
      frequencyGHz: -1,
      txPowerDbm: Number.NaN,
      roomWidthM: 8
    });

    expect(normalized.frequencyGHz).toBe(defaultNamiGateInput.frequencyGHz);
    expect(normalized.txPowerDbm).toBe(defaultNamiGateInput.txPowerDbm);
    expect(normalized.roomWidthM).toBe(8);
  });

  it("keeps valid negative and small-positive fields through normalization", () => {
    const normalized = normalizeNamiGateInput({
      ...defaultNamiGateInput,
      txPowerDbm: -5,
      incidentAngleDeg: -60,
      outdoorDistanceM: 0.05
    });

    expect(normalized.txPowerDbm).toBe(-5);
    expect(normalized.incidentAngleDeg).toBe(-60);
    expect(normalized.outdoorDistanceM).toBe(0.05);
  });
});
