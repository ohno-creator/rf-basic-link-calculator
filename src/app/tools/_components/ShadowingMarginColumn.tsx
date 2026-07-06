import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * シャドウイングマージンのコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 電電公社（現NTT）の技師・奥村善久らが東京を測り歩いた1960年代の大実測が、
 * 世界の携帯電話設計の物差し（奥村モデル→秦式）になり、シャドウイングσという発想を生んだ話。
 * ※依頼メモの「エリクソンの技師」は史実と異なるため、所属は一次出典どおり電気通信研究所とする。
 */
export function ShadowingMarginColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：東京を測り歩いた技師が、世界の携帯電話の物差しになった</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          1960年代、電電公社（現NTT）電気通信研究所の奥村善久たちは、測定アンテナを積んだ車で
          東京と関東平野をひたすら走り回っていました。まだ「携帯電話」という言葉すらない時代に、
          将来の移動体無線のため、周波数・距離・地形を変えながら電界強度を測り続ける——
          地図と記録紙が積み上がる、途方もない実測プロジェクトです。
        </p>
        <p>
          走るほどに、奇妙な事実が積み上がりました。<strong>送信も距離も同じなのに、受信レベルが
          場所によって何十dBも違う</strong>のです。ビルの陰、坂の下、開けた交差点——電波は
          きれいなカーブでは減っていきませんでした。ここで彼らは発想を変えます。ばらつきを
          誤差として捨てるのではなく、<strong>中央値のカーブと「ばらつきの統計量」に分けて、
          両方を設計データにする</strong>。dBの目盛りで見るとばらつきが釣鐘型（正規分布）に
          収まる——今日「シャドウイングσ」と呼ばれる考え方の誕生です。
        </p>
        <p>
          この成果をまとめた1968年の奥村らの報告は、やがて国境を越えます。1980年に同じ研究所の
          秦正治が使いやすい式に直し（奥村–秦モデル）、日本の自動車電話はもちろん、
          米国や欧州の初期セルラー網の設計にも使われました。<strong>東京の路地で測った数字が、
          世界中の基地局の置き方を決める物差しになった</strong>のです。
        </p>
        <p>
          このツールが計算する「σ×Φ⁻¹(信頼率)」は、その直系の子孫です。マージンは勘で積む
          安全代ではなく、「何%の地点を守るか」を宣言して初めて決まる数字——それが、
          測り歩いた技師たちが残したいちばん大きな遺産かもしれません。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（なぜ対数正規か・Q関数・出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            なぜ対数正規か: 経路上の多数の遮蔽・回折による損失は、線形では掛け算、dBでは足し算になる。
            独立な多数の項の和は中心極限定理により正規分布に近づくため、シャドウイングはdBで正規
            （＝線形の受信電力では対数正規）に従うと説明される。
          </p>
          <p>
            Q関数と必要マージン: Q(z)=P(X&gt;z)（標準正規の上側確率）。しきい値の上に中央値をM[dB]
            置いたとき、成立確率は P = Φ(M/σ) = 1−Q(M/σ)。これを逆に解くと
            M = σ·Q⁻¹(1−p) = σ·Φ⁻¹(p)。本ツールのΦ⁻¹は Peter J. Acklam の有理近似
            （公称相対誤差 約1.15×10⁻⁹）で計算している。
          </p>
          <p>
            σの目安: 開放地4dB・郊外6dBは 3GPP TR 38.901 の σ_SF（LOS / UMa-NLOS）に対応、
            都市8dBは慣用値（Rappaport の教科書に市街地実測で約8dBの例）。
          </p>
          <p>
            出典: Y. Okumura, E. Ohmori, T. Kawano, K. Fukuda, &quot;Field Strength and Its
            Variability in VHF and UHF Land-Mobile Radio Service,&quot; Review of the Electrical
            Communication Laboratory, Vol.16 (1968)／M. Hata, &quot;Empirical Formula for Propagation
            Loss in Land Mobile Radio Services,&quot; IEEE Trans. Veh. Technol., VT-29 (1980)／
            T. S. Rappaport, <em>Wireless Communications: Principles and Practice</em>, 2nd ed.／
            3GPP TR 38.901 &quot;Study on channel model for frequencies from 0.5 to 100 GHz&quot;。
          </p>
        </div>
      </details>
    </Callout>
  );
}
