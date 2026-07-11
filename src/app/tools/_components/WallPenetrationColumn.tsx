import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";
import { WALL_MATERIAL_SOURCES } from "@/data/wallMaterials";

/**
 * 壁透過損失のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「Low-Eガラスは電波の断熱材」— 省エネ窓の金属膜が920MHzを20dB食べる話。
 */
export function WallPenetrationColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：Low-Eガラスは電波の断熱材</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          省エネビルの窓ガラスには、目に見えないほど薄い銀の膜が蒸着されています。Low-E
          （低放射）ガラスと呼ばれるこの膜の仕事は、熱を運ぶ赤外線を鏡のように跳ね返すこと。
          夏の日射を遮り、冬の暖房を逃さない——建築の世界では文句なしの優等生です。
          ところが赤外線も電波も同じ電磁波。<strong>金属膜は赤外線と一緒に、920MHzの電波まで
          20dB前後も跳ね返してしまいます</strong>。20dBは電力にして100分の1。断熱性能を上げた
          ぶんだけ、その窓は「電波の断熱材」にもなるのです。
        </p>
        <p>
          この効き方が、現場では不思議な光景を生みます。最新の省エネマンションの中心部で、
          スマートメーターや宅内センサーだけが沈黙する。図面上は基地局まで十分近いのに、
          RC外壁とLow-E窓に全周を包まれた部屋は、金属の箱——シールドルームに半歩近づいた
          状態だからです。逆に「窓際1mの魔法」も起きます。窓のわずかな金属膜の切れ目や
          サッシまわりから漏れ入る電波を拾えるのは、窓のそば1m。端末を窓際に置いただけで
          RSSIが20dB以上回復する、という実測はこの理屈の裏返しです。
        </p>
        <p>
          だからこの分野の設計は「壁を貫く」から「開口を探す」へ発想を変えると急に楽になります。
          最短の直線経路が60dB食われるなら、単層ガラスの窓・換気口・廊下を経由する遠回りの
          経路のほうが強いことは珍しくありません。城壁を正面から破らず門を探す——いわば
          ナミゲート的な発想です。このツールで壁ごとの損失を積んでみると、
          「どの1枚を避けると一番効くか」が数字で見えてきます。
        </p>
        <p>
          ※「金属膜が電波を全部跳ね返す」というたとえは直感用で、実際の透過損失は膜の面抵抗・
          ガラス厚・入射角・サッシの導通で連続的に変わり、周波数によっては共振的に抜ける
          窓さえ作れます（周波数選択板＝FSS）。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（数値の根拠と一次出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            ITU-R P.2040-2 は建材の複素誘電率モデルと透過損失の測定法・代表値をまとめた勧告で、
            金属膜付きガラス（metallised/coated glass）が通常ガラスより桁違いに大きな損失を示すこと、
            コンクリートの損失が周波数と含水率で増えることを一次データで示す。NISTIR 6055 は
            NISTによる実測レポートで、鉄筋コンクリートは厚さ・鉄筋ピッチにより数十dBの減衰に
            達することを周波数別に報告している。本ツールの表はこれらと iBwave の材質データベースの
            公表値をレンジとして整理した目安値であり、個別の壁の実測代替にはならない。
          </p>
          <ul className="list-disc space-y-1 pl-4">
            {WALL_MATERIAL_SOURCES.map((source) => (
              <li key={source.href}>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sky-900 underline decoration-sky-300 underline-offset-2 hover:text-sky-700"
                >
                  {source.label}
                </a>
                <span className="ml-1">— {source.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </Callout>
  );
}
