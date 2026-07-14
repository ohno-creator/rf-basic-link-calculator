import { calculateFsplDb } from "@/lib/rf/fspl";
import { formatDb } from "@/lib/rf/format";
import type { ToolColumn } from "./types";

/**
 * 自由空間損失（FSPL）ツールの構造化コラム。
 * 定量値は compute() で lib/rf から自動計算する。
 */
export const fsplColumn: ToolColumn = {
  id: "fspl",
  title: "フリスの伝達公式、1946年の1枚の式が携帯を生んだ",
  hook: "1946年、ベル研究所のハラルド・フリスは「電波はどれだけ届くのか」という計算を、たった1行の式に整理しました。送信電力・両アンテナの実効面積・波長・距離の2乗——必要なのはこれだけ。この式は、いまやスマホの基地局設計からGPS、深宇宙探査機との通信まで、あらゆる無線リンクの出発点になっています。",
  body: [
    "式の心臓部は距離の2乗です。電波は点光源の光と同じように球状に広がるので、距離が2倍になれば同じ電力が4倍の面積へ薄まる。だから距離10倍で損失は約20dB増える——ここまでは直感どおりです。",
    "多くの人がつまずくのは「周波数が高いほど損失が増える」という部分です。空気が高周波を余計に吸うわけではありません。真犯人はアンテナの実効面積です。利得を一定（等方性）にしたアンテナが電波を捕まえられる面積は波長の2乗に比例し、周波数が上がるほど小さくなる。つまり「損失」の正体は、受信アンテナの網が高周波ほど目減りしていくことなのです。"
  ],
  analogy: {
    text: "受信アンテナは「電波という雨を受けるお椀」にたとえられます。周波数が上がるほど、同じ利得を保つためのお椀は小さくなり、受け取れる雨（電力）が減ります。",
    limits: "この「網が小さくなる」というたとえは受信側だけの話で、送信側で利得を上げてビームを絞れば高周波ほど有利にもなり得ます（パラボラは高周波ほど鋭くなる）。FSPLの周波数項は「等方性を仮定したときだけ」に現れる見かけの損失です。"
  },
  quant: {
    title: "数値で見る（このツールの式から自動計算）",
    rows: [
      {
        label: "920MHz・1kmでの自由空間損失",
        compute: () => formatDb(calculateFsplDb(920, 1)),
        liveKey: "fspl",
        note: "現在の入力に連動"
      },
      {
        label: "同条件・距離10倍（10km）での損失",
        compute: () => formatDb(calculateFsplDb(920, 10)),
        note: "920MHz・1kmとの差はちょうど+20.00dB"
      },
      {
        label: "距離1km・周波数を2400MHzへ（2.6倍）",
        compute: () => formatDb(calculateFsplDb(2400, 1)),
        note: "920MHz・1kmとの差は+8.32dB（周波数比の20log10）"
      }
    ]
  },
  derivation: {
    title: "なぜ (4πd/λ)² なのか（導出の要点）",
    steps: [
      "フリスの伝達公式: Pr = Pt・(Aer・Aet) / (d²・λ²)。Ae は各アンテナの実効開口面積、d は距離、λ は波長。",
      "送受を等方性アンテナ（利得1）とすると実効開口は Ae = λ²/4π となり、代入して FSPL = (4πd/λ)² が得られる。",
      "dB表記では FSPL = 20log10(4πd/λ) = 32.44 + 20log10(d[km]) + 20log10(f[MHz])。周波数項20log10(f)は空気の吸収ではなく、等方性受信アンテナの開口λ²/4πが高周波ほど縮小することに由来する（λ=c/fのため）。"
    ]
  },
  antiPatterns: [
    {
      mistake: "「高周波は減衰が大きい」を、空気による吸収と誤解する",
      consequence: "実際の空気吸収（酸素・水蒸気）は数十GHz以上でないと無視できるほど小さく、FSPLの周波数項の正体は受信アンテナの実効開口縮小である",
      fix: "同じ物理アンテナサイズ（同じ利得）で比較する場合、高周波が不利とは限らない——パラボラのように開口面積を固定すれば周波数が上がるほど利得は上がる"
    }
  ],
  sources: [
    {
      label: "H. T. Friis, \"A Note on a Simple Transmission Formula,\" Proc. IRE",
      href: "https://ieeexplore.ieee.org/document/1697062",
      kind: "paper",
      locator: "Vol. 34, No. 5, pp. 254-256",
      retrievedAt: "2026-07"
    },
    {
      label: "Balanis, \"Antenna Theory: Analysis and Design\"",
      kind: "book",
      locator: "実効開口とアンテナ利得の関係 G=4πAe/λ² の章",
      retrievedAt: "2026-07"
    }
  ],
  lastReviewed: "2026-07"
};
