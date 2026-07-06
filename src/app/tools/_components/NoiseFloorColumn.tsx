import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * ノイズフロアのコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「雑音を消そうとした人たちが、宇宙を発見した」— kTB（熱雑音）の物語。
 */
export function NoiseFloorColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：雑音を消そうとした人たちが、宇宙を発見した</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          1932年、ベル研究所のカール・ジャンスキーは大西洋横断無線のパチパチという雑音の犯人捜しを
          命じられていました。雷、船の火花点火、電源……原因を一つずつ潰していくと、どうしても消えない
          「シューッ」という成分が残ります。しかもそれは23時間56分周期——地球の自転に対する星の周期で
          強弱を繰り返していました。犯人は天の川の中心。<strong>雑音退治の仕事が、電波天文学という
          学問を生んだ瞬間</strong>です。
        </p>
        <p>
          33年後、同じベル研のペンジアスとウィルソンも、アンテナに残る謎の雑音と格闘していました。
          アンテナに住み着いたハトを追い払い、フンを掃除してもなお、空のどの方向にも約3K（-270℃）ぶんの
          雑音が残る。これが<strong>ビッグバンの残り火（宇宙マイクロ波背景放射）</strong>で、
          二人はノーベル物理学賞を受賞します。彼らが徹底的に理解しようとしたのが、
          まさにこのツールが計算している「雑音の水面はどこか」でした。
        </p>
        <p>
          このツールの式の先頭にある<strong>-174dBm/Hz</strong>は、常温（290K）の物体すべてが出す
          熱雑音の密度です。電子は温度がある限り揺らぎ続けるので、これはどんな高級受信機でも
          下回れない自然の床。エンジニアにできるのは、①拾う幅（帯域幅）を絞る
          ②自分の回路が足す雑音（NF）を減らす ③雑音の下から信号を掘り出す変調（負の所要SNR）を
          使う、の3つだけです。
        </p>
        <p>
          その③の極致を、あなたは毎日使っています。<strong>GPSの信号は地表ではノイズフロアより
          約20dB下</strong>——雑音の水面のはるか下に沈んで届きます。受信機は衛星ごとの長い合言葉
          （拡散符号）と突き合わせる相関処理で、雑音の海から信号だけをすくい上げる。LoRaのSF12が
          フロア下20dBを復調できるのも同じ原理です。※「合言葉を繰り返すほど聞き取れる」というたとえは
          直感用で、実際は相関による処理利得です——そして繰り返すほど通信速度は遅くなる、という
          代償を必ず払います。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            熱雑音電力 P = kTB（k=1.380649×10⁻²³ J/K・ボルツマン定数）。T=290Kで
            10log₁₀(kT/1mW) = -173.975 ≈ <span className="tabular-nums">-174dBm/Hz</span>。
            290Kは IEEE が定めた標準雑音温度（T₀）で、NFの定義（Friis, 1944）もこの温度を基準にする。
          </p>
          <p>
            拡散変調の処理利得 ≈ 10log₁₀(チップレート/データレート)。GPS L1 C/A は約43dB
            （1.023Mcps/50bps）で、地表受信電力の仕様値は約-128.5dBm（IS-GPS-200）。
            LoRa の SF別復調限界SNR（SF7:-7.5dB〜SF12:-20dB）は Semtech SX1276 データシートによる。
          </p>
          <p>
            出典: K. Jansky, &quot;Electrical Disturbances Apparently of Extraterrestrial Origin,&quot;
            Proc. IRE (1933)／A. Penzias &amp; R. Wilson, &quot;A Measurement of Excess Antenna
            Temperature at 4080 Mc/s,&quot; ApJ (1965)／H. T. Friis, &quot;Noise Figures of Radio
            Receivers,&quot; Proc. IRE (1944)。
          </p>
        </div>
      </details>
    </Callout>
  );
}
