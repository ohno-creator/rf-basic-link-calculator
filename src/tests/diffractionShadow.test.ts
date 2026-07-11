import { describe, expect, it } from "vitest";
import {
  diffractionLossByBand,
  diffractionParameterV,
  diffractionShadowLoss
} from "@/lib/rf/diffractionShadow";
import { RfError } from "@/lib/rf/errors";

// 期待値はすべて ITU-R P.526 の単一ナイフエッジ近似
//   J(v) = 6.9 + 20·log10(√((v-0.1)²+1) + v - 0.1)  [v > -0.78]
//   v = h·√(2(d1+d2)/(λ·d1·d2))
// から自前で再計算した値（λ = 299792458 / f）。

describe("diffractionParameterV", () => {
  it("reproduces v ≈ 1.108 for h=10m, d1=d2=1000m at 920MHz (λ≈0.3259m)", () => {
    // v = 10·√(2·2000/(0.325861·10⁶)) = 1.10793…
    const v = diffractionParameterV({ obstacleHeightAboveLosM: 10, d1M: 1000, d2M: 1000 }, 920);
    expect(v).toBeCloseTo(1.108, 3);
  });

  it("is 0 (not -0) when the obstacle grazes the LOS exactly", () => {
    const v = diffractionParameterV({ obstacleHeightAboveLosM: -0, d1M: 1000, d2M: 1000 }, 920);
    expect(Object.is(v, 0)).toBe(true);
  });

  it("guards non-positive distances and frequency", () => {
    expect(() =>
      diffractionParameterV({ obstacleHeightAboveLosM: 10, d1M: 0, d2M: 1000 }, 920)
    ).toThrowError(RfError);
    expect(() =>
      diffractionParameterV({ obstacleHeightAboveLosM: 10, d1M: 1000, d2M: -5 }, 920)
    ).toThrowError(RfError);
    expect(() =>
      diffractionParameterV({ obstacleHeightAboveLosM: 10, d1M: 1000, d2M: 1000 }, 0)
    ).toThrowError(RfError);
    expect(() =>
      diffractionParameterV({ obstacleHeightAboveLosM: Number.NaN, d1M: 1000, d2M: 1000 }, 920)
    ).toThrowError(RfError);
  });
});

describe("diffractionShadowLoss", () => {
  it("gives ≈6.03dB at v=0 (grazing; theoretical knife edge is 6.02dB, within ±0.1dB)", () => {
    const { vParam, lossDb } = diffractionShadowLoss(
      { obstacleHeightAboveLosM: 0, d1M: 1000, d2M: 1000 },
      920
    );
    expect(vParam).toBe(0);
    // J(0) = 6.9 + 20log10(√1.01 - 0.1) = 6.0329（近似式値）。厳密解 6.02dB と±0.1dB以内で一致。
    expect(lossDb).toBeCloseTo(6.033, 3);
    expect(Math.abs(lossDb - 6.02)).toBeLessThan(0.1);
  });

  it("gives ≈14.60dB for h=10m, d1=d2=1000m at 920MHz", () => {
    // v=1.10793 → J = 6.9 + 20log10(√((1.00793)²+1)+1.00793) = 14.6041…
    const { lossDb } = diffractionShadowLoss(
      { obstacleHeightAboveLosM: 10, d1M: 1000, d2M: 1000 },
      920
    );
    expect(lossDb).toBeCloseTo(14.6, 1);
  });

  it("returns exactly 0dB (not -0) for v ≤ -0.78 (十分な見通し余裕)", () => {
    const result = diffractionShadowLoss(
      { obstacleHeightAboveLosM: -100, d1M: 1000, d2M: 1000 },
      920
    );
    expect(result.vParam).toBeLessThan(-0.78);
    expect(result.lossDb).toBe(0);
    expect(Object.is(result.lossDb, -0)).toBe(false);
  });

  it("computes the wavelength from c = 299792458 m/s", () => {
    const { wavelengthM } = diffractionShadowLoss(
      { obstacleHeightAboveLosM: 10, d1M: 1000, d2M: 1000 },
      920
    );
    expect(wavelengthM).toBeCloseTo(0.32586, 5);
  });
});

describe("diffractionLossByBand", () => {
  const geometry = { obstacleHeightAboveLosM: 11.75, d1M: 1000, d2M: 1000 };
  const bands = [150, 430, 920, 2400, 5600, 28000];

  it("returns one result per requested frequency, matching the single-shot calc", () => {
    const results = diffractionLossByBand({ ...geometry, frequenciesMHz: bands });
    expect(results).toHaveLength(bands.length);
    for (const [index, frequencyMHz] of bands.entries()) {
      const single = diffractionShadowLoss(geometry, frequencyMHz);
      expect(results[index].frequencyMHz).toBe(frequencyMHz);
      expect(results[index].vParam).toBeCloseTo(single.vParam, 10);
      expect(results[index].lossDb).toBeCloseTo(single.lossDb, 10);
    }
  });

  it("loss increases monotonically with frequency when the LOS is blocked (h>0)", () => {
    const results = diffractionLossByBand({ ...geometry, frequenciesMHz: bands });
    for (let i = 1; i < results.length; i += 1) {
      expect(results[i].lossDb).toBeGreaterThan(results[i - 1].lossDb);
    }
    // 具体値の照合（自前再計算: 150MHz→10.49dB / 28GHz→29.97dB）
    expect(results[0].lossDb).toBeCloseTo(10.49, 1);
    expect(results[5].lossDb).toBeCloseTo(29.97, 1);
  });

  it("guards an empty frequency list and invalid geometry", () => {
    expect(() => diffractionLossByBand({ ...geometry, frequenciesMHz: [] })).toThrowError(RfError);
    expect(() =>
      diffractionLossByBand({
        obstacleHeightAboveLosM: 10,
        d1M: -1,
        d2M: 1000,
        frequenciesMHz: bands
      })
    ).toThrowError(RfError);
    expect(() =>
      diffractionLossByBand({ ...geometry, frequenciesMHz: [920, Number.NaN] })
    ).toThrowError(RfError);
  });
});
