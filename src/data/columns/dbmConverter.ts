import { dbmToMw, mwToDbm } from "@/lib/rf/db";
import { combinePowersDbm } from "@/lib/rf/dbFamily";
import { formatNumber } from "@/lib/rf/format";
import type { ToolColumn } from "./types";

/**
 * dBm変換ツールの構造化コラム。
 * 定量値は compute() で lib/rf から自動計算する。
 */
export const dbmConverterColumn: ToolColumn = {
  id: "dbm-converter",
  title: "なぜエンジニアはWでなくdBmで話すのか",
  hook: "1920年代、ベル電話会社の技術者たちは長距離電話の悩みを抱えていました。ケーブルを1マイル延ばすごとに信号は一定の「割合」で弱まる。10マイル延ばせば損失は掛け算で積み上がり、区間ごとに掛け続ける計算はミスの温床でした。",
  body: [
    "そこで対数をとれば掛け算が足し算に化ける——この性質を使い、1924年に伝送単位（TU）を、1928年にはベルの名を冠した「デシベル」を定義しました。送信電力からケーブル損失を引き、アンテナ利得を足し、経路損失を引く——本来なら10¹²倍もの桁をまたいで割り算・掛け算を続ける計算が、dBmとdBの世界では一行の足し算・引き算で書けてしまいます。",
    "受信電力が0.000000000001Wでも「-120dBm」と一語で言える。エンジニアがWでなくdBmで話すのは見栄ではなく、桁の海で溺れないための実務です。",
    "ただし「dBは足すもの」という直感は万能ではありません。2つの電波の「電力そのもの」を合成するとき（干渉や雑音の加算）はdBのまま足せず、いったんmW（線形）に戻して足し合わせてからdBに戻す必要があります。足し算の魔法が効くのは「比の掛け算」に対してだけで、独立な電力の合成には効きません。"
  ],
  analogy: {
    text: "dBmは「桁数を数える速記法」にたとえられます。1兆分の1Wという長い数字を「-120dBm」の一語で言い表せます。",
    limits: "速記法はあくまで比率・掛け算の世界の話です。2つの電力そのものを合成する場面（雑音の加算等）では、速記法のまま足すと物理的に誤った答えになります。"
  },
  quant: {
    title: "数値で見る（このツールの式から自動計算）",
    rows: [
      {
        label: "1mW をdBmへ変換",
        compute: () => `${formatNumber(mwToDbm(1), 2)}dBm`,
        liveKey: "mwToDbm",
        note: "0dBm = 1mWが基準"
      },
      {
        label: "0dBm + 0dBm（電力合成・線形へ戻してから加算）",
        compute: () => `${formatNumber(combinePowersDbm(0, 0), 2)}dBm`,
        note: "3dBmではなく約3.01dBm（線形で1mW+1mW=2mW）"
      },
      {
        label: "-120dBm をmWへ変換",
        compute: () => `${dbmToMw(-120).toExponential(2)}mW`,
        note: "1兆分の1W級の微弱信号を一語で表せる"
      }
    ]
  },
  derivation: {
    title: "なぜdBm+dBmは足せないのか（導出の要点）",
    steps: [
      "定義: dBm = 10log10(P / 1mW)、逆に P[mW] = 10^(dBm/10)。基準は0dBm=1mW。+10dBごとに電力は10倍、+3dBで約2倍になる。",
      "他基準との換算: dBWは基準を1Wにとった量でdBW=dBm−30（1W=1000mW=+30dBm）。dBμVは電圧基準の量でdBμV=20log10(V/1μV)。50Ω系ではP=V²/Rで電力と電圧が結び付き、0dBm⇔106.99dBμV（dBm≈dBμV−107、75Ω系では定数が−108.75に変わる）。",
      "足し算が成り立つのは比（利得・損失）に対してのみ。独立な電力の合成は線形でP_total[mW]=ΣPi[mW]と足してからdBmへ戻す。"
    ]
  },
  antiPatterns: [
    {
      mistake: "2つの干渉電力や雑音電力をdBm同士でそのまま足し算する",
      consequence: "0dBm+0dBmを3dBmと誤答してしまう（正しくは線形で1mW+1mW=2mW=約3.01dBm——差は僅かだが原理を誤解している）",
      fix: "電力の合成は必ず線形（mW）に戻してから加算し、必要に応じてdBmへ戻す（combinePowersDbm相当の手順）"
    }
  ],
  sources: [
    {
      label: "W. H. Martin, \"Decibel — The Name for the Transmission Unit,\" Bell System Technical Journal",
      kind: "paper",
      locator: "Vol. 8, No. 1 (1929)",
      retrievedAt: "2026-07"
    },
    {
      label: "IEC 60027-3 / ISO 80000-3",
      kind: "standard",
      locator: "対数量・レベルの定義",
      retrievedAt: "2026-07"
    }
  ],
  lastReviewed: "2026-07"
};
