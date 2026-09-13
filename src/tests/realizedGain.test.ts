import { describe, expect, it } from "vitest";
import {
  dbdToDbi,
  dbiToDbd,
  mismatchLossDb,
  realizedGain,
  vswrToReflectionCoefficient
} from "@/lib/rf/realizedGain";

describe("VSWR/整合", () => {
  it("VSWR=1で反射0・不整合損失0", () => {
    expect(vswrToReflectionCoefficient(1)).toBe(0);
    expect(mismatchLossDb(1)).toBeCloseTo(0, 6);
  });

  it("VSWR=2で|Γ|=1/3、不整合損失≈0.512dB", () => {
    expect(vswrToReflectionCoefficient(2)).toBeCloseTo(1 / 3, 6);
    expect(mismatchLossDb(2)).toBeCloseTo(0.512, 3);
  });

  it("VSWR<1は例外", () => {
    expect(() => mismatchLossDb(0.9)).toThrow();
  });
});

describe("realizedGain", () => {
  it("効率100%・整合完全なら 実現利得=指向性、dBd=dBi-2.15", () => {
    const r = realizedGain({ directivityDbi: 2.15, efficiencyPercent: 100, vswr: 1 });
    expect(r.efficiencyDb).toBeCloseTo(0, 6);
    expect(r.gainDbi).toBeCloseTo(2.15, 6);
    expect(r.mismatchLossDb).toBeCloseTo(0, 6);
    expect(r.realizedGainDbi).toBeCloseTo(2.15, 6);
    expect(r.realizedGainDbd).toBeCloseTo(0, 6);
    expect(r.totalEfficiency).toBeCloseTo(1, 6);
  });

  it("効率50%で利得は約3.01dB低下", () => {
    const r = realizedGain({ directivityDbi: 5, efficiencyPercent: 50, vswr: 1 });
    expect(r.efficiencyDb).toBeCloseTo(-3.0103, 3);
    expect(r.gainDbi).toBeCloseTo(1.9897, 3);
  });

  it("VSWR=2の整合損失が実現利得から引かれ、総合効率も低下", () => {
    const r = realizedGain({ directivityDbi: 5, efficiencyPercent: 80, vswr: 2 });
    expect(r.gainDbi).toBeCloseTo(5 + 10 * Math.log10(0.8), 4); // ≈4.031
    expect(r.realizedGainDbi).toBeCloseTo(r.gainDbi - 0.512, 3);
    expect(r.totalEfficiency).toBeCloseTo(0.8 * (1 - (1 / 3) ** 2), 4); // 0.8*0.8889
  });

  it("効率が範囲外なら例外", () => {
    expect(() => realizedGain({ directivityDbi: 2, efficiencyPercent: 0, vswr: 1 })).toThrow();
    expect(() => realizedGain({ directivityDbi: 2, efficiencyPercent: 120, vswr: 1 })).toThrow();
  });
});

describe("利得単位変換", () => {
  it("dBi↔dBd 往復", () => {
    expect(dbiToDbd(2.15)).toBeCloseTo(0, 6);
    expect(dbdToDbi(0)).toBeCloseTo(2.15, 6);
    expect(dbdToDbi(dbiToDbd(7))).toBeCloseTo(7, 6);
  });
});
