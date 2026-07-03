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
