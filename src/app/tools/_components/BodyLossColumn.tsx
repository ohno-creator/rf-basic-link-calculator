import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * ボディロスのコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「人間は歩く水袋——2.4GHzが体で30dB消える話」。
 */
export function BodyLossColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：人間は歩く水袋——2.4GHzが体で30dB消える話</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          電子レンジの周波数は2.45GHz。Wi-FiやBLEの2.4GHz帯と、ほとんど同じです。
          電子レンジが食品を温められるのは、この周波数の電磁波が<strong>水に強く吸収される</strong>から。
          そして人体の約6割は水です。つまり無線設計者から見ると、
          人間は「歩く水袋」——2.4GHzの電波をよく吸い、よく遮る障害物that動き回る、
          設計上いちばん厄介な存在です。体の反対側へ回り込む条件では、
          文献値で最大30dB。電力にして<strong>1/1000</strong>が体ひとつで消えます。
        </p>
        <p>
          この「吸われる」問題が最も切実なのがウェアラブルです。アンテナを皮膚にぴったり
          付けると、アンテナの近傍界（エネルギーを溜めるすぐ近くの場）に水分が入り込み、
          共振がずれ、放射効率が落ちる。ところが<strong>体からわずか1mm浮かすだけで数dB戻る</strong>
          ことが実測で知られています。スマートウォッチのバンドの厚み、絆創膏型センサの
          基材の厚み——あの1mmは、リンクバジェット上は送信電力を倍にしたのと同じ価値を持つ、
          静かな設計努力なのです。
        </p>
        <p>
          「持ち方」も同じくらい効きます。2010年、iPhone 4は金属フレームの切れ目を
          アンテナの一部として使う意欲的な設計でしたが、左手で握ると指がその切れ目を短絡して
          共振がずれ、アンテナ表示が激減する——いわゆる<strong>「デスグリップ」事件</strong>が
          起きました。「持ち方が悪い」という趣旨の初期対応が火に油を注ぎ、最終的に
          無償ケース配布に至ります。手のひらひとつで圏外になり得ることを、
          世界で最も有名にした事例です。だからこのツールは「手持ち」と「体表密着」を
          別のシナリオとして扱っています。
        </p>
        <p>
          ※「電子レンジと同じだから体で消える」というたとえには破れがあります——
          ボディロスの主因は加熱ではなく、吸収に加えて<strong>体による遮蔽と、
          近接によるアンテナの離調（整合ずれ）</strong>の合算で、体はほとんど温まりません。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（試験法と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            業界では「持ち方・装着」の影響を再現性よく測るため、人体を模した
            <strong>ファントム</strong>（頭部SAM・手・胴体の模型。組織等価液・等価材で電気特性を合わせる）
            を使い、TRP（総放射電力）/TIS（総合受信感度）を全球積分で評価します。
            CTIA OTA Test Plan（Head/Hand Phantoms）がその代表的な試験規程です。
          </p>
          <p>
            システム設計側では、3GPP TR 36.814 §8.2 がシミュレーション前提としての
            ボディロス値を定めており（実装損失の扱いは TR 37.840 にも記載）、
            本ツールの表はこれらと AntennaWare 社のウェアラブル帯域別実測公開データを
            突き合わせた設計初期の目安値です。
          </p>
          <p>
            出典: 3GPP TR 36.814, &quot;Further advancements for E-UTRA physical layer
            aspects,&quot; §8.2／CTIA, &quot;Test Plan for Wireless Device Over-the-Air
            Performance&quot;（Head/Hand Phantoms）／AntennaWare, Body Loss Data。
          </p>
        </div>
      </details>
    </Callout>
  );
}
