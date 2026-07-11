import type { ComponentType } from "react";

/** 「感覚でわかる電波」1章ぶんのメタ情報。ナビ・進捗・見出しはすべてここから描画する。 */
export type IntuitionChapterMeta = {
  /** 進捗保存キーにも使う不変ID（例: "wave"）。 */
  id: string;
  /** 1始まりの表示順。 */
  order: number;
  /** 章タイトル（例: 電波は波だ）。 */
  title: string;
  /** 見出し下の1行リード。 */
  lead: string;
  /** ステッパーに出す短い名前（4〜6文字）。 */
  navLabel: string;
};

export type IntuitionChapter = {
  meta: IntuitionChapterMeta;
  Component: ComponentType;
};
