import { calculateNoiseFloorDbm, calculateSensitivityDbm } from "@/lib/rf/noiseFloor";
import { formatNumber } from "@/lib/rf/format";
import type { ToolColumn } from "./types";

/**
 * 雑音床（ノイズフロア）ツールの構造化コラム。
 * 定量値は compute() で lib/rf から自動計算する。
 */
export const noiseFloorColumn: ToolColumn = {
  id: "noise-floor",
  title: "雑音を消そうとした人たちが、宇宙を発見した",
  hook: "1932年、ベル研究所のカール・ジャンスキーは大西洋横断無線のパチパチという雑音の犯人捜しを命じられていました。雷、船の火花点火、電源……原因を一つずつ潰していくと、どうしても消えない「シューッ」という成分が残ります。しかもそれは23時間56分周期——地球 of 自転に対する星の周期で強弱を繰り返していました。犯人は天の川の中心。雑音退治の仕事が、電波天文学という学問を生んだ瞬間です。",
  body: [
    "33年後、同じベル研のペンジアスとウィルソンも、アンテナに残る謎の雑音と格闘していました。アンテナに住み着いたハトを追い払い、フンを掃除してもなお、空のどの方向にも約3K（-270℃）ぶんの雑音が残る。これがビッグバンの残り火（宇宙マイクロ波背景放射）で、二人はノーベル物理学賞を受賞します。彼らが徹底的に理解しようとしたのが、まさにこのツールが計算している「雑音の水面はどこか」でした。",
    "このツールの式の先頭にある -174dBm/Hz は、常温（290K）の物体すべてが出す熱雑音の密度です。電子は温度がある限り揺らぎ続けるので、これはどんな高級受信機でも下回れない自然の床。エンジニアにできるのは、①拾う幅（帯域幅）を絞る ②自分の回路が足す雑音（NF）を減らす ③雑音の下から信号を掘り出す変調（負の所要SNR）を使う、の3つだけです。",
    "その③の極致を、あなたは毎日使っています。GPSの信号は地表ではノイズフロアより約20dB下——雑音の水面のはるか下に沈んで届きます。受信機は衛星ごとの長い合言葉（拡散符号）と突き合わせる相関処理で、雑音の海から信号だけをすくい上げる。LoRaのSF12がフロア下20dBを復調できるのも同じ原理です。"
  ],
  analogy: {
    text: "ノイズフロアは「コップに水を注ぐとき、常にコップの底にたまっている微少な砂利」にたとえられます。どれだけ綺麗な水を注いでも、砂利（熱雑音）より下の水位は測れません。",
    limits: "砂利（雑音）は物理的に完全に除去することはできず、温度が絶対零度にならない限り存在し続けます。また、変調処理によって砂利に埋もれた信号（負のSNR）を検出することは可能であり、コップの比喩のように「水面下は絶対に読めない」わけではありません。"
  },
  quant: {
    title: "数値で見る（このツールの式から自動計算）",
    rows: [
      {
        label: "常温熱雑音電力密度（1Hzあたり）",
        compute: () => "-174.0 dBm",
        note: "自然界の物理的限界"
      },
      {
        label: "LoRa帯域幅（125kHz・NF 6dB）でのノイズフロア",
        compute: () => `${formatNumber(calculateNoiseFloorDbm(125_000, 6), 1)} dBm`,
        liveKey: "noiseFloor",
        note: "帯域幅を広げるほどフロアが上昇"
      },
      {
        label: "LoRa SF12（所要SNR -20dB）の受信感度",
        compute: () => `${formatNumber(calculateSensitivityDbm(125_000, 6, -20), 1)} dBm`,
        liveKey: "sensitivity",
        note: "ノイズフロア下20dBまで受信可能"
      }
    ]
  },
  derivation: {
    title: "なぜ -174dBm/Hz なのか（導出の要点）",
    steps: [
      "熱雑音電力密度 P = kTB（k=1.380649×10⁻²³ J/K はボルツマン定数、Tは絶対温度、Bは帯域幅）。",
      "標準雑音温度 T=290K、B=1Hz を代入すると、P = 4.00388×10⁻²¹ W となる。",
      "これを dBm（1mW基準の対数）に変換すると、10log₁₀(P / 1mW) = 10log₁₀(4.00388×10⁻¹⁸) ≈ -173.975 dBm/Hz となり、慣用値として -174 dBm/Hz が使われる。"
    ]
  },
  antiPatterns: [
    {
      mistake: "帯域幅を広げて通信速度を上げつつ、長距離の到達も期待する",
      consequence: "帯域幅が10倍になるとノイズフロアが10dB上昇し、受信感度が10dB悪化して通信距離が半分以下に縮む",
      fix: "長距離が必要な場合は帯域幅を必要最小限（LoRaやNB-IoTなど）に設計する"
    }
  ],
  sources: [
    {
      label: "K. Jansky, \"Electrical Disturbances Apparently of Extraterrestrial Origin,\" Proc. IRE",
      href: "https://ieeexplore.ieee.org/document/1642220",
      kind: "paper",
      locator: "Vol. 21, No. 10, pp. 1387-1398",
      retrievedAt: "2026-07"
    },
    {
      label: "A. Penzias & R. Wilson, \"A Measurement of Excess Antenna Temperature at 4080 Mc/s,\" ApJ",
      href: "https://adsabs.harvard.edu/pdf/1965ApJ...142..419P",
      kind: "paper",
      locator: "Vol. 142, pp. 419-421",
      retrievedAt: "2026-07"
    },
    {
      label: "H. T. Friis, \"Noise Figures of Radio Receivers,\" Proc. IRE",
      href: "https://ieeexplore.ieee.org/document/1643685",
      kind: "paper",
      locator: "Vol. 32, No. 7, pp. 419-422",
      retrievedAt: "2026-07"
    }
  ],
  lastReviewed: "2026-07"
};
