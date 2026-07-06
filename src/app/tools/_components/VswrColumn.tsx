import { Waves } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * VSWRのコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「VSWRという波の名前」— 整合がずれると線路に定在波が立ち、
 * VSWR／リターンロス／反射係数は同じ現象の3つの言葉。1.5で満足すべきか2.0で妥協かの現場観。
 */
export function VswrColumn() {
  return (
    <Callout tone="info" size="lg" icon={<Waves aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：VSWRという波の名前</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          無線の黎明期、送信機とアンテナをつなぐ給電線が、原因不明の<strong>決まった場所</strong>で
          焼け焦げる事故がありました。犯人は「定在波」。整合がずれて負荷から戻ってきた反射波が、
          行きの波と重なり合い、線路上の固定した位置に電圧の腹（山）と節（谷）を作ります。
          波が流れずその場に立って見えるので <strong>standing wave（定在波）</strong>。腹では整合時の
          何倍もの電圧がかかり、そこだけが放電・発熱する。焼ける位置がいつも同じなので、
          技術者は焦げ跡の間隔から波長を逆算できたほどでした。
        </p>
        <p>
          この山と谷の電圧比こそ <strong>VSWR（電圧定在波比）</strong>です。昔は溝を切った同軸
          （スロットライン）に検出器を差し込み、線路に沿って滑らせて最大電圧と最小電圧を実測し、
          その比を目盛りで読みました。完全整合なら波は立たず山も谷もなく比は1.0、
          全反射なら谷がゼロになり比は∞になります。VSWRは「反射波がどれだけ立っているか」を
          1つの数字に潰したものです。
        </p>
        <p>
          リターンロスと反射係数Γは、<strong>同じ反射を別の物差しで測った兄弟</strong>です。
          Γは「入った波の電圧のうち何割が跳ね返るか」、リターンロスはそれをdBの小ささで、
          VSWRは山と谷の比で言い換えたにすぎません。VSWR1.5＝Γ0.2＝リターンロス約14dB＝反射電力4%。
          測定器の表示が違うだけで、3つは同じ波の別名です。
        </p>
        <p>
          では1.5で満足すべきか、2.0で妥協か。VSWR2.0でも反射電力は約11%、ミスマッチ損失は
          わずか0.5dB——リンクバジェット上はほぼ誤差の範囲です。現場が2.0を嫌う本当の理由は
          損失よりも、<strong>反射波が送信機の終段に戻って発熱させ</strong>、送信機によっては保護回路が
          出力を絞ってしまうこと。VSWRは「効率」より「送信機を守れるか」で効いてくる指標なのです。
          ※「山と谷」のたとえは直感用で、実際に線路を伝わっているのは時々刻々変化する電圧であり、
          腹・節は時間平均した振幅の分布を指します。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式・相互変換と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            反射係数Γは入射波電圧に対する反射波電圧の比（本来は複素数だが、本ツールは大きさ|Γ|を扱う）。
            VSWR = (1+|Γ|)/(1-|Γ|)、逆に |Γ| = (VSWR-1)/(VSWR+1)。リターンロス
            RL[dB] = -20log₁₀|Γ|（正の数で表す慣習）。ミスマッチ損失 ML[dB] = -10log₁₀(1-|Γ|²)、
            反射電力の割合 = |Γ|²。
          </p>
          <p>
            換算例:{" "}
            <span className="tabular-nums">
              VSWR1.5 → |Γ|0.200 → RL13.98dB → 反射4.0% → ML0.177dB
            </span>
            。
            <span className="tabular-nums">
              VSWR2.0 → |Γ|0.333 → RL9.54dB → 反射11.1% → ML0.512dB
            </span>
            。VSWRが大きいほど反射も損失も増えるが、2.0までは損失そのものは小さい。
          </p>
          <p>
            出典: D. M. Pozar, &quot;Microwave Engineering,&quot; 4th ed., Wiley (2012), §2.3
            （定在波比・反射係数・リターンロスの定義）／K. Kurokawa, &quot;Power Waves and the
            Scattering Matrix,&quot; IEEE Trans. Microwave Theory Tech., MTT-13 (1965)／
            C. G. Montgomery, &quot;Technique of Microwave Measurements,&quot; MIT Radiation
            Laboratory Series, Vol. 11, McGraw-Hill (1947)（スロットラインによるVSWR実測）／
            IEEE Std 100, &quot;IEEE Standard Dictionary of Electrical and Electronics Terms.&quot;
          </p>
        </div>
      </details>
    </Callout>
  );
}
