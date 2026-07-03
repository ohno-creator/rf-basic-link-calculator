// UI Kit v2 の純ロジック層（Reactに依存しない・vitestで検証可能）。
// 表示コンポーネント（MetricCard / SegmentedControl / CollapsibleSection）は、状態→クラスや
// キー操作→次インデックスといった判断をここに集約し、描画は各 .tsx が担う。
// 設計方針は docs/ui-redesign-plan.md §2。

import type { CalloutTone } from "@/components/Callout";
import type { StatTone } from "@/components/Stat";
import type { LinkJudgementLevel } from "@/lib/rf/judgement";

/** 結果カードの意味トーン。判定を持つ値のみ neutral/primary 以外を指定する（呼び出し側の規律）。 */
export type MetricTone = "neutral" | "primary" | "success" | "info" | "caution" | "warning" | "danger";

/** MetricTone → 主役数値の色（Stat のトーン）。Stat には orange が無いため warning は amber に寄せる。 */
export const metricStatTone: Record<MetricTone, StatTone> = {
  neutral: "neutral",
  primary: "staf",
  success: "emerald",
  info: "sky",
  caution: "amber",
  warning: "amber",
  danger: "rose"
};

/** MetricTone → カード面のトーン（Callout の意味トークンを再利用）。neutral/primary は素の白面。 */
export const metricSurfaceTone: Record<MetricTone, CalloutTone> = {
  neutral: "neutral",
  primary: "neutral",
  success: "success",
  info: "info",
  caution: "caution",
  warning: "warning",
  danger: "danger"
};

/**
 * ロービング tabindex のセグメンテッドコントロールで、矢印キーから次に選ぶインデックスを返す。
 * 右/下=+1、左/上=−1（両端で巻き戻る）。対象外キーや空リストは -1（移動なし）。
 */
export function nextRovingIndex(current: number, key: string, length: number): number {
  if (length <= 0) return -1;
  if (key === "ArrowRight" || key === "ArrowDown") return (current + 1) % length;
  if (key === "ArrowLeft" || key === "ArrowUp") return (current - 1 + length) % length;
  return -1;
}

/** localStorage の保存値と既定から、折りたたみセクションの初期開閉を決める。 */
export function resolveCollapsibleOpen(stored: string | null, defaultOpen: boolean): boolean {
  if (stored === "open") return true;
  if (stored === "closed") return false;
  return defaultOpen;
}

/** 折りたたみ状態の localStorage キー（docs/ui-redesign-plan.md §2.7 の命名規約）。 */
export function collapsibleStorageKey(key: string): string {
  return `collapsible:${key}`;
}

/** 判定レベル → 主役数値の色（Stat のトーン）。Stat に orange が無いため unstable は amber に寄せる。 */
export const judgementStatTone: Record<LinkJudgementLevel, StatTone> = {
  excellent: "emerald",
  good: "sky",
  caution: "amber",
  unstable: "amber",
  poor: "rose"
};

/** 判定レベル → 状態ドットの背景色（ResultBar/MobileResultBar 用。unstable は orange で区別）。 */
export const judgementDotClass: Record<LinkJudgementLevel, string> = {
  excellent: "bg-emerald-500",
  good: "bg-sky-500",
  caution: "bg-amber-500",
  unstable: "bg-orange-500",
  poor: "bg-rose-500"
};

/**
 * モバイルの結果追従バーを表示すべきか。
 * 結果カードがまだ画面より下にある（＝編集中で見えていない）ときだけ true。
 * StickyResultSummary の判定を汎用化したもの。
 */
export function shouldShowMobileResultBar(isIntersecting: boolean, top: number): boolean {
  return !isIntersecting && top > 0;
}

/**
 * ChoiceChips の重症度（選択肢の「効きやすさ」目安）。緑=有利〜赤=最も不利。
 * 数値計算は lib/rf 側が担い、これは選択UIの色分けのための順序付き分類。
 */
export type ChoiceChipSeverity = "ok" | "warn" | "bad" | "severe";

/** 重症度 → 選択時のカード面クラスとドット色（NcuBelowGroundClient の配色を昇格）。 */
export const choiceChipToneClass: Record<ChoiceChipSeverity, { selected: string; dot: string }> = {
  ok: { selected: "border-emerald-300 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
  warn: { selected: "border-amber-300 bg-amber-50 text-amber-900 ring-1 ring-amber-200", dot: "bg-amber-500" },
  bad: { selected: "border-orange-300 bg-orange-50 text-orange-900 ring-1 ring-orange-200", dot: "bg-orange-500" },
  severe: { selected: "border-rose-300 bg-rose-50 text-rose-900 ring-1 ring-rose-200", dot: "bg-rose-500" }
};

/** 凡例・並びの重症度順（緑→赤）。 */
export const CHOICE_CHIP_SEVERITY_ORDER: readonly ChoiceChipSeverity[] = ["ok", "warn", "bad", "severe"];

/** 重症度 → 凡例ラベル（緑=有利〜赤=不利）。 */
export const choiceChipSeverityLabel: Record<ChoiceChipSeverity, string> = {
  ok: "有利",
  warn: "やや不利",
  bad: "不利",
  severe: "最も不利"
};
