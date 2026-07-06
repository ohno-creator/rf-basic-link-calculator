import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * LTE電波指標のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「圏外ギリギリの-120dBmは弱いのか」— RSRPの世界では-120dBmでも通信できるLTEの設計思想。
 */
export function LteSignalMetricsColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：圏外ギリギリの-120dBmは、本当に「弱い」のか</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          Wi-Fiの世界では<strong>-70dBmでも「電波が弱い」</strong>と嫌われます。ところがLTEのスマホは、
          画面に<strong>-120dBm</strong>と出ていても平然と通話し、地図を読み込みます。同じ「dBm」なのに、
          なぜこんなに感覚がずれるのか。答えは、その-120dBmが<strong>RSRP＝基準信号1本分の電力</strong>
          だからです。Wi-Fiが語るのはチャネル全体の合計（RSSIに近い値）。ものさしが最初から違うのです。
        </p>
        <p>
          LTEの設計思想は「<strong>電力を薄く広げず、細い基準信号に集めて遠くへ届ける</strong>」でした。
          帯域全体をかき集めれば大きな電力でも、端末が距離を測り、復調の足場にするのは
          <strong>1本ずつの基準信号</strong>。だから1本あたりが雑音に埋もれない限り、リンクは生きています。
          10MHz帯なら合計との差は約28dB——<strong>RSSIで-92dBmでも、RSRPの世界では-120dBm</strong>という
          わけです。「圏外ギリギリ」に見える数字は、実は基準信号の物差しで読んだ、まだ余裕のある値かもしれません。
        </p>
        <p>
          そもそも「アンテナ棒」という表示は、電波を測る文化そのものの遺産です。かつての携帯は
          受信全体の強さ（RSSIに近い量）を棒にしていました。しかしLTE以降、棒が指す実体は
          <strong>RSRP</strong>へと静かに置き換わります。見た目は同じ4本でも、中身の定義は世代で変わってきた——
          棒の本数だけを信じて「強い/弱い」を語ると足をすくわれるのは、このためです。
        </p>
        <p>
          現場で効くのは、<strong>RSRP（強さ）とRSRQ・SINR（きれいさ）を分けて読む</strong>習慣です。
          RSRPが十分でも、周りのセルからの干渉でRSRQが悪ければ速度は出ません。逆にRSRPが-120dBmでも、
          干渉が少なくSINRが確保できていれば、低速ながら通信は成立します。※「1本に集めるほど遠くへ」という
          たとえは直感用で、実際は<strong>フルロード（全RB送信）を前提にした換算</strong>——基地局が空いていて
          送信本数が減れば、RSSIもRSRQも変わる、という代償を必ず伴います。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（定義・式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            <strong>RSRP</strong>は、測定帯域内で基準信号を運ぶリソースエレメント（RE）の受信電力の線形平均
            [dBm]。<strong>RSSI</strong>は、同帯域の全REの受信電力（信号＋干渉＋雑音）の合計 [dBm]。
            <strong>RSRQ</strong> = N_RB × RSRP / RSSI（対数では
            <span className="tabular-nums"> RSRQ[dB] = 10log₁₀(N_RB) + RSRP − RSSI</span>）。定義は 3GPP
            TS 36.214 §5.1。1リソースブロック=12サブキャリア（15kHz間隔）。
          </p>
          <p>
            本ツールのRSSI⇔RSRP換算は<strong>フルロード（全RBでデータ送信）仮定</strong>で、
            <span className="tabular-nums"> RSRP = RSSI − 10log₁₀(12·N_RB)</span>。このときRSRQは帯域幅に依らず
            <span className="tabular-nums"> −10log₁₀(12) ≈ −10.79dB</span> が理論上限。部分負荷ではRSSIが下がるため
            RSRQは改善方向へ動く（実測のRSRQが上限に近いほど高負荷を示唆）。
          </p>
          <p>
            <strong>SINR近似の限界</strong>: フルロードで干渉＋雑音をRSSI残余とみなすと
            <span className="tabular-nums"> ρ = 12·10^(RSRQ/10)</span>、
            <span className="tabular-nums"> SINR = 10log₁₀(ρ/(1−ρ))</span>。RSRQが上限(−10.79dB)に近づくと
            ρ→1でSINRが発散するため、この一次近似は<strong>高RSRQ域では使えない</strong>。実機のSINRは
            チャネル推定・受信機実装に依存し、RSRQからの一意換算はできない（あくまで桁の目安）。
          </p>
          <p>
            出典: 3GPP TS 36.214 &quot;Physical layer; Measurements&quot; §5.1（RSRP/RSRQ/RSSI定義）／
            3GPP TS 36.101 表5.6-1（チャネル帯域幅とN_RBの対応）／3GPP TS 36.211 §6（リソースブロック＝
            12サブキャリア×15kHz）。
          </p>
        </div>
      </details>
    </Callout>
  );
}
