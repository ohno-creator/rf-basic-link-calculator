import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * 電測サンプリング設計のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材:「なぜ40波長で50点なのか」— W.C.Y. Lee が 1985 年に定めた電測の作法の物語。
 */
export function MeasurementSamplingColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：なぜ「40波長で50点」なのか</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          携帯電話の黎明期、基地局のエリア設計をする技師たちには共通の悩みがありました。
          同じ場所で受信レベルを測っているはずなのに、<strong>数十cmずれるだけで表示が10dBも跳ねる</strong>。
          歩きながら測れば針は暴れ、止まって測れば「たまたまそこが谷だった」だけかもしれない。
          「本当の受信レベル」がどこにあるのか、誰も自信を持って言えなかったのです。
        </p>
        <p>
          この暴れの正体は、直接波と反射波が干渉してできる<strong>定在波（マルチパスフェージング）</strong>です。
          電波の山と谷は半波長ごとに並ぶので、周波数900MHzなら約17cm進むだけで山から谷へ落ちる。
          1点の測定値は、この細かい模様のどこを踏んだかで決まる「くじ引き」にすぎませんでした。
        </p>
        <p>
          1985年、ベル研究所の<strong>W.C.Y. Lee</strong>が、この混乱に統計で決着をつけます。彼はこう問いました。
          「速いフェージングは平均でならし、しかし建物の陰のような遅い変化は残したい。
          では<strong>どれだけの区間を、何点で測れば良いか</strong>」。答えは、区間は
          <strong>40波長</strong>、その中を<strong>50点</strong>（＝0.8波長間隔）。速い干渉模様は40波長あれば十分に
          均され、標本平均の推定誤差は実用上1dB程度に収まる。以来これは電測の「作法」として、
          歩測でも車載測定でも受け継がれてきました。測るたびに違う数字に悩んだ技師たちへの、
          統計からの回答です。
        </p>
        <p>
          面白いのは、この40波長という長さが<strong>周波数で実寸を変える</strong>ことです。920MHzでは約13m、
          2.4GHzではわずか5m。高い周波数ほど短い区間で平均が取れる——のに、同じ50点。
          波長という物差しで見れば、電波の世界の「測り方」はどの周波数でも同じ姿をしているのです。
          ※「40波長で誤差1dB」は代表的な相場で、実際の必要点数は許容誤差とばらつき σ で
          このツールの n の式が決めます。作法（窓）と統計（点数）は別物、というのが実務の勘所です。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            Lee 基準: 局所平均（local average）を求める測定窓長 = <span className="tabular-nums">40λ</span>、
            窓内サンプル数 = <span className="tabular-nums">50点</span>（間隔 <span className="tabular-nums">0.8λ</span>）。
            40λ は速いレイリー・フェージングを平均化するのに十分な長さで、標本平均の 90% 信頼区間が
            約 ±1dB に収まる目安として導かれた。0.8λ 間隔は、隣接サンプルが実質的に無相関とみなせる
            距離（レイリー場の自己相関がほぼ0となる ~0.4λ 以上）を確保するための刻み。
          </p>
          <p>
            必要サンプル数（統計側）: 平均受信レベルを許容誤差 ±E[dB]・信頼水準 c で推定するとき、
            対数正規シャドウイング（標準偏差 σ[dB]）に対し n = (z·σ/E)²。
            z = Φ⁻¹((1+c)/2) は両側 z 値（c=95% で z≈1.96）。
            n ∝ 1/E² なので、許容誤差を半分にすると必要点数は 4 倍になる。独立サンプル前提のため、
            相関のある密な測定では実効サンプル数が減り n は過小評価になる。
          </p>
          <p>
            出典: W. C. Y. Lee, &quot;Estimate of Local Average Power of a Mobile Radio Signal,&quot;
            IEEE Trans. Vehicular Technology, vol. VT-34, no. 1, pp. 22–27, Feb. 1985。
            σ の相場（開放4／郊外6／都市8dB）は 3GPP TR 38.901 の σ_SF 等に対応。
          </p>
        </div>
      </details>
    </Callout>
  );
}
