import { referenceLossPoints } from "@/lib/rf/coax";
import { formatNumber } from "@/lib/rf/format";
import type { ToolColumn } from "./types";

/**
 * 同軸ケーブル損失ツールの構造化コラム。
 * 定量値は compute() で lib/rf から自動計算する。
 */
export const coaxColumn: ToolColumn = {
  id: "coax-cable-loss",
  title: "同軸は長いほど損をする。では基地局はなぜ塔の上に無線機を置くのか",
  hook: "昔の携帯基地局は、塔のふもとの小屋に無線機を置き、太い同軸フィーダーで塔上のアンテナまで数十メートルの銅線を引き上げていました。この配置には避けられない税金があります——フィーダー損失。送信では出力を、受信では感度を、行きも帰りも削られていきます。",
  body: [
    "しかも損失は周波数とともに増えます。同軸の損失は周波数の平方根（√f）に比例して増え、長さには単純に比例する。塔の高さはそのままに周波数だけが上がっていくので、フィーダーは年々重い足かせになりました。",
    "答えは拍子抜けするほど素直でした——同軸が長いほど損をするなら、同軸を無くせばいい。無線機そのものをアンテナの真下、塔のてっぺんへ持ち上げる。これがRRH（リモート・ラジオ・ヘッド）です。塔の上と下を結ぶのは、もはや損失のほとんど無い光ファイバーだけ。長い銅の同軸は50cmまで縮みました。",
    "受信側では塔上に低雑音増幅器（マストヘッドアンプ）を先に置き、フィーダー損失が感度を殺す前に信号を持ち上げます。ミリ波では「塔の上に無線機」どころか、アンテナと無線機を一体化したAAUが必然になりました。"
  ],
  analogy: {
    text: "高いビルの屋上へ水を届けるのに、地上の1台のポンプで押し上げるのをやめて屋上にポンプを据えるようなものです。",
    limits: "水道管の圧力損は摩擦で周波数に関係しませんが、同軸の損失は表皮効果で周波数依存——高い周波数ほど電流が導体表面の薄い層に集まり抵抗が増えます。このたとえは「周波数が上がるほど深刻化する」という点では破れます。"
  },
  quant: {
    title: "数値で見る（このツールの式から自動計算・正規化値）",
    rows: [
      {
        label: "800MHz→3000MHzでの損失増加率（√f則・正規化値）",
        compute: () => {
          const points = referenceLossPoints(1, 1);
          const at800 = points.find((p) => p.freqMHz === 800)!.lossDb;
          const at3000 = points.find((p) => p.freqMHz === 3000)!.lossDb;
          return `×${formatNumber(at3000 / at800, 2)}（√(3000/800)と一致）`;
        },
        note: "同一ケーブル・同一長さで周波数だけ上げた場合の損失倍率（絶対値ではなく比率が本質）"
      }
    ]
  },
  derivation: {
    title: "なぜ√fで損をするのか（導出の要点）",
    steps: [
      "同軸の減衰 α = α_c + α_d。導体損α_cは表皮抵抗 R_s=√(πfμ/σ) に比例するため α_c ∝ √f。誘電体損は α_d ∝ f・tanδ。低〜中周波ではα_cが支配的なので、実務では「損失∝√f」の近似が使われる。長さには線形で、総損失[dB]=単位長損失×長さ。",
      "表皮深さ δ=√(2/(ωμσ)) ∝ 1/√f。周波数が4倍になると表皮抵抗は2倍、導体損もおよそ2倍になる。これが「√fで損をする」正体。",
      "受信側でフィーダー損失が効く理由はFriisの縦続雑音式 F=F₁+(F₂−1)/G₁。フィーダー（受動損失L・利得G=1/L）をLNAの前に置くと、系の雑音指数はフィーダー損失ぶん丸ごと悪化する。LNAを塔上（フィーダーより前段）へ置けば系NF≈LNAのNFで済む——これがマストヘッドアンプ／RRHの受信側の狙い。"
    ]
  },
  antiPatterns: [
    {
      mistake: "受信系の雑音指数改善で、LNAをどこに置いても同じだと考える",
      consequence: "フィーダーの後段にLNAを置くと、系のNFはフィーダー損失ぶん丸ごと悪化する（Friisの縦続雑音式）",
      fix: "LNAは可能な限りアンテナに近い位置（フィーダーより前段）に配置する"
    }
  ],
  sources: [
    {
      label: "D. M. Pozar, \"Microwave Engineering,\" 4th ed., Wiley",
      kind: "book",
      locator: "§2.7（同軸の減衰・表皮効果）",
      retrievedAt: "2026-07"
    },
    {
      label: "H. T. Friis, \"Noise Figures of Radio Receivers,\" Proc. IRE",
      href: "https://ieeexplore.ieee.org/document/1697062",
      kind: "paper",
      locator: "1944（縦続雑音指数）",
      retrievedAt: "2026-07"
    },
    {
      label: "CPRI Specification V7.0",
      kind: "standard",
      locator: "2015（基地局のベースバンドRECと無線部RE=RRHを結ぶフロントホール）",
      retrievedAt: "2026-07"
    }
  ],
  lastReviewed: "2026-07"
};
