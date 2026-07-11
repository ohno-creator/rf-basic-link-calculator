import { describe, expect, it } from "vitest";
import { calculateLMatch, type LMatchSolution } from "@/lib/rf/lMatch";
import { RfError } from "@/lib/rf/errors";

type Complex = { re: number; im: number };

function reciprocal(value: Complex): Complex {
  const denominator = value.re * value.re + value.im * value.im;
  return { re: value.re / denominator, im: -value.im / denominator };
}

function verifyInputImpedance(load: Complex, solution: LMatchSolution): Complex {
  if (solution.topology === "shunt-then-series") {
    const seriesBranch = { re: load.re, im: load.im + solution.seriesReactanceOhm };
    const branchAdmittance = reciprocal(seriesBranch);
    return reciprocal({ re: branchAdmittance.re, im: branchAdmittance.im + solution.shuntSusceptanceSiemens });
  }

  const loadAdmittance = reciprocal(load);
  const parallelImpedance = reciprocal({
    re: loadAdmittance.re,
    im: loadAdmittance.im + solution.shuntSusceptanceSiemens
  });
  return { re: parallelImpedance.re, im: parallelImpedance.im + solution.seriesReactanceOhm };
}

describe("calculateLMatch（G7・複素負荷のL型整合）", () => {
  it("20-j10Ω・920MHz・50Ω → proposalの2解とQ=1.225", () => {
    const result = calculateLMatch({
      loadResistanceOhm: 20,
      loadReactanceOhm: -10,
      frequencyMHz: 920,
      sourceResistanceOhm: 50
    });

    expect(result.isResistanceMatched).toBe(false);
    expect(result.q).toBeCloseTo(Math.sqrt(1.5), 12);
    expect(result.fractionalBandwidth).toBeCloseTo(1 / Math.sqrt(1.5), 12);
    expect(result.solutions).toHaveLength(2);

    const [solution1, solution2] = result.solutions;
    expect(solution1.topology).toBe("shunt-then-series");
    expect(solution1.seriesComponent.kind).toBe("inductor");
    expect(solution1.seriesComponent.value).toBeCloseTo(5.97, 2);
    expect(solution1.seriesComponent.unit).toBe("nH");
    expect(solution1.shuntComponent?.kind).toBe("capacitor");
    expect(solution1.shuntComponent?.value).toBeCloseTo(4.24, 2);
    expect(solution1.shuntComponent?.unit).toBe("pF");

    expect(solution2.seriesComponent.kind).toBe("capacitor");
    expect(solution2.seriesComponent.value).toBeCloseTo(11.9, 1);
    expect(solution2.shuntComponent?.kind).toBe("inductor");
    expect(solution2.shuntComponent?.value).toBeCloseTo(7.06, 2);
  });

  it("独立複素アドミタンス検算: 2解とも入力インピーダンスが50+j0Ω", () => {
    const result = calculateLMatch({
      loadResistanceOhm: 20,
      loadReactanceOhm: -10,
      frequencyMHz: 920,
      sourceResistanceOhm: 50
    });

    for (const solution of result.solutions) {
      const input = verifyInputImpedance({ re: 20, im: -10 }, solution);
      expect(input.re).toBeCloseTo(50, 10);
      expect(input.im).toBeCloseTo(0, 10);
    }
  });

  it("R>Z0側も2解を返し、series-then-shunt構成で整合する", () => {
    const result = calculateLMatch({
      loadResistanceOhm: 100,
      loadReactanceOhm: 25,
      frequencyMHz: 2400,
      sourceResistanceOhm: 50
    });
    expect(result.q).toBeCloseTo(1, 12);
    expect(result.solutions).toHaveLength(2);
    for (const solution of result.solutions) {
      expect(solution.topology).toBe("series-then-shunt");
      const input = verifyInputImpedance({ re: 100, im: 25 }, solution);
      expect(input.re).toBeCloseTo(50, 10);
      expect(input.im).toBeCloseTo(0, 10);
    }
  });

  it("R=Z0ではL型を使わず、負荷リアクタンスだけを直列で打ち消す", () => {
    const result = calculateLMatch({
      loadResistanceOhm: 50,
      loadReactanceOhm: -10,
      frequencyMHz: 920,
      sourceResistanceOhm: 50
    });
    expect(result.isResistanceMatched).toBe(true);
    expect(result.q).toBe(0);
    expect(result.fractionalBandwidth).toBeNull();
    expect(result.solutions).toHaveLength(1);
    expect(result.solutions[0].seriesReactanceOhm).toBe(10);
    expect(result.solutions[0].seriesComponent.kind).toBe("inductor");
    expect(result.solutions[0].shuntComponent).toBeNull();
  });

  it("ガード: R/Z0/fは正、Xは有限", () => {
    expect(() =>
      calculateLMatch({ loadResistanceOhm: 0, loadReactanceOhm: 0, frequencyMHz: 920, sourceResistanceOhm: 50 })
    ).toThrowError(RfError);
    expect(() =>
      calculateLMatch({ loadResistanceOhm: 20, loadReactanceOhm: Number.NaN, frequencyMHz: 920, sourceResistanceOhm: 50 })
    ).toThrowError(RfError);
    expect(() =>
      calculateLMatch({ loadResistanceOhm: 20, loadReactanceOhm: 0, frequencyMHz: 0, sourceResistanceOhm: 50 })
    ).toThrowError(RfError);
    expect(() =>
      calculateLMatch({ loadResistanceOhm: 20, loadReactanceOhm: 0, frequencyMHz: 920, sourceResistanceOhm: 0 })
    ).toThrowError(RfError);
  });
});
