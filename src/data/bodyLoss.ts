/**
 * 人体・手の影響による追加損失（ボディロス）の文献代表値テーブル [dB]。
 *
 * 「装着・保持シナリオ × 周波数帯」ごとに Typ（典型）/ Worst（悪条件）の2値を持つ。
 * 値は 3GPP の評価前提・CTIA のファントム試験知見・アンテナベンダ公開データを突き合わせた
 * 設計初期の目安値であり、実機では筐体・アンテナ配置・姿勢により大きく変わる（実測前提）。
 * 文献に代表値が見当たらない組合せ（GNSS L1 × 頭部近接）は null（データなし）とする。
 *
 * 出典:
 *   - 3GPP TR 36.814 §8.2（評価前提のボディロス。TR 37.840 の実装損失の扱いも併記）
 *   - CTIA OTA Test Plan（Head/Hand Phantoms によるOTA評価法）
 *   - AntennaWare, Body Loss Data（ウェアラブル帯域別の実測公開データ）
 */

/** 周波数帯ID（UIチップ・テーブルのキー）。 */
export type BodyLossBandId = "920" | "1575" | "2400" | "sub6";

/** 装着・保持シナリオID。 */
export type BodyLossScenarioId = "handheld" | "wrist" | "head" | "bodyWorn" | "bodyShadow";

export type BodyLossBand = {
  id: BodyLossBandId;
  /** チップ表示名。 */
  label: string;
  /** 代表用途の補足。 */
  note: string;
};

/** 周波数帯（表示順）。 */
export const BODY_LOSS_BANDS: readonly BodyLossBand[] = [
  { id: "920", label: "920MHz", note: "LPWA・Sub-GHz（LoRa/Sigfox/Wi-SUN）" },
  { id: "1575", label: "1575MHz", note: "GNSS L1（GPS/みちびき）" },
  { id: "2400", label: "2.4GHz", note: "BLE・Wi-Fi・電子レンジと同帯域" },
  { id: "sub6", label: "Sub-6", note: "セルラー Sub-6GHz（LTE/5G）" }
];

export type BodyLossScenario = {
  id: BodyLossScenarioId;
  /** チップ表示名。 */
  label: string;
  /** 何を想定した条件かの1行説明。 */
  description: string;
};

/** 装着・保持シナリオ（表示順）。 */
export const BODY_LOSS_SCENARIOS: readonly BodyLossScenario[] = [
  { id: "handheld", label: "手持ち", description: "スマホ・ハンディ端末を手で保持（手のみの影響）" },
  { id: "wrist", label: "手首装着", description: "スマートウォッチ・リストバンド型（腕への密着）" },
  { id: "head", label: "頭部近接", description: "通話姿勢・ヘッドセットなど頭部至近" },
  { id: "bodyWorn", label: "体表密着", description: "胸ポケット・体貼付けセンサなど体表に密着" },
  { id: "bodyShadow", label: "体による遮蔽", description: "体の反対側に電波が回り込む（人体シャドウイング）" }
];

/** Typ（典型）/ Worst（悪条件）の追加損失 [dB]。文献データなしは null。 */
export type BodyLossCell = { typicalDb: number; worstDb: number } | null;

/**
 * ボディロス表 [dB]（シナリオ × 帯域）。
 * 数値は上記出典の代表値。GNSS L1 × 頭部近接は文献代表値が得られないため null。
 */
export const BODY_LOSS_TABLE: Record<BodyLossScenarioId, Record<BodyLossBandId, BodyLossCell>> = {
  handheld: {
    "920": { typicalDb: 3.0, worstDb: 6.0 },
    "1575": { typicalDb: 4.5, worstDb: 8.0 },
    "2400": { typicalDb: 5.0, worstDb: 10.0 },
    sub6: { typicalDb: 4.0, worstDb: 8.0 }
  },
  wrist: {
    "920": { typicalDb: 8.0, worstDb: 15.0 },
    "1575": { typicalDb: 10.0, worstDb: 18.0 },
    "2400": { typicalDb: 12.0, worstDb: 20.0 },
    sub6: { typicalDb: 9.0, worstDb: 16.0 }
  },
  head: {
    "920": { typicalDb: 5.0, worstDb: 10.0 },
    "1575": null,
    "2400": { typicalDb: 8.0, worstDb: 15.0 },
    sub6: { typicalDb: 7.0, worstDb: 12.0 }
  },
  bodyWorn: {
    "920": { typicalDb: 10.0, worstDb: 18.0 },
    "1575": { typicalDb: 12.0, worstDb: 22.0 },
    "2400": { typicalDb: 15.0, worstDb: 25.0 },
    sub6: { typicalDb: 12.0, worstDb: 20.0 }
  },
  bodyShadow: {
    "920": { typicalDb: 12.0, worstDb: 20.0 },
    "1575": { typicalDb: 15.0, worstDb: 25.0 },
    "2400": { typicalDb: 18.0, worstDb: 30.0 },
    sub6: { typicalDb: 15.0, worstDb: 25.0 }
  }
};

export type BodyLossSource = {
  label: string;
  href: string;
  kind: "standard" | "test-plan" | "measurement";
  note: string;
};

/** データの一次出典（UIの深掘り・脚注から参照）。 */
export const BODY_LOSS_SOURCES: readonly BodyLossSource[] = [
  {
    label: "3GPP TR 36.814 §8.2 (Further advancements for E-UTRA physical layer aspects)",
    href: "https://www.3gpp.org/dynareport/36814.htm",
    kind: "standard",
    note: "システム評価前提としてのボディロス値。実装損失の扱いは TR 37.840 も併記される。"
  },
  {
    label: "CTIA OTA Test Plan (Test Plan for Wireless Device Over-the-Air Performance, Head/Hand Phantoms)",
    href: "https://ctiacertification.org/test-plans/",
    kind: "test-plan",
    note: "頭部・手ファントムを用いたTRP/TISのOTA評価法。保持姿勢を再現して測る業界標準。"
  },
  {
    label: "AntennaWare, Body Loss Data",
    href: "https://www.antennaware.com/",
    kind: "measurement",
    note: "ウェアラブル用途の帯域別ボディロス実測公開データ。"
  }
];
