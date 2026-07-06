import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * マイクロストリップ線路のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「基板の細い線が50Ωになる理由」— 同軸時代の損失と耐電力の妥協点、そして世界が50Ωに揃えた歴史。
 */
export function MicrostripLineColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：基板の細い線が50Ωになる理由</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          <strong><span className="tabular-nums">50Ω</span>は物理定数ではなく、人間が選んだ妥協点</strong>です。
          同軸ケーブルの特性インピーダンスは Z₀ =（<span className="tabular-nums">138</span>/√εr）·log₁₀(D/d) と、
          外導体と内導体の直径比だけで決まります。空気を絶縁体にした同軸で計算すると、
          ①信号の減衰が最小になるのは約<span className="tabular-nums">77Ω</span>、
          ②同じ太さで最大の電力を流せるのは約<span className="tabular-nums">30Ω</span>——
          この2つの「おいしい点」が別々の場所にありました。片方を取れば低損失だが電力に弱く、
          もう片方は電力に強いが損失が大きい。両者のちょうど中間、幾何平均でおよそ
          <span className="tabular-nums">50Ω</span>が「損失にも電力にも致命的でない一点」だったのです。
        </p>
        <p>
          第二次大戦期、レーダーや無線機を各社バラバラの規格で作っていては、そもそも接続すらできません。
          米軍と部品メーカーは同軸コネクタを標準化する必要に迫られ、この扱いやすい丸い数字
          <strong>「<span className="tabular-nums">50</span>」に世界が収束</strong>しました。
          映像・テレビ系だけは損失最小の<span className="tabular-nums">77Ω</span>に近い
          <span className="tabular-nums">「75Ω」</span>を選び、いまも別系統として生き残っています。
          基板のマイクロストリップを<span className="tabular-nums">50Ω</span>で設計するのも、
          この同軸時代の取り決めをそのまま受け継いでいるからです。
        </p>
        <p>
          「<span className="tabular-nums">50Ω</span>は損失と電力のいいとこ取り」とよく言われます——
          ですが<strong>このたとえは破れます</strong>。厳密には両方の最良点
          （<span className="tabular-nums">77Ω</span>と<span className="tabular-nums">30Ω</span>）の
          どちらでもなく、どちらの美味しさも半分ずつ諦めた「引き分けの数字」です。
          だから空気ではなくテフロン（εr≈<span className="tabular-nums">2.1</span>）を詰めた実物の同軸では
          最小損失点が<span className="tabular-nums">50Ω</span>付近に寄り、結果的に損失面でも悪くない、
          という後付けの幸運も重なっています。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            同軸: Z₀ =（60/√εr）·ln(D/d)。空気（εr=1）では、減衰最小が D/d≈3.6 →
            <span className="tabular-nums"> Z₀≈77Ω</span>、耐電力（絶縁破壊）最大が D/d≈1.65 →
            <span className="tabular-nums"> Z₀≈30Ω</span>。両者の幾何平均 √(30·77)≈
            <span className="tabular-nums">48Ω</span> が「50Ω」の物理的な下敷きになる
            （Ramo, Whinnery, Van Duzer による導出）。
          </p>
          <p>
            マイクロストリップ: u=W/h、εeff =（εr+1)/2 +（εr-1)/2·(1+12/u)^(-1/2)、
            Z₀ =（120π/√εeff）/（u + 1.393 + 0.667·ln(u + 1.444)）（u≥1）。この閉形式は
            Wheeler の等角写像近似を Hammerstad が設計用に整理したもの。FR4（εr≈4.4・h=1.6mm）では
            W≈<span className="tabular-nums">3.0mm</span> でおよそ 50Ω になる（本ツールの既定値）。
          </p>
          <p>
            出典: H. A. Wheeler, &quot;Transmission-Line Properties of Parallel Strips Separated by a
            Dielectric Sheet,&quot; IEEE Trans. MTT-13 (1965)／E. O. Hammerstad, &quot;Equations for
            Microstrip Circuit Design,&quot; Proc. 5th European Microwave Conf. (1975)／S. Ramo,
            J. R. Whinnery, T. Van Duzer, &quot;Fields and Waves in Communication Electronics,&quot; Wiley。
          </p>
        </div>
      </details>
    </Callout>
  );
}
