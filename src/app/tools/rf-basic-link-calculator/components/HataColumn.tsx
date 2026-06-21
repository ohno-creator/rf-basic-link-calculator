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
          一方で、これは第一原理ではなく“実測へのフィッティング”です。だからこそ、周波数 150〜1500MHz、距離 1〜20km、基地局高 30〜200m、移動局高 1〜10m といった適用範囲があります（1500MHzを超える帯域はCOST 231-Hataが拡張しました）。範囲を外れると外挿になり、屋内や都市の細かな変化は別の手法が必要です。
        </p>
        <p>
          IoT端末では、この「細かな変化」が主役になりがちです。端末は地面や壁、金属筐体、メーター箱、人体、車両、配管、盤内のGNDに近づきます。アンテナ高も1m前後、あるいはそれ以下になり、Hataが想定する「基地局と移動局の広域平均」とは別の損失が乗ります。そのため、Hataの値だけで通信可否を断定すると、現地では10dB単位でずれることがあります。
        </p>
        <p>
          最近のLPWA/IoT測定研究でも、同じ方向の結果が出ています。都市LoRaの大規模測定では、Okumura系やLog-distance系は計画の出発点として有効な一方、現地データで係数を求めることが重要とされています。屋内LoRaWANの研究では、壁や家具、温湿度、CO2、在室状況などの環境特徴量を入れることで、単純な距離モデルより誤差が下がることが報告されています。NB-IoTの深部屋内測定でも、既存の経験式だけでは2〜12dB程度の誤差増加が観測され、距離以外の特徴量が必要とされています。
        </p>
        <p>
          そのため、本ツールではHataを「消す」のではなく、基準線として残します。その上で、IoT実測補正Hataモードでは、既知距離で測ったRSSIまたはRSRPからHataのずれを1点校正し、必要に応じて距離10倍あたりの勾配補正を加えます。これは万能な新公式ではありませんが、現地測定をリンクバジェットへ戻すための実務的な橋渡しです。
        </p>
        <p>
          重要なのは、補正値を“魔法の安全率”にしないことです。測定時の送信電力、アンテナ利得、ケーブル損失、端末近傍損失をそろえ、同じRSSI/RSRP指標で比較します。アンカー距離から10倍以上離れた距離へ外挿する場合は、複数地点の実測で距離勾配を確認してください。
        </p>
        <div className="rounded-md border border-amber-300 bg-white/70 p-3">
          <p className="font-semibold">参考にした研究・標準</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <a className="font-semibold text-amber-800 underline" href="https://arxiv.org/abs/2109.07768">
                Path Loss in Urban LoRa Networks
              </a>
              ：都市LoRaの大規模測定で、Okumura系・Log-distance系など複数モデルを比較。
            </li>
            <li>
              <a className="font-semibold text-amber-800 underline" href="https://arxiv.org/abs/2505.06375">
                LoRaWAN indoor environmental dataset
              </a>
              ：環境特徴量を入れたモデルでRMSE改善を報告。
            </li>
            <li>
              <a className="font-semibold text-amber-800 underline" href="https://arxiv.org/abs/2006.00880">
                NB-IoT deep-indoor propagation modelling
              </a>
              ：深部屋内では既存経験式だけでは不十分であることを実測で評価。
            </li>
            <li>
              <a className="font-semibold text-amber-800 underline" href="https://www.3gpp.org/ftp/Specs/archive/38_series/38.901/38901-j20.zip">
                3GPP TR 38.901 Release 19
              </a>
              ：LOS/NLOS、シャドウフェージング、クラッタ、O2Iなどを分ける標準的なチャネルモデル。
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
