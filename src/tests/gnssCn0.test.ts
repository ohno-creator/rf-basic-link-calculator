import { describe, expect, it } from "vitest";
import {
  calculateActiveGnssCn0,
  calculateGnssCn0,
  classifyGnssCn0
} from "@/lib/rf/gnssCn0";
import { RfError } from "@/lib/rf/errors";

describe("GNSS C/N0（G20）", () => {
  it("P=-130dBm・G=3dBi・NF=1.5dB・損失0 → 45.5dB-Hz", () => {
    expect(calculateGnssCn0({
      receivedPowerDbm: -130,
      antennaGainDbi: 3,
      preLnaLossDb: 0,
      receiverNoiseFigureDb: 1.5
    }).cn0DbHz).toBeCloseTo(45.5, 12);
  });

  it("判定境界: >40 good、35..40 usable、<35 difficult", () => {
    expect(classifyGnssCn0(40.001)).toBe("good");
    expect(classifyGnssCn0(40)).toBe("usable");
    expect(classifyGnssCn0(35)).toBe("usable");
    expect(classifyGnssCn0(34.999)).toBe("difficult");
  });

  it("パッシブ系はケーブル損失3dBでC/N0がちょうど3dB低下", () => {
    const noCable = calculateGnssCn0({
      receivedPowerDbm: -130,
      antennaGainDbi: 3,
      preLnaLossDb: 0,
      receiverNoiseFigureDb: 1.5
    });
    const cable3Db = calculateGnssCn0({
      receivedPowerDbm: -130,
      antennaGainDbi: 3,
      preLnaLossDb: 3,
      receiverNoiseFigureDb: 1.5
    });
    expect(noCable.cn0DbHz - cable3Db.cn0DbHz).toBeCloseTo(3, 12);
    expect(cable3Db.systemNoiseFigureDb).toBeCloseTo(1.5, 12);
  });

  it("アクティブ系は20dB LNAにより後段3dBケーブルの影響が0.1dB未満", () => {
    const noCable = calculateActiveGnssCn0({
      receivedPowerDbm: -130,
      antennaGainDbi: 3,
      preLnaLossDb: 0,
      lnaGainDb: 20,
      lnaNoiseFigureDb: 1.5,
      postLnaLossDb: 0,
      receiverNoiseFigureDb: 3
    });
    const cable3Db = calculateActiveGnssCn0({
      receivedPowerDbm: -130,
      antennaGainDbi: 3,
      preLnaLossDb: 0,
      lnaGainDb: 20,
      lnaNoiseFigureDb: 1.5,
      postLnaLossDb: 3,
      receiverNoiseFigureDb: 3
    });
    expect(noCable.cn0DbHz - cable3Db.cn0DbHz).toBeGreaterThan(0);
    expect(noCable.cn0DbHz - cable3Db.cn0DbHz).toBeLessThan(0.1);
  });

  it("Friis縦続を線形雑音係数で独立検算する", () => {
    const actual = calculateActiveGnssCn0({
      receivedPowerDbm: -130,
      antennaGainDbi: 3,
      preLnaLossDb: 0,
      lnaGainDb: 20,
      lnaNoiseFigureDb: 1.5,
      postLnaLossDb: 3,
      receiverNoiseFigureDb: 3
    }).systemNoiseFigureDb;
    const f1 = 10 ** (1.5 / 10);
    const f2 = 10 ** (3 / 10);
    const f3 = 10 ** (3 / 10);
    const g1 = 10 ** (20 / 10);
    const g2 = 10 ** (-3 / 10);
    const expected = 10 * Math.log10(f1 + (f2 - 1) / g1 + (f3 - 1) / (g1 * g2));
    expect(actual).toBeCloseTo(expected, 12);
  });

  it("ガード: C/N0入力は有限、損失/NFは非負、縦続段は空不可", () => {
    expect(() => calculateGnssCn0({ receivedPowerDbm: Number.NaN, antennaGainDbi: 3, preLnaLossDb: 0, receiverNoiseFigureDb: 1.5 })).toThrowError(RfError);
    expect(() => calculateGnssCn0({ receivedPowerDbm: -130, antennaGainDbi: 3, preLnaLossDb: -1, receiverNoiseFigureDb: 1.5 })).toThrowError(RfError);
    expect(() => calculateGnssCn0({ receivedPowerDbm: -130, antennaGainDbi: 3, preLnaLossDb: 0, receiverNoiseFigureDb: -1 })).toThrowError(RfError);
    expect(() => calculateActiveGnssCn0({ receivedPowerDbm: -130, antennaGainDbi: 3, preLnaLossDb: 0, receiverNoiseFigureDb: 1.5, lnaGainDb: 20, lnaNoiseFigureDb: 1, postLnaLossDb: -1 })).toThrowError(RfError);
  });
});
