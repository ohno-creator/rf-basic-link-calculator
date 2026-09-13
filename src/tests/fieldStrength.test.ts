import { describe, expect, it } from "vitest";
import { eirpDbmToWatt, fieldStrengthAtDistance } from "@/lib/rf/fieldStrength";

describe("eirpDbmToWatt", () => {
  it("30dBm=1W, 0dBm=1mW", () => {
    expect(eirpDbmToWatt(30)).toBeCloseTo(1, 9);
    expect(eirpDbmToWatt(0)).toBeCloseTo(1e-3, 12);
  });
});

describe("fieldStrengthAtDistance", () => {
  it("EIRP=1W(30dBm)・r=10mでS≈7.96e-4 W/m²、E≈0.548 V/m", () => {
    const r = fieldStrengthAtDistance({ eirpDbm: 30, distanceM: 10 });
    expect(r.powerDensityWm2).toBeCloseTo(1 / (4 * Math.PI * 100), 8); // 7.9577e-4
    // E = √(30·EIRP_W)/r = √30/10
    expect(r.eFieldVm).toBeCloseTo(Math.sqrt(30) / 10, 3); // 0.5477
    expect(r.eFieldDbuVm).toBeCloseTo(20 * Math.log10(r.eFieldVm / 1e-6), 6);
    expect(r.eFieldDbuVm).toBeCloseTo(114.77, 1);
    expect(r.receivedPowerDbm).toBeNull();
  });

  it("mW/cm²換算（W/m²→mW/cm²は×0.1）", () => {
    const r = fieldStrengthAtDistance({ eirpDbm: 30, distanceM: 10 });
    expect(r.powerDensityMwCm2).toBeCloseTo(r.powerDensityWm2 * 0.1, 12);
  });

  it("周波数・受信利得を与えると受信電力=Friisと一致", () => {
    const eirpDbm = 30;
    const distanceM = 100;
    const frequencyMHz = 920;
    const rxGainDbi = 2;
    const r = fieldStrengthAtDistance({ eirpDbm, distanceM, frequencyMHz, rxGainDbi });
    // Friis: Prx = EIRP + Grx - FSPL, FSPL=20log10(4πr/λ)
    const c = 299_792_458;
    const lambda = c / (frequencyMHz * 1e6);
    const fspl = 20 * Math.log10((4 * Math.PI * distanceM) / lambda);
    const friis = eirpDbm + rxGainDbi - fspl;
    expect(r.receivedPowerDbm).not.toBeNull();
    expect(r.receivedPowerDbm as number).toBeCloseTo(friis, 6);
  });

  it("距離0以下は例外", () => {
    expect(() => fieldStrengthAtDistance({ eirpDbm: 30, distanceM: 0 })).toThrow();
  });
});
