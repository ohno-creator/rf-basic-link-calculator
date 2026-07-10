import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * デセンスのコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「USB3.0がWi-Fiを殺した事件」— Intel の RFI 白書(2012)で有名になった自家中毒の実話。
 */
export function DesenseColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：USB3.0が、すぐ隣のWi-Fiを黙らせた</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          USB3.0（5Gbps）が普及し始めた頃、ノートPCやタブレットの現場で奇妙な不具合が続出しました。
          <strong>USBに外付けSSDやハブを挿すと、2.4GHzのWi-Fiやワイヤレスマウスが急に不安定になる</strong>。
          ケーブルを抜くと直る。犯人は電波干渉ではなく、USB3.0の広帯域ノイズでした。5Gbpsの信号は
          2.5GHz付近に強いスペクトル成分を持ち、その裾が2.4GHz帯にまで漏れ出します。コネクタの隙間や
          シールドの甘いケーブルからこのノイズが放射され、数cm横に置かれたWi-Fiアンテナのノイズフロアを
          押し上げた——典型的なデセンス（自家中毒）です。
        </p>
        <p>
          2012年、Intelはこの問題を体系的にまとめた技術白書
          「USB 3.0 Radio Frequency Interference Impact on 2.4 GHz Wireless Devices」を公開しました。
          そこで示された対策は派手な魔法ではなく、地味な物理の積み重ねでした。コネクタの金属シェルを
          しっかり接地する、ケーブルとフレキの遮蔽を強化する、そして<strong>アンテナをノイズ源から
          物理的に離して配置する</strong>。数dBフロアを下げるだけで、リンクは劇的に生き返ります。
        </p>
        <p>
          この事件の教訓は、電波の敵はいつも外にいるとは限らない、ということです。自分の基板の高速デジタル、
          DC/DCの数MHzスイッチング、その高調波——それらが自分の受信機を静かに殺しにきます。
          静かな図書館で本を読むのに、いちばん邪魔なのは遠くの街の喧騒ではなく、隣の席のイヤホンから
          漏れるシャカシャカ音だった、というわけです。※もっとも、実際の被害量は漏れたノイズが受信帯域内で
          どんなスペクトル形状かに強く依存し、広帯域の雑音状ノイズと単一のスプリアスでは効き方が違います——
          「隣の音」のたとえは方向性を示すだけで、対策は必ずスペクトルを測ってから決めます。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            電力加算: 合成雑音床 N′ = 10log₁₀(10^(N/10) + 10^(I/10)) [dBm]。デセンス Δ = N′ − N。
            干渉がフロアと同レベル(I=N)なら Δ=10log₁₀2 = <span className="tabular-nums">+3.01dB</span>、
            10dB下(I=N−10)なら 10log₁₀(1.1) = <span className="tabular-nums">+0.41dB</span>。
          </p>
          <p>
            キャリア内干渉（in-band / co-channel）は受信帯域そのものに落ちる妨害で、上式のとおり直接フロアを
            持ち上げデセンスさせる。キャリア外干渉（out-of-band / blocker）は帯域外の強い信号で、フロアは
            直接上げないがLNA/ミキサの相互変調・利得圧縮・位相雑音の相互相関を通じて実効感度を落とす——
            3GPPの受信機仕様では前者を感度(reference sensitivity)、後者をブロッキング/選択度として別々に規定する。
          </p>
          <p>
            熱雑音の下限は kTB。290Kで密度 -174dBm/Hz、帯域幅を掛けて N が決まる（NF分だけ上乗せ）。
            感度の基準(REFSENS)は 3GPP TS 36.101（LTE）等で N + NF + 所要SNR + 実装マージンとして定義される。
          </p>
          <p>
            出典: Intel, &quot;USB 3.0 Radio Frequency Interference Impact on 2.4 GHz Wireless Devices,&quot;
            White Paper (April 2012)／3GPP TS 36.101, &quot;E-UTRA UE radio transmission and reception&quot;
            （reference sensitivity・blocking の定義）／H. T. Friis, &quot;Noise Figures of Radio Receivers,&quot;
            Proc. IRE (1944)。
          </p>
        </div>
      </details>
    </Callout>
  );
}
