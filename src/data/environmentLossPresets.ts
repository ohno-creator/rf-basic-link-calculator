export type EnvironmentLossPreset = {
  label: string;
  lossDb: number | null;
  description: string;
};

export const environmentLossPresets: EnvironmentLossPreset[] = [
  { label: "屋外見通し", lossDb: 0, description: "障害物が少ない見通し環境の目安です。" },
  { label: "屋内・軽度", lossDb: 10, description: "壁や家具などの影響を少し含めた目安です。" },
  { label: "工場・倉庫", lossDb: 15, description: "反射、遮蔽、設備の影響を見込んだ目安です。" },
  { label: "筐体内蔵", lossDb: 10, description: "内蔵アンテナで筐体やGND影響を受ける目安です。" },
  { label: "金属近接", lossDb: 20, description: "金属部品や金属筐体に近い要注意条件の目安です。" },
  { label: "手動入力", lossDb: null, description: "実測値や設計条件に合わせて任意に入力します。" }
];
