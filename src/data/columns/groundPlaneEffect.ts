import { groundPlaneEfficiencyDropDb } from "@/lib/rf/groundPlaneEffect";
import { formatNumber } from "@/lib/rf/format";
import type { ToolColumn } from "./types";

/**
 * GNDプレーン寸法と効率ツールの構造化コラム。
 * 定量値は compute() で lib/rf から自動計算する。
 */
export const groundPlaneEffectColumn: ToolColumn = {
  id: "ground-plane-size",
  title: "基板の裏側がアンテナの半分",
  hook: "アンテナの教科書で最初に習うダイポールは、全長λ/2の一対の素子です。これを半分に切って大地に立てたのがモノポールで、マルコーニの長波送信以来の定番です。なぜ半分で済むのか。導体の大地が鏡になり、地面の下に逆さまの鏡像アンテナが映るからです。本物のλ/4と鏡像のλ/4が合わさって1本のλ/2ダイポールとして動く——つまりアンテナの半分は、導体面の中にいます。",
  body: [
    "IoT機器のチップアンテナやIFAも、この構図はまったく同じです。大地の代役を務めるのが基板のGNDプレーン。アンテナ部品のデータシートに載る性能は、たいてい推奨サイズの評価基板——つまり「十分に大きな鏡」——での値です。ところが920MHzのλ/4は約8.1cm。名刺（55×91mm）の短辺方向では足りません。基板を小型化するたびに、部品は同じでもアンテナの残り半分が物理的に削られていくのです。",
    "現場でよくあるのが「前の基板と同じアンテナ部品なのに、小型化した新基板では飛ばない」という相談です。犯人は部品ではなく、削られたGND。しかもGNDが短いと共振周波数がずれて整合も外れるため、実際の落ち込みはこれに上乗せされます。外形寸法が決まった瞬間に、その基板のアンテナ性能の上限も決まっている——RF担当が企画段階で真っ先に外形図を欲しがるのは、このためです。"
  ],
  analogy: {
    text: "GNDプレーンは「アンテナが自分の姿を映す鏡」にたとえられます。鏡が小さいと、映る像も不完全になります。",
    limits: "「鏡」のたとえが厳密に成り立つのは無限に広い完全導体面だけで、実際の小さな基板ではGND上を流れる有限のRF電流そのものがアンテナの一部として放射しています。"
  },
  quant: {
    title: "数値で見る（このツールの式から自動計算）",
    rows: [
      {
        label: "GND最長辺 λ/10 のときの効率低下",
        compute: () => `${formatNumber(groundPlaneEfficiencyDropDb(0.1), 0)}dB（電力1/4）`,
        liveKey: "drop",
        note: "λ/4確保（0dB）からの低下"
      },
      {
        label: "GND最長辺 λ/20 のときの効率低下",
        compute: () => `${formatNumber(groundPlaneEfficiencyDropDb(0.05), 0)}dB（電力1/16）`
      },
      {
        label: "GNDなし（Lg/λ=0）のときの効率低下",
        compute: () => `${formatNumber(groundPlaneEfficiencyDropDb(0), 0)}dB`
      }
    ]
  },
  derivation: {
    title: "イメージ理論と目安表の根拠（導出の要点）",
    steps: [
      "イメージ理論: 無限完全導体（PEC）面上のλ/4モノポールは、面下の鏡像と合わせてλ/2ダイポールと等価になる。放射は上半空間のみで、入力インピーダンスはダイポールの半分（約36.6Ω）。",
      "GNDが有限になると鏡像が不完全になり、放射抵抗の低下（効率低下）に加えて、電気長不足による共振周波数の上昇と整合ずれが同時に起きる。",
      "本ツールの目安表（λ/4→0dB・λ/10→-6dB・λ/20→-12dB・GNDなし→-20dB）は、ベンダーアプリケーションノートに示される「GND最長辺とアンテナ性能」の実測系の目安を、Lg/λの区分線形カーブとして転記したもの。"
    ]
  },
  antiPatterns: [
    {
      mistake: "前の基板と同じアンテナ部品を使えば、小型化した新基板でも同じ性能が出ると考える",
      consequence: "GND最長辺がλ/4を切ると効率が段階的に低下し（λ/10で-6dB）、共振・整合ずれも重なって実測ではさらに悪化する",
      fix: "企画段階で外形寸法とGND最長辺を確認し、λ/4を確保できない場合は性能低下を織り込んで設計する"
    }
  ],
  sources: [
    {
      label: "TI AN058 (SWRA161) \"Antenna Selection Guide\"",
      href: "https://www.ti.com/lit/pdf/swra161",
      kind: "datasheet",
      locator: "§3.1.2",
      retrievedAt: "2026-07"
    },
    {
      label: "TI DN035 (SWRA351) \"Antenna Quick Guide\"",
      href: "https://www.ti.com/lit/pdf/swra351",
      kind: "datasheet",
      retrievedAt: "2026-07"
    },
    {
      label: "EnOcean AN102 \"Antenna Basics\"",
      href: "https://www.enocean.com/en/support/knowledge-base/",
      kind: "datasheet",
      locator: "§4",
      retrievedAt: "2026-07"
    }
  ],
  lastReviewed: "2026-07"
};
