import { convertVswr } from "@/lib/rf/vswr";
import { formatNumber } from "@/lib/rf/format";
import type { ToolColumn } from "./types";

/**
 * VSWR/リターンロス/反射係数ツールの構造化コラム。
 * 定量値は compute() で lib/rf から自動計算する。
 */
export const vswrColumn: ToolColumn = {
  id: "vswr",
  title: "VSWRという波の名前",
  hook: "無線の黎明期、送信機とアンテナをつなぐ給電線が、原因不明の決まった場所で焼け焦げる事故がありました。犯人は「定在波」。反射波が行きの波と重なり、線路上の固定した位置に電圧の腹（山）と節（谷）を作ります。焼ける位置がいつも同じなので、技術者は焦げ跡の間隔から波長を逆算できたほどでした。",
  body: [
    "この山と谷の電圧比こそVSWR（電圧定在波比）です。昔は溝を切った同軸に検出器を差し込み、線路に沿って滑らせて最大電圧と最小電圧を実測し、その比を目盛りで読みました。完全整合なら波は立たず比は1.0、全反射なら比は∞になります。",
    "リターンロスと反射係数Γは、同じ反射を別の物差しで測った兄弟です。Γは「入った波の電圧のうち何割が跳ね返るか」、リターンロスはそれをdBの小ささで、VSWRは山と谷の比で言い換えたにすぎません。測定器の表示が違うだけで、3つは同じ波の別名です。",
    "では1.5で満足すべきか、2.0で妥協か。VSWR2.0でも反射電力は約11%、ミスマッチ損失はわずか0.5dB——リンクバジェット上はほぼ誤差の範囲です。現場が2.0を嫌う本当の理由は損失よりも、反射波が送信機の終段に戻って発熱させ、送信機によっては保護回路が出力を絞ってしまうこと。VSWRは「効率」より「送信機を守れるか」で効いてくる指標なのです。"
  ],
  analogy: {
    text: "VSWRは「線路の上にできる定在波の山と谷の高さの比」にたとえられます。山が高いほど反射が大きい合図です。",
    limits: "「山と谷」は時間平均した振幅の分布を指すたとえで、実際に線路を伝わっているのは時々刻々変化する電圧そのものです。"
  },
  quant: {
    title: "数値で見る（このツールの式から自動計算）",
    rows: [
      {
        label: "VSWR1.5のときの反射係数・リターンロス・反射電力・ミスマッチ損失",
        compute: () => {
          const r = convertVswr("vswr", 1.5);
          return `Γ${formatNumber(r.reflectionCoefficient, 3)} / RL${formatNumber(r.returnLossDb, 2)}dB / 反射${formatNumber(r.reflectedPowerPercent, 1)}% / ML${formatNumber(r.mismatchLossDb, 3)}dB`;
        },
        liveKey: "vswr15"
      },
      {
        label: "VSWR2.0のときの反射係数・リターンロス・反射電力・ミスマッチ損失",
        compute: () => {
          const r = convertVswr("vswr", 2.0);
          return `Γ${formatNumber(r.reflectionCoefficient, 3)} / RL${formatNumber(r.returnLossDb, 2)}dB / 反射${formatNumber(r.reflectedPowerPercent, 1)}% / ML${formatNumber(r.mismatchLossDb, 3)}dB`;
        },
        note: "VSWRが大きいほど反射も損失も増えるが、2.0までは損失そのものは小さい"
      }
    ]
  },
  derivation: {
    title: "相互変換の式（導出の要点）",
    steps: [
      "反射係数Γは入射波電圧に対する反射波電圧の比（本来は複素数だが、大きさ|Γ|を扱う）。VSWR = (1+|Γ|)/(1-|Γ|)、逆に |Γ| = (VSWR-1)/(VSWR+1)。",
      "リターンロス RL[dB] = -20log10|Γ|（正の数で表す慣習）。ミスマッチ損失 ML[dB] = -10log10(1-|Γ|²)、反射電力の割合 = |Γ|²。"
    ]
  },
  antiPatterns: [
    {
      mistake: "VSWR2.0を「大きな損失」と誤解し、整合に過剰なコストをかける",
      consequence: "VSWR2.0のミスマッチ損失は約0.5dBに過ぎず、リンクバジェット上はほぼ誤差の範囲",
      fix: "VSWRが効く本当の理由（送信機の保護回路が出力を絞る・終段の発熱）を区別して評価する"
    }
  ],
  sources: [
    {
      label: "D. M. Pozar, \"Microwave Engineering,\" 4th ed., Wiley",
      kind: "book",
      locator: "§2.3（定在波比・反射係数・リターンロスの定義）",
      retrievedAt: "2026-07"
    },
    {
      label: "K. Kurokawa, \"Power Waves and the Scattering Matrix,\" IEEE Trans. Microwave Theory Tech.",
      href: "https://ieeexplore.ieee.org/document/1128589",
      kind: "paper",
      locator: "MTT-13 (1965)",
      retrievedAt: "2026-07"
    },
    {
      label: "C. G. Montgomery, \"Technique of Microwave Measurements\"",
      kind: "book",
      locator: "MIT Radiation Laboratory Series, Vol. 11, McGraw-Hill (1947)（スロットラインによるVSWR実測）",
      retrievedAt: "2026-07"
    }
  ],
  lastReviewed: "2026-07"
};
