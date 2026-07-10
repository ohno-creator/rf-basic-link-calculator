import { describe, expect, it } from "vitest";
import {
  calculateActiveGnssCn0,
  calculateGnssCn0,
  classifyGnssCn0
} from "@/lib/rf/gnssCn0";
import { RfError } from "@/lib/rf/errors";

describe("calculateGnssCn0 (passive)", () => {
  it("-130dBm・3dBi・NF1.5dB・損失0で45.5dB-Hzになる", () => {
    const result = calculateGnssCn0({
      receivedPowerDbm: -130,
      antennaGainDbi: 3,
      preLnaLossDb: 0,
      receiverNoiseFigureDb: 1.5
    });
    expect(result.cn0DbHz).toBeCloseTo(45.5, 10);
    expect(result.systemNoiseFigureDb).toBeCloseTo(1.5, 10);
    expect(result.quality).toBe("good");
  });

  it("LNA前のケーブル損失3dBでC/N0が3dB低下する", () => {
    const noCable = calculateGnssCn0({
      receivedPowerDbm: -130,
      antennaGainDbi: 3,
      preLnaLossDb: 0,
      receiverNoiseFigureDb: 4
    });
    const cable = calculateGnssCn0({
      receivedPowerDbm: -130,
      antennaGainDbi: 3,
      preLnaLossDb: 3,
      receiverNoiseFigureDb: 4
    });
    expect(cable.cn0DbHz - noCable.cn0DbHz).toBeCloseTo(-3, 10);
  });

  it("C/N0が厳密に0のとき-0ではなく+0を返す", () => {
    const result = calculateGnssCn0({
      receivedPowerDbm: -174,
      antennaGainDbi: 0,
      preLnaLossDb: 0,
      receiverNoiseFigureDb: 0
    });
    expect(result.cn0DbHz).toBe(0);
    expect(Object.is(result.cn0DbHz, -0)).toBe(false);
    expect(Object.is(result.systemNoiseFigureDb, -0)).toBe(false);
  });
});

describe("calculateActiveGnssCn0 (Friis cascade)", () => {
  it("20dB LNA後の3dBケーブル損失による劣化を約0.1dB以下に抑える", () => {
    const baseInput = {
      receivedPowerDbm: -130,
      antennaGainDbi: 3,
      preLnaLossDb: 0,
      lnaGainDb: 20,
      lnaNoiseFigureDb: 1.5,
      receiverNoiseFigureDb: 4
    };
    const noCable = calculateActiveGnssCn0({ ...baseInput, postLnaLossDb: 0 });
    const cable = calculateActiveGnssCn0({ ...baseInput, postLnaLossDb: 3 });
    const degradationDb = noCable.cn0DbHz - cable.cn0DbHz;
    expect(degradationDb).toBeGreaterThan(0);
    expect(degradationDb).toBeLessThan(0.1);
    expect(degradationDb).toBeCloseTo(0.075, 2);
  });

  it("LNA利得を上げると後段寄与が小さくなる", () => {
    const common = {
      receivedPowerDbm: -130,
      antennaGainDbi: 3,
      preLnaLossDb: 0,
      postLnaLossDb: 3,
      lnaNoiseFigureDb: 1,
      receiverNoiseFigureDb: 6
    };
    const lowGain = calculateActiveGnssCn0({ ...common, lnaGainDb: 10 });
    const highGain = calculateActiveGnssCn0({ ...common, lnaGainDb: 30 });
    expect(highGain.systemNoiseFigureDb).toBeLessThan(lowGain.systemNoiseFigureDb);
    expect(highGain.cn0DbHz).toBeGreaterThan(lowGain.cn0DbHz);
  });
});

describe("classifyGnssCn0 and guards", () => {
  it("40超=good、35〜40=usable、35未満=difficult", () => {
    expect(classifyGnssCn0(40.01)).toBe("good");
    expect(classifyGnssCn0(40)).toBe("usable");
    expect(classifyGnssCn0(35)).toBe("usable");
    expect(classifyGnssCn0(34.99)).toBe("difficult");
  });

  it("非有限電力と負の損失・NFを拒否する", () => {
    expect(() =>
      calculateGnssCn0({ receivedPowerDbm: Number.NaN, antennaGainDbi: 3, preLnaLossDb: 0, receiverNoiseFigureDb: 1.5 })
    ).toThrowError(RfError);
    expect(() =>
      calculateGnssCn0({ receivedPowerDbm: -130, antennaGainDbi: 3, preLnaLossDb: -1, receiverNoiseFigureDb: 1.5 })
    ).toThrowError(RfError);
    expect(() =>
      calculateActiveGnssCn0({
        receivedPowerDbm: -130,
        antennaGainDbi: 3,
        preLnaLossDb: 0,
        postLnaLossDb: 3,
        lnaGainDb: 20,
        lnaNoiseFigureDb: -1,
        receiverNoiseFigureDb: 4
      })
    ).toThrowError(RfError);
  });
});
