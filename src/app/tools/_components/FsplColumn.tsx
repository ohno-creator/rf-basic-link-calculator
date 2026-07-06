import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * 自由空間損失のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「フリスの伝達公式 — 1946年の1枚の式が携帯を生んだ」。距離2乗の直感と、
 * 「なぜ高周波ほど損失が増えるか」の誤解（真因はアンテナ実効面積の縮小）。
 */
export function FsplColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：フリスの伝達公式、1946年の1枚の式が携帯を生んだ</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          1946年、ベル研究所のハラルド・フリスは、無線技術者を長年悩ませてきた「電波はどれだけ届くのか」の
          計算を、たった1行の式に整理しました。送信電力・両アンテナの実効面積・波長・そして距離の2乗——
          必要なのはこれだけ。<strong>この『フリスの伝達公式』は、いまやスマホの基地局設計からGPS、
          深宇宙探査機との通信まで、あらゆる無線リンクの出発点</strong>になっています。あなたがこのツールで
          回している式も、元をたどればここに行き着きます。
        </p>
        <p>
          式の心臓部は<strong>距離の2乗</strong>です。電波は点光源の光と同じように球状に広がるので、
          距離が2倍になれば同じ電力が4倍の面積へ薄まる。だから距離10倍で損失は約20dB増える——
          ここまでは直感どおりです。
        </p>
        <p>
          多くの人がつまずくのは<strong>「周波数が高いほど損失が増える」</strong>という部分。
          空気が高周波を余計に吸うわけではありません。真犯人は<strong>アンテナの実効面積</strong>です。
          利得を一定（等方性）にしたアンテナが電波を捕まえられる面積は波長の2乗に比例し、周波数が上がるほど
          小さくなる。つまり“損失”の正体は、受信アンテナの網が高周波ほど目減りしていくことなのです。
          ※「網が小さくなる」というたとえは受信側だけの話で、送信側で利得を上げてビームを絞れば
          高周波ほど有利にもなり得ます（パラボラは高周波ほど鋭くなる）——FSPLの周波数項は
          “等方性を仮定したときだけ”に現れる見かけの損失です。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            フリスの伝達公式: P_r = P_t · (A_er · A_et) / (d² · λ²)。ここで A_e は各アンテナの実効開口面積、
            d は距離、λ は波長。送受を等方性アンテナ（利得1）とすると実効開口は
            A_e = λ²/4π となり、代入して FSPL = (4πd/λ)² が得られる。
          </p>
          <p>
            dB表記では FSPL = 20log₁₀(4πd/λ) = <span className="tabular-nums">32.44 + 20log₁₀(d[km]) + 20log₁₀(f[MHz])</span>。
            周波数項 20log₁₀(f) は空気の吸収ではなく、等方性受信アンテナの開口 λ²/4π が高周波ほど
            縮小することに由来する（λ = c/f のため）。距離を10倍にすると 20log₁₀(10) = +20dB。
          </p>
          <p>
            出典: H. T. Friis, &quot;A Note on a Simple Transmission Formula,&quot; Proc. IRE,
            vol. 34, no. 5, pp. 254–256 (1946)。実効開口とアンテナ利得の関係
            G = 4πA_e/λ² は同論文および標準的なアンテナ工学（Balanis, &quot;Antenna Theory&quot;）による。
          </p>
        </div>
      </details>
    </Callout>
  );
}
