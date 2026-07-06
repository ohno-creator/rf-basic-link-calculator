import { describe, expect, it } from "vitest";
import {
  P676_OXYGEN_LINES,
  P676_WATER_VAPOUR_LINES
} from "@/data/gaseousAttenuationSpectroscopy";
import {
  gaseousSpecificAttenuationDbPerKm,
  P676_GAS_MAX_FREQ_GHZ,
  P676_GAS_MIN_FREQ_GHZ,
  P838_RAIN_MAX_FREQ_GHZ,
  P838_RAIN_MIN_FREQ_GHZ,
  rainBaseCoefficients,
  rainCoefficients,
  rainPathAttenuationDb,
  rainSpecificAttenuationDbPerKm
} from "@/lib/rf/rainAttenuation";
import { RfError } from "@/lib/rf/errors";

describe("gaseousSpecificAttenuationDbPerKm（P.676-13 Annex 1）", () => {
  it("一次転記した酸素44線・水蒸気35線を保持する", () => {
    expect(P676_OXYGEN_LINES).toHaveLength(44);
    expect(P676_WATER_VAPOUR_LINES).toHaveLength(35);
    expect(P676_OXYGEN_LINES[0][0]).toBe(50.474214);
    expect(P676_WATER_VAPOUR_LINES.at(-1)?.[0]).toBe(1780);
  });

  it("標準大気の2.4GHzでは大気ガス減衰が0.01dB/km未満", () => {
    expect(gaseousSpecificAttenuationDbPerKm(2.4)).toBeCloseTo(0.007066309, 9);
  });

  it("22.235GHz水蒸気線では乾燥大気より標準大気の減衰が0.1dB/km以上大きい", () => {
    const standard = gaseousSpecificAttenuationDbPerKm(22.23508);
    const dry = gaseousSpecificAttenuationDbPerKm(22.23508, 0);
    expect(standard).toBeCloseTo(0.193462247, 9);
    expect(dry).toBeCloseTo(0.013157785, 9);
    expect(standard - dry).toBeGreaterThan(0.1);
  });

  it("60GHz酸素帯は標準大気で14〜16dB/km", () => {
    expect(gaseousSpecificAttenuationDbPerKm(60)).toBeCloseTo(14.655556404, 9);
  });

  it("適用域と水蒸気密度を検証する", () => {
    expect(() => gaseousSpecificAttenuationDbPerKm(0.5)).toThrowError(RfError);
    expect(() => gaseousSpecificAttenuationDbPerKm(1001)).toThrowError(RfError);
    expect(() => gaseousSpecificAttenuationDbPerKm(22, -1)).toThrowError(RfError);
    expect(P676_GAS_MIN_FREQ_GHZ).toBe(1);
    expect(P676_GAS_MAX_FREQ_GHZ).toBe(1000);
  });
});

describe("rainBaseCoefficients（Table 5 補間）", () => {
  it("表に存在する周波数は厳密一致（28GHz）", () => {
    expect(rainBaseCoefficients(28)).toEqual({ kH: 0.2051, alphaH: 0.9679, kV: 0.1964, alphaV: 0.9277 });
  });

  it("10GHz も厳密一致", () => {
    expect(rainBaseCoefficients(10)).toEqual({ kH: 0.01217, alphaH: 1.2571, kV: 0.01129, alphaV: 1.2156 });
  });

  it("表の間（12.5GHz）は隣接点(12,13)の間に補間される", () => {
    const c = rainBaseCoefficients(12.5);
    expect(c.kH).toBeGreaterThan(rainBaseCoefficients(12).kH);
    expect(c.kH).toBeLessThan(rainBaseCoefficients(13).kH);
    expect(c.alphaH).toBeLessThan(rainBaseCoefficients(12).alphaH);
    expect(c.alphaH).toBeGreaterThan(rainBaseCoefficients(13).alphaH);
  });

  it("適用域ガード: <1GHz / >1000GHz は RfError", () => {
    expect(() => rainBaseCoefficients(0.5)).toThrowError(RfError);
    expect(() => rainBaseCoefficients(1500)).toThrowError(RfError);
    expect(P838_RAIN_MIN_FREQ_GHZ).toBe(1);
    expect(P838_RAIN_MAX_FREQ_GHZ).toBe(1000);
  });
});

