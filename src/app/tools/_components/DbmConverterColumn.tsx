import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * dBm変換のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「なぜエンジニアはWでなくdBmで話すのか」— 掛け算が足し算になる魔法と、
 * リンクバジェットが一行の足し算で書ける理由（デシベル誕生の実話）。
 */
export function DbmConverterColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：なぜエンジニアはWでなくdBmで話すのか</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          1920年代、ベル電話会社の技術者たちは長距離電話の悩みを抱えていました。ケーブルを
          1マイル延ばすごとに、信号は一定の「割合」で弱まる。10マイル延ばせば損失は掛け算で
          積み上がり、区間ごとに 0.79×0.79×… と掛け続ける計算はミスの温床でした。彼らは損失を
          「標準ケーブル何マイル分か（mile of standard cable）」で数えていましたが、掛け算のままでは
          扱いにくい。そこで<strong>対数をとれば掛け算が足し算に化ける</strong>——この性質を使い、
          1924年に伝送単位（TU）を、1928年にはベルの名を冠した「デシベル」を定義しました。
        </p>
        <p>
          対数の魔法はこうです。電力の比を dB にすると、掛ける代わりに足せる。送信電力から
          ケーブル損失を引き、アンテナ利得を足し、経路損失を引く——本来なら 10¹² 倍もの桁を
          またいで割り算・掛け算を続ける計算が、<strong>dBm と dB の世界では一行の足し算・引き算</strong>
          で書けてしまいます。受信電力が 0.000000000001W でも「−120dBm」と一語で言える。
          エンジニアが W でなく dBm で話すのは見栄ではなく、桁の海で溺れないための実務です。
        </p>
        <p>
          ただし「dB は足すもの」という直感は万能ではありません。<strong>2つの電波の“電力そのもの”を
          合成するとき</strong>（干渉や雑音の加算）は dB のまま足せず、いったん mW（線形）に戻して
          足し合わせてから dB に戻す必要があります——足し算の魔法が効くのは「比の掛け算」に対してだけで、
          独立な電力の合成には効きません。0dBm ＋ 0dBm は 3dBm ではなく、線形で 1mW＋1mW＝2mW（＝3.01dBm）です。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            定義: <span className="tabular-nums">dBm = 10·log₁₀(P / 1mW)</span>、逆に
            <span className="tabular-nums"> P[mW] = 10^(dBm/10)</span>。基準は
            <strong> 0dBm = 1mW</strong>。+10dB ごとに電力は 10 倍、+3dB で約 2 倍になる。
          </p>
          <p>
            他基準との換算: <strong>dBW</strong> は基準を 1W にとった量で
            <span className="tabular-nums"> dBW = dBm − 30</span>（1W = 1000mW = +30dBm）。
            <strong> dBμV</strong> は電圧基準の量で
            <span className="tabular-nums"> dBμV = 20·log₁₀(V / 1μV)</span>。
            50Ω系では P = V²/R で電力と電圧が結び付き、0dBm ⇔ 106.99dBμV、すなわち
            <span className="tabular-nums"> dBm ≈ dBμV − 107（50Ω）</span>（75Ω系では定数が −108.75 に変わる）。
          </p>
          <p>
            足し算が成り立つのは比（利得・損失）に対してのみ。独立な電力の合成は線形で
            <span className="tabular-nums"> P_total[mW] = ΣPᵢ[mW]</span> と足してから dBm へ戻す。
          </p>
          <p>
            出典: W. H. Martin, &quot;Decibel—The Name for the Transmission Unit,&quot; Bell System
            Technical Journal, vol. 8, no. 1 (1929)／対数量・レベルの定義は IEC 60027-3 ・
            ISO 80000-3／dBμV↔dBm(50Ω) 換算は RF計測の標準関係（Keysight／Rohde &amp; Schwarz
            アプリケーションノート）。
          </p>
        </div>
      </details>
    </Callout>
  );
}
