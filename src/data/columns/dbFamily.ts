import { dbiToDbd, dbdToDbi, DIPOLE_GAIN_DBI } from "@/lib/rf/dbFamily";
import { formatNumber } from "@/lib/rf/format";
import type { ToolColumn } from "./types";

/**
 * dBファミリー（dBi/dBd/dBm）ツールの構造化コラム。
 * 定量値は compute() で lib/rf から自動計算する。
 */
export const dbFamilyColumn: ToolColumn = {
  id: "db-family",
  title: "2.15dBの営業マジック——dBdとdBiが混ざるとき",
  hook: "同じアンテナのカタログが2枚あります。A社は「利得5.15dBi」、B社は「利得3dBd」。数字だけ並べればA社の圧勝——でも中身はまったく同じアンテナです。基準が違うだけで、同じ性能が違う数字に見えるのです。",
  body: [
    "dBiの基準は「全方向へ均等に飛ぶ架空の等方アンテナ」、dBdの基準は「実在する半波長ダイポール」。そしてダイポール自身が等方アンテナより2.15dB強く飛ぶため、同じアンテナでもdBi表記は必ず2.15dB大きく見えます。",
    "この「2.15dBの営業マジック」は、アンテナ業界で実際に混乱を生んできました。単位を省いて「利得5dB」とだけ書けば、読み手にはどちらの基準か分かりません。だから無線の現場では「アンテナ利得には必ず基準（iかd）を書け」が鉄則になり、IEEEの用語規格（IEEE Std 145）もdBi・dBdを別の量として明確に定義しています。",
    "では、なぜリンクバジェットではdBm・dB・dBiを混ぜて足せるのでしょうか。式の正体が「送信電力×アンテナ利得×経路損失…」という掛け算だからです。対数を取ると掛け算は足し算に変わる。逆に電力＋電力（dBm+dBm）は掛け算ではなく「和」なので、対数のままでは足せません。"
  ],
  analogy: {
    text: "dBiとdBdの違いは「巻き尺の原点をどこに置くか」にたとえられます。同じ長さでも、原点をずらせば読む数字が変わります。",
    limits: "「営業マジック」といっても、dBd表記が不誠実というわけではありません。ダイポールを基準器に実測する現場ではdBdの方が実務的で、dBiが「正しい」わけでもない——問題は基準の混在と単位の省略だけです。"
  },
  quant: {
    title: "数値で見る（このツールの式から自動計算）",
    rows: [
      {
        label: "5.15dBi をdBdへ変換",
        compute: () => `${formatNumber(dbiToDbd(5.15), 2)}dBd`,
        liveKey: "dbiToDbd",
        note: `半波長ダイポールの指向性1.64（10log10(1.64)≈${DIPOLE_GAIN_DBI}dB）ぶん差し引く`
      },
      {
        label: "3dBd をdBiへ変換",
        compute: () => `${formatNumber(dbdToDbi(3), 2)}dBi`,
        note: "5.15dBiと完全に同じアンテナを指す"
      }
    ]
  },
  derivation: {
    title: "なぜdBm+dBmは足せないのか（導出の要点）",
    steps: [
      "半波長ダイポールの指向性 D=1.64（≈1.643）。10log10(1.64)≈2.15dBなので G[dBi]=G[dBd]+2.15。",
      "Friisの伝達式 Pr=Pt・Gt・Gr・(λ/4πd)² は線形では掛け算、対数（dB）では Pr[dBm]=Pt[dBm]+Gt[dBi]+Gr[dBi]−FSPL[dB] の足し算になる。",
      "dBm+dBmが無効なのは、log(P1)+log(P2)=log(P1・P2)（電力の積）であって電力の和にならないため。合成は 10log10(10^(P1/10)+10^(P2/10))。"
    ]
  },
  antiPatterns: [
    {
      mistake: "カタログの「利得5dB」を基準表記なしで比較する",
      consequence: "dBi表記とdBd表記が混在すると、実力差ゼロのアンテナに2.15dBの見かけの差が生まれる",
      fix: "アンテナ利得には必ず基準（iかd）を明記し、比較時は同一基準へ揃える"
    },
    {
      mistake: "2つの送信電力をdBm同士でそのまま足し算する",
      consequence: "dBmは電力の対数値なので、和ではなく積の関係——単純加算は物理的に誤った値になる",
      fix: "電力の合成は線形（mW/W）へ戻してから足し、必要ならdBmへ再変換する"
    }
  ],
  sources: [
    {
      label: "IEEE Std 145, IEEE Standard for Definitions of Terms for Antennas",
      kind: "standard",
      locator: "dBi/dBdの定義",
      retrievedAt: "2026-07"
    },
    {
      label: "C. A. Balanis, \"Antenna Theory: Analysis and Design\"",
      kind: "book",
      locator: "半波長ダイポールの指向性1.64の章",
      retrievedAt: "2026-07"
    },
    {
      label: "W. H. Martin, \"Decibel — The Name for the Transmission Unit,\" Bell Syst. Tech. J.",
      kind: "paper",
      locator: "1929（デシベル命名の経緯）",
      retrievedAt: "2026-07"
    }
  ],
  lastReviewed: "2026-07"
};
