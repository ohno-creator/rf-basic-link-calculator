import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * 偏波不整合損失のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「衛星放送が円偏波を選んだ理由」— 向き合わせ不要という発明的選択と、GPSの反射波排除。
 */
export function PolarizationLossColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：衛星放送が円偏波を選んだ理由</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          ベランダのBSアンテナを思い出してください。設置で合わせるのは方位角と仰角だけで、
          「お皿の回転角」を合わせた記憶はないはずです。一方、屋根の上の地デジアンテナは
          水平偏波の地域では素子が横向き、垂直偏波の地域では縦向きに付いています。
          直線偏波は<strong>向きを合わせないと受からない</strong>からです。
          ではなぜBSは向き合わせが要らないのか——<strong>円偏波だから</strong>です。
        </p>
        <p>
          直線偏波で衛星放送をやろうとすると、困ったことが起きます。衛星から見た偏波面は、
          受信する土地の緯度・経度によって傾いて見え（スキュー角）、全国の家庭ごとに
          「あなたの町ではアンテナを何度回して」と指定しなければなりません。さらに電離層は
          直線偏波の向きそのものを回してしまいます（ファラデー回転。周波数が低いほど大きい）。
          円偏波はくるくる回りながら進む偏波なので、<strong>受信側の取り付け回転角がどうであれ
          同じように受かります</strong>。日本のBSが右旋円偏波を採用したのは、この
          「向き合わせという工事課題を物理で消す」選択でした。
        </p>
        <p>
          GPSも同じ理由で円偏波（右旋・RHCP）です。しかもGPSにはもう一つ巧妙な狙いがあります。
          電波は<strong>面で反射すると旋回の向きが反転</strong>します（右旋→左旋）。右旋専用の
          受信アンテナは、ビルや地面で跳ね返った左旋の反射波を偏波不整合で大きく減衰させる——
          つまり円偏波そのものが<strong>マルチパス（測位誤差の元）を弾くフィルタ</strong>として
          働くのです。
        </p>
        <p>
          ただし円偏波はタダではありません。相手が直線偏波なら、向きに依らず常に3dB
          （電力半分）を払います。UHF帯RFIDのリーダが円偏波なのは、向きが不定なタグに対する
          「3dBの保険料」です。※保険料はたとえで、実際は円偏波の直交2成分のうち片方を
          受け取れない、という電力の物理です。また雨も無関係ではなく、落下で扁平になった雨滴は
          偏波を崩す（交差偏波成分を生む）ため、円偏波でも豪雨時は偏波分離が劣化します。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            偏波損失係数 PLF = |ρ̂ᵂ·ρ̂ₐ|²（波と受信アンテナの偏波単位ベクトルの内積の2乗・線形値）。
            直線-直線で PLF = cos²θ → 損失 = -20log₁₀|cosθ|[dB]、直線↔円は PLF = 1/2 →
            10log₁₀(2) ≈ <span className="tabular-nums">3.01dB</span>、理想円偏波の逆旋は PLF = 0（理論∞）。
            実アンテナの円偏波は楕円で、その真円度は軸比（AR）、直交偏波の漏れは交差偏波識別度
            （XPD）で表す。逆旋の実効的な分離はXPDで頭打ちになり、20dB超程度が目安。
          </p>
          <p>
            扁平雨滴による差分減衰・差分位相はXPDを劣化させ、その予測法は ITU-R P.618 に規定される。
            電離層のファラデー回転は ITU-R P.531 に規定があり、周波数の2乗にほぼ反比例して小さくなる
            （L帯のGPSでは無視できず、円偏波採用の理由の一つ）。GPS L1 C/A の右旋円偏波（RHCP）と
            受信最小電力は IS-GPS-200 が規定する。
          </p>
          <p>
            出典: C. A. Balanis, <em>Antenna Theory: Analysis and Design</em> §2.12（PLF）／
            IEEE Std 145-2013, <em>IEEE Standard for Definitions of Terms for Antennas</em>
            （偏波・軸比・XPDの用語定義。円偏波の旋回は伝搬方向に見た回転で定義）／
            ITU-R P.618（降雨のXPD予測）／ITU-R P.531（ファラデー回転）／
            IS-GPS-200（GPS信号仕様・RHCP）。
          </p>
        </div>
      </details>
    </Callout>
  );
}
