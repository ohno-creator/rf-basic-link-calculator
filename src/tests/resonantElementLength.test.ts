import { describe, expect, it } from "vitest";
import {
  freeSpaceWavelengthM,
  resonantElementLength,
  type ResonantLengthInput
} from "@/lib/rf/resonantElementLength";

function input(overrides: Partial<ResonantLengthInput> = {}): ResonantLengthInput {
  return {
    frequencyMHz: 920,
    type: "monopole_quarter",
    shorteningFactor: 0.95,
    velocityFactor: 1,
    ...overrides
  };
}

describe("freeSpaceWavelengthM", () => {
  it("920MHzで約0.3258m", () => {
    expect(freeSpaceWavelengthM(920)).toBeCloseTo(0.32586, 4);
  });

  it("周波数が0以下なら例外", () => {
    expect(() => freeSpaceWavelengthM(0)).toThrow();
  });
});

describe("resonantElementLength", () => {
  it("λ/4モノポール: 920MHz・k=0.95で約77.4mm、片側長はnull", () => {
    const r = resonantElementLength(input());
    expect(r.fraction).toBe(0.25);
    expect(r.idealLengthM).toBeCloseTo(0.32586 / 4, 4);
    expect(r.physicalLengthM).toBeCloseTo(0.32586 / 4 * 0.95, 4); // ≈0.07739m
    expect(r.armLengthM).toBeNull();
  });

  it("λ/2ダイポール: 全長=fraction·λ·k、片側はその半分", () => {
    const r = resonantElementLength(input({ type: "dipole_half" }));
    expect(r.fraction).toBe(0.5);
    expect(r.physicalLengthM).toBeCloseTo(0.32586 / 2 * 0.95, 4);
    expect(r.armLengthM).toBeCloseTo(r.physicalLengthM / 2, 6);
  });

  it("波長短縮VFが物理長へ線形に効く", () => {
    const bare = resonantElementLength(input());
    const insulated = resonantElementLength(input({ velocityFactor: 0.9 }));
    expect(insulated.physicalLengthM).toBeCloseTo(bare.physicalLengthM * 0.9, 6);
  });

  it("短縮率・VFが範囲外なら例外", () => {
    expect(() => resonantElementLength(input({ shorteningFactor: 1.2 }))).toThrow();
    expect(() => resonantElementLength(input({ velocityFactor: 0 }))).toThrow();
  });
});
