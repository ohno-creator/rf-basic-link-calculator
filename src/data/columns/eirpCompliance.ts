import { ARIB_T108_POWER_CLASSES } from "@/data/aribT108PowerClasses";
import { formatNumber } from "@/lib/rf/format";
import type { ToolColumn } from "./types";

const lowPower = ARIB_T108_POWER_CLASSES[0]; // 特定小電力（20mW型）
const registered = ARIB_T108_POWER_CLASSES[1]; // 登録局（250mW型）

/**
 * EIRP法規チェックツールの構造化コラム。
 * 定量値は data層（ARIB_T108_POWER_CLASSES・一次確認済み）から compute() で取得する。
 */
export const eirpComplianceColumn: ToolColumn = {
  id: "eirp-compliance",
  title: "なぜ日本の920MHzは「遠慮がち」なのか",
  hook: `同じ900MHz帯のIoT無線でも、米国では最大1W（30dBm）・利得6dBiのアンテナ込みでEIRP 4W（36dBm）まで飛ばせます（FCC規則）。一方の日本は、免許のいらない特定小電力で空中線電力${lowPower.maxAntennaPowerMw}mW・EIRP ${lowPower.eirpLimitDbm}dBm——電力にして約100分の1です。「日本は規制が厳しくて損だ」と言われがちですが、この数字だけを見ると設計思想を読み違えます。`,
  body: [
    "日本の920MHz帯は、2012年に950MHz帯にいたRFIDを移設して整備された、いわば新興住宅地です。すぐ隣には携帯電話のバンドが建ち、区画の中にはRFIDゲート、電力スマートメーター、LoRaWAN、Sigfoxと、性格の違う住人がひしめきます。国土が狭く人口密度が高い日本では、「大声を許すが各自が周波数ホッピングで散らばる」米国流よりも、「全員が小声で、譲り合いのルールを守る」方式が選ばれました。",
    `その譲り合いがキャリアセンス（LBT: Listen Before Talk）とデューティ比です。送信前に${lowPower.carrierSenseDurationMs}ms間だけ耳を澄まし、${lowPower.carrierSenseThresholdDbm}dBmより強い電波が聞こえたら黙って待つ。話し始めても1回${lowPower.maxTxDurationSec}秒まで、終わったら${lowPower.txPauseMs}ms休み、1時間の合計は${lowPower.maxTotalTxPerHourSec}秒（=10%）まで——エレベーターの「お先にどうぞ」を電波法で義務化したような設計です。`,
    `遠慮がちなEIRP ${lowPower.eirpLimitDbm}dBmでも、920MHzは回折で障害物を回り込みやすく、LPWAの受信感度（-130dBm級）と組み合わせれば数kmのリンクが成立します。上限の数字は「弱さ」ではなく、多数の無線システムが同じ帯域で共存し続けるための設計思想です。`
  ],
  analogy: {
    text: "エレベーターの「お先にどうぞ」を電波法で義務化したような設計です。送信前に周囲を確認し、譲り合いながら短時間ずつ話します。",
    limits: "キャリアセンスで分かるのは「自分の場所で聞こえるか」だけで、相手の受信機のそばに別の送信者がいる「隠れ端末」どうしの衝突までは防げません。"
  },
  quant: {
    title: "数値で見る（ARIB STD-T108・一次確認済みデータから自動取得）",
    rows: [
      {
        label: "特定小電力（20mW型）のEIRP上限",
        compute: () => `${formatNumber(lowPower.eirpLimitDbm, 0)}dBm（空中線電力${lowPower.maxAntennaPowerMw}mW）`
      },
      {
        label: "登録局（250mW型）のEIRP上限",
        compute: () => `${formatNumber(registered.eirpLimitDbm, 0)}dBm（空中線電力${registered.maxAntennaPowerMw}mW）`
      },
      {
        label: "1時間あたりの最大送信時間比率（デューティ比）",
        compute: () => `${formatNumber((lowPower.maxTotalTxPerHourSec / 3600) * 100, 1)}%`,
        note: `1時間3600秒中${lowPower.maxTotalTxPerHourSec}秒まで`
      }
    ]
  },
  derivation: {
    title: "区分表・電波法との関係（導出の要点）",
    steps: [
      `両区分とも基準空中線利得は${lowPower.referenceAntennaGainDbi}dBiで、これを超える利得のアンテナは送信電力を抑えてEIRPを上限以下に保つ。送信時間制限（連続${lowPower.maxTxDurationSec}秒・休止${lowPower.txPauseMs}ms・1時間合計${lowPower.maxTotalTxPerHourSec}秒）も共通。`,
      "電波法上、20mW型は「特定小電力無線局」として免許不要、250mW型は「登録局」として登録制で運用される（空中線電力等の条件は電波法施行規則第6条による）。",
      "米国の比較値はFCC 47 CFR §15.247（902-928MHz）: 最大出力1W、利得6dBiまでのアンテナと組み合わせてEIRP 36dBm（4W）。ただし周波数ホッピングまたはデジタル変調の要件を満たすことが条件で、キャリアセンス義務はない。"
    ]
  },
  antiPatterns: [
    {
      mistake: "EIRP上限の低さだけを見て「日本の920MHzは電波が弱い」と判断する",
      consequence: "920MHzは回折で障害物を回り込みやすく、LPWAの高感度受信（-130dBm級）と組み合わせれば数kmのリンクが実際に成立する",
      fix: "EIRP上限は共存設計の一部として理解し、実効的な到達距離はリンクバジェット全体（受信感度・伝搬モデル）で評価する"
    }
  ],
  sources: [
    {
      label: "ARIB STD-T108「920MHz帯テレメータ用、テレコントロール用及びデータ伝送用無線設備」",
      kind: "standard",
      locator: "第2編/第3編 第2.1節",
      note: "本ツールのdata層 src/data/aribT108PowerClasses.ts は一次確認済み（docs/handoff/E4-aribT108-values.md, 2026-07-04）",
      retrievedAt: "2026-07"
    },
    {
      label: "電波法施行規則第6条",
      kind: "standard",
      retrievedAt: "2026-07"
    },
    {
      label: "FCC 47 CFR §15.247（902-928MHz）",
      kind: "standard",
      retrievedAt: "2026-07"
    }
  ],
  lastReviewed: "2026-07"
};
