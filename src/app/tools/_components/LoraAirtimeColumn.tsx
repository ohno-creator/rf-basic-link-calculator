import { BookOpen } from "lucide-react";
import { Accordion } from "@/components/Accordion";
import { Callout } from "@/components/Callout";

export function LoraAirtimeColumn() {
  return (
    <section className="mt-8 space-y-4" aria-labelledby="lora-airtime-column-title">
      <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
        <h2 className="text-base font-bold">コラム：電波は「みんなの入会地」——4秒ルールが生まれた理由</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
          <p>
            920MHz帯は免許がいらない代わりに、スマートメーターも物流タグも農業センサーも、みんなが同じ帯域を分け合う
            「入会地（いりあいち）」です。ひとりが話し続ければ全員が困る——だからARIB STD-T108には
            「送る前に他人の声を聞く（キャリアセンス）」「一度に話すのは4秒まで」「話した時間の10倍は黙る」
            「1時間の合計は360秒まで」という、無線版の会議マナーが法律の裏付きで定められています。
          </p>
          <p>
            このマナーの崖っぷちを、本ツールで実際に踏めます。SF12・125kHzで100バイトを送ると、送信時間は
            計算上ちょうど3.94秒——4秒制限まで残り60ミリ秒しかありません。「遠くへ届けたいからSFを上げる」
            という素直な発想が、規制・電池・チャネル占有の三重の壁に同時にぶつかる。LPWAの設計とは、
            この綱引きの落とし所を探す作業です。
          </p>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-sky-900/80">
          <span className="font-bold">たとえの破れ：</span>
          入会地の草は食べれば減りますが、電波は時間・場所・チャネルで再利用できる資源です。ルールの目的は
          枯渇防止ではなく「同時に話す衝突」の抑制にあります。
        </p>
      </Callout>

      <div>
        <p className="text-sm font-semibold text-staf-dark">設計コラム</p>
        <h2 id="lora-airtime-column-title" className="mt-1 text-xl font-bold text-slate-950">
          LoRaは「遠くへ届く」と「短く送る」の綱引き
        </h2>
      </div>

      <Accordion title="SFを上げると、なぜ送信時間が急増する？">
        <div className="space-y-3 text-sm leading-relaxed text-slate-700">
          <p>
            LoRaの1シンボル時間は <strong>2^SF / BW</strong> です。SFを1段上げるとシンボルはほぼ2倍長くなり、
            受信感度と引き換えに電池消費・チャネル占有時間・衝突確率が増えます。
          </p>
          <p>
            ペイロードだけでなく、プリアンブル、ヘッダ、CRC、符号化率も送信時間へ効きます。LoRaWANを使う場合は
            MACヘッダ等を含めた実際のPHYペイロード長で評価してください。
          </p>
        </div>
      </Accordion>

      <Accordion title="ARIB判定を読むときの注意">
        <div className="space-y-3 text-sm leading-relaxed text-slate-700">
          <p>
            本ツールは、選択した920MHz帯区分の連続送信時間・休止時間・1時間累積時間を照合する設計チェックです。
            周波数、チャネル幅、キャリアセンス方式、無線局種別によって適用条件が変わります。
          </p>
          <Callout tone="caution" size="sm">
            「適合」表示は技術基準適合証明や法的適合を保証しません。製品化時は使用モジュールの認証条件と最新版
            ARIB STD-T108、電波法令を確認してください。
          </Callout>
        </div>
      </Accordion>

      <Accordion title="一次資料">
        <ul className="space-y-2 text-sm leading-relaxed text-slate-700">
          <li>
            <a
              href="https://www.semtech.com/products/wireless-rf/lora-connect/sx1276"
              className="font-semibold text-staf-dark underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Semtech SX1276 — AN1200.13参照の公式LoRa Calculator
            </a>
          </li>
          <li>
            <a
              href="https://www.arib.or.jp/english/std_tr/telecommunications/std-t108.html"
              className="font-semibold text-staf-dark underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              ARIB STD-T108 公式配布ページ（版数・改定履歴）
            </a>
          </li>
        </ul>
      </Accordion>
    </section>
  );
}
