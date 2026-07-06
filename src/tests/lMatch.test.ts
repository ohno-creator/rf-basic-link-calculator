import { describe, expect, it } from "vitest";
import { calculateLMatch, type LMatchSolution } from "@/lib/rf/lMatch";
import { RfError } from "@/lib/rf/errors";

type Complex = { re: number; im: number };

function reciprocal(value: Complex): Complex {
  const denominator = value.re ** 2 + value.im ** 2;
  return { re: value.re / denominator, im: -value.im / denominator };
}

/** 素子値の導出式とは独立に、完成した回路を複素数で再合成する。 */
function matchedInputImpedance(load: Complex, solution: LMatchSolution): Complex {
  if (solution.topology === "series-only") {
    return { re: load.re, im: load.im + solution.seriesReactanceOhm };
  }
  if (solution.topology === "series-then-shunt") {
    const afterSeries = { re: load.re, im: load.im + solution.seriesReactanceOhm };
    const admittance = reciprocal(afterSeries);
    return reciprocal({ re: admittance.re, im: admittance.im + solution.shuntSusceptanceSiemens });
  }
  const loadAdmittance = reciprocal(load);
  const afterShunt = reciprocal({
    re: loadAdmittance.re,
    im: loadAdmittance.im + solution.shuntSusceptanceSiemens
  });
  return { re: afterShunt.re, im: afterShunt.im + solution.seriesReactanceOhm };
}

describe("calculateLMatch", () => {
  it("20-j10Ωを50Ωへ整合する2解とQを再現する", () => {
    const result = calculateLMatch({
      loadResistanceOhm: 20,
      loadReactanceOhm: -10,
      frequencyMHz: 920,
      sourceResistanceOhm: 50
    });

    expect(result.q).toBeCloseTo(Math.sqrt(1.5), 10);
    expect(result.fractionalBandwidth).toBeCloseTo(1 / Math.sqrt(1.5), 10);
    expect(result.resistanceMismatchPercent).toBeCloseTo(60, 10);
    expect(result.isResistanceMatched).toBe(false);
    expect(result.solutions).toHaveLength(2);

    const inductive = result.solutions.find((solution) => solution.seriesComponent.kind === "inductor");
    const capacitive = result.solutions.find((solution) => solution.seriesComponent.kind === "capacitor");
    expect(inductive?.seriesComponent.value).toBeCloseTo(5.97, 2);
    expect(inductive?.seriesComponent.unit).toBe("nH");
    expect(inductive?.shuntComponent?.value).toBeCloseTo(4.24, 2);
    expect(inductive?.shuntComponent?.unit).toBe("pF");
    expect(capacitive?.seriesComponent.value).toBeCloseTo(11.9, 1);
    expect(capacitive?.seriesComponent.unit).toBe("pF");
    expect(capacitive?.shuntComponent?.value).toBeCloseTo(7.06, 2);
    expect(capacitive?.shuntComponent?.unit).toBe("nH");

    for (const solution of result.solutions) {
      const input = matchedInputImpedance({ re: 20, im: -10 }, solution);
      expect(input.re).toBeCloseTo(50, 8);
      expect(input.im).toBeCloseTo(0, 8);
    }
  });

  it("負荷抵抗が基準抵抗より大きい場合も2解を複素再合成できる", () => {
    const result = calculateLMatch({
      loadResistanceOhm: 100,
      loadReactanceOhm: 20,
      frequencyMHz: 2400,
      sourceResistanceOhm: 50
    });
    expect(result.solutions).toHaveLength(2);
    expect(result.solutions.every((solution) => solution.topology === "shunt-then-series")).toBe(true);
    for (const solution of result.solutions) {
      const input = matchedInputImpedance({ re: 100, im: 20 }, solution);
      expect(input.re).toBeCloseTo(50, 8);
      expect(input.im).toBeCloseTo(0, 8);
    }
  });

  it("R=Z0では負荷リアクタンスを単一直列素子で打ち消す", () => {
    const result = calculateLMatch({
      loadResistanceOhm: 50,
      loadReactanceOhm: 15,
      frequencyMHz: 920,
      sourceResistanceOhm: 50
    });
    expect(result.q).toBe(0);
    expect(result.fractionalBandwidth).toBeNull();
    expect(result.resistanceMismatchPercent).toBe(0);
    expect(result.isResistanceMatched).toBe(true);
    expect(result.solutions).toHaveLength(1);
    expect(result.solutions[0].topology).toBe("series-only");
    expect(result.solutions[0].seriesReactanceOhm).toBe(-15);
    expect(matchedInputImpedance({ re: 50, im: 15 }, result.solutions[0])).toEqual({ re: 50, im: 0 });
  });

  it("RとZ0の近さを閾値なしの抵抗差率として返す", () => {
    const result = calculateLMatch({
      loadResistanceOhm: 49.999,
      loadReactanceOhm: 0,
      frequencyMHz: 920,
      sourceResistanceOhm: 50
    });
    expect(result.resistanceMismatchPercent).toBeCloseTo(0.002, 10);
    expect(result.isResistanceMatched).toBe(false);
    expect(result.solutions).toHaveLength(2);
  });

  it("非正抵抗・周波数と非有限リアクタンスを拒否する", () => {
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
      calculateLMatch({
        loadResistanceOhm: 20,
        loadReactanceOhm: -10,
        frequencyMHz: Number.MAX_VALUE,
        sourceResistanceOhm: 50
      })
    ).toThrowError(RfError);
  });
});
