import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * dB体感ツールのコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「デシベルはベル研究所の電話網から生まれた」— bel/deci-bel と対数が選ばれた実務の必然。
 */
export function DbFeelColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：デシベルは電話網の「弱り」を数えるために生まれた</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          電話が大陸を横断しはじめた1920年代、ベル電話網の技術者たちは「声がどれだけ弱るか」を測る
          単位に困っていました。最初に使われた物差しは<strong>「標準ケーブル○マイル分の減衰」</strong>。
          しかしケーブルの太さや周波数で基準が揺れ、技術者ごとに数字が食い違います。長距離回線は
          何十もの中継区間の減衰を積み上げねばならず、区間ごとに違う倍率を掛け合わせる計算は悪夢でした。
        </p>
        <p>
          ここで効いたのが<strong>対数</strong>です。ケーブルを進む信号は距離に対して指数的に弱まります。
          その指数を対数の目盛りに移すと、掛け算が足し算に化ける。区間Aで1/4、区間Bで1/2に弱っても、
          対数なら「−6と−3を足して−9」で済みます。ベル研はこの対数目盛りを
          <strong>「伝送単位（Transmission Unit）」</strong>と名付け、回線設計を足し算の世界へ移しました。
        </p>
        <p>
          1928年、この単位は電話の発明者<strong>アレクサンダー・グラハム・ベル</strong>にちなみ
          「ベル（bel）」と改称され、その1/10が「デシ・ベル（deci-bel）」になります。なぜ10分の1か。
          1ベルは電力10倍という大きすぎる刻みで、実務のケーブル損失を表すには粗すぎたからです。
          ちょうど良い分解能が10分の1のデシベルでした。翌1929年、W. H. マーティンがこの新名称と
          定義を論文で公表します。
        </p>
        <p>
          デシベルは<strong>「掛け算の世界を足し算に翻訳する装置」</strong>と言えます。
          ※ただしこのたとえには破れがあります——足せるのはあくまで同じ基準どうしの比（dB）だけ。
          絶対電力を表すdBm（1mW基準）を2つ足すと物理的に無意味な数になります。正しくは
          <strong>「dBm＋dB＝dBm」</strong>。翻訳できるのは比であって、量そのものではないのです。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            定義: 1ベル = <span className="tabular-nums">log₁₀(P₁/P₀)</span>、
            1デシベル = <span className="tabular-nums">10·log₁₀(P₁/P₀)</span>（電力比）。
            同一インピーダンスなら電圧比では <span className="tabular-nums">20·log₁₀(V₁/V₀)</span> となる。
            dB は無次元の<strong>比</strong>で、利得や損失の「差」を表す。
          </p>
          <p>
            dBm との違い: dBm = <span className="tabular-nums">10·log₁₀(P/1mW)</span> で、
            0dBm = 1mW の<strong>絶対電力</strong>を指す「点」。だから dB は足し引きできるが、
            dBm どうしの加算は無意味（dBm＋dB＝dBm、dBm−dBm＝dB）。ケーブル減衰は
            <span className="tabular-nums">P(ℓ)=P₀·10^(−αℓ/10)</span> と長さに指数的で、
            対数を取れば区間損失を単純加算できるのがリンクバジェットの基礎になっている。
          </p>
          <p>
            出典: W. H. Martin, &quot;Decibel—The New Name for the Transmission Unit,&quot;
            Bell System Technical Journal, Vol. 8, No. 1, pp. 1–2 (Jan. 1929)／同
            &quot;The Transmission Unit and Telephone Transmission Reference Systems,&quot;
            BSTJ, Vol. 3, No. 3, pp. 400–408 (Jul. 1924)。
          </p>
        </div>
      </details>
    </Callout>
  );
}
