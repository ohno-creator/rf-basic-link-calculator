export type DielectricPreset = {
  material: string;
  er: number;
  note: string;
};

/** アンテナ小型化でよく使われる誘電体材料の比誘電率εrの代表値（目安）。 */
export const dielectricPresets: DielectricPreset[] = [
  { material: "空気", er: 1.0, note: "基準（短縮なし）" },
  { material: "PTFE（テフロン）", er: 2.1, note: "低損失・ケーブル誘電体" },
  { material: "FR4 基板", er: 4.4, note: "一般的なプリント基板" },
  { material: "アルミナ", er: 9.8, note: "セラミック基板" },
  { material: "高誘電率セラミック", er: 20, note: "チップアンテナ材" },
  { material: "高εr セラミック", er: 40, note: "小型チップアンテナ材" }
];
