import { describe, expect, it } from "vitest";
import {
  applyCorrelationToDiversityGain,
  besselJ0,
  calculateDiversityGain,
  correlationFromSpacing,
  selectionDiversityGainDb
} from "@/lib/rf/diversityGain";
import { RfError } from "@/lib/rf/errors";

describe("selectionDiversityGainDb（2ブランチ・レイリー選択合成）", () => {
  it("独立2ブランチ・1%アウテージ → 10.21dB", () => {
    expect(selectionDiversityGainDb(1, 2)).toBeCloseTo(10.205, 3);
  });

  it("5%/10%ではアウテージ率が上がるほど利得が小さくなる", () => {
    const at1 = selectionDiversityGainDb(1, 2);
    const at5 = selectionDiversityGainDb(5, 2);
    const at10 = selectionDiversityGainDb(10, 2);
    expect(at1).toBeGreaterThan(at5);
    expect(at5).toBeGreaterThan(at10);
  });

  it("1ブランチなら利得0dB（-0を返さない）", () => {
    expect(selectionDiversityGainDb(1, 1)).toBe(0);
    expect(Object.is(selectionDiversityGainDb(1, 1), -0)).toBe(false);
  });

  it("ガード: outageは0..100%の開区間、branchは正整数", () => {
    expect(() => selectionDiversityGainDb(0, 2)).toThrowError(RfError);
    expect(() => selectionDiversityGainDb(100, 2)).toThrowError(RfError);
    expect(() => selectionDiversityGainDb(1, 0)).toThrowError(RfError);
    expect(() => selectionDiversityGainDb(1, 1.5)).toThrowError(RfError);
  });
});

describe("Clarke一様到来モデル ρe≈J0²(2πd/λ)", () => {
  it("J0(0)=1、J0(π)≈-0.30424", () => {
    expect(besselJ0(0)).toBe(1);
    expect(besselJ0(Math.PI)).toBeCloseTo(-0.304242, 5);
  });

  it("d=0.5λ → ρe≈0.0926", () => {
    expect(correlationFromSpacing(0.5)).toBeCloseTo(0.09256, 4);
  });

  it("d=0 → ρe=1、負距離はRfError", () => {
    expect(correlationFromSpacing(0)).toBe(1);
    expect(() => correlationFromSpacing(-0.1)).toThrowError(RfError);
  });
});

describe("相関補正と統合計算", () => {
  it("ρe=0.7 → 独立利得×√0.3", () => {
    const independent = selectionDiversityGainDb(1, 2);
    expect(applyCorrelationToDiversityGain(independent, 0.7)).toBeCloseTo(independent * Math.sqrt(0.3), 12);
  });

  it("ρe=1なら0dB（-0なし）", () => {
    expect(applyCorrelationToDiversityGain(10, 1)).toBe(0);
    expect(Object.is(applyCorrelationToDiversityGain(10, 1), -0)).toBe(false);
  });

  it("間隔0.5λ・1%の統合結果", () => {
    const result = calculateDiversityGain({ outagePercent: 1, spacingWavelengths: 0.5 });
    expect(result.correlationCoefficient).toBeCloseTo(0.09256, 4);
    expect(result.independentGainDb).toBeCloseTo(10.205, 3);
    expect(result.correctedGainDb).toBeCloseTo(9.722, 2);
    expect(result.correlationAssessment).toBe("effective");
  });

  it("手入力ρeを優先し、0.5以上はcorrelated判定", () => {
    const result = calculateDiversityGain({ outagePercent: 1, spacingWavelengths: 0.5, correlationCoefficient: 0.7 });
    expect(result.correlationCoefficient).toBe(0.7);
    expect(result.correlationAssessment).toBe("correlated");
  });

  it("ガード: ρeは0..1", () => {
    expect(() => applyCorrelationToDiversityGain(10, -0.1)).toThrowError(RfError);
    expect(() => applyCorrelationToDiversityGain(10, 1.1)).toThrowError(RfError);
  });
});
