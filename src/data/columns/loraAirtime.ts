import { calculateLoRaAirtime } from "@/lib/rf/loraAirtime";
import { formatNumber } from "@/lib/rf/format";
import type { ToolColumn } from "./types";

const SF12_100BYTE_INPUT = {
  bandwidthKhz: 125,
  codingRateDenominator: 5,
  preambleSymbols: 8,
  explicitHeader: true,
  crcEnabled: true,
  payloadBytes: 100,
  spreadingFactor: 12
} as const;

/**
 * LoRa送信時間（Time-on-Air）ツールの構造化コラム。
 * 定量値は compute() で lib/rf から自動計算する。
 */
export const loraAirtimeColumn: ToolColumn = {
  id: "lora-airtime",
  title: "電波は「みんなの入会地」——4秒ルールが生まれた理由",
  hook: "920MHz帯は免許がいらない代わりに、スマートメーターも物流タグも農業センサーも、みんなが同じ帯域を分け合う「入会地（いりあいち）」です。ひとりが話し続ければ全員が困る——だからARIB STD-T108には「送る前に他人の声を聞く」「一度に話すのは4秒まで」「1時間の合計は360秒まで」という、無線版の会議マナーが法律の裏付きで定められています。",
  body: [
    "このマナーの崖っぷちを、本ツールで実際に踏めます。SF12・125kHzで100バイトを送ると、送信時間は計算上ちょうど3.94秒——4秒制限まで残り60ミリ秒しかありません。「遠くへ届けたいからSFを上げる」という素直な発想が、規制・電池・チャネル占有の三重の壁に同時にぶつかる。LPWAの設計とは、この綱引きの落とし所を探す作業です。",
    "LoRaの1シンボル時間は2^SF/BWです。SFを1段上げるとシンボルはほぼ2倍長くなり、受信感度と引き換えに電池消費・チャネル占有時間・衝突確率が増えます。ペイロードだけでなく、プリアンブル、ヘッダ、CRC、符号化率も送信時間へ効きます。"
  ],
  analogy: {
    text: "入会地（村の共有地）で、みんなが少しずつ草を刈って使うようなものです。ひとりが独占すれば全員が困るので、時間を区切って譲り合います。",
    limits: "入会地の草は食べれば減りますが、電波は時間・場所・チャネルで再利用できる資源です。ルールの目的は枯渇防止ではなく「同時に話す衝突」の抑制にあります。"
  },
  quant: {
    title: "数値で見る（このツールの式から自動計算）",
    rows: [
      {
        label: "SF12・125kHz・100バイトの送信時間",
        compute: () => `${formatNumber(calculateLoRaAirtime(SF12_100BYTE_INPUT).airtimeMs / 1000, 2)}秒`,
        liveKey: "airtime",
        note: "4秒制限まで残り約60ミリ秒"
      }
    ]
  },
  derivation: {
    title: "なぜSFを上げると送信時間が急増するのか（導出の要点）",
    steps: [
      "Semtech AN1200.13のシンボル数式: Tsym[s]=2^SF/BW[Hz]、Tpre[s]=(Npre+4.25)・Tsym。ペイロードのシンボル数はSF・符号化率・ヘッダ有無・CRC有無で決まり、ToA=Tpre+Npayload・Tsymとなる。",
      "本ツールは選択した920MHz帯区分の連続送信時間・休止時間・1時間累積時間をARIB STD-T108の基準に照合する設計チェック。周波数、チャネル幅、キャリアセンス方式、無線局種別によって適用条件が変わる。"
    ]
  },
  antiPatterns: [
    {
      mistake: "本ツールの「適合」表示を技術基準適合証明や法的適合の保証だと考える",
      consequence: "製品化後に実機の認証条件と食い違い、手戻りが発生する",
      fix: "製品化時は使用モジュールの認証条件と最新版ARIB STD-T108・電波法令を確認する"
    }
  ],
  sources: [
    {
      label: "Semtech SX1276 — AN1200.13 LoRa Modem Designer's Guide",
      href: "https://www.semtech.com/products/wireless-rf/lora-connect/sx1276",
      kind: "datasheet",
      retrievedAt: "2026-07"
    },
    {
      label: "ARIB STD-T108 公式配布ページ",
      href: "https://www.arib.or.jp/english/std_tr/telecommunications/std-t108.html",
      kind: "standard",
      retrievedAt: "2026-07"
    }
  ],
  lastReviewed: "2026-07"
};
