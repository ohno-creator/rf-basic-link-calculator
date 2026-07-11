// コラム・図鑑系コンテンツで共有する「出典」データモデル（Track D1 パイロット）。
// 仕様の正本は docs/column-guide.md §4.1。今後の新コラムはこの型で出典を持ち、
// 表示側（各Column/Panel）は kind バッジ＋label（＋locator）で統一表記する。

/**
 * 出典の種別。表示バッジとリンク鮮度運用（retrievedAt）の分類に使う。
 * - paper: 査読論文・学会論文
 * - standard: 規格・勧告（ITU-R / IEEE Std / 3GPP など）
 * - dataset: 公開データベース・測定データ集
 * - book: 書籍
 * - datasheet: 部品・製品データシート、メーカー実装ガイド
 * - article: 上記に収まらない解説記事・ホワイトペーパー（column-guide.md 互換）
 */
export type ColumnSourceKind = "paper" | "standard" | "dataset" | "book" | "datasheet" | "article";

/** 出典1件。定量主張には locator（式番号・節番号・表番号）まで添えるのが望ましい。 */
export type ColumnSource = {
  /** 表示名（例: "Hata (1980) IEEE Trans. VT-29"）。 */
  label: string;
  /** リンク先URL。安定したURL（DOI・規格団体の恒久ページ）がある場合のみ付ける。 */
  href?: string;
  kind: ColumnSourceKind;
  /** 式番号・節番号・表番号など（例: "式(16)-(20)" / "§4.5" / "Table 7.4.1-1"）。 */
  locator?: string;
  /** 1行の要旨（この出典が何を裏付けるか）。 */
  note?: string;
  /** リンク・内容を確認した年月（例: "2026-07"）。鮮度レビューに使う。 */
  retrievedAt?: string;
};

/** kind → 表示バッジの日本語ラベル（表示側で共通利用）。 */
export const columnSourceKindLabel: Record<ColumnSourceKind, string> = {
  paper: "論文",
  standard: "規格",
  dataset: "データ",
  book: "書籍",
  datasheet: "データシート",
  article: "記事"
};
