// リンクバジェット入力検証コード → 画面表示用の日本語文言（UI層）。
// 計算層 src/lib/rf/linkBudget.ts は日本語を持たず LinkBudgetErrorCode のみを返す。
// フィールド固有の完全文言はここに、非負エラーはフィールドラベル＋テンプレートで解決する。

import type {
  LinkBudgetErrorCode,
  LinkBudgetInput,
  ValidationErrors
} from "./rf/linkBudget";

/** 解決後の表示文言（フィールド→日本語）。UI コンポーネントの errors prop はこの型を受ける。 */
export type LinkBudgetErrorMessages = Partial<Record<keyof LinkBudgetInput, string>>;

// 非負エラー（"non_negative"）でフィールド名を日本語ラベルへ写像する。
const NON_NEGATIVE_LABELS: Partial<Record<keyof LinkBudgetInput, string>> = {
  cableLossDb: "ケーブル・コネクタ損失",
  environmentLossDb: "環境損失",
  groundProximityLossDb: "地面近接損失",
  enclosureLossDb: "筐体損失",
  polarizationMismatchLossDb: "偏波ミスマッチ損失",
  vehicleBodyObstructionLossDb: "車両・人体遮蔽損失",
  installationMarginDb: "設置ばらつきマージン"
};

// フィールド固有コード → 完全文言（非負以外）。
const CODE_MESSAGES: Record<Exclude<LinkBudgetErrorCode, "non_negative">, string> = {
  system_required: "通信方式を選択してください。",
  link_type_required: "通信形態を選択してください。",
  propagation_model_required: "伝搬モデルを選択してください。",
  propagation_area_required: "奥村・秦モデルのエリア種別を選択してください。",
  path_loss_exponent_range: "Log-distanceの距離損失指数は1〜6の範囲で入力してください。",
  iot_anchor_distance_positive: "IoT実測アンカー距離は0より大きい値を入力してください。",
  iot_anchor_unit_required: "IoT実測アンカー距離の単位を選択してください。",
  iot_measured_power_number: "IoT実測受信電力をdBmで入力してください。",
  iot_slope_range: "距離勾配補正は-40〜40dB/decadeの範囲で入力してください。",
  frequency_positive: "周波数は0より大きい値をMHzで入力してください。",
  frequency_too_large: "周波数が大きすぎます。MHz単位で入力してください。",
  distance_positive: "通信距離は0より大きい値を入力してください。",
  distance_too_large: "通信距離が大きすぎます。初期検討に適した範囲で入力してください。",
  tx_power_number: "送信電力をdBmで入力してください。",
  tx_gain_number: "送信アンテナ利得をdBiで入力してください。",
  rx_gain_number: "受信アンテナ利得をdBiで入力してください。",
  tx_height_positive: "送信側アンテナ高は0より大きい値をmで入力してください。",
  rx_height_positive: "受信側アンテナ高は0より大きい値をmで入力してください。",
  calibration_offset_number: "実測補正値をdBで入力してください。未入力の場合は0dBにしてください。",
  sensitivity_number: "受信感度をdBmで入力してください。"
};

/** 1件の検証コードを、フィールドに応じた日本語文言へ解決する。 */
export function linkBudgetErrorMessage(field: keyof LinkBudgetInput, code: LinkBudgetErrorCode): string {
  if (code === "non_negative") {
    return `${NON_NEGATIVE_LABELS[field] ?? "値"}は0以上の値を入力してください。`;
  }
  return CODE_MESSAGES[code];
}

/** ValidationErrors（コード）を、表示用の日本語メッセージ集合へ解決する。 */
export function resolveLinkBudgetErrors(errors: ValidationErrors): LinkBudgetErrorMessages {
  const resolved: LinkBudgetErrorMessages = {};
  for (const [field, code] of Object.entries(errors) as [keyof LinkBudgetInput, LinkBudgetErrorCode][]) {
    resolved[field] = linkBudgetErrorMessage(field, code);
  }
  return resolved;
}
