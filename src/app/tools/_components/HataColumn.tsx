import { BookOpen } from "lucide-react";

import { Callout } from "@/components/Callout";

// 奥村-秦モデルの背景を伝える読み物コラム。

export function HataColumn() {
  return (
    <Callout tone="caution" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5" />}>
      <h2 className="text-base font-bold">コラム：奥村-秦モデルと最新IoT伝搬研究</h2>

      <div className="mt-3 space-y-3 text-sm leading-relaxed">
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
          2025〜2026年の研究を追うと、方向性はさらに明確です。屋内LoRaWANの長期測定では、温湿度、CO2、粒子状物質、気圧、SNRを加えたモデルがRMSEを8.07dBから7.09dBへ改善し、99%到達率に必要なフェードマージンも線形基準より約2dB小さくできると報告されています。2026年のAERPAW LoRaWAN実験では、地上車両、ドローン、高高度ヘリカイトを比較し、高度、移動、地形、NLOSが受信品質のばらつきを大きく変えることが示されています。
        </p>
        <p>
          つまり「IoT向けに奥村・秦を少し直せば常に当たる」というより、現地の実測点で基準モデルを校正し、残差のばらつきから信頼率に応じた余裕を取る考え方が実務に近いです。3GPP TR 38.901 Release 19の議論でも、LOS/NLOS、端末アンテナ、クラッタ、近傍界、空間非定常性など、単一の平均損失式だけではなく、条件を分けて扱う流れが強まっています。
        </p>
        <p>
          そのため、本ツールではHataを「消す」のではなく、基準線として残します。その上で、IoT実測補正Hataモードでは、既知距離で測ったRSSIまたはRSRPからHataのずれを1点校正し、必要に応じて距離10倍あたりの勾配補正を加えます。これは万能な新公式ではありませんが、現地測定をリンクバジェットへ戻すための実務的な橋渡しです。
        </p>
        <p>
          重要なのは、補正値を“魔法の安全率”にしないことです。測定時の送信電力、アンテナ利得、ケーブル損失、端末近傍損失をそろえ、同じRSSI/RSRP指標で比較します。アンカー距離から10倍以上離れた距離へ外挿する場合は、複数地点の実測で距離勾配を確認してください。
        </p>
        <div className="rounded-md border border-amber-300 bg-white/70 p-4">
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
              <a className="font-semibold text-amber-800 underline" href="https://arxiv.org/abs/2510.04346">
                Environment-Aware Indoor LoRaWAN Path Loss
              </a>
              ：残差分布から信頼率つきフェードマージンを校正する2025年研究。
            </li>
            <li>
              <a className="font-semibold text-amber-800 underline" href="https://arxiv.org/abs/2604.06444">
                Real-World LoRaWAN Performance and Propagation Modeling
              </a>
              ：地上車両、UAV、ヘリカイトの高度・移動・地形差を比較した2026年実測研究。
            </li>
            <li>
              <a className="font-semibold text-amber-800 underline" href="https://arxiv.org/abs/2006.00880">
                NB-IoT deep-indoor propagation modelling
              </a>
              ：深部屋内では既存経験式だけでは不十分であることを実測で評価。
            </li>
            <li>
              <a className="font-semibold text-amber-800 underline" href="https://arxiv.org/abs/2507.19266">
                Overview of 3GPP Release 19 Study on TR 38.901
              </a>
              ：TR 38.901のRelease 19拡張で、端末アンテナ、クラッタ、近傍界、空間非定常性などを整理。
            </li>
          </ul>
        </div>
      </div>
    </Callout>
  );
}
