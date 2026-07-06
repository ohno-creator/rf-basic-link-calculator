import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * VSWR帯域幅とQのコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「小さなアンテナはなぜ頑固なのか」— Chu-Harrington限界（1948）の物語。
 */
export function VswrBandwidthQColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：小さなアンテナはなぜ頑固なのか</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          第二次大戦のレーダー開発で、技術者たちはアンテナをどんどん小さくしたがっていました。ところが
          小さくすると、なぜか決まって<strong>帯域が狭く、効率も落ちる</strong>。腕の悪い設計のせいなのか、
          それとも避けられない壁なのか——誰も答えを持っていませんでした。
        </p>
        <p>
          1948年、MITの<strong>ラン・ジェン・チュー（L. J. Chu）</strong>がこの問いに正面から答えます。
          彼はアンテナを、それをすっぽり包む半径 a の想像上の球で囲い、外に出ていく電波を「球面波モード」に
          分解しました。すると各モードが、エネルギーを溜めては吐き出す<strong>共振回路（LC）と等価</strong>だと
          分かった。球が波長に比べて小さいほど（ka が小さいほど）、放射されずに近傍にとどまる蓄積エネルギーの
          割合が跳ね上がり、Qは <strong>1/(ka)³</strong> の勢いで急上昇します。帯域はおよそ 1/Q なので、
          これは<strong>「この大きさなら帯域はここまで」という天井</strong>そのものでした。
        </p>
        <p>
          衝撃的だったのは、この天井が<strong>設計の巧拙とは無関係</strong>だったことです。どんなに賢い形状を
          編み出しても、球に収まるサイズ（波長に対する大きさ）だけで下限のQが決まってしまう。小型アンテナが
          「頑固」に狭帯域なのは、エンジニアの腕ではなく物理法則の壁だったのです。だから「小さくて広帯域」という
          カタログ要求は、しばしば物理と喧嘩します。※「球で囲う」というのは数学上の便法で、実際のアンテナが球状という
          意味ではありません——大きさの目安として、収まる最小の球の半径を使っているだけです。
        </p>
        <p>
          この壁は、あなたがいまスマートフォンやIoT端末で毎日押し合いへし合いしている現実そのものです。筐体を
          数mm削るたびに、アンテナ帯域の天井はじりじり下がる。このツールで出した比帯域が「そもそもその筐体で
          実現可能か」を、右上リンクの<strong>小型アンテナ限界（Chu限界）</strong>で確かめれば、無理筋な仕様を
          設計前に見抜けます。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            Chu限界（最小Q）: 電気的に小さいアンテナを半径 a の球で囲うとき、放射効率100%の理想で
            <span className="tabular-nums"> Q_min ≈ 1/(ka)³ + 1/(ka)</span>（ka = 2πa/λ）。McLean(1996)が
            球面波モードの蓄積エネルギーを厳密に評価し、この形を確定した。ka が小さいほどQは急増し、
            帯域の上限 ≈ 1/Q が下がる。
          </p>
          <p>
            単一共振近似の適用範囲: 本ツールの FBW=(s−1)/(Q·√s) は、整合済みアンテナを1個の共振回路
            （直列RLC）とみなす狭帯域近似で、比帯域が概ね20%以下で精度が良い。多重共振（複同調）や広帯域
            整合を施すと、同じ放射Qでも実効的な帯域はこの式より広げられる（ただしBode-Fano限界が別の天井を課す）。
          </p>
          <p>
            出典: L. J. Chu, &quot;Physical Limitations of Omni-Directional Antennas,&quot; J. Appl. Phys.,
            19(12), 1948／R. F. Harrington, &quot;Effect of Antenna Size on Gain, Bandwidth, and
            Efficiency,&quot; J. Res. NBS, 1960／J. S. McLean, &quot;A Re-examination of the Fundamental
            Limits on the Radiation Q of Electrically Small Antennas,&quot; IEEE Trans. AP, 44(5), 1996／
            A. D. Yaghjian &amp; S. R. Best, &quot;Impedance, Bandwidth, and Q of Antennas,&quot; IEEE
            Trans. AP, 53(4), 2005。
          </p>
        </div>
      </details>
    </Callout>
  );
}
