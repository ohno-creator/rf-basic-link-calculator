import { calculatePropagationLoss, type PropagationInput } from "@/lib/rf/propagation";
import { calculateFsplDb } from "@/lib/rf/fspl";
import { formatNumber } from "@/lib/rf/format";
import type { ToolColumn } from "./types";

/**
 * 奥村-秦（Okumura-Hata）モデルの構造化コラム。
 * 定量値は compute() で lib/rf から自動計算する。
 */
const BASE: PropagationInput = {
  frequencyMHz: 920,
  baseHeightM: 30,
  mobileHeightM: 1.5,
  distanceKm: 1,
  area: "urbanMedium"
};

export const hataColumn: ToolColumn = {
  id: "okumura-hata",
  title: "奥村-秦モデル——実測から生まれ、実測で校正する",
  hook: "この式は机上の理論からではなく、地道な実測から生まれました。1960年代、奥村善久氏らが東京とその周辺で膨大な電波伝搬測定を行い、減衰を地形別の曲線群（いわゆる奥村カーブ）にまとめ上げ、1980年に秦正治氏がそれを誰でも電卓で計算できる回帰式へ翻訳しました。これが世界中の携帯電話セル設計の土台となった奥村-秦（Okumura-Hata）モデルです。",
  body: [
    "ただしこの式は第一原理ではなく、実測への回帰（フィッティング）です。だからこそ適用範囲——周波数150〜1500MHz・基地局高30〜200m・移動局高1〜10m・距離1〜20km——が明確に決まっており、1500MHz超はCOST 231-Hataが拡張します。範囲を外れた入力は外挿になり、本ツールでは範囲外警告を表示します。一方で式の各項は現実の効きにきれいに対応しており、実測を数式に翻訳した結果、物理的な意味が透けて見えるのも特徴です（導出参照）。",
    "IoT端末では、この式が想定しない「細かな変化」が主役になりがちです。端末は地面・壁・金属筐体・人体に近づき、アンテナ高も1m前後まで下がるため、広域平均を表すHataに載らない損失が上乗せされます。Hata値だけで通信可否を断定すると、現地では10dB単位でずれることがあります。近年のLPWA測定研究でも同じ方向の結果が出ています。都市LoRaの大規模測定は「計画の出発点として有効、ただし現地データでの係数校正が重要」と報告し、NB-IoTの深部屋内測定では既存経験式だけで2〜12dB程度の誤差増加が観測され、屋内LoRaWANの長期測定では環境特徴量を加えたモデルがRMSEを8.07dBから7.09dBへ改善しています（出典参照）。",
    "そのため本ツールはHataを「消す」のではなく基準線として残し、IoT実測補正モードで既知距離のRSSI/RSRPとの差を1点校正する構成にしています。補正値を「魔法の安全率」にしないことが重要です。測定時の送信電力・アンテナ利得・ケーブル損失をそろえ、アンカー距離から10倍以上離れる外挿では複数地点の実測で距離勾配を確認してください。"
  ],
  analogy: {
    text: "Hataモデルは「全国の気象平年値マップ」にたとえられます。都市の平均的な電波の減りかたは教えてくれますが、あなたの軒下のミクロ気候までは知りません。",
    limits: "平年値は座標ごとに固定ですが、IoT端末の追加損失は周囲数十cmの金属・人体・設置姿勢で大きく変わります。最後は現地の実測（1点校正）で埋める必要があります。"
  },
  quant: {
    title: "数値で見る（このツールの式から自動計算）",
    rows: [
      {
        label: "Hata損失（920MHz・1km・基地局30m・端末1.5m・中小都市）",
        compute: () => `${formatNumber(calculatePropagationLoss(BASE).pathLossDb, 1)}dB`,
        note: "適用範囲内の代表条件"
      },
      {
        label: "同条件の自由空間損失（FSPL）との差",
        compute: () => {
          const hata = calculatePropagationLoss(BASE).pathLossDb;
          const fspl = calculateFsplDb(BASE.frequencyMHz, BASE.distanceKm);
          return `+${formatNumber(hata - fspl, 1)}dB`;
        },
        note: "市街地の建物・クラッタによる実測由来の上乗せ"
      },
      {
        label: "距離10倍（1km→10km）での損失増分",
        compute: () => {
          const near = calculatePropagationLoss(BASE).pathLossDb;
          const far = calculatePropagationLoss({ ...BASE, distanceKm: 10 }).pathLossDb;
          return `+${formatNumber(far - near, 1)}dB`;
        },
        note: "(44.9−6.55·log₁₀hb)·log₁₀d の傾き（hb=30mのとき）"
      }
    ]
  },
  derivation: {
    title: "式の構造と本ツールの実装（導出の要点）",
    steps: [
      "中小都市・市街地のHata式: L = 69.55 + 26.16·log₁₀f − 13.82·log₁₀hb − a(hm) + (44.9 − 6.55·log₁₀hb)·log₁₀d。26.16·log₁₀fは周波数が高いほど損失が増えること、距離項は基地局を高くするほど傾きが緩くなること、a(hm)は端末側の高さ、エリア補正は「街の作りそのもの」を表す。",
      "適用範囲は f: 150〜1500MHz・hb: 30〜200m・hm: 1〜10m・d: 1〜20km。1500〜2000MHzはCOST 231-Hata（46.3 + 33.9·log₁₀f … + Cm）が拡張し、本ツールは周波数に応じて自動で切り替える。",
      "経験式は近距離や極端な開放地条件で自由空間損失を下回る非物理値を返し得るため、本ツールはFSPLを下限（床）として採用し、床が効いた場合はその旨を表示する。",
      "IoT実測補正モードは、既知距離で測ったRSSI/RSRPとHata予測の差を1点校正し、必要に応じて距離10倍あたりの勾配補正を加える。万能な新公式ではなく、現地測定をリンクバジェットへ戻すための実務的な橋渡しである。"
    ]
  },
  antiPatterns: [
    {
      mistake: "Hata（COST 231-Hata）の予測値だけで、金属盤内や地上高1m以下に置かれたIoT端末の通信可否を断定する",
      consequence: "端末近傍の金属・人体・低アンテナ高は式の想定外で、現地では10dB単位のずれ（研究報告では2〜12dB程度の誤差増加）が生じる",
      fix: "IoT実測補正モードで既知距離のRSSI/RSRPから1点校正し、残差のばらつきに応じたフェードマージンを確保する"
    }
  ],
  sources: [
    {
      label: "M. Hata (1980) \"Empirical Formula for Propagation Loss in Land Mobile Radio Services\" IEEE Trans. Veh. Technol. VT-29(3)",
      href: "https://doi.org/10.1109/T-VT.1980.23859",
      kind: "paper",
      locator: "pp.317–325",
      note: "奥村カーブを回帰式化した原典",
      retrievedAt: "2026-07"
    },
    {
      label: "Path Loss in Urban LoRa Networks",
      href: "https://arxiv.org/abs/2109.07768",
      kind: "paper",
      note: "都市LoRaの大規模測定で、Okumura系・Log-distance系など複数モデルを比較",
      retrievedAt: "2026-07"
    },
    {
      label: "LoRaWAN indoor environmental dataset",
      href: "https://arxiv.org/abs/2505.06375",
      kind: "paper",
      note: "環境特徴量を入れたモデルでRMSE改善を報告",
      retrievedAt: "2026-07"
    },
    {
      label: "Environment-Aware Indoor LoRaWAN Path Loss",
      href: "https://arxiv.org/abs/2510.04346",
      kind: "paper",
      note: "残差分布から信頼率つきフェードマージンを校正する2025年研究",
      retrievedAt: "2026-07"
    },
    {
      label: "Real-World LoRaWAN Performance and Propagation Modeling",
      href: "https://arxiv.org/abs/2604.06444",
      kind: "paper",
      note: "地上車両・UAV・ヘリカイトの高度・移動・地形差を比較した2026年実測研究",
      retrievedAt: "2026-07"
    },
    {
      label: "NB-IoT deep-indoor propagation modelling",
      href: "https://arxiv.org/abs/2006.00880",
      kind: "paper",
      note: "深部屋内では既存経験式だけでは不十分であることを実測で評価",
      retrievedAt: "2026-07"
    },
    {
      label: "Overview of 3GPP Release 19 Study on TR 38.901",
      href: "https://arxiv.org/abs/2507.19266",
      kind: "paper",
      note: "TR 38.901のRelease 19拡張で、端末アンテナ・クラッタ・近傍界・空間非定常性などを整理",
      retrievedAt: "2026-07"
    }
  ],
  lastReviewed: "2026-07"
};
