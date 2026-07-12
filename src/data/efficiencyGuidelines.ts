export type EfficiencyGuidelineCategory = "external" | "embedded" | "wearable" | "harsh";
export type EfficiencyGuideline = {
  id: string;
  category: EfficiencyGuidelineCategory;
  situation: string;
  percentLow: number;
  percentHigh: number;
  comment: string;
  relatedTool?: string;
};

/** 代表的な設計目安。製品寸法・筐体・人体・周波数で変わるため、最終判断は実機OTA測定を優先する。 */
export const EFFICIENCY_GUIDELINES: readonly EfficiencyGuideline[] = [
  { id: "external", category: "external", situation: "外付けホイップ／ダイポール（基準）", percentLow: 70, percentHigh: 90, comment: "整合が取れていれば上限感となる水準。" },
  { id: "920-spacious", category: "embedded", situation: "920MHz 内蔵・基板余裕あり", percentLow: 40, percentHigh: 60, comment: "GNDをλ/4程度確保できた内蔵アンテナの良好水準。", relatedTool: "/tools/ground-plane-size" },
  { id: "920-small", category: "embedded", situation: "920MHz 小型IoT（GND不足・筐体内）", percentLow: 15, percentHigh: 40, comment: "GND不足や筐体近接を含む現実的な範囲。", relatedTool: "/tools/ground-plane-size" },
  { id: "24-embedded", category: "embedded", situation: "2.4GHz BLE／Wi-Fi 小型機内蔵", percentLow: 30, percentHigh: 60, comment: "部品が密集する実装での現実解。" },
  { id: "gnss-patch", category: "embedded", situation: "GNSSパッチ（良好実装）", percentLow: 50, percentHigh: 70, comment: "効率低下が受信C/N0へ直結する。" },
  { id: "wearable", category: "wearable", situation: "ウェアラブル（人体近接）", percentLow: 5, percentHigh: 20, comment: "人体吸収と離調を含む厳しい条件。", relatedTool: "/tools/body-loss" },
  { id: "metal", category: "harsh", situation: "金属筐体・過酷実装", percentLow: 5, percentHigh: 15, comment: "金属近接と離調を実機で確認する。", relatedTool: "/tools/detuning-estimator" }
];
