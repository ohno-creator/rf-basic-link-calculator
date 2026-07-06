import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * かんたんリンク計算のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「リンクバジェットは通信の家計簿」— 収入(送信+利得)と支出(損失)の手残り(マージン)。
 * 実話: 20W級の送信機で数百億km彼方から届くボイジャーのリンク設計。
 */
export function SimpleLinkBudgetColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：リンクバジェットは通信の家計簿</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          いま地球からいちばん遠くにいる人工物、ボイジャー1号。その送信機の出力は
          <strong>わずか20W級</strong>——白熱電球より暗いくらいです。それが約240億km彼方から
          発する電波を、NASAは今も受け取り続けています。地球に届くころの電力は、1兆分の1のさらに
          10億分の1という、想像を絶する微弱さ。なぜそんなものが「聞こえる」のでしょうか。
        </p>
        <p>
          答えは、エンジニアが電波の<strong>家計簿</strong>を1円単位ならぬ1dB単位でつけているからです。
          収入は<strong>送信電力＋アンテナ利得</strong>。ボイジャー側は3.7mのパラボラで電波を一点に絞り、
          受け取る地球側は直径70mの巨大アンテナで利得を稼ぎます。支出は<strong>距離による損失（自由空間損失）</strong>。
          240億kmともなると、この費目だけで桁外れの「出費」になります。収入から支出を全部引いて、
          最後に受信機が聞き取れる下限（受信感度）を差し引いた<strong>手残りが「リンク余裕（マージン）」</strong>。
          これがプラスである限り、通信は黒字＝成立します。
        </p>
        <p>
          このツールがやっているのも、まさにその家計簿です。送信電力に利得を足し、距離損失と追加損失を引き、
          受信電力を出す。それが感度を何dB上回っているか——手残りだけを見ます。ボイジャーの手残りは
          薄氷のように薄く、だからこそ通信速度をどんどん落として（数十bps）まで黒字を死守しています。
        </p>
        <p>
          ※「家計簿」はあくまで直感用のたとえです。<strong>たとえの破れ</strong>：家計簿は円という
          線形の金額を足し引きしますが、dBは対数です。dBの足し算は本当は電力比の掛け算で、
          「-190dB」は10のマイナス19乗という天文学的な割り算を意味します。だから桁が違うのに
          「手残り数dB」で成立し得るのです。
        </p>
        <p className="pt-1">
          屋外の壁反射や地面、筐体の損失まで分けて積み上げたくなったら、旗艦ツールへ。
          <Link
            href="/tools/rf-basic-link-calculator"
            className="mx-1 inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
          >
            リンクバジェット診断
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
          で詳細な費目まで計上できます。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            受信電力 P<sub>rx</sub>[dBm] = P<sub>tx</sub> + G<sub>ant</sub> − FSPL − L<sub>extra</sub>、
            リンク余裕[dB] = P<sub>rx</sub> − 受信感度。各項の意味は、
            <strong>P<sub>tx</sub></strong>=送信電力（収入の元手）、<strong>G<sub>ant</sub></strong>=
            送受信アンテナ利得の合計（電波を絞って稼ぐ利得）、<strong>FSPL</strong>=自由空間損失
            （距離と周波数で決まる最大の支出）、<strong>L<sub>extra</sub></strong>=壁・筐体などの追加損失。
          </p>
          <p>
            自由空間損失 FSPL[dB] = 20log₁₀(d) + 20log₁₀(f) + 32.44（d:km, f:MHz）。
            これは Friis の伝送公式 P<sub>rx</sub>/P<sub>tx</sub> = G<sub>tx</sub>G<sub>rx</sub>(λ/4πd)²
            を dB 表記に直したもの。dB は 10log₁₀（電力比）で、加減算が電力比の乗除算に対応する。
          </p>
          <p>
            出典: H. T. Friis, &quot;A Note on a Simple Transmission Formula,&quot; Proc. IRE, vol.34,
            no.5 (1946)／T. S. Rappaport, &quot;Wireless Communications: Principles and Practice,&quot;
            2nd ed., Prentice Hall (2002), §4（リンクバジェット）／DSN Telecommunications Link Design
            Handbook (810-005), NASA JPL（深宇宙リンク設計の一次資料）。ボイジャーの諸元は NASA/JPL
            Voyager Mission による。
          </p>
        </div>
      </details>
    </Callout>
  );
}
