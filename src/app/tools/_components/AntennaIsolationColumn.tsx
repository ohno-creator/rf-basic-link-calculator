import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * アンテナ・アイソレーションのコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材:「隣のアンテナがうるさい—MIMOとアイソレーション」。近接した2本のアンテナは結合して性能を落とす。
 * スマホに詰め込まれる多数のアンテナの配置バトルと、距離・直交で稼ぐアイソレーションの物語。
 */
export function AntennaIsolationColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：隣のアンテナがうるさい—MIMOとアイソレーション</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          2010年、発売直後のiPhone 4を手に握った人たちが「アンテナが1本になる」と騒ぎ出しました。
          原因は本体の金属縁——2本のアンテナの継ぎ目を指でまたぐと、そこがつながって同調がずれ、
          受信レベルが落ちたのです。<strong>離れているはずの2本が、ほんの数ミリの隙間を通じて
          結合していた</strong>。この「アンテナゲート」騒動は、近接アンテナ同士がいかに簡単に
          干渉し合うかを世に知らしめた事件でした。
        </p>
        <p>
          今のスマホには10本以上のアンテナが詰まっています。4×4 MIMOは、複数のアンテナが
          <strong>互いに独立した電波の通り道（チャネル）</strong>を見ることで、同じ電波で何倍もの
          データを同時に運ぶ技術です。ところが2本が近すぎて結合すると、電気的には「1本」として
          振る舞い始め、独立性が消えてMIMOの旨みが蒸発します。だから設計者は数ミリ単位の狭い筐体で
          「どこに何を置くか」の陣取り合戦を繰り広げます。
        </p>
        <p>
          稼ぎ方は主に2つ。ひとつは<strong>距離</strong>——遠方界では間隔を2倍にするごとに結合が約6dB
          下がります（このツールが計算しているのがこれ）。もうひとつは<strong>直交</strong>——
          一方を縦偏波、もう一方を横偏波にすると、理屈の上では相手の電波が「見えなく」なり、
          20〜30dBを一気に稼げます。指向性を別方向に振る（パターンダイバーシチ）のも同じ発想です。
        </p>
        <p>
          「アンテナ＝それぞれ独立した耳」というたとえは直感には便利ですが、破れがあります。
          結合した2本は電流を共有するので、耳を増やしても“聞き分け”は増えません——本数を足しただけでは
          容量は増えず、むしろ効率が落ちて全体が悪化することさえあるのです。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            近接2素子の独立性は<strong>包絡線相関係数 ECC（ρₑ）</strong>で測る。厳密には遠方界パターン
            F₁, F₂ の重なりで ρₑ = |∬(F₁·F₂*)dΩ|² / (∬|F₁|²dΩ · ∬|F₂|²dΩ) と定義される。
            無損失・一様多重波環境ならSパラメータだけで近似でき、
            ρₑ ≈ |S₁₁*S₁₂ + S₂₁*S₂₂|² / [(1−|S₁₁|²−|S₂₁|²)(1−|S₂₂|²−|S₁₂|²)]（Blanch 2003）。
            <span className="tabular-nums"> ρₑ&lt;0.5</span> がダイバーシチの一つの目安で、
            見かけのダイバーシチ利得は 10√(1−|ρₑ|) 程度で近似される。
          </p>
          <p>
            結合量 S₂₁ を下げる主手段は間隔（遠方界で距離2倍あたり約−6dB）と偏波直交。
            交差偏波識別（XPD）は実装で20〜30dB得られるが、多重波環境ではデポラリゼーションにより
            実効値は低下する。狭小筐体では中和線（neutralization line）や減結合回路で S₂₁ を追い込む。
          </p>
          <p>
            出典: R. G. Vaughan &amp; J. B. Andersen, &quot;Antenna Diversity in Mobile
            Communications,&quot; IEEE Trans. Veh. Technol. (1987)／S. Blanch, J. Romeu, I. Corbella,
            &quot;Exact representation of antenna system diversity performance from input parameter
            description,&quot; Electronics Letters (2003)／H. T. Friis, &quot;A Note on a Simple
            Transmission Formula,&quot; Proc. IRE (1946)。
          </p>
        </div>
      </details>
    </Callout>
  );
}
