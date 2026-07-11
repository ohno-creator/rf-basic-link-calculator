import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * 回折・回り込みのコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「東京スカイツリーが634mになった理由」— ビル影（回折損失）との戦いとしての電波設計。
 */
export function DiffractionShadowColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：東京スカイツリーが634mになった理由</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          1958年に完成した東京タワーは333m。半世紀にわたり、関東一円へテレビの電波を届けてきました。
          ところが1990年代後半から、都心に200m級の超高層ビルが次々と建ちはじめます。新宿、汐留、品川——
          送信アンテナと同じくらいの高さの「壁」が林立し、<strong>その裏側に電波の影</strong>が
          伸びていきました。
        </p>
        <p>
          光なら、影は真っ黒です。でも波長が数十cmもある電波は、障害物の縁で曲がって影の中へ
          回り込みます。ただし回り込める深さは波長しだい。地デジが使うUHF帯（波長およそ0.5m）は、
          波長数mだったアナログVHFより影に弱いのです。しかも地デジ時代には、ワンセグ——
          地上1.5mの手のひらの上での受信まで求められました。ビルの谷間の深い影の底まで届かせるには、
          <strong>影そのものを浅くする</strong>しかありません。
        </p>
        <p>
          影を浅くするいちばん確実な方法は、光源を高く上げることです。夕方に長く伸びた影が、
          太陽の高い真昼には足元へ縮むのと同じ理屈。送信点が200m級ビルを見下ろす高さになれば、
          縁を越えるための「食い込みの深さ」（このツールのv値）が小さくなり、回折損失は一気に減ります。
          在京放送局が求めた新タワーは600m級。2012年に開業した東京スカイツリーは、
          当初計画の約610mから<strong>634m</strong>へ引き上げられました。「武蔵（ムサシ）」の
          語呂で親しまれるこの数字は、洒落である前に、ビル影と戦うための電波設計の答えだったのです。
        </p>
        <p>
          ※「太陽が高いほど影が短い」という光のたとえには破れがあって、電波の影は縁がにじんで
          真っ黒にはならず、そのにじみ方（回り込む量）が周波数で変わります——このツールが
          計算しているのは、まさにその「にじみの深さ」です。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            単一ナイフエッジ回折の損失 J(v) = 6.9 + 20log₁₀(√((v−0.1)²+1)+v−0.1)［v&gt;−0.78、
            それ以下は0dB］、v = h·√(2(d1+d2)/(λ·d1·d2))。縁すれすれ（v=0）で約6dB——
            波面の半分が遮られ電界がちょうど半分になる、が直感です。出典: Recommendation ITU-R P.526,
            &quot;Propagation by diffraction&quot;。
          </p>
          <p>
            都心の超高層ビルによる地デジ受信障害と中継・送信点整備の経緯は、総務省の地上デジタル
            テレビジョン放送関連資料（受信障害対策・デジタル中継局整備）に整理されている。
            新タワーの高さ634m（自立式電波塔）と2012年5月開業、610m級からの変更は
            東武タワースカイツリー株式会社の公式発表・公式サイトによる。ワンセグ等の移動体受信を
            含む地デジ放送方式（ISDB-T）の技術的背景は NHK放送技術研究所の資料に詳しい。
          </p>
        </div>
      </details>
    </Callout>
  );
}
