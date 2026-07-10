import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * フレネルゾーンのコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「見通せているのに繋がらない—フレネルの楕円の話」。光学者フレネルの回折理論が
 * 電波の見通し設計に効く。第1フレネルゾーン60%確保の実務則、地面すれすれのリンクが弱い理由。
 */
export function FresnelZoneColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：見通せているのに繋がらない—フレネルの楕円の話</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          田んぼの向こうのアンテナが、双眼鏡でくっきり見える。障害物は何もない。それなのにリンクが弱い——
          現場でよくある「見えているのに繋がらない」の犯人は、<strong>目に見えない楕円</strong>です。
          電波は送受信点を結ぶ一本の直線ではなく、その線を軸にしたラグビーボール状の立体（第1フレネル
          ゾーン）を束になって通ります。地面すれすれのリンクでは、この楕円の下半分が地面にめり込む。
          視界は通っていても、電波の通り道は削られているのです。
        </p>
        <p>
          この楕円の正体を解いたのは、無線とは無縁の一人の光学者でした。<strong>オーギュスタン・
          ジャン・フレネル</strong>は19世紀初頭のフランスの土木技師で、余暇に光の回折——光が縁を
          回り込んで影の中へにじむ現象——を研究しました。彼は波面を同心の帯（ゾーン）に分け、隣り合う
          帯からの光が半波長ずれて干渉する、という描像で回折を説明します。1818年の懸賞論文は、当初
          「光が波なら影の中心に明るい点ができるはず」と反論されましたが、実験するとその点は本当に
          現れた。フレネルは正しかったのです。
        </p>
        <p>
          その100年後、同じゾーンの考え方が電波の見通し設計に効くと分かります。実務則が
          <strong>「第1フレネルゾーンの60%を空ける」</strong>。ここまで確保すれば回り込み（回折）
          損失はほぼ0dB。逆にアンテナが低いほど楕円は地面に食われ、リンクは弱る——だから見通し無線は
          「高さを稼ぐ」ことが物理的に効くのです。※電波を「楕円の土管を通る」とたとえましたが、破れは
          こうです：土管に硬い壁はありません。エネルギーは楕円の外へも連続的に染み出し、境界線は
          「行き帰りの経路差がちょうど半波長になる面」という人が引いた便宜上の線にすぎません。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            第nフレネルゾーンは「送信→その点→受信」の経路が直線経路より nλ/2 だけ長くなる点の集合。
            その半径は r_n = √( n·λ·d₁·d₂ / (d₁+d₂) )（λ=波長, d₁/d₂=障害物から送受信点までの距離[m]）。
            経路中央（d₁=d₂=D/2）で最大となり、第1ゾーンは
            <span className="tabular-nums"> r₁ = ½√(λD)</span>。周波数が高い（λが小さい）ほど楕円は細くなる。
          </p>
          <p>
            クリアランス比 = クリアランス/r₁ とナイフエッジ回折パラメータ v は v = -√2·(クリアランス/r₁) の関係にあり、
            <span className="tabular-nums"> 60%確保（比0.6）は v≈-0.85</span> に対応して回折損失≈0dB。
            ITU-R P.530 は見通しリンクの設計基準として「第1フレネルゾーン半径の0.6倍のクリアランス」を挙げる。
          </p>
          <p>
            出典: A.-J. Fresnel, &quot;Mémoire sur la diffraction de la lumière&quot;（1818年懸賞論文、
            Académie des sciences 1819年受賞）／Rec. ITU-R P.526, &quot;Propagation by diffraction&quot;
            （フレネルゾーン・ナイフエッジ回折の定義）／Rec. ITU-R P.530, &quot;Propagation data and prediction
            methods for the design of terrestrial line-of-sight systems&quot;（60%クリアランス基準）。
          </p>
        </div>
      </details>
    </Callout>
  );
}
