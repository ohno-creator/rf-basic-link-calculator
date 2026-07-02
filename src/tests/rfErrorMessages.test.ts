import { describe, expect, it } from "vitest";
import { calculateReflectorRisEffect, calculatePatchAntenna, calculateGratingLobes } from "@/lib/rf/antenna";
import { RfError, RfErrorCode } from "@/lib/rf/errors";
import { rfErrorMessage } from "@/lib/rfErrorMessages";
import { convertVswr } from "@/lib/rf/vswr";

describe("rfErrorMessage", () => {
  it("renders code+field via the generic templates", () => {
    expect(rfErrorMessage(new RfError(RfErrorCode.NonPositive, { field: "frequency" }))).toBe(
      "周波数は0より大きい値を入力してください。"
    );
    expect(rfErrorMessage(new RfError(RfErrorCode.Negative, { field: "loss_resistance" }))).toBe(
      "損失抵抗は0以上の値を入力してください。"
    );
    expect(rfErrorMessage(new RfError(RfErrorCode.Percent, { field: "aperture_efficiency" }))).toBe(
      "開口効率は0より大きく100以下の値を入力してください。"
    );
    expect(rfErrorMessage(new RfError(RfErrorCode.BelowMinimum, { field: "vswr", min: 1 }))).toBe(
      "VSWRは1以上の値を入力してください。"
    );
    expect(rfErrorMessage(new RfError(RfErrorCode.NonFinite, { field: "dbi" }))).toBe(
      "dBiは数値で入力してください。"
    );
  });

  it("uses the field-specific full message for cross-field/special cases", () => {
    expect(rfErrorMessage(new RfError(RfErrorCode.OutOfDomain, { field: "scan_angle" }))).toContain(
      "走査角"
    );
    expect(rfErrorMessage(new RfError(RfErrorCode.OutOfDomain, { field: "wire_vs_loop" }))).toBe(
      "線径はループ径より小さくしてください。"
    );
    expect(
      rfErrorMessage(new RfError(RfErrorCode.OutOfDomain, { field: "reflection_coefficient" }))
    ).toBe("反射係数は0以上1未満の値を入力してください。");
    expect(rfErrorMessage(new RfError(RfErrorCode.Negative, { field: "return_loss" }))).toBe(
      "リターンロスは0以上のdB値を入力してください。"
    );
    expect(rfErrorMessage(new RfError(RfErrorCode.NonFinite, { field: "vswr_value" }))).toBe(
      "数値を入力してください。"
    );
    expect(rfErrorMessage(new RfError(RfErrorCode.NonFinite, { field: "link_margin" }))).toBe(
      "リンクマージンを計算できません。入力値を確認してください。"
    );
  });

  it("falls back for non-RfError and unknown fields", () => {
    expect(rfErrorMessage(new Error("boom"))).toBe("入力値を確認してください。");
    expect(rfErrorMessage("nope", "既定文言")).toBe("既定文言");
    expect(rfErrorMessage(new RfError(RfErrorCode.NonFinite))).toBe("数値を入力してください。");
  });

  it("maps real thrown RfErrors from A群 calc functions to Japanese", () => {
    // 反射係数の範囲外
    let msg = "";
    try {
      convertVswr("reflection", 1.2);
    } catch (error) {
      msg = rfErrorMessage(error);
    }
    expect(msg).toBe("反射係数は0以上1未満の値を入力してください。");

    // パッチの比誘電率<=1
    try {
      calculatePatchAntenna({ frequencyMHz: 2400, dielectricConstant: 1, substrateHeightMm: 1.6 });
    } catch (error) {
      msg = rfErrorMessage(error);
    }
    expect(msg).toBe("比誘電率は1より大きい値を入力してください。");

    // 走査角の範囲外
    try {
      calculateGratingLobes({ frequencyMHz: 4800, spacingM: 0.06, scanAngleDeg: 95 });
    } catch (error) {
      msg = rfErrorMessage(error);
    }
    expect(msg).toContain("走査角");

    // 反射面幅の非正
    try {
      calculateReflectorRisEffect({
        frequencyMHz: 4800,
        widthM: 0,
        heightM: 1,
        txDistanceM: 30,
        rxDistanceM: 30,
        efficiencyPercent: 50
      });
    } catch (error) {
      msg = rfErrorMessage(error);
    }
    expect(msg).toBe("反射面幅は0より大きい値を入力してください。");
  });
});
