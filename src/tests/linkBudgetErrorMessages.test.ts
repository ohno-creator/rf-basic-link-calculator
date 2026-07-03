import { describe, expect, it } from "vitest";
import { defaultLinkBudgetInput, validateLinkBudgetInput } from "@/lib/rf/linkBudget";
import {
  linkBudgetErrorMessage,
  resolveLinkBudgetErrors
} from "@/lib/linkBudgetErrorMessages";

describe("linkBudgetErrorMessage", () => {
  it("reproduces the exact field-specific messages (表示互換を固定)", () => {
    expect(linkBudgetErrorMessage("frequencyMHz", "frequency_positive")).toBe(
      "周波数は0より大きい値をMHzで入力してください。"
    );
    expect(linkBudgetErrorMessage("frequencyMHz", "frequency_too_large")).toBe(
      "周波数が大きすぎます。MHz単位で入力してください。"
    );
    expect(linkBudgetErrorMessage("pathLossExponent", "path_loss_exponent_range")).toBe(
      "Log-distanceの距離損失指数は1〜6の範囲で入力してください。"
    );
    expect(linkBudgetErrorMessage("distance", "distance_too_large")).toBe(
      "通信距離が大きすぎます。初期検討に適した範囲で入力してください。"
    );
    expect(linkBudgetErrorMessage("calibrationOffsetDb", "calibration_offset_number")).toBe(
      "実測補正値をdBで入力してください。未入力の場合は0dBにしてください。"
    );
  });

  it("builds non_negative messages from the field label", () => {
    expect(linkBudgetErrorMessage("cableLossDb", "non_negative")).toBe(
      "ケーブル・コネクタ損失は0以上の値を入力してください。"
    );
    expect(linkBudgetErrorMessage("installationMarginDb", "non_negative")).toBe(
      "設置ばらつきマージンは0以上の値を入力してください。"
    );
  });
});

describe("validate → resolve は元の表示文言と一致する", () => {
  it("frequencyを空欄にすると従来と同じ文言へ解決される", () => {
    const errors = validateLinkBudgetInput({ ...defaultLinkBudgetInput, frequencyMHz: Number.NaN });
    expect(errors.frequencyMHz).toBe("frequency_positive");
    const messages = resolveLinkBudgetErrors(errors);
    expect(messages.frequencyMHz).toBe("周波数は0より大きい値をMHzで入力してください。");
  });

  it("負のケーブル損失は non_negative → ラベル入り文言へ", () => {
    const errors = validateLinkBudgetInput({ ...defaultLinkBudgetInput, cableLossDb: -1 });
    expect(errors.cableLossDb).toBe("non_negative");
    expect(resolveLinkBudgetErrors(errors).cableLossDb).toBe(
      "ケーブル・コネクタ損失は0以上の値を入力してください。"
    );
  });

  it("正常入力ではエラーなし", () => {
    expect(resolveLinkBudgetErrors(validateLinkBudgetInput(defaultLinkBudgetInput))).toEqual({});
  });
});
