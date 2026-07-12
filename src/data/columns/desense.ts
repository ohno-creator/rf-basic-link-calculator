import { desenseDb } from "@/lib/rf/desense";
import { formatNumber } from "@/lib/rf/format";
import type { ToolColumn } from "./types";

/**
 * デセンス（感度劣化）ツールの構造化コラム。
 * 定量値は compute() で lib/rf から自動計算する。
 */
export const desenseColumn: ToolColumn = {
  id: "desense",
  title: "USB3.0が、すぐ隣のWi-Fiを黙らせた",
  hook: "USB3.0（5Gbps）が普及し始めた頃、ノートPCやタブレットの現場で奇妙な不具合が続出しました。USBに外付けSSDやハブを挿すと、2.4GHzのWi-Fiやワイヤレスマウスが急に不安定になる。ケーブルを抜くと直る。犯人は電波干渉ではなく、USB3.0の広帯域ノイズでした。",
  body: [
    "5Gbpsの信号は2.5GHz付近に強いスペクトル成分を持ち、その裾が2.4GHz帯にまで漏れ出します。コネクタの隙間やシールドの甘いケーブルからこのノイズが放射され、数cm横に置かれたWi-Fiアンテナのノイズフロアを押し上げた——典型的なデセンス（自家中毒）です。",
    "2012年、Intelはこの問題を体系的にまとめた技術白書を公開しました。そこで示された対策は派手な魔法ではなく、地味な物理の積み重ねでした。コネクタの金属シェルをしっかり接地する、ケーブルとフレキの遮蔽を強化する、そしてアンテナをノイズ源から物理的に離して配置する。数dBフロアを下げるだけで、リンクは劇的に生き返ります。",
    "この事件の教訓は、電波の敵はいつも外にいるとは限らない、ということです。自分の基板の高速デジタル、DC/DCの数MHzスイッチング、その高調波——それらが自分の受信機を静かに殺しにきます。"
  ],
  analogy: {
    text: "静かな図書館で本を読むのに、いちばん邪魔なのは遠くの街の喧騒ではなく、隣の席のイヤホンから漏れるシャカシャカ音だった、というわけです。",
    limits: "実際の被害量は漏れたノイズが受信帯域内でどんなスペクトル形状かに強く依存し、広帯域の雑音状ノイズと単一のスプリアスでは効き方が違います。「隣の音」のたとえは方向性を示すだけで、対策は必ずスペクトルを測ってから決めます。"
  },
  quant: {
    title: "数値で見る（このツールの式から自動計算）",
    rows: [
      {
        label: "干渉が雑音床と同レベル（I=N）のときのデセンス",
        compute: () => `+${formatNumber(desenseDb(-100, -100), 2)}dB`,
        note: "10log10(2) = 3.01dB（干渉レベルによらず一定）"
      },
      {
        label: "干渉が雑音床より10dB低い（I=N-10dB）ときのデセンス",
        compute: () => `+${formatNumber(desenseDb(-100, -110), 2)}dB`,
        liveKey: "desense",
        note: "10log10(1.1) = 0.41dB"
      }
    ]
  },
  derivation: {
    title: "式と適用条件（導出の要点）",
    steps: [
      "電力加算: 合成雑音床 N'=10log10(10^(N/10)+10^(I/10)) [dBm]。デセンス Δ=N'−N。",
      "キャリア内干渉（in-band/co-channel）は受信帯域そのものに落ちる妨害で、上式のとおり直接フロアを持ち上げデセンスさせる。キャリア外干渉（out-of-band/blocker）は帯域外の強い信号で、フロアは直接上げないがLNA/ミキサの相互変調・利得圧縮・位相雑音の相互相関を通じて実効感度を落とす——3GPPの受信機仕様では前者を感度(reference sensitivity)、後者をブロッキング/選択度として別々に規定する。",
      "熱雑音の下限はkTB。290Kで密度-174dBm/Hz、帯域幅を掛けてNが決まる（NF分だけ上乗せ）。感度の基準(REFSENS)は3GPP TS 36.101（LTE）等でN+NF+所要SNR+実装マージンとして定義される。"
    ]
  },
  antiPatterns: [
    {
      mistake: "デセンスの原因を必ず「外部からの電波干渉」だと決めつける",
      consequence: "USB3.0事件のように、自分の基板の高速デジタル信号やDC/DCスイッチングが受信機のノイズフロアを押し上げていることが少なくない",
      fix: "疑わしい高速信号線・電源をON/OFFして感度の変化を比較し、外来か自家中毒かを切り分ける"
    }
  ],
  sources: [
    {
      label: "Intel, \"USB 3.0 Radio Frequency Interference Impact on 2.4 GHz Wireless Devices,\" White Paper",
      kind: "article",
      locator: "April 2012",
      retrievedAt: "2026-07"
    },
    {
      label: "3GPP TS 36.101, \"E-UTRA UE radio transmission and reception\"",
      kind: "standard",
      locator: "reference sensitivity・blockingの定義",
      retrievedAt: "2026-07"
    },
    {
      label: "H. T. Friis, \"Noise Figures of Radio Receivers,\" Proc. IRE",
      href: "https://ieeexplore.ieee.org/document/1697062",
      kind: "paper",
      locator: "1944",
      retrievedAt: "2026-07"
    }
  ],
  lastReviewed: "2026-07"
};
