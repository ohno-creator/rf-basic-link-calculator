import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * L型整合のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「2部品で世界をつなぐL型整合」— たった2つのL/Cでインピーダンスを変換する最小の整合回路と、
 * スミスチャート上の一手、L/ハイパス/ローパスの選択、そしてQ・帯域という代償の物語。
 */
export function LMatchColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：2部品で世界をつなぐL型整合</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          あなたのスマホがWiFiやBluetoothの電波を出すとき、アンテナの根元にはたいてい
          「L」と「C」がたった2個だけ置かれています。アンテナのインピーダンスは50Ωちょうどには
          まずならない——だから送信機とアンテナの間で電力が跳ね返らないよう、
          <strong>最小限の2部品でインピーダンスを付け替える</strong>のがL型整合回路です。
          直列に1個、並列に1個。回路図がアルファベットの「L」の形に見えるから、この名がつきました。
        </p>
        <p>
          スミスチャートの上では、これは驚くほど幾何学的です。直列素子は等抵抗円に沿って点を滑らせ、
          並列素子は等コンダクタンス円に沿って滑らせる。<strong>2本の弧をつなぐ一手で、負荷の点が
          チャートのど真ん中（＝完全整合）へ吸い込まれる</strong>。RFで最も美しい「1筆書き」の一つです。
        </p>
        <p>
          面白いのは、答えが必ず2つ出ること。一方は「直列L＋並列C」でローパス（高調波を一緒に潰す）、
          もう一方は「直列C＋並列L」でハイパス（直流や低域を切る）。つまり整合しながら、
          ほしいフィルタ特性をおまけに選べます。高調波が邪魔なら前者、というふうに設計者は使い分けます。
        </p>
        <p>
          ただしL型には逃れられない代償があります。負荷Rと基準Z0を決めた瞬間、
          <strong>回路のQ（＝帯域の狭さ）が自動的に決まってしまう</strong>——帯域を独立に選べないのです。
          だから手で握るとアンテナのインピーダンスがずれるスマホ（2010年の「アンテナゲート」が有名）では、
          整合が簡単に崩れます。帯域を自分で握りたければ、3個目の部品（π型・T型）を足すしかありません。
          世界をつなぐ最小回路は、最小ゆえに融通が利かない、というわけです。
        </p>
        <p className="text-xs text-sky-900/70">
          ※「一手でチャート中心へ」というたとえは直感用です。実際の2素子は順番に動くのではなく、
          同時に成立する連立方程式の解——2本の弧は計算を追う人間の目のための道筋にすぎません。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            L型整合のノードQは負荷抵抗と基準抵抗の比だけで決まる：
            <span className="tabular-nums"> Q = √(R_high / R_low − 1)</span>
            （R_high, R_low は R と Z0 の大小）。負荷Qがそのまま比帯域を支配し、
            <span className="tabular-nums"> 比帯域 ≈ 1/Q</span> の目安になる。Rと Z0 を決めた時点で
            Qは一意——帯域を独立に設計するには素子を1つ増やしてπ型・T型にし、
            仮想抵抗を挟んでQを自由変数に昇格させる必要がある。
          </p>
          <p>
            素子換算は <span className="tabular-nums">X_L = ωL</span>、
            <span className="tabular-nums"> X_C = −1/(ωC)</span>（ω = 2πf）。
            直列素子は等R円、並列素子は等G円に沿う移動というスミスチャートの性質から、
            各L型に対して「上に回ってから入る／下に回ってから入る」2解が生じ、
            それぞれローパス（直列L・並列C）／ハイパス（直列C・並列L）の周波数特性を持つ。
          </p>
          <p>
            出典: D. M. Pozar, <em>Microwave Engineering</em>, 4th ed., Wiley (2012), §5.1
            「Matching with Lumped Elements（L-networks）」／C. Bowick, <em>RF Circuit Design</em>,
            2nd ed., Newnes (2008), Ch.4「The L Network」および Q・帯域と π/T 型への拡張。
          </p>
        </div>
      </details>
    </Callout>
  );
}
