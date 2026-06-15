/**
 * 同軸フィードライン（ケーブル）の損失を見積もる。
 *
 * 減衰は周波数とともに増える。表皮効果による導体損失が支配的な範囲では
 * おおむね √f に比例するので、2.4GHz の代表減衰量を基準にスケールする。
 *
 *   α(f)[dB/m] = α(2.4GHz) × √(f[MHz] / 2400)
 *   ケーブル損失[dB] = α(f) × 長さ[m]
 *   合計損失[dB]   = ケーブル損失 + コネクタ数 × 1個あたり損失
 *   残る電力[%]    = 10^(-合計損失/10) × 100
 *
 * あくまで初期検討用の目安。実際の値はケーブル個体、コネクタ品質、曲げ、温度で変わる。
 */

const REFERENCE_FREQUENCY_MHZ = 2400;
export const DEFAULT_CONNECTOR_LOSS_DB = 0.15;

function assertPositiveFinite(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label}は0より大きい値を入力してください。`);
  }
}

export type CoaxLossResult = {
  perMeterDb: number;
  cableDb: number;
  connectorDb: number;
  totalDb: number;
  powerRemainingPercent: number;
};

export function coaxCableLoss(
  attenuationAt2400DbPerM: number,
  frequencyMHz: number,
  lengthM: number,
  connectorCount: number,
  perConnectorDb: number = DEFAULT_CONNECTOR_LOSS_DB
): CoaxLossResult {
  assertPositiveFinite(attenuationAt2400DbPerM, "基準減衰量");
  assertPositiveFinite(frequencyMHz, "周波数");
  assertPositiveFinite(lengthM, "ケーブル長");

  if (!Number.isFinite(connectorCount) || connectorCount < 0) {
    throw new Error("コネクタ数は0以上で入力してください。");
  }
  if (!Number.isFinite(perConnectorDb) || perConnectorDb < 0) {
    throw new Error("コネクタ1個あたりの損失は0以上で入力してください。");
  }

  const perMeterDb =
    attenuationAt2400DbPerM * Math.sqrt(frequencyMHz / REFERENCE_FREQUENCY_MHZ);
  const cableDb = perMeterDb * lengthM;
  const connectorDb = connectorCount * perConnectorDb;
  const totalDb = cableDb + connectorDb;

  return {
    perMeterDb,
    cableDb,
    connectorDb,
    totalDb,
    powerRemainingPercent: 10 ** (-totalDb / 10) * 100
  };
}
