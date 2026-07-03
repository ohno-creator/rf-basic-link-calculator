import { describe, expect, it } from "vitest";
import {
  calculateEirpDbm,
  checkEirpCompliance,
  dbmFromMilliwatt,
  evaluateEirpCompliance,
  milliwattFromDbm
} from "@/lib/rf/eirpCompliance";
import { RfError } from "@/lib/rf/errors";

describe("calculateEirpDbm（EIRP = Ptx + Gant − Lcable）", () => {
  it("Ptx=13dBm, Gant=3dBi, Lcable=1dB → 15dBm", () => {
    expect(calculateEirpDbm(13, 3, 1)).toBe(15);
  });

  it("利得・送信電力は負値も許容、損失は0以上", () => {
    expect(calculateEirpDbm(10, -2, 0)).toBe(8);
    expect(() => calculateEirpDbm(13, 3, -1)).toThrowError(RfError);
    expect(() => calculateEirpDbm(Number.NaN, 3, 1)).toThrowError(RfError);
  });
});

describe("checkEirpCompliance（上限との余裕・合否）", () => {
  it("250mWクラス上限27dBmに対しEIRP15dBm → 余裕12dB・合格", () => {
    expect(checkEirpCompliance(15, 27)).toEqual({ marginDb: 12, pass: true });
  });

  it("上限16dBmに対し余裕僅少1dB・合格", () => {
    expect(checkEirpCompliance(15, 16)).toEqual({ marginDb: 1, pass: true });
  });

  it("上限3dBmに対し超過12dB・不合格", () => {
    expect(checkEirpCompliance(15, 3)).toEqual({ marginDb: -12, pass: false });
  });

  it("ちょうど上限（余裕0）は合格（≤上限）", () => {
    expect(checkEirpCompliance(20, 20)).toEqual({ marginDb: 0, pass: true });
  });
});

describe("mW ↔ dBm 変換", () => {
  it("250mW → 23.9794dBm", () => {
    expect(dbmFromMilliwatt(250)).toBeCloseTo(23.9794, 4);
  });

  it("20mW → 13.0103dBm / 1mW → 0dBm", () => {
    expect(dbmFromMilliwatt(20)).toBeCloseTo(13.0103, 4);
    expect(dbmFromMilliwatt(1)).toBeCloseTo(0, 10);
  });

  it("dBm→mW: 0→1, 30→1000", () => {
    expect(milliwattFromDbm(0)).toBeCloseTo(1, 10);
    expect(milliwattFromDbm(30)).toBeCloseTo(1000, 6);
  });

  it("往復変換で不変", () => {
    expect(milliwattFromDbm(dbmFromMilliwatt(250))).toBeCloseTo(250, 6);
  });

  it("ガード: 電力0以下は RfError / dBm非有限は RfError", () => {
    expect(() => dbmFromMilliwatt(0)).toThrowError(RfError);
    expect(() => dbmFromMilliwatt(-5)).toThrowError(RfError);
    expect(() => milliwattFromDbm(Number.NaN)).toThrowError(RfError);
  });
});

describe("evaluateEirpCompliance（統合）", () => {
  it("入力一式からEIRP・余裕・合否をまとめて返す", () => {
    expect(
      evaluateEirpCompliance({ ptxDbm: 13, antennaGainDbi: 3, cableLossDb: 1, eirpLimitDbm: 27 })
    ).toEqual({ eirpDbm: 15, eirpLimitDbm: 27, marginDb: 12, pass: true });
  });

  it("超過ケースは pass=false", () => {
    const r = evaluateEirpCompliance({ ptxDbm: 20, antennaGainDbi: 6, cableLossDb: 1, eirpLimitDbm: 20 });
    expect(r.eirpDbm).toBe(25);
    expect(r.marginDb).toBe(-5);
    expect(r.pass).toBe(false);
  });
});
