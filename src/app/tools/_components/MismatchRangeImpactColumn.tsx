import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * ミスマッチと通信距離のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「VSWR 2.0で上司に怒られたら読む話」— 測定器の数字と、本当に効く順序の逆転。
 */
export function MismatchRangeImpactColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：VSWR 2.0で上司に怒られたら読む話</h2>
      <div className="mt-3 space-y-3 text-sky-950/90">
        <p className="text-sm leading-relaxed">
          現場でアンテナアナライザを当てると、上司が画面をのぞき込んで言います。「VSWR 2.0？
          ダメだろ、1.5切るまで追い込め」。よくある問答です。でも、その2.0が距離に与える影響を
          計算すると——<strong>失う電力は0.51dB、自由空間での距離減はわずか5.7%</strong>。
          10km届く設計なら約9.4kmまで、という程度の話です。数字の見た目（2倍！）と、実際に
          失うもの（電力の1割・距離の数％）のあいだには、大きなギャップがあります。
        </p>
        <p className="text-sm leading-relaxed">
          VSWRが怖いのは、実は距離が縮むことよりも別の理由からです。反射波が送信機に戻ると
          終段が熱を持ち、電力が大きい局では素子を痛めます。だからメーカは「VSWR 2.0以下で
          使え」と保護のために規定する。つまり<strong>VSWR規格の多くは飛距離の規格ではなく、
          機器保護の規格</strong>なのです。これを混同すると、距離のために整合を追い込んでいるつもりが、
          実は保護マージンを削っているだけ、ということになりかねません。
        </p>
        <p className="text-sm leading-relaxed">
          VSWR 1.05を追い込む職人がいます。無響室で、ケーブルの取り回し一本まで整えて、
          小数第二位を削る。その技術は本物です。ただ屋外に出た瞬間、アンテナが雨に濡れれば
          誘電率が変わってVSWRは1.8に跳ね上がり、雪が積もればさらに動く。
          <strong>実運用のVSWRは環境で秒単位に呼吸している</strong>——1.05という値は、
          その一瞬の静止画にすぎません。
        </p>
        <p className="text-sm leading-relaxed">
          では何が本当に距離を決めるのか。順番はこうです。まず<strong>アンテナの置き場所と高さ</strong>
          （フレネルゾーンが抜けるか、地面反射を拾わないか）。次に<strong>偏波の向き</strong>。
          その後にようやく整合の追い込みが来ます。VSWRを2.0から1.2に改善して稼げるのは距離4%弱。
          同じ努力でアンテナを数十cm高くできるなら、そちらの方がはるかに効く場面が多い。
          測定器の数字が一番目立つからといって、それが一番効くとは限らない——現場のいちばん
          大事な感覚です。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            反射係数 <span className="tabular-nums">Γ = (VSWR−1)/(VSWR+1)</span>。反射電力率 = Γ²、
            アンテナへ入る電力率 = 1−Γ²。ミスマッチ損失
            <span className="tabular-nums"> ML[dB] = −10·log₁₀(1 − Γ²)</span>。
            リターンロスとは <span className="tabular-nums">RL[dB] = −20·log₁₀(Γ)</span> の関係で、
            VSWR2 は Γ=1/3・RL≈9.54dB・反射電力11.1%・ML≈0.51dB。
          </p>
          <p>
            自由空間では受信電力が距離の2乗に反比例する（FSPL ∝ d²、距離2倍で−6dB＝20log₁₀）ため、
            電力のdBを距離のdBへ換算する係数は20。よって距離維持率 =
            <span className="tabular-nums"> 10^(−ML/20) = √(1 − Γ²)</span>。VSWR2 で
            √0.889 ≈ 0.943、距離影響 −5.7%。実環境では距離指数が2から外れる（市街地で3〜4）ため、
            距離%はあくまで整合改善の価値を測る一次目安である。
          </p>
          <p>
            なお ML は「反射で失う分」のみを表し、線路損があると反射波が往復で減衰して見かけのVSWRが
            良く見えるなど、実測解釈には注意を要する。
          </p>
          <p>
            出典: D. M. Pozar, <em>Microwave Engineering</em>, 4th ed., Wiley（Ch.2「反射係数・
            VSWR・ミスマッチ損失」）／整合とリターンロスの定義は同書 §2.3 による。
          </p>
        </div>
      </details>
    </Callout>
  );
}
