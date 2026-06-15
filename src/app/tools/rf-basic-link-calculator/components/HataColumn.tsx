import { BookOpen } from "lucide-react";

// 奥村-秦モデルの背景を伝える読み物コラム。

export function HataColumn() {
  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <BookOpen aria-hidden="true" className="h-5 w-5 text-amber-700" />
        <h2 className="text-lg font-bold text-amber-950">コラム：実測が生んだ式 ― 奥村-秦モデル</h2>
      </div>

      <div className="mt-3 space-y-3 text-sm leading-relaxed text-amber-950/90">
        <p>
          この式は、机上の理論からではなく、地道な“実測”から生まれました。1960年代、日本の奥村善久（おくむら よしひさ）氏らは、東京とその周辺で膨大な電波伝搬の測定を行い、周波数・距離・アンテナ高・市街地や郊外といった地形ごとに、電波がどれだけ弱くなるかを一群の曲線（いわゆる「奥村カーブ」）としてまとめ上げました。
        </p>
        <p>
          ただ、曲線をグラフから読み取るのは手間がかかります。そこで1980年、秦正治（はた まさはる）氏が、その曲線を誰でも電卓で計算できる数式（回帰式）に落とし込みました。これが今日「奥村-秦（Okumura-Hata）モデル」と呼ばれ、世界中の携帯電話のセル設計の土台になりました。
        </p>
        <p>
          面白いのは、式の各項が現実の効きにきれいに対応していることです。
          <span className="font-semibold">26.16·log(f)</span> は周波数が高いほど損失が増えること、
          <span className="font-semibold">(44.9 − 6.55·log hb)·log(d)</span> は距離が伸びるほど損失が増え、その傾きは基地局を高くするほど緩くなること、
          <span className="font-semibold">a(hm)</span> は端末側の高さ、そしてエリア補正は「街の作りそのもの」を表しています。実測を数式に翻訳した結果、物理的な意味が透けて見えるのです。
        </p>
        <p>
          一方で、これは第一原理ではなく“実測へのフィッティング”です。だからこそ、周波数 150〜1500MHz、距離 1〜20km、基地局高 30〜200m といった適用範囲があります（1500MHzを超える帯域はCOST 231-Hataが拡張しました）。範囲を外れると外挿になり、屋内や都市の細かな変化は別の手法が必要です。
        </p>
        <p>
          それでも、IoTやLPWAの「だいたいどれくらい飛ぶか」を見積もる出発点として、半世紀以上たった今も現役です。実測がいかに強いか、という技術史としても味わい深いモデルです。
        </p>
      </div>
    </section>
  );
}
