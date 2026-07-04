import { describe, expect, it } from "vitest";
import {
  guidedWavelengthMm,
  lengthDiffToPhaseDiffDeg,
  phaseDegToPhysicalLengthMm,
  phasePerMmDeg,
  phaseToleranceToLengthToleranceMm,
  physicalLengthToElectricalLengthLambda,
  physicalLengthToPhaseDeg,
  wrappedPhaseDeg
} from "@/lib/rf/electricalLength";
import { RfError } from "@/lib/rf/errors";

describe("guidedWavelengthMm (λg = VF·λ0)", () => {
  it("920MHz, VF=0.66 → λg = 215.06850mm", () => {
    expect(guidedWavelengthMm(920, 0.66)).toBeCloseTo(215.0685, 4);
  });

  it("VF=1 で自由空間波長[mm]に一致する", () => {
    expect(guidedWavelengthMm(920, 1)).toBeCloseTo(325.8613673695652, 6);
  });

  it("周波数ガード: 0以下/NaN で RfError", () => {
    expect(() => guidedWavelengthMm(0, 0.66)).toThrowError(RfError);
    expect(() => guidedWavelengthMm(-920, 0.66)).toThrowError(RfError);
    expect(() => guidedWavelengthMm(Number.NaN, 0.66)).toThrowError(RfError);
  });

  it("VFガード: 0以下/1超/NaN で RfError(out_of_domain, velocity_factor)", () => {
    expect(() => guidedWavelengthMm(920, 0)).toThrowError(RfError);
    expect(() => guidedWavelengthMm(920, 1.01)).toThrowError(RfError);
    expect(() => guidedWavelengthMm(920, Number.NaN)).toThrowError(RfError);
    try {
      guidedWavelengthMm(920, -0.5);
      expect.unreachable("RfError が送出されるはず");
    } catch (error) {
      expect(error).toBeInstanceOf(RfError);
      expect((error as RfError).code).toBe("out_of_domain");
      expect((error as RfError).field).toBe("velocity_factor");
    }
  });
});

describe("phasePerMmDeg (360/λg)", () => {
  it("920MHz, VF=0.66 → 1.6738853 deg/mm", () => {
    expect(phasePerMmDeg(920, 0.66)).toBeCloseTo(1.6738853, 6);
  });
});

describe("physicalLengthToPhaseDeg (φ = 360·L/λg)", () => {
  it("L=λg(215.0685mm) → 360°", () => {
    expect(physicalLengthToPhaseDeg(215.0685, 920, 0.66)).toBeCloseTo(360, 4);
  });

  it("L=100mm → 167.3885°", () => {
    expect(physicalLengthToPhaseDeg(100, 920, 0.66)).toBeCloseTo(167.3885, 4);
  });

  it("L=500mm → 総位相 836.9426°（wrapしない）", () => {
    expect(physicalLengthToPhaseDeg(500, 920, 0.66)).toBeCloseTo(836.9426, 4);
  });

  it("L=0 → 0°（0は許容）", () => {
    expect(physicalLengthToPhaseDeg(0, 920, 0.66)).toBeCloseTo(0, 10);
  });

  it("長さガード: 負値で RfError", () => {
    expect(() => physicalLengthToPhaseDeg(-1, 920, 0.66)).toThrowError(RfError);
  });
});

describe("physicalLengthToElectricalLengthLambda (N = L/λg)", () => {
  it("L=500mm → 2.324841λ", () => {
    expect(physicalLengthToElectricalLengthLambda(500, 920, 0.66)).toBeCloseTo(2.324841, 6);
  });

  it("L=λg → 1λ", () => {
    expect(physicalLengthToElectricalLengthLambda(215.0685, 920, 0.66)).toBeCloseTo(1, 6);
  });
});

describe("phaseDegToPhysicalLengthMm (L = λg·φ/360)", () => {
  it("360° → λg = 215.0685mm（往復変換の整合）", () => {
    expect(phaseDegToPhysicalLengthMm(360, 920, 0.66)).toBeCloseTo(215.0685, 4);
  });

  it("167.3885° → 100mm", () => {
    expect(phaseDegToPhysicalLengthMm(167.3885, 920, 0.66)).toBeCloseTo(100, 4);
  });

  it("位相ガード: NaN で RfError", () => {
    expect(() => phaseDegToPhysicalLengthMm(Number.NaN, 920, 0.66)).toThrowError(RfError);
  });
});

describe("lengthDiffToPhaseDiffDeg (Δφ = 360·ΔL/λg・符号保持)", () => {
  it("ΔL=+1mm → +1.6738853°", () => {
    expect(lengthDiffToPhaseDiffDeg(1, 920, 0.66)).toBeCloseTo(1.6738853, 6);
  });

  it("ΔL=-1mm → -1.6738853°（符号保持）", () => {
    expect(lengthDiffToPhaseDiffDeg(-1, 920, 0.66)).toBeCloseTo(-1.6738853, 6);
  });

  it("ΔL=0 → 0°", () => {
    expect(lengthDiffToPhaseDiffDeg(0, 920, 0.66)).toBeCloseTo(0, 10);
  });

  it("ΔLガード: NaN/Infinity で RfError", () => {
    expect(() => lengthDiffToPhaseDiffDeg(Number.NaN, 920, 0.66)).toThrowError(RfError);
    expect(() => lengthDiffToPhaseDiffDeg(Number.POSITIVE_INFINITY, 920, 0.66)).toThrowError(RfError);
  });
});

describe("phaseToleranceToLengthToleranceMm (ΔL_tol = λg·Δφ_tol/360)", () => {
  it("±5° → ΔL_tol = 2.987063mm", () => {
    expect(phaseToleranceToLengthToleranceMm(5, 920, 0.66)).toBeCloseTo(2.987063, 6);
  });

  it("許容位相ガード: 負値で RfError", () => {
    expect(() => phaseToleranceToLengthToleranceMm(-5, 920, 0.66)).toThrowError(RfError);
  });
});

describe("wrappedPhaseDeg（[0,360) 正規化）", () => {
  it("836.9426° → 116.9426°（L=500mm の wrapped）", () => {
    expect(wrappedPhaseDeg(836.9426)).toBeCloseTo(116.9426, 4);
  });

  it("360° → 0（+0で返す）", () => {
    const wrapped = wrappedPhaseDeg(360);
    expect(wrapped).toBeCloseTo(0, 10);
    expect(Object.is(wrapped, -0)).toBe(false);
  });

  it("-360° → 0（-0ではなく+0）", () => {
    const wrapped = wrappedPhaseDeg(-360);
    expect(wrapped).toBeCloseTo(0, 10);
    expect(Object.is(wrapped, -0)).toBe(false);
  });

  it("負位相 -90° → 270°", () => {
    expect(wrappedPhaseDeg(-90)).toBeCloseTo(270, 10);
  });

  it("位相ガード: NaN で RfError", () => {
    expect(() => wrappedPhaseDeg(Number.NaN)).toThrowError(RfError);
  });
});
