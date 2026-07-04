import { describe, expect, it } from "vitest";
import {
  ARIB_T108_POWER_CLASSES,
  getAribT108PowerClass
} from "@/data/aribT108PowerClasses";
import { dbmFromMilliwatt, evaluateEirpCompliance } from "@/lib/rf/eirpCompliance";

describe("ARIB STD-T108 電力区分（一次確認済み値）", () => {
  it("2区分あり、idは一意、全て confirmed", () => {
    expect(ARIB_T108_POWER_CLASSES).toHaveLength(2);
    const ids = ARIB_T108_POWER_CLASSES.map((c) => c.id);
    expect(new Set(ids).size).toBe(2);
    for (const c of ARIB_T108_POWER_CLASSES) {
      expect(c.confidence).toBe("confirmed");
      expect(c.source).toMatch(/ARIB STD-T108/);
    }
  });

  it("20mW型: 13dBm / EIRP16dBm / CS-80dBm / 送信4s / 休止50ms", () => {
    const c = getAribT108PowerClass("specified_low_power_20mw");
    expect(c?.maxAntennaPowerMw).toBe(20);
    expect(c?.maxAntennaPowerDbm).toBe(13);
    expect(c?.eirpLimitDbm).toBe(16);
    expect(c?.carrierSenseThresholdDbm).toBe(-80);
    expect(c?.maxTxDurationSec).toBe(4);
    expect(c?.txPauseMs).toBe(50);
  });

  it("250mW型: 24dBm / EIRP27dBm(緩和30.8) / CS-86dBm", () => {
    const c = getAribT108PowerClass("registered_250mw");
    expect(c?.maxAntennaPowerMw).toBe(250);
    expect(c?.maxAntennaPowerDbm).toBe(24);
    expect(c?.eirpLimitDbm).toBe(27);
    expect(c?.relaxedEirpLimitDbm).toBe(30.8);
    expect(c?.carrierSenseThresholdDbm).toBe(-86);
  });

  it("mW→dBm 換算が表記値と整合（20mW≈13.01dBm / 250mW≈23.98dBm）", () => {
    expect(dbmFromMilliwatt(20)).toBeCloseTo(13.01, 2);
    expect(dbmFromMilliwatt(250)).toBeCloseTo(23.98, 2);
  });

  it("未知idは undefined", () => {
    expect(getAribT108PowerClass("nope")).toBeUndefined();
  });
});

describe("EIRPエンジンとdata層の接続（区分照合）", () => {
  it("Ptx13dBm+利得3dBi-損失0 → EIRP16dBm、20mW型上限にちょうど合格", () => {
    const cls = getAribT108PowerClass("specified_low_power_20mw");
    const r = evaluateEirpCompliance({
      ptxDbm: 13,
      antennaGainDbi: 3,
      cableLossDb: 0,
      eirpLimitDbm: cls?.eirpLimitDbm ?? 0
    });
    expect(r.eirpDbm).toBe(16);
    expect(r.marginDb).toBe(0);
    expect(r.pass).toBe(true);
  });

  it("20mW型で高利得6dBi（電力抑制なし）→ EIRP19dBmで上限16超過・不合格", () => {
    const cls = getAribT108PowerClass("specified_low_power_20mw");
    const r = evaluateEirpCompliance({
      ptxDbm: 13,
      antennaGainDbi: 6,
      cableLossDb: 0,
      eirpLimitDbm: cls?.eirpLimitDbm ?? 0
    });
    expect(r.eirpDbm).toBe(19);
    expect(r.marginDb).toBe(-3);
    expect(r.pass).toBe(false);
  });

  it("250mW型: Ptx24dBm+利得3dBi → EIRP27dBmで上限27にちょうど合格", () => {
    const cls = getAribT108PowerClass("registered_250mw");
    const r = evaluateEirpCompliance({
      ptxDbm: 24,
      antennaGainDbi: 3,
      cableLossDb: 0,
      eirpLimitDbm: cls?.eirpLimitDbm ?? 0
    });
    expect(r.eirpDbm).toBe(27);
    expect(r.pass).toBe(true);
  });
});