describe("rainCoefficients（偏波合成 式(4)(5)）", () => {
  it("水平偏波は kH,αH を厳密再現（28GHz）", () => {
    const c = rainCoefficients(28, { polarization: "horizontal" });
    expect(c.k).toBeCloseTo(0.2051, 10);
    expect(c.alpha).toBeCloseTo(0.9679, 10);
  });

  it("垂直偏波は kV,αV を厳密再現（28GHz）", () => {
    const c = rainCoefficients(28, { polarization: "vertical" });
    expect(c.k).toBeCloseTo(0.1964, 10);
    expect(c.alpha).toBeCloseTo(0.9277, 10);
  });

  it("円偏波(τ=45°)は水平/垂直の中間 k=0.200750, α=0.948236", () => {
    const c = rainCoefficients(28, { polarization: "circular" });
    expect(c.k).toBeCloseTo(0.20075, 5);
    expect(c.alpha).toBeCloseTo(0.948236, 5);
  });
});

describe("rainSpecificAttenuationDbPerKm（γ_R = k·R^α）", () => {
  it("28GHz/水平/R=25 → 4.6241 dB/km", () => {
    expect(rainSpecificAttenuationDbPerKm(25, 28, { polarization: "horizontal" })).toBeCloseTo(4.6241, 4);
  });

  it("28GHz/垂直/R=25 → 3.8905 dB/km", () => {
    expect(rainSpecificAttenuationDbPerKm(25, 28, { polarization: "vertical" })).toBeCloseTo(3.8905, 4);
  });

  it("28GHz/円/R=25 → 4.2485 dB/km", () => {
    expect(rainSpecificAttenuationDbPerKm(25, 28, { polarization: "circular" })).toBeCloseTo(4.2485, 4);
  });

  it("既定偏波は水平（geometry省略で4.6241）", () => {
    expect(rainSpecificAttenuationDbPerKm(25, 28)).toBeCloseTo(4.6241, 4);
  });

  it("10/20/38GHz/水平/R=25 の単調性（0.6961/2.7506/6.8327）", () => {
    expect(rainSpecificAttenuationDbPerKm(25, 10)).toBeCloseTo(0.6961, 4);
    expect(rainSpecificAttenuationDbPerKm(25, 20)).toBeCloseTo(2.7506, 4);
    expect(rainSpecificAttenuationDbPerKm(25, 38)).toBeCloseTo(6.8327, 4);
  });

  it("Sub-GHz近傍(1GHz)/R=25 は実質ゼロ（<0.001 dB/km）", () => {
    expect(rainSpecificAttenuationDbPerKm(25, 1)).toBeCloseTo(0.000586, 6);
    expect(rainSpecificAttenuationDbPerKm(25, 1)).toBeLessThan(0.001);
  });

  it("R=0 は 0 dB/km", () => {
    expect(rainSpecificAttenuationDbPerKm(0, 28)).toBe(0);
  });

  it("ガード: R負値は RfError", () => {
    expect(() => rainSpecificAttenuationDbPerKm(-1, 28)).toThrowError(RfError);
  });
});

describe("rainPathAttenuationDb（A_rain = γ_R·d·r）", () => {
  it("28GHz/水平/R=25/d=2km/r=1 → 9.2483 dB", () => {
    expect(rainPathAttenuationDb(25, 28, 2, { polarization: "horizontal" })).toBeCloseTo(9.2483, 4);
  });

  it("実効距離係数 r=0.5 で半分", () => {
    const full = rainPathAttenuationDb(25, 28, 2, { polarization: "horizontal" });
    const half = rainPathAttenuationDb(25, 28, 2, { polarization: "horizontal", effectiveDistanceFactor: 0.5 });
    expect(half).toBeCloseTo(full / 2, 10);
  });

  it("ガード: 距離0/負は RfError", () => {
    expect(() => rainPathAttenuationDb(25, 28, 0)).toThrowError(RfError);
    expect(() => rainPathAttenuationDb(25, 28, -1)).toThrowError(RfError);
  });
});
