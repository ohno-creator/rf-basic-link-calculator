/**
 * RF計算層の共通バリデーションエラー。
 *
 * lib層は日本語の表示文言を持たず、エラーの「種類コード」と「フィールドキー(ascii)」だけを運ぶ。
 * 画面に出す日本語文言は UI 層（将来のコード→文言マップ）が owns する。message はデバッグ用の
 * 非localized文字列で、ユーザーには表示しない。共通ガード関数もここに集約して重複を排除する。
 */

export const RfErrorCode = {
  /** 数値でない（NaN/Infinity）。 */
  NonFinite: "non_finite",
  /** 0より大きい値が必要。 */
  NonPositive: "non_positive",
  /** 0以上が必要（負値）。 */
  Negative: "negative",
  /** 上限を超過。 */
  TooLarge: "too_large",
  /** 下限未満（例: 比誘電率は1以上）。 */
  BelowMinimum: "below_minimum",
  /** 定義域外（例: 0より大きく1未満）。 */
  OutOfDomain: "out_of_domain",
  /** 百分率（0より大きく100以下）の範囲外。 */
  Percent: "percent",
  /** 必要なデータが空。 */
  Empty: "empty"
} as const;

export type RfErrorCode = (typeof RfErrorCode)[keyof typeof RfErrorCode];

export type RfErrorContext = {
  /** 対象フィールドの機械キー(ascii)。UIが日本語ラベルへ写像する。 */
  field?: string;
  min?: number;
  max?: number;
};

export class RfError extends Error {
  readonly code: RfErrorCode;
  readonly field?: string;
  readonly min?: number;
  readonly max?: number;

  constructor(code: RfErrorCode, context: RfErrorContext = {}) {
    super(context.field ? `${code}:${context.field}` : code);
    this.name = "RfError";
    this.code = code;
    this.field = context.field;
    this.min = context.min;
    this.max = context.max;
  }
}

/** 数値（有限）であることを要求する。 */
export function assertFinite(value: number, field: string): void {
  if (!Number.isFinite(value)) {
    throw new RfError(RfErrorCode.NonFinite, { field });
  }
}

/** 0より大きい有限値であることを要求する。 */
export function assertPositiveFinite(value: number, field: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RfError(RfErrorCode.NonPositive, { field });
  }
}

/** 0以上の有限値であることを要求する。 */
export function assertNonNegative(value: number, field: string): void {
  assertFinite(value, field);
  if (value < 0) {
    throw new RfError(RfErrorCode.Negative, { field });
  }
}

/** 下限 min 以上の有限値であることを要求する。 */
export function assertAtLeast(value: number, min: number, field: string): void {
  if (!Number.isFinite(value) || value < min) {
    throw new RfError(RfErrorCode.BelowMinimum, { field, min });
  }
}

/** 百分率（0より大きく100以下）であることを要求する。 */
export function assertPercent(value: number, field: string): void {
  if (!Number.isFinite(value) || value <= 0 || value > 100) {
    throw new RfError(RfErrorCode.Percent, { field });
  }
}
