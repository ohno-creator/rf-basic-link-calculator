import { BookOpen } from "lucide-react";
import { Accordion } from "@/components/Accordion";
import { Callout } from "@/components/Callout";

export function DiversityGainColumn() {
  return (
    <section className="mt-8 space-y-4" aria-labelledby="diversity-column-title">
      <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
        <h2 className="text-base font-bold">コラム：耳が2つある理由——配置だけで10dB稼ぐ話</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
          <p>
            雑踏の中でも会話が聞き取れるのは、人間に耳が2つあるからです。片方に騒音が被っても、もう片方が
            拾ってくれる。無線の世界がこの「2つの耳」に気づいたのは1920年代——短波の大西洋横断通信で、
            受信アンテナを数百メートル離して2本置くと、電離層フェージングで片方が沈んでも
            もう片方は生きていることが発見されました。受信機を良くしたのではなく、置き方を変えただけで
            通信が安定したのです。
          </p>
          <p>
            この「置き方の魔法」は数字にできます。互いに独立にフェージングする2本からその瞬間良い方を選ぶと、
            両方が同時に深く沈む確率は掛け算で小さくなり、1%の時間しか許されない深い落ち込みの水準が
            約10.2dB改善します。送信電力を10倍にしたのと同等の効果を、電気を1ワットも足さずに
            アンテナの間隔だけで手に入れる——これが今日のスマホのMIMOやWi-Fiの複数アンテナの原点です。
          </p>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-sky-900/80">
          <span className="font-bold">たとえの破れ：</span>
          耳は2つの音の位相差から「方向」も聞き分けますが、選択ダイバーシティは方向推定をせず、
          単にその瞬間の強い方へ切り替えるだけです。
        </p>
        <details className="mt-3 rounded-lg border border-sky-200 bg-white/70 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-sky-900">出典・さらに学ぶ</summary>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-sky-950/80">
            <li>
              <span className="font-semibold">D. G. Brennan, “Linear Diversity Combining Techniques,” Proc. IRE, 1959</span>
              （合成方式の古典・選択合成のアウテージ解析）
            </li>
            <li>
              <span className="font-semibold">R. G. Vaughan &amp; J. B. Andersen, “Antenna Diversity in Mobile Communications,” IEEE Trans. VT, 1987</span>
              （相関√(1−ρe)補正の根拠）
            </li>
            <li>
              <span className="font-semibold">W. C. Jakes, Microwave Mobile Communications, 1974</span>
              （Clarkeモデル・ρe≈J0²(2πd/λ)）
            </li>
          </ul>
        </details>
      </Callout>

      <div>
        <p className="text-sm font-semibold text-staf-dark">設計コラム</p>
        <h2 id="diversity-column-title" className="mt-1 text-xl font-bold text-slate-950">
          アンテナ2本の価値は「平均」より深い落ち込みで現れる
        </h2>
      </div>

      <Accordion title="選択ダイバーシティとは">
        <p className="text-sm leading-relaxed text-slate-700">
          2本の受信レベルを比べ、その瞬間に良い方を選ぶ方式です。独立なレイリーフェージングなら、
          両方が同時に深く落ちる確率が積になるため、1%アウテージ点で約10.2dBの改善が得られます。
        </p>
      </Accordion>

      <Accordion title="相関が高いと効果が減る">
        <div className="space-y-3 text-sm leading-relaxed text-slate-700">
          <p>
            2本が同じ場所・同じ偏波・同じパターンを見ると同時に落ちやすくなります。本ツールのρeは
            一様到来を仮定した間隔モデルであり、実装結合や筐体は含みません。
          </p>
          <Callout tone="caution" size="sm">
            最終判断は実測ECC、放射パターン、OTAフェージング試験で確認してください。
          </Callout>
        </div>
      </Accordion>
    </section>
  );
}
