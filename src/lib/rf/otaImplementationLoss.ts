/**
 * OTA実装損失・デセンス分析。
 *
 * 伝導測定（無線機コネクタ端の出力 Pc / 感度 Sc）とアンテナ放射効率 η から
 * 期待されるOTA値（TRP/TIS）を求め、実測TRP/TISとの差分を送信/受信に分離する。
 *
 *   expectedTRP[dBm] = Pc[dBm] + η[dB]
 *   trpGap[dB]       = expectedTRP − TRP実測 （正 = 送信側の説明のつかない実装損失）
 *   expectedTIS[dBm] = Sc[dBm] − η[dB]      （効率が悪いほど感度の数値は大きく＝悪くなる）
 *   tisGap[dB]       = TIS実測 − expectedTIS（正 = 受信側の説明のつかない劣化）
 *   desense[dB]      = tisGap − trpGap
 *
 * η は放射効率のdB値で常に 0 以下（100% = 0dB、50% ≈ -3.01dB）。
 * 整合・ケーブル・筐体吸収などの受動的な実装損失は相反性により送受へ同量効くため、
 * TIS側だけ余計に悪い分（desense）が、端末自身の雑音がRX帯に落ちて感度を潰す
 * 「自己デセンス（platform noise / RF desense）」の推定値になる。
 *
 * 適用条件:
 * - η・TRP・TIS は同一実装状態・同一条件（自由空間/ファントム・同一姿勢）の値であること。
 * - TIS の判定条件（BER/スループット基準）は伝導感度 Sc と揃えること。
 * - CA動作・隣接Band干渉・外来波によるデセンスは本分離の対象外（別要因）。
 *
 * 出典: CTIA "Test Plan for Wireless Device Over-the-Air Performance"（TRP/TISの定義・測定法）、
 *       3GPP TS 34.114（UE/MS Over The Air アンテナ性能の適合試験）。
 */

import { assertFinite, RfError, RfErrorCode } from "./errors";

/** デセンス推定がこの値以下[dB]なら「clean」（自己雑音の兆候は小さい）。 */
export const DESENSE_CLEAN_MAX_DB = 1;

/** デセンス推定がこの値以下[dB]なら「caution」。これを超えると「noisy」。 */
export const DESENSE_CAUTION_MAX_DB = 3;

/** デセンス推定の3段階判定。 */
export type OtaDesenseVerdict = "clean" | "caution" | "noisy";

export type OtaBandInput = {
  /** 伝導出力 Pc[dBm]（無線機コネクタ端）。 */
  conductedPowerDbm: number;
  /** 伝導感度 Sc[dBm]（無線機コネクタ端。小さいほど良い）。 */
  conductedSensitivityDbm: number;
  /** アンテナ放射効率 η[dB]。0以下（100%=0dB、50%≈-3.01dB）。 */
  antennaEfficiencyDb: number;
  /** OTA実測の全放射電力 TRP[dBm]。 */
  trpDbm: number;
  /** OTA実測の全等方感度 TIS[dBm]（小さいほど良い）。 */
  tisDbm: number;
};

export type OtaBandAnalysis = {
  /** 期待TRP[dBm] = Pc + η。 */
  expectedTrpDbm: number;
  /** TRPギャップ[dB] = 期待TRP − TRP実測。正 = 送信側の説明のつかない実装損失。 */
  trpGapDb: number;
  /** 期待TIS[dBm] = Sc − η。 */
  expectedTisDbm: number;
  /** TISギャップ[dB] = TIS実測 − 期待TIS。正 = 受信側の説明のつかない劣化。 */
  tisGapDb: number;
  /** デセンス推定[dB] = tisGap − trpGap（TIS側だけ余計に悪い分＝自己雑音の推定）。 */
  desenseDb: number;
  verdict: OtaDesenseVerdict;
};

/** -0 を +0 に正規化する（表示・比較の揺れ防止）。 */
function normalizeZero(value: number): number {
  return value === 0 ? 0 : value;
}

/**
 * デセンス推定値[dB]を3段階に判定する。
 * ≤1dB: clean ／ 1〜3dB: caution ／ >3dB: noisy。
 */
export function classifyDesense(desenseDb: number): OtaDesenseVerdict {
  assertFinite(desenseDb, "desense");
  if (desenseDb <= DESENSE_CLEAN_MAX_DB) {
    return "clean";
  }
  if (desenseDb <= DESENSE_CAUTION_MAX_DB) {
    return "caution";
  }
  return "noisy";
}

/**
 * 1Bandぶんの伝導値・効率・OTA実測から、送信/受信ギャップとデセンス推定を返す。
 * ギャップが負（実測が期待より良い）も許容する（測定不確かさの範囲で普通に起きる）。
 */
export function analyzeOtaBand(input: OtaBandInput): OtaBandAnalysis {
  assertFinite(input.conductedPowerDbm, "conducted_power");
  assertFinite(input.conductedSensitivityDbm, "conducted_sensitivity");
  assertFinite(input.antennaEfficiencyDb, "antenna_efficiency");
  if (input.antennaEfficiencyDb > 0) {
    // 放射効率は電力比≤1（dBで≤0）。正のdBは物理的にあり得ない。
    throw new RfError(RfErrorCode.TooLarge, { field: "antenna_efficiency", max: 0 });
  }
  assertFinite(input.trpDbm, "trp");
  assertFinite(input.tisDbm, "tis");

  const expectedTrpDbm = normalizeZero(input.conductedPowerDbm + input.antennaEfficiencyDb);
  const trpGapDb = normalizeZero(expectedTrpDbm - input.trpDbm);
  const expectedTisDbm = normalizeZero(input.conductedSensitivityDbm - input.antennaEfficiencyDb);
  const tisGapDb = normalizeZero(input.tisDbm - expectedTisDbm);
  const desenseDb = normalizeZero(tisGapDb - trpGapDb);

  return {
    expectedTrpDbm,
    trpGapDb,
    expectedTisDbm,
    tisGapDb,
    desenseDb,
    verdict: classifyDesense(desenseDb)
  };
}
