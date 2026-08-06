import { describe, expect, it } from "vitest";
import { farFieldDistance } from "@/lib/rf/farFieldDistance";

describe("farFieldDistance", () => {
  it("大型開口(D=1m,10GHz)は2D²/λが支配し約66.7m", () => {
    const r = farFieldDistance({ frequencyMHz: 10_000, dimensionM: 1 });
    expect(r.wavelengthM).toBeCloseTo(0.02998, 4);
    expect(r.fraunhoferDistanceM).toBeCloseTo(66.7, 1);
    expect(r.recommendedFarFieldM).toBeCloseTo(66.7, 1);
    expect(r.dominantCriterion).toBe("fraunhofer");
    expect(r.electricallySmall).toBe(false);
  });

  it("小型アンテナ(D=0.1m,2.4GHz)は波長床3λが支配", () => {
    const r = farFieldDistance({ frequencyMHz: 2400, dimensionM: 0.1 });
    // λ=0.1249m, 2D²/λ=0.16m, 3λ=0.375m → 3λが支配
    expect(r.fraunhoferDistanceM).toBeCloseTo(0.16, 2);
    expect(r.recommendedFarFieldM).toBeCloseTo(3 * r.wavelengthM, 6);
    expect(r.dominantCriterion).toBe("wavelength");
    expect(r.electricallySmall).toBe(true);
  });

  it("3境界の大小関係（大型開口では反応近傍<フラウンホーファ）", () => {
    const r = farFieldDistance({ frequencyMHz: 10_000, dimensionM: 1 });
    expect(r.reactiveNearFieldLimitM).toBeLessThan(r.fraunhoferDistanceM);
    expect(r.reactiveNearFieldLimitM).toBeCloseTo(0.62 * Math.sqrt(1 / r.wavelengthM), 3);
  });

  it("寸法が0以下なら例外", () => {
    expect(() => farFieldDistance({ frequencyMHz: 920, dimensionM: 0 })).toThrow();
  });
});
