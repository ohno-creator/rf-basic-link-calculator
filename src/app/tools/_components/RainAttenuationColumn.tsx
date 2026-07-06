import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * 降雨・大気減衰のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「60GHz、酸素が電波を食べる周波数」— 雨でもないのに減衰する謎と、その欠点の再利用。
 */
export function RainAttenuationColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：60GHz、酸素が電波を食べる周波数</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          第二次大戦末期、MITの放射研究所は当時最先端の1.25cm波（約24GHz）レーダーを開発しました。
          分解能は抜群のはずが、湿った空気の中で性能がみるみる落ちる。雨も降っていないのに、です。
          原因は選んだ周波数そのもの——<strong>水蒸気の吸収線22.235GHzのほぼ真上</strong>を
          引き当てていました。空気中の水分子が、レーダーの電波をピンポイントで食べていたのです。
          この失敗を理論で解き明かしたのが物理学者ヴァン・ヴレック（後のノーベル賞受賞者）でした。
        </p>
        <p>
          彼の理論はもう一つの「電波を食べる周波数」を予言します。60GHz付近の酸素です。
          酸素分子は不対電子を2つ持つ、<strong>磁石の性質（常磁性）を帯びた珍しい分子</strong>で、
          その磁気的な共鳴がちょうど60GHz帯に密集しています。地表ではこの吸収だけで
          <strong>約15dB/km——1km進むと電力が約1/30</strong>。雨とは無関係に、晴天でも常に効く壁です。
          酸素分子は「60GHz専用に調律された小さな受信アンテナの群れ」のようなもの、と言えます。
          ※このたとえには破れがあります。実際は磁気双極子遷移による量子的な吸収で、
          電波のエネルギーは信号としてではなく熱として空気に散逸し、無数の吸収線が
          気圧でにじんで一つの大きな山に見えている、というのが正体です。
        </p>
        <p>
          面白いのはここからです。エンジニアはこの「欠点」を逆手に取りました。
          60GHzは<strong>遠くへ届かないからこそ、隣と干渉しない</strong>。同じチャネルを数十mおきに
          使い回せるため、WiGig（IEEE 802.11ad/ay）は60GHz帯で数Gbpsの近距離無線を実現し、
          各国がこの帯域を免許不要で開放しています。さらに衛星同士を結ぶリンクにも60GHz帯が
          使われてきました。真空の宇宙では酸素の壁は存在せず、一方で地上から盗聴・妨害しようとする
          電波は大気の酸素が遮ってくれる——<strong>「電波を食べる空気」が天然の防壁</strong>になるのです。
        </p>
        <p>
          このツールで周波数スライダーを60GHzへ動かすと、朱色の大気カーブが山のように盛り上がるのが
          見えます。雨のカーブ（青）とは別に、晴れの日でも消えない山。周波数を選ぶことは、
          空気とどう付き合うかを選ぶことでもあります。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            降雨減衰は γ_R = k・R^α [dB/km]（ITU-R P.838-3 式(1)）。k・α は周波数と偏波で決まる係数で、
            雨滴の粒径分布と散乱計算から回帰されたもの（同 Table 5、1〜1000GHz）。偏波・仰角の合成は
            式(4)(5)による。落下中の雨滴は空気抵抗でまんじゅう状（扁平回転楕円体）につぶれるため、
            水平方向の断面が大きく、<span className="tabular-nums">k_H &gt; k_V</span>
            ——水平偏波の方が減衰が大きい（例: 28GHz・25mm/hで水平4.62dB/km、垂直3.89dB/km）。
          </p>
          <p>
            大気ガス減衰は ITU-R P.676-13 Annex 1 の line-by-line 法。酸素44本・水蒸気35本の
            分光線ごとに強度と線形（気圧による広がり）を足し合わせ、乾燥空気の連続吸収
            （Debyeスペクトル＋窒素の圧力誘起吸収）を加える。標準大気（1013.25hPa・15℃・
            水蒸気密度7.5g/m³）で、60GHz酸素帯のピークは約15dB/km、水蒸気線22.235GHzは約0.2dB/km。
            酸素の共鳴はマイクロ波帯では例外的な<strong>磁気双極子遷移</strong>（酸素は基底状態
            ³Σg⁻の常磁性分子）で、個々の微細構造線が地表気圧では広がって一つの吸収帯に融合する。
          </p>
          <p>
            出典: Recommendation ITU-R P.838-3 &quot;Specific attenuation model for rain&quot; (2005)／
            Recommendation ITU-R P.676-13 &quot;Attenuation by atmospheric gases&quot; (2022)／
            J. H. Van Vleck, &quot;The Absorption of Microwaves by Water Vapor&quot; および
            &quot;The Absorption of Microwaves by Oxygen,&quot; Phys. Rev. 71 (1947)／
            D. E. Kerr (ed.), Propagation of Short Radio Waves, MIT Radiation Laboratory Series
            Vol. 13 (1951)——K帯レーダーと水蒸気吸収の記録／IEEE Std 802.11ad-2012（60GHz帯 WiGig）。
          </p>
        </div>
      </details>
    </Callout>
  );
}
