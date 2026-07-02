/**
 * RfError（コード＋フィールドキー）を、画面表示用の日本語文言へ写像するUI層のマップ。
 *
 * 計算層(src/lib/rf/*)は日本語を持たず、表示文言はここに集約する。将来の多言語化は
 * このファイルを言語ごとに差し替えるだけで済む。lib層のガード（errors.ts）が投げる
 * コードとフィールドキーに1対1で対応する。
 */

import { RfError, RfErrorCode } from "./rf/errors";

// フィールドキー(ascii) → 日本語ラベル。汎用テンプレートに埋め込む。
const FIELD_LABELS: Record<string, string> = {
  frequency: "周波数",
  distance: "距離",
  ratio: "倍率",
  watts: "W",
  milliwatts: "mW",
  dbi: "dBi",
  dbd: "dBd",
  dbm: "dBm",
  db: "dB",
  eirp_inputs: "EIRP計算の入力",
  aperture_diameter: "開口径",
  aperture_efficiency: "開口効率",
  velocity_factor: "短縮率",
  antenna_spacing: "アンテナ間隔",
  substrate_height: "基板厚",
  loop_diameter: "ループ径",
  wire_diameter: "線径",
  turns: "巻数",
  antenna_length: "アンテナ長",
  loss_resistance: "損失抵抗",
  sphere_radius: "外接球半径",
  target_bandwidth: "目標比帯域",
  array_aperture: "アレイ開口",
  eval_distance: "評価距離",
  reflector_width: "反射面幅",
  reflector_height: "反射面高さ",
  tx_distance: "送信側距離",
  rx_distance: "受信側距離",
  vswr: "VSWR",
  return_loss: "リターンロス"
};

// フィールド固有の完全メッセージ（コード非依存で最優先。クロスフィールドや特殊範囲用）。
const FIELD_MESSAGES: Record<string, string> = {
  scan_angle: "走査角は-90度より大きく90度より小さい値で入力してください。",
  patch_dielectric: "比誘電率は1より大きい値を入力してください。",
  wire_vs_loop: "線径はループ径より小さくしてください。",
  reflection_coefficient: "反射係数は0以上1未満の値を入力してください。",
  return_loss: "リターンロスは0以上のdB値を入力してください。",
  vswr_value: "数値を入力してください。",
  link_margin_inputs: "受信電力または受信感度を計算できません。",
  link_margin: "リンクマージンを計算できません。入力値を確認してください。"
};

function labelOf(field?: string): string {
  return (field && FIELD_LABELS[field]) ?? "入力値";
}

/**
 * RfError（またはそれ以外のエラー）を日本語文言へ変換する。
 * RfError でない場合や未知コードは fallback を返す。
 */
export function rfErrorMessage(error: unknown, fallback = "入力値を確認してください。"): string {
  if (!(error instanceof RfError)) {
    return fallback;
  }

  if (error.field && FIELD_MESSAGES[error.field]) {
    return FIELD_MESSAGES[error.field];
  }

  const label = labelOf(error.field);

  switch (error.code) {
    case RfErrorCode.NonFinite:
      return error.field ? `${label}は数値で入力してください。` : "数値を入力してください。";
    case RfErrorCode.NonPositive:
      return `${label}は0より大きい値を入力してください。`;
    case RfErrorCode.Negative:
      return `${label}は0以上の値を入力してください。`;
    case RfErrorCode.TooLarge:
      return `${label}が大きすぎます。初期検討に適した範囲で入力してください。`;
    case RfErrorCode.BelowMinimum:
      return `${label}は${error.min ?? 1}以上の値を入力してください。`;
    case RfErrorCode.Percent:
      return `${label}は0より大きく100以下の値を入力してください。`;
    case RfErrorCode.InvalidInput:
      return "入力値を確認してください。";
    case RfErrorCode.OutOfDomain:
      return `${label}が指定できる範囲を外れています。`;
    case RfErrorCode.Empty:
      return "データがありません。";
    default:
      return fallback;
  }
}
