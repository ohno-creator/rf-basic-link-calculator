import { describe, expect, it } from "vitest";
import {
  FULL_LOAD_RSRQ_DB,
  fullLoadCorrectionDb,
  LTE_RESOURCE_BLOCKS,
  resourceBlocksForLteBandwidthMhz,
  rsrpFromRssi,
  rsrqFromMeasurements,
  rsrqFromSinr,
  rssiFromRsrp,
  sinrFromRsrq,
  SUBCARRIERS_PER_RESOURCE_BLOCK
} from "@/lib/rf/signalMetrics";
import { RfError } from "@/lib/rf/errors";

describe("signalMetrics（G15・RSSI/RSRP/RSRQ/SINR変換）", () => {
  it("定数: サブキャリア12本・フルロードRSRQ=−10.7918dB", () => {
    expect(SUBCARRIERS_PER_RESOURCE_BLOCK).toBe(12);
    expect(FULL_LOAD_RSRQ_DB).toBeCloseTo(-10.7918124605, 9);
  });

  it("LTE帯域幅→RB数の対応表（6/15/25/50/75/100）", () => {
    expect(LTE_RESOURCE_BLOCKS).toHaveLength(6);
    expect(resourceBlocksForLteBandwidthMhz(1.4)).toBe(6);
    expect(resourceBlocksForLteBandwidthMhz(3)).toBe(15);
    expect(resourceBlocksForLteBandwidthMhz(5)).toBe(25);
    expect(resourceBlocksForLteBandwidthMhz(10)).toBe(50);
    expect(resourceBlocksForLteBandwidthMhz(15)).toBe(75);
    expect(resourceBlocksForLteBandwidthMhz(20)).toBe(100);
  });

  it("表外の帯域幅（7MHz等）は RfError", () => {
    expect(() => resourceBlocksForLteBandwidthMhz(7)).toThrowError(RfError);
    expect(() => resourceBlocksForLteBandwidthMhz(0)).toThrowError(RfError);
  });

  it("フルロード補正: 50RB → 27.7815dB", () => {
    expect(fullLoadCorrectionDb(50)).toBeCloseTo(27.7815125038, 9);
  });

  it("RSSI=−70dBm, 50RB → RSRP=−97.7815dBm", () => {
    expect(rsrpFromRssi(-70, 50)).toBeCloseTo(-97.7815125038, 9);
  });

  it("RSSI=−70dBm, 1.4MHz(6RB) → RSRP=−88.5733dBm", () => {
    expect(rsrpFromRssi(-70, resourceBlocksForLteBandwidthMhz(1.4))).toBeCloseTo(-88.5733249643, 9);
  });

  it("往復: RSRP→RSSI が元の −70dBm に戻る", () => {
    expect(rssiFromRsrp(rsrpFromRssi(-70, 50), 50)).toBeCloseTo(-70, 10);
  });

  it("フルロード実測（RSRP=RSSI−corr）のRSRQは −10.7918dB", () => {
    const rssi = -70;
    const rsrp = rsrpFromRssi(rssi, 50);
    expect(rsrqFromMeasurements(rsrp, rssi, 50)).toBeCloseTo(-10.7918124605, 9);
  });

  it("部分負荷例: RSRP=−95, RSSI=−70, 50RB → RSRQ=−8.0103dB", () => {
    expect(rsrqFromMeasurements(-95, -70, 50)).toBeCloseTo(-8.0103, 4);
  });

  it("SINR→RSRQ: 0dB→−13.8021 / 10dB→−11.2057 / −3dB→−15.5562", () => {
    expect(rsrqFromSinr(0)).toBeCloseTo(-13.8021124171, 9);
    expect(rsrqFromSinr(10)).toBeCloseTo(-11.2057393121, 9);
    expect(rsrqFromSinr(-3)).toBeCloseTo(-15.5561610848, 9);
  });

  it("RSRQ→SINR: −13.8021dB（=10log10(1/24)）→ SINR≈0dB", () => {
    // -0 になり得るため toBe(0) ではなく toBeCloseTo で比較。
    expect(sinrFromRsrq(10 * Math.log10(1 / 24))).toBeCloseTo(0, 10);
    expect(sinrFromRsrq(-11)).toBeCloseTo(13.0887861982, 9);
  });

  it("往復一致: SINR=7.3dB → RSRQ → SINR が恒等", () => {
    expect(sinrFromRsrq(rsrqFromSinr(7.3))).toBeCloseTo(7.3, 10);
  });

  it("ガード: RSRQ≥−10.79dB（ρ≥1）は OutOfDomain", () => {
    expect(() => sinrFromRsrq(FULL_LOAD_RSRQ_DB)).toThrowError(RfError);
    expect(() => sinrFromRsrq(-8.0103)).toThrowError(RfError);
  });

  it("ガード: 非有限のdBm・非正のRB数は RfError", () => {
    expect(() => rsrpFromRssi(Number.NaN, 50)).toThrowError(RfError);
    expect(() => rsrpFromRssi(-70, 0)).toThrowError(RfError);
    expect(() => rssiFromRsrp(Number.POSITIVE_INFINITY, 50)).toThrowError(RfError);
    expect(() => rsrqFromMeasurements(-95, Number.NaN, 50)).toThrowError(RfError);
    expect(() => rsrqFromMeasurements(-95, -70, -1)).toThrowError(RfError);
    expect(() => fullLoadCorrectionDb(Number.NaN)).toThrowError(RfError);
    expect(() => sinrFromRsrq(Number.NaN)).toThrowError(RfError);
    expect(() => rsrqFromSinr(Number.NaN)).toThrowError(RfError);
  });
});
