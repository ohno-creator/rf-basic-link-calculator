import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * GNSS C/N0 のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「地表のGPS信号は雑音より弱いのに、なぜ受かるのか」— 拡散符号の処理利得の物語。
 */
export function GnssCn0Column() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：地表のGPS信号は雑音より弱い。なぜ受かるのか</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          GPS衛星は高度約2万km、送信電力はわずか数十Wです。地表に届くころには受信電力が
          約<strong>-128.5dBm</strong>（IS-GPS-200の最低保証値）まで痩せ細ります。一方、受信機が
          2MHzほどの帯域で拾う熱雑音は約-111dBm。<strong>信号は雑音より十数dBも弱く</strong>、
          雑音の水面下に完全に沈んで届きます。素直に測れば、そこには雑音しか見えないはずです。
        </p>
        <p>
          それでも受かるのは、衛星ごとに割り当てられた長い「合言葉」（C/Aコード、毎秒1,023,000チップ）を
          受信機が最初から知っているからです。届いた雑音まみれの電波に、同じ符号を時間をずらしながら
          重ね合わせる（相関）と、符号がピタリと一致した瞬間だけ信号成分が積み上がり、雑音は打ち消し合う。
          この稼ぎが<strong>処理利得</strong>で、GPS L1 C/Aでは約43dB。水面下20dBの信号が、
          一気に水面のはるか上へ引き上げられます。
        </p>
        <p>
          引き上げ後の強さを帯域幅で割らずに表したのが<strong>C/N0（搬送波対雑音密度比）</strong>です。
          オープンスカイでは45dB-Hz前後あり、<strong>40dB-Hzあれば測位は安定します</strong>。逆に屋内では、
          建物侵入損が10〜30dB。処理利得で稼いだ余裕をこの壁が食い尽くし、C/N0が捕捉閾値を割ると、
          受信機は符号の一致点を見つけられず「測位不可」になります。ビルの窓際で急に精度が落ちるのは、
          このためです。
        </p>
        <p>
          ※「合言葉を重ねるほど聞き取れる」というたとえは直感用で、実際は符号相関による処理利得です
          ——そして符号を長く積むほど、得られる位置の更新は遅くなる、という代償を必ず払います。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            処理利得 Gp ≈ 10log₁₀(チップレート/データレート)。GPS L1 C/A は 1.023Mcps / 50bps で
            約<span className="tabular-nums">43dB</span>（10log₁₀(1.023×10⁶/50)=43.1）。地表での最低受信電力の
            仕様値は<span className="tabular-nums">-128.5dBm</span>（IS-GPS-200）。
          </p>
          <p>
            C/N0[dB-Hz] = 受信搬送波電力[dBm] − 雑音電力密度[dBm/Hz]。雑音電力密度は290Kで
            -174dBm/Hz に系全体の雑音指数 NFsys を足した値。復調に効く実効SNR ≈ C/N0 − 10log₁₀(データレート)
            で、50bpsなら C/N0 から約17dBを引いた値になる。
          </p>
          <p>
            出典: Global Positioning System Directorate, &quot;NAVSTAR GPS Space Segment/Navigation User
            Interfaces (IS-GPS-200)&quot;／J. B.-Y. Tsui, &quot;Fundamentals of Global Positioning System
            Receivers,&quot; Wiley／E. Kaplan &amp; C. Hegarty, &quot;Understanding GPS/GNSS: Principles and
            Applications,&quot; Artech House。
          </p>
        </div>
      </details>
    </Callout>
  );
}
