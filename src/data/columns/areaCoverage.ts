import { areaCoverageFraction } from "@/lib/rf/areaCoverage";
import { formatNumber } from "@/lib/rf/format";
import type { ToolColumn } from "./types";

export const areaCoverageColumn: ToolColumn = {
  id: "area-coverage",
  title: "なぜ“端っこ50%”で満足していいのか",
  hook: "セルの端では五分五分の勝負。それでも無線網全体では、多くの場所がきちんと届きます。円の面積と、中心へ近づくほど増える電波の余裕が、直感との差を作ります。",
  body: [
    "セル端信頼率は、サービス範囲のいちばん厳しい境界一点を評価します。中心へ近づけば距離損失が減り、同じシャドウイングが起きても受信しきい値までの余裕が増えます。したがって端が50%でも、内側の局所信頼率は急速に100%へ近づきます。",
    "さらに面積は半径ではなく半径の二乗で増えます。各距離の成立確率を円環の面積で重み付けして積分すると、都市σ=8dB・n=3.5では、端50%でも面積被覆率は約75%になります。エッジの数字とエリア全体の数字は、同じ意味ではありません。",
    "設計では、端信頼率を上げるコストと、必要な面積被覆率を分けて判断します。基地局密度、送信電力、アンテナ高を決める際は、円形セル近似の結果へ地形・建物・セル間干渉の余裕を別途加えます。"
  ],
  analogy: { text: "中心ほど濃く塗られた標的紙を想像すると、端の薄い輪が50%でも、標的全体はかなり塗られて見えます。", limits: "実際のセルは完全な円ではなく、干渉限界・道路・地形・アンテナ指向性で歪むため、同心円はノイズ制限セルの一次近似です。" },
  quant: { title: "数値で見る", rows: [{ label: "都市σ=8dB・n=3.5・端50%", compute: () => `${formatNumber(areaCoverageFraction(.5,8,3.5)*100,2)}%`, liveKey: "areaCoverage" }, { label: "同・端90%", compute: () => `${formatNumber(areaCoverageFraction(.9,8,3.5)*100,2)}%` }] },
  derivation: { title: "閉形式が出るまで", steps: ["半径比t=r/Rで局所成立率をΦ(a−b ln t)と置き、円環の面積重み2t dtで0から1まで積分する。", "t=e^(−x)で指数積分へ変換し、部分積分後のガウス指数を完全平方化すると閉形式へ帰着する。", "Fu=Φ(a)+exp(2a/b+2/b²)Q(a+2/b)。"] },
  sources: [
    { label: "W. C. Jakes (ed.), Microwave Mobile Communications", href: "https://onlinelibrary.wiley.com/doi/book/10.1002/9780470545285", kind: "book", locator: "Log-normal area coverage", retrievedAt: "2026-07" },
    { label: "3GPP TR 38.901", href: "https://www.3gpp.org/dynareport?code=38-series.htm", kind: "standard", locator: "§7.4.1 shadow fading", retrievedAt: "2026-07" }
  ],
  lastReviewed: "2026-07"
};
