/**
 * セルラーIoT（LTE-M / NB-IoT）電波品質の良否判定バンド（G15判定強化）。
 *
 * RSRP[dBm]・RSRQ[dB]・SINR[dB] を「安定運用の推奨帯」で4段階（excellent/good/fair/poor）
 * に区分するしきい値表。判定境界は「下限以上（≥）」でその段に入る:
 *   value ≥ excellentMin → excellent ／ ≥ goodMin → good ／ ≥ fairMin → fair ／ それ未満 → poor
 * （例: LTE-M の RSRP −100dBm は fair の下端であり poor には入らない）
 *
 * 注意: CE（Coverage Enhancement）機能により RSRP −115dBm 以下でも接続自体は維持され得る
 * （NB-IoT は −135dBm 程度まで）。本表は「接続可否」ではなく安定運用の推奨値。
 *
 * 出典: 3GPP TS 36.133（測定確度・報告レンジの根拠規格）／
 *       Quectel NB-IoT・LTE-M Application Notes（モジュールベンダ推奨の品質目安）／
 *       キャリアIoT実務仕様（国内MNOのIoT回線設計目安）。
 */

export type CellularMode = "lte-m" | "nb-iot";

export type CellularSignalLevel = "excellent" | "good" | "fair" | "poor";

export type CellularMetricKey = "rsrp" | "rsrq" | "sinr";

export type CellularMetricThresholds = {
  /** 指標キー（機械キー）。 */
  metric: CellularMetricKey;
  /** 表示ラベル。 */
  label: string;
  /** 単位（RSRP は dBm＝絶対電力、RSRQ/SINR は dB＝比）。 */
  unit: "dBm" | "dB";
  /** これ以上で excellent。 */
  excellentMin: number;
  /** これ以上（excellentMin 未満）で good。 */
  goodMin: number;
  /** これ以上（goodMin 未満）で fair。fairMin 未満は poor。 */
  fairMin: number;
};

export type CellularSignalBand = {
  mode: CellularMode;
  /** 表示ラベル（例: LTE-M（Cat-M1））。 */
  label: string;
  /** 判定対象の指標としきい値。NB-IoT は RSRQ 推奨帯を持たない（RSRP/SINR のみ）。 */
  metrics: readonly CellularMetricThresholds[];
};

/** モード別の良否判定バンド。数値は下記 SOURCES の推奨帯からの転記（発明値なし）。 */
export const CELLULAR_SIGNAL_BANDS: Record<CellularMode, CellularSignalBand> = {
  "lte-m": {
    mode: "lte-m",
    label: "LTE-M（Cat-M1）",
    metrics: [
      { metric: "rsrp", label: "RSRP", unit: "dBm", excellentMin: -80, goodMin: -90, fairMin: -100 },
      { metric: "rsrq", label: "RSRQ", unit: "dB", excellentMin: -10, goodMin: -15, fairMin: -20 },
      { metric: "sinr", label: "SINR", unit: "dB", excellentMin: 20, goodMin: 13, fairMin: 0 }
    ]
  },
  "nb-iot": {
    mode: "nb-iot",
    label: "NB-IoT（Cat-NB1）",
    metrics: [
      { metric: "rsrp", label: "RSRP", unit: "dBm", excellentMin: -95, goodMin: -105, fairMin: -115 },
      { metric: "sinr", label: "SINR", unit: "dB", excellentMin: 10, goodMin: 3, fairMin: -3 }
    ]
  }
};

/** 判定レベルの表示ラベル（日本語＋英語）。 */
export const CELLULAR_SIGNAL_LEVEL_LABELS: Record<
  CellularSignalLevel,
  { ja: string; en: string }
> = {
  excellent: { ja: "優良", en: "Excellent" },
  good: { ja: "良好", en: "Good" },
  fair: { ja: "注意", en: "Fair" },
  poor: { ja: "不良", en: "Poor" }
};

/** CE（Coverage Enhancement）に関する必須注記。UIにそのまま表示する。 */
export const CE_COVERAGE_NOTE =
  "CE（Coverage Enhancement）機能により RSRP −115dBm 以下でも接続自体は維持され得ます" +
  "（NB-IoT は −135dBm 程度まで）。本判定は安定運用の推奨値です。";

export type CellularSignalBandSource = {
  label: string;
  href?: string;
  kind: "standard" | "vendor" | "practice";
  note?: string;
};

/** しきい値の出典。href の無いものは実務仕様（公開URLなし）。 */
export const CELLULAR_SIGNAL_BAND_SOURCES: readonly CellularSignalBandSource[] = [
  {
    label: "3GPP TS 36.133 — Requirements for support of radio resource management",
    href: "https://www.3gpp.org/DynaReport/36133.htm",
    kind: "standard",
    note: "RSRP/RSRQ の測定確度・報告レンジの根拠規格"
  },
  {
    label: "Quectel NB-IoT / LTE-M Application Notes",
    href: "https://www.quectel.com/",
    kind: "vendor",
    note: "モジュールベンダ推奨の RSRP/SINR 品質目安"
  },
  {
    label: "キャリアIoT実務仕様（国内MNOのIoT回線設計目安）",
    kind: "practice",
    note: "安定運用のための実務推奨帯。目安値・実測前提"
  }
];
