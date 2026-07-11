/**
 * OTA実装損失・デセンス分析のBand別サンプル入力（教材用の代表例。「例」を明記して表示する）。
 *
 * 値の位置づけ:
 * - 伝導出力 23dBm は 3GPP TS 36.101 の UE Power Class 3（23dBm）に対応する公称値。
 * - 伝導感度・放射効率・TRP/TIS は特定製品の実測値ではなく、LTE-M級の小型端末で
 *   よく見かけるレンジを示す教材用サンプル（低いBandほど小型アンテナの効率が落ち、
 *   TISギャップが開きやすい、という典型傾向を再現している）。
 *
 * 測定量の定義の出典:
 * - CTIA, "Test Plan for Wireless Device Over-the-Air Performance"（TRP/TISの定義と測定手順）
 * - 3GPP TS 34.114, "User Equipment (UE) / Mobile Station (MS) Over The Air (OTA) antenna
 *   performance; Conformance testing"
 */

export type OtaBandPreset = {
  /** 表示ラベル（サンプルであることを「（例）」で明記）。 */
  label: string;
  /** 伝導出力 Pc[dBm]。 */
  conductedPowerDbm: number;
  /** 伝導感度 Sc[dBm]。 */
  conductedSensitivityDbm: number;
  /** アンテナ放射効率 η[dB]（0以下）。 */
  antennaEfficiencyDb: number;
  /** OTA実測 TRP[dBm]。 */
  trpDbm: number;
  /** OTA実測 TIS[dBm]。 */
  tisDbm: number;
};

/** 初期表示に使うBand別サンプル（LTE-M想定・教材用の例）。 */
export const OTA_BAND_PRESETS: readonly OtaBandPreset[] = [
  {
    label: "LTE-M B1（例）",
    conductedPowerDbm: 23,
    conductedSensitivityDbm: -108,
    antennaEfficiencyDb: -3,
    trpDbm: 19.5,
    tisDbm: -102
  },
  {
    label: "LTE-M B8（例）",
    conductedPowerDbm: 23,
    conductedSensitivityDbm: -108,
    antennaEfficiencyDb: -4,
    trpDbm: 18,
    tisDbm: -99
  },
  {
    label: "LTE-M B18（例）",
    conductedPowerDbm: 23,
    conductedSensitivityDbm: -108,
    antennaEfficiencyDb: -5,
    trpDbm: 17.5,
    tisDbm: -97.5
  }
];

/** 同時に管理できるBand行の上限。 */
export const MAX_OTA_BANDS = 6;
