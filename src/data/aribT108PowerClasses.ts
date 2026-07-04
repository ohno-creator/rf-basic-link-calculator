/**
 * ARIB STD-T108（920MHz帯 特定小電力無線局・登録局）の空中線電力区分と法規パラメータ。
 *
 * EIRP計算エンジン（src/lib/rf/eirpCompliance.ts）へ `eirpLimitDbm` として渡す規格上限を、
 * 出典・確度フラグ付きで data 層に分離する（改定追随・UI非依存）。数値は一次調査で確認済み
 * （docs/handoff/E4-aribT108-values.md, Antigravity 2026-07-04, 全 confirmed）。
 *
 * 単位: 電力[dBm]/[mW]、利得[dBi]、時間[ms]/[s]、キャリアセンス閾値[dBm]。
 * 注意: EIRP上限は「空中線電力＋基準利得」の運用上限であり、高利得アンテナ使用時は
 * 送信電力制御で EIRP を上限以下に保つ必要がある（本 data はその上限値を表す）。
 */

export type AribT108PowerClass = {
  /** 機械キー。 */
  id: string;
  /** UI表示名。 */
  label: string;
  /** 空中線電力上限[mW]。 */
  maxAntennaPowerMw: number;
  /** 空中線電力上限[dBm]。 */
  maxAntennaPowerDbm: number;
  /** 基準空中線利得[dBi]（これを超える利得は送信電力抑制が必要）。 */
  referenceAntennaGainDbi: number;
  /** EIRP上限[dBm]（EIRP計算エンジンの eirpLimitDbm へ渡す）。 */
  eirpLimitDbm: number;
  /** 指向性緩和等を満たした場合の緩和EIRP上限[dBm]（無ければ null）。 */
  relaxedEirpLimitDbm: number | null;
  /** キャリアセンス（LBT）閾値[dBm]。 */
  carrierSenseThresholdDbm: number;
  /** キャリアセンス受信時間[ms]。 */
  carrierSenseDurationMs: number;
  /** 1回の連続送信時間上限[s]。 */
  maxTxDurationSec: number;
  /** 送信休止時間（バックオフ）[ms]。 */
  txPauseMs: number;
  /** 1時間あたりの総送信時間上限[s]（デューティ比の絶対値）。 */
  maxTotalTxPerHourSec: number;
  /** 適用対象の説明。 */
  appliesTo: string;
  /** 一次出典。 */
  source: string;
  /** 確度。一次確認できない値は "needs_check" のまま保持しUIで明示する。 */
  confidence: "confirmed" | "needs_check";
};

/**
 * 920MHz帯の代表2区分（一次確認済み）。
 * 出典: ARIB STD-T108／電波法施行規則。docs/handoff/E4-aribT108-values.md。
 */
export const ARIB_T108_POWER_CLASSES: readonly AribT108PowerClass[] = [
  {
    id: "specified_low_power_20mw",
    label: "特定小電力（20mW型）",
    maxAntennaPowerMw: 20,
    maxAntennaPowerDbm: 13,
    referenceAntennaGainDbi: 3,
    eirpLimitDbm: 16,
    relaxedEirpLimitDbm: null,
    carrierSenseThresholdDbm: -80,
    carrierSenseDurationMs: 5,
    maxTxDurationSec: 4,
    txPauseMs: 50,
    maxTotalTxPerHourSec: 360,
    appliesTo: "920MHz帯 特定小電力無線局（利得3dBi超は送信電力抑制でEIRP16dBm以下に保つ）",
    source: "ARIB STD-T108 第2編/第3編 第2.1節・電波法施行規則第6条",
    confidence: "confirmed"
  },
  {
    id: "registered_250mw",
    label: "登録局（250mW型）",
    maxAntennaPowerMw: 250,
    maxAntennaPowerDbm: 24,
    referenceAntennaGainDbi: 3,
    eirpLimitDbm: 27,
    relaxedEirpLimitDbm: 30.8,
    carrierSenseThresholdDbm: -86,
    carrierSenseDurationMs: 5,
    maxTxDurationSec: 4,
    txPauseMs: 50,
    maxTotalTxPerHourSec: 360,
    appliesTo: "920MHz帯 登録局（指向性緩和要件を満たせば最大30.8dBm/1212mWまで）",
    source: "ARIB STD-T108 第2編/第3編 第2.1.2節・電波法施行規則第6条",
    confidence: "confirmed"
  }
];

/** id で区分を引く。 */
export function getAribT108PowerClass(id: string): AribT108PowerClass | undefined {
  return ARIB_T108_POWER_CLASSES.find((item) => item.id === id);
}
