import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * dBファミリーのコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「2.15dBの営業マジック——dBdとdBiが混ざるとき」。
 */
export function DbFamilyColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：2.15dBの営業マジック——dBdとdBiが混ざるとき</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          同じアンテナのカタログが2枚あります。A社は「利得 5.15dBi」、B社は「利得 3dBd」。
          数字だけ並べればA社の圧勝——でも中身はまったく同じアンテナです。dBi の基準は
          「全方向へ均等に飛ぶ架空の等方アンテナ」、dBd の基準は「実在する半波長ダイポール」。
          そしてダイポール自身が等方アンテナより 2.15dB 強く飛ぶため、
          <strong>同じアンテナでも dBi 表記は必ず 2.15dB 大きく見える</strong>のです。
        </p>
        <p>
          この「2.15dBの営業マジック」は、アンテナ業界で実際に混乱を生んできました。
          単位を省いて「利得5dB」とだけ書けば、読み手にはどちらの基準か分かりません。
          比較表に dBi と dBd が混ざれば、実力差ゼロのアンテナに 2.15dB の「差」を演出できてしまう。
          だから無線の現場では<strong>「アンテナ利得には必ず基準（i か d）を書け」が鉄則</strong>になり、
          IEEE の用語規格（IEEE Std 145）も dBi・dBd を別の量として明確に定義しています。
          ダイポールは作って実測できる基準器、等方アンテナは計算にしか存在しない理想——
          移動体通信の実測現場では dBd、衛星やリンク計算では dBi と、分野ごとの流儀も混在の一因でした。
        </p>
        <p>
          では、なぜリンクバジェット（Friisの式）では dBm・dB・dBi を混ぜて足せるのでしょうか。
          式の正体が「送信電力 × アンテナ利得 × 経路損失 × …」という<strong>掛け算</strong>だからです。
          対数を取ると掛け算は足し算に変わる。dBm も dB も dBi も、全部「何かで割った値の対数」なので、
          掛け算に対応する組合せならそのまま足せます。逆に電力＋電力（dBm+dBm）は掛け算ではなく
          「和」なので、対数のままでは足せない——足し算チェッカーが弾いたのはこれです。
        </p>
        <p>
          ※「営業マジック」といっても、dBd 表記が不誠実というわけではありません。ダイポールを基準器に
          実測する現場では dBd の方が実務的で、dBi が「正しい」わけでもない——問題は基準の混在と
          単位の省略だけです。このたとえの破れを埋めるのが「単位を必ず書く」という一行の習慣です。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            半波長ダイポールの指向性 D = 1.64（≈1.643）。10·log10(1.64) ≈ <span className="tabular-nums">2.15dB</span>{" "}
            なので G[dBi] = G[dBd] + 2.15。等方アンテナ（isotropic radiator）は全立体角に均等放射する
            理想の基準で、実在はしないが計算の原点になる。
          </p>
          <p>
            Friis の伝達式 Pr = Pt·Gt·Gr·(λ/4πd)² は線形では掛け算、対数（dB）では
            Pr[dBm] = Pt[dBm] + Gt[dBi] + Gr[dBi] − FSPL[dB] の足し算になる。dBm+dBm が無効なのは、
            log(P1)+log(P2) = log(P1·P2)（電力の積）であって電力の和にならないため。合成は
            10·log10(10^(P1/10)+10^(P2/10))。
          </p>
          <p>
            出典: IEEE Std 145, IEEE Standard for Definitions of Terms for Antennas（dBi/dBd の定義）／
            C. A. Balanis, <em>Antenna Theory: Analysis and Design</em>（半波長ダイポールの指向性 1.64）／
            W. H. Martin, &quot;Decibel — The Name for the Transmission Unit,&quot; Bell Syst. Tech. J. (1929)
            （デシベル命名の経緯）。
          </p>
        </div>
      </details>
    </Callout>
  );
}
