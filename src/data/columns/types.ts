import type { ColumnSource } from "@/data/columnSources";

export type { ColumnSource };

/**
 * 構造化コラムの型（docs/column-guide.md §4.1 の実装）。
 * コラムを「データ＋共通レンダラー（ToolColumnCard）」に分離し、
 * 改稿はデータのみ・定量値は compute() でlib関数から自動追随させる。
 */

export type QuantRow = {
  /** 行ラベル（例: "第1フレネル半径（920MHz・100m・中央）"）。 */
  label: string;
  /** lib/rf を呼び、フォーマット済み文字列を返す（手書き数値の陳腐化防止）。 */
  compute: () => string;
  /** 指定時、live propに同キーがあれば「いまの条件では」を再計算表示する。 */
  liveKey?: string;
  /** 適用条件などの1行注記。 */
  note?: string;
};

export type AntiPattern = {
  /** ありがちな誤り。 */
  mistake: string;
  /** 数値で見る帰結。 */
  consequence: string;
  /** 回避策（本サイトのツールへの接続を推奨）。 */
  fix: string;
};

export type ToolColumn = {
  id: string;
  title: string;
  /** 層1: フック（2〜3文・専門用語なし）。 */
  hook: string;
  /** 層2: 本文段落（合計600〜800字目安）。 */
  body: string[];
  /** たとえ＋破れ（使うなら必須ペア）。 */
  analogy?: { text: string; limits: string };
  /** 層3: 数値で見る（開いた状態で表示）。 */
  quant?: { title: string; rows: QuantRow[] };
  /** 層4: 導出・なぜこの式か（折りたたみ）。 */
  derivation?: { title: string; steps: string[] };
  /** 補助: よくある間違い（折りたたみ）。 */
  antiPatterns?: AntiPattern[];
  /** 層5: 一次出典（最低1つ・locator推奨）。 */
  sources: ColumnSource[];
  /** 年次レビュー運用（D8）。"YYYY-MM"。 */
  lastReviewed: string;
};
