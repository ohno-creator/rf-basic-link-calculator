import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";
import { ARIB_T108_POWER_CLASSES } from "@/data/aribT108PowerClasses";

// 規格値は data 層（src/data/aribT108PowerClasses.ts・一次確認済み）のみを参照する。
const lowPower = ARIB_T108_POWER_CLASSES[0]; // 特定小電力（20mW型）
const registered = ARIB_T108_POWER_CLASSES[1]; // 登録局（250mW型）

/**
 * EIRP法規チェックのコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「なぜ日本の920MHzは『遠慮がち』なのか」— 小出力＋キャリアセンス＋デューティ比という
 * 日本流の共存設計を、周波数のご近所付き合いの話として読む。
 */
export function EirpComplianceColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：なぜ日本の920MHzは「遠慮がち」なのか</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          同じ900MHz帯のIoT無線でも、米国では最大1W（30dBm）・利得6dBiのアンテナ込みで
          EIRP 4W（36dBm）まで飛ばせます（FCC規則）。一方の日本は、免許のいらない特定小電力で
          空中線電力{lowPower.maxAntennaPowerMw}mW・EIRP {lowPower.eirpLimitDbm}dBm——
          電力にして<strong>約100分の1</strong>です。「日本は規制が厳しくて損だ」と言われがちですが、
          この数字だけを見ると設計思想を読み違えます。
        </p>
        <p>
          日本の920MHz帯は、2012年に950MHz帯にいたRFIDを移設して整備された、いわば新興住宅地です。
          すぐ隣には携帯電話のバンドが建ち、区画の中にはRFIDゲート、電力スマートメーター、
          LoRaWAN、Sigfoxと、性格の違う住人がひしめきます。国土が狭く人口密度が高い日本では、
          「大声を許すが各自が周波数ホッピングで散らばる」米国流よりも、
          「全員が小声で、譲り合いのルールを守る」方式が選ばれました。
        </p>
        <p>
          その譲り合いが<strong>キャリアセンス（LBT: Listen Before Talk）とデューティ比</strong>です。
          送信前に{lowPower.carrierSenseDurationMs}ms間だけ耳を澄まし、
          {lowPower.carrierSenseThresholdDbm}dBmより強い電波が聞こえたら黙って待つ。話し始めても
          1回{lowPower.maxTxDurationSec}秒まで、終わったら{lowPower.txPauseMs}ms休み、1時間の合計は
          {lowPower.maxTotalTxPerHourSec}秒（=10%）まで——エレベーターの「お先にどうぞ」を
          電波法で義務化したような設計です。※このたとえには破れがあります。キャリアセンスで
          分かるのは「自分の場所で聞こえるか」だけで、相手の受信機のそばに別の送信者がいる
          「隠れ端末」どうしの衝突までは防げません。
        </p>
        <p>
          遠慮がちなEIRP {lowPower.eirpLimitDbm}dBmでも、920MHzは回折で障害物を回り込みやすく、
          LPWAの受信感度（本サイトのノイズフロア・受信感度ツールで計算できる-130dBm級）と
          組み合わせれば数kmのリンクが成立します。上限の数字は「弱さ」ではなく、
          多数の無線システムが同じ帯域で共存し続けるための設計思想——EIRPチェックは、
          そのご近所ルールへの署名でもあるわけです。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（区分表・電波法との関係・出典）
        </summary>
        <div className="mt-3 space-y-3 text-xs leading-relaxed text-sky-950/80">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-sky-200">
                  <th className="py-1.5 pr-3 font-semibold">区分</th>
                  <th className="py-1.5 pr-3 font-semibold">空中線電力</th>
                  <th className="py-1.5 pr-3 font-semibold">EIRP上限</th>
                  <th className="py-1.5 pr-3 font-semibold">キャリアセンス</th>
                </tr>
              </thead>
              <tbody>
                {[lowPower, registered].map((item) => (
                  <tr key={item.id} className="border-b border-sky-100">
                    <td className="py-1.5 pr-3">{item.label}</td>
                    <td className="py-1.5 pr-3 tabular-nums">
                      {item.maxAntennaPowerMw}mW（{item.maxAntennaPowerDbm}dBm）
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums">
                      {item.eirpLimitDbm}dBm
                      {item.relaxedEirpLimitDbm !== null ? `（指向性緩和 ${item.relaxedEirpLimitDbm}dBm）` : ""}
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums">
                      {item.carrierSenseThresholdDbm}dBm・{item.carrierSenseDurationMs}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            両区分とも基準空中線利得は{lowPower.referenceAntennaGainDbi}dBiで、これを超える利得の
            アンテナは送信電力を抑えてEIRPを上限以下に保つ。送信時間制限（連続
            {lowPower.maxTxDurationSec}秒・休止{lowPower.txPauseMs}ms・1時間合計
            {lowPower.maxTotalTxPerHourSec}秒）も共通。電波法上、20mW型は「特定小電力無線局」
            として免許不要、250mW型は「登録局」として登録制で運用される
            （空中線電力等の条件は電波法施行規則第6条による）。
          </p>
          <p>
            米国の比較値は FCC 47 CFR §15.247（902–928MHz）: 最大出力1W、利得6dBiまでの
            アンテナと組み合わせてEIRP 36dBm（4W）。ただし周波数ホッピングまたは
            デジタル変調の要件を満たすことが条件で、キャリアセンス義務はない。
          </p>
          <p>
            出典: ARIB STD-T108「920MHz帯テレメータ用、テレコントロール用及びデータ伝送用無線設備」
            第2編/第3編 第2.1節（本ツールのdata層 src/data/aribT108PowerClasses.ts は一次確認済みの値）／
            電波法施行規則第6条／FCC 47 CFR §15.247。920MHz帯への移行経緯は総務省の
            周波数再編アクションプラン（950MHz帯RFIDの移行・2012年）による。
          </p>
        </div>
      </details>
    </Callout>
  );
}
