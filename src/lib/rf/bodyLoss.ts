/**
 * 人体・手の影響による追加損失（ボディロス）の表引き。
 *
 *   受信レベル[dBm] = （自由空間での受信レベル） − ボディロス[dB]
 *
 * 値は文献代表値（src/data/bodyLoss.ts。3GPP TR 36.814 §8.2 / CTIA OTA Test Plan /
 * AntennaWare 公開データ）の Typ / Worst [dB]。周波数帯とシナリオの離散表引きであり、
 * 補間は行わない（帯域内の周波数差より個体・姿勢ばらつきの方が大きいため）。
 *
 * 用途: リンクバジェットの「環境損失」への計上値の当たり付け。
 * 適用条件: 設計初期の目安値。実機は筐体・アンテナ配置・姿勢で変わるため実測前提。
 * 文献データが無い組合せ（GNSS L1 × 頭部近接）は null を返す（0dB ではない点に注意）。
 */

import {
  BODY_LOSS_TABLE,
  type BodyLossBandId,
  type BodyLossScenarioId
} from "@/data/bodyLoss";
import { RfError, RfErrorCode } from "./errors";

export type { BodyLossBandId, BodyLossScenarioId } from "@/data/bodyLoss";

export type BodyLossResult = {
  /** 典型値 [dB]（リンクバジェットへの推奨計上値）。 */
  typicalDb: number;
  /** 悪条件値 [dB]（姿勢・密着が最悪側に振れた場合）。 */
  worstDb: number;
};

export type BodyLossQuery = {
  band: BodyLossBandId;
  scenario: BodyLossScenarioId;
};

/**
 * シナリオ × 周波数帯のボディロス文献値を返す。
 * 文献データが無い組合せは null（呼び出し側は「データなし」として扱い、0dB とみなさない）。
 * 未知のキー（実行時の不正入力）は RfError(invalid_input) を投げる。
 */
export function lookupBodyLoss({ band, scenario }: BodyLossQuery): BodyLossResult | null {
  const row = Object.prototype.hasOwnProperty.call(BODY_LOSS_TABLE, scenario)
    ? BODY_LOSS_TABLE[scenario]
    : undefined;
  if (row === undefined) {
    throw new RfError(RfErrorCode.InvalidInput, { field: "scenario" });
  }
  if (!Object.prototype.hasOwnProperty.call(row, band)) {
    throw new RfError(RfErrorCode.InvalidInput, { field: "band" });
  }
  const cell = row[band];
  if (cell === null) {
    return null;
  }
  // データ層の値をそのまま外へ渡さない（呼び出し側の変更から表を守る防御的コピー）
  return { typicalDb: cell.typicalDb, worstDb: cell.worstDb };
}
