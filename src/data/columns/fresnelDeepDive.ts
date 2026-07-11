import { analyzeObstacle, calculateFresnel, radioHorizonKm } from "@/lib/rf/fresnel";
import { formatMeters, formatNumber } from "@/lib/rf/format";
import type { ToolColumn } from "./types";

/**
 * D1パイロット第1号: フレネル深掘りコラムの構造化データ版。
 * 定量値はすべて compute() で lib/rf から導出する（式が変われば表示も追随）。
 */
export const fresnelDeepDiveColumn: ToolColumn = {
  id: "fresnel-deep-dive",
  title: "IoTの現場でフレネルゾーンをどう活かすか",
  hook:
    "フレネルゾーンは「理想的な見通し」を前提に語られがちです。しかし実際の現場では、棚、在庫、配管、人、車が経路に入り込み、太った楕円をまるごと空けられる環境はむしろ稀です。だからこそこの半径は「どれだけ余裕を見込むか」「どこに置けば損をしにくいか」を考えるものさしになります。",
  body: [
    "送信側は、できるだけ高く・障害物の上にゾーンを通すのが基本です。楕円は経路の中央付近が最も太いため、送信点のすぐ近くより中央の遮蔽が効きます。避けられない障害物は経路の端（送信点・受信点の近く）へ寄せると影響が小さくなり、数十cmずらすだけで安定することも珍しくありません。",
    "受信側は、端末が動く・向きが変わる・人が持つことを前提に考えます。人体は2.4GHz帯をよく吸収するため、人の往来そのものが「動く障害物」です。設置した瞬間は見通せていても、フォークリフト、駐車車両、在庫の増減、レイアウト変更で経路は変わります。「ある日突然つながらない」の多くはこの環境変化が原因です。",
    "そして物理限界があります。ゾーンの太さは波長で決まり、アンテナをいくら小型化しても縮みません。見通しが不確実で環境も変わる以上、ぎりぎりの設計は危険です。だからこそ、マージンが重要——リンクバジェットに遮蔽・フェージング・将来の変化を見込んだ余裕（数dB〜十数dB）を上乗せしておくことが、止まらない無線をつくる鍵です。"
  ],
  analogy: {
    text: "フレネルゾーンは「電波の通り道は1本の糸ではなく、ラグビーボール状のトンネルだ」と考えると直感に合います。トンネルの壁に何かが食い込むほど、通れる電波が削られます。",
    limits:
      "トンネルの比喩は「中さえ空いていれば満点」と誤解させます。実際は60%クリアで実用上十分（損失ほぼ0dB）で、逆に全部空いていても地面反射などの干渉で落ち込むことがあります。"
  },
  quant: {
    title: "数値で見る（このツールの式から自動計算）",
    rows: [
      {
        label: "第1フレネル半径（920MHz・100m経路・中央）",
        compute: () => formatMeters(calculateFresnel(920, 0.1, 0.5).firstZoneRadiusM),
        liveKey: "firstZoneRadius",
        note: "60%確保の目安はこの0.6倍"
      },
      {
        label: "同・2.4GHzに上げると",
        compute: () => formatMeters(calculateFresnel(2400, 0.1, 0.5).firstZoneRadiusM),
        note: "周波数√倍で細くなる"
      },
      {
        label: "障害物が見通し線ちょうど（v=0）のときの回折損失",
        compute: () =>
          `${formatNumber(analyzeObstacle(920, 0.1, 0.5, 2, 2, 2).diffractionLossDb, 1)} dB`,
        note: "「ギリギリ見えている」は既に約半分"
      },
      {
        label: "アンテナ高3m/2mの電波見通し距離（k=4/3）",
        compute: () => `${formatNumber(radioHorizonKm(3, 2), 1)} km`,
        note: "長距離モードの根拠"
      }
    ]
  },
  derivation: {
    title: "なぜ60%で足りるのか（導出の要点）",
    steps: [
      "ナイフエッジ回折の損失は無次元パラメータ v で決まり、クリアランス比 c/r1 とは v = −(c/r1)·√2 の関係にある（本ツールの実装と同一）。",
      "c/r1 = 0.6 を代入すると v ≈ −0.85。ITU-R P.526 の近似式 J(v)=6.9+20log10(√((v−0.1)²+1)+v−0.1) は v≤−0.78 で 0dB になるため、60%確保＝回折損失ほぼゼロ。",
      "逆に c=0（障害物が見通し線に接する）では v=0 となり J(0)≈6.0dB——電力で約1/4を失う。「見えている」と「届く」の差はここにある。"
    ]
  },
  antiPatterns: [
    {
      mistake: "「見通しがある＝届く」と判断する",
      consequence: "縁すれすれの見通しでは約6dB（電力1/4）の回折損失。マージン3dBの設計なら即赤字",
      fix: "本ツールで60%クリアランスを確認し、不足分はリンクバジェット診断の環境損失に計上する"
    },
    {
      mistake: "地面すれすれの低いアンテナで長距離リンクを組む",
      consequence: "経路中央のフレネルゾーンが地面に食い込み、常時数dB〜10dB超の損失",
      fix: "中央の必要クリアランス（本ツールの半径×0.6）を確保できる高さに上げる"
    }
  ],
  sources: [
    {
      label: "ITU-R P.526-15, Propagation by diffraction",
      href: "https://www.itu.int/rec/R-REC-P.526-15-202010-I/en",
      kind: "standard",
      locator: "§4.1（単一ナイフエッジ・J(v)近似式）",
      retrievedAt: "2026-07"
    },
    {
      label: "ITU-R P.530-18, Propagation data for terrestrial line-of-sight systems",
      href: "https://www.itu.int/rec/R-REC-P.530-18-202109-I/en",
      kind: "standard",
      locator: "§2.2.1（クリアランス設計基準）",
      retrievedAt: "2026-07"
    }
  ],
  lastReviewed: "2026-07"
};
