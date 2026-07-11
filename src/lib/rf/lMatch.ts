/**
 * 複素負荷を純抵抗Z0へ変換するL型整合回路（Track G7）。
 *
 * R < Z0: 負荷へ直列リアクタンスXsを加え、その入力側へ並列サセプタンスBを置く。
 *   Xt = Xload + Xs = ±√(R(Z0-R)), B = Xt/(R·Z0)
 * R > Z0: 負荷へ並列Bを加え、その入力側へ直列Xsを置く（アドミタンス領域の双対解）。
 *   G = R/(R²+X²), Bt = ±√(G/Z0-G²), B = Bt-Bload, Xs = Bt·Z0/G
 *
 * 素子換算: XL=ωL、XC=-1/(ωC)、BC=ωC、BL=-1/(ωL)。
 * 単位: R/X/Xs[Ω]、B[S]、周波数[MHz]、素子値[nH/pF]、Qと比帯域は無次元。
 * 適用条件: 理想集中定数・単一周波数。部品Q、寄生成分、基板配線を含まない初期値。
 */

import { assertFinite, assertPositiveFinite } from "./errors";

export type LMatchInput = {
  loadResistanceOhm: number;
  loadReactanceOhm: number;
  frequencyMHz: number;
  sourceResistanceOhm: number;
};

export type LMatchComponent = {
  kind: "inductor" | "capacitor" | "none";
  value: number;
  unit: "nH" | "pF" | null;
};

export type LMatchSolution = {
  topology: "series-then-shunt" | "shunt-then-series" | "series-only";
  seriesReactanceOhm: number;
  shuntSusceptanceSiemens: number;
  seriesComponent: LMatchComponent;
  shuntComponent: LMatchComponent | null;
};

export type LMatchResult = {
  q: number;
  fractionalBandwidth: number | null;
  resistanceMismatchPercent: number;
  isResistanceMatched: boolean;
  solutions: LMatchSolution[];
};

function normalizeZero(value: number): number {
  return value === 0 ? 0 : value;
}

function seriesComponent(reactanceOhm: number, omega: number): LMatchComponent {
  if (reactanceOhm > 0) {
    const value = (reactanceOhm / omega) * 1e9;
    assertPositiveFinite(value, "series_inductance");
    return { kind: "inductor", value, unit: "nH" };
  }
  if (reactanceOhm < 0) {
    const value = (-1 / (omega * reactanceOhm)) * 1e12;
    assertPositiveFinite(value, "series_capacitance");
    return { kind: "capacitor", value, unit: "pF" };
  }
  return { kind: "none", value: 0, unit: null };
}

function shuntComponent(susceptanceSiemens: number, omega: number): LMatchComponent {
  if (susceptanceSiemens > 0) {
    const value = (susceptanceSiemens / omega) * 1e12;
    assertPositiveFinite(value, "shunt_capacitance");
    return { kind: "capacitor", value, unit: "pF" };
  }
  if (susceptanceSiemens < 0) {
    const value = (-1 / (omega * susceptanceSiemens)) * 1e9;
    assertPositiveFinite(value, "shunt_inductance");
    return { kind: "inductor", value, unit: "nH" };
  }
  return { kind: "none", value: 0, unit: null };
}

function buildSolution(
  topology: LMatchSolution["topology"],
  seriesReactanceOhm: number,
  shuntSusceptanceSiemens: number,
  omega: number
): LMatchSolution {
  const normalizedX = normalizeZero(seriesReactanceOhm);
  const normalizedB = normalizeZero(shuntSusceptanceSiemens);
  assertFinite(normalizedX, "series_reactance");
  assertFinite(normalizedB, "shunt_susceptance");
  return {
    topology,
    seriesReactanceOhm: normalizedX,
    shuntSusceptanceSiemens: normalizedB,
    seriesComponent: seriesComponent(normalizedX, omega),
    shuntComponent: topology === "series-only" ? null : shuntComponent(normalizedB, omega)
  };
}

/** 指定周波数で負荷R+jXをZ0へ整合する理想L型回路の解を返す。 */
export function calculateLMatch(input: LMatchInput): LMatchResult {
  assertPositiveFinite(input.loadResistanceOhm, "load_resistance");
  assertFinite(input.loadReactanceOhm, "load_reactance");
  assertPositiveFinite(input.frequencyMHz, "frequency");
  assertPositiveFinite(input.sourceResistanceOhm, "source_resistance");

  const resistance = input.loadResistanceOhm;
  const reactance = input.loadReactanceOhm;
  const source = input.sourceResistanceOhm;
  const omega = 2 * Math.PI * input.frequencyMHz * 1e6;
  assertPositiveFinite(omega, "angular_frequency");
  const resistanceMismatchPercent = (Math.abs(resistance - source) / source) * 100;
  assertFinite(resistanceMismatchPercent, "resistance_mismatch_percent");

  if (resistance === source) {
    const seriesX = normalizeZero(-reactance);
    return {
      q: 0,
      fractionalBandwidth: null,
      resistanceMismatchPercent,
      isResistanceMatched: true,
      solutions:
        seriesX === 0 ? [] : [buildSolution("series-only", seriesX, 0, omega)]
    };
  }

  const q = Math.sqrt(Math.max(resistance, source) / Math.min(resistance, source) - 1);
  const fractionalBandwidth = 1 / q;
  assertPositiveFinite(q, "circuit_q");
  assertPositiveFinite(fractionalBandwidth, "fractional_bandwidth");

  if (resistance < source) {
    const targetReactanceMagnitude = Math.sqrt(resistance * (source - resistance));
    assertPositiveFinite(targetReactanceMagnitude, "target_reactance");
    const solutions = [targetReactanceMagnitude, -targetReactanceMagnitude].map(
      (targetReactance) => {
        const seriesX = targetReactance - reactance;
        const shuntB = targetReactance / (resistance * source);
        return buildSolution("shunt-then-series", seriesX, shuntB, omega);
      }
    );
    return {
      q,
      fractionalBandwidth,
      resistanceMismatchPercent,
      isResistanceMatched: false,
      solutions
    };
  }

  const denominator = resistance ** 2 + reactance ** 2;
  assertPositiveFinite(denominator, "load_impedance_magnitude_squared");
  const loadConductance = resistance / denominator;
  const loadSusceptance = -reactance / denominator;
  assertPositiveFinite(loadConductance, "load_conductance");
  assertFinite(loadSusceptance, "load_susceptance");
  const targetSusceptanceMagnitude = Math.sqrt(loadConductance / source - loadConductance ** 2);
  assertPositiveFinite(targetSusceptanceMagnitude, "target_susceptance");
  const solutions = [targetSusceptanceMagnitude, -targetSusceptanceMagnitude].map(
    (targetSusceptance) => {
      const shuntB = targetSusceptance - loadSusceptance;
      const seriesX = (targetSusceptance * source) / loadConductance;
      return buildSolution("series-then-shunt", seriesX, shuntB, omega);
    }
  );
  return {
    q,
    fractionalBandwidth,
    resistanceMismatchPercent,
    isResistanceMatched: false,
    solutions
  };
}
