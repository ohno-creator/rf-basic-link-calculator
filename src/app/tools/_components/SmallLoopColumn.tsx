import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";
import { calculateSmallLoop } from "@/lib/rf/antenna";
import { formatNumber } from "@/lib/rf/format";

type SmallLoopColumnProps = {
  frequencyMHz: number;
  loopDiameterMm: number;
  wireDiameterMm: number;
  turns: number;
};

/** 現在入力に連動するライブコラム（PatchAntennaColumn と同様式）。計算不能な入力では静的文のみ表示する。 */
export function SmallLoopColumn({ frequencyMHz, loopDiameterMm, wireDiameterMm, turns }: SmallLoopColumnProps) {
  let live: { inductanceNh: number; capacitancePf: number; circumferenceLambda: number } | null = null;
  try {
    const result = calculateSmallLoop({ frequencyMHz, loopDiameterMm, wireDiameterMm, turns });
    live = {
      inductanceNh: result.inductanceH * 1e9,
      capacitancePf: result.capacitanceF * 1e12,
      circumferenceLambda: result.circumferenceLambda
    };
  } catch {
    live = null;
  }

  return (
    <div data-testid="small-loop-column">
      <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
        <h2 className="text-base font-bold">コラム：財布の中のアンテナは、アンテナではなかった</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
          <p>
            交通系ICカードやスマホのNFCは13.56MHzで動きます。波長はおよそ22m。カードの中のループは
            一辺数cmですから、波長の1/300ほどしかない「絶望的に小さいアンテナ」です。まともに電波を
            放射できるサイズではないのに、改札では毎日確実に動く——なぜでしょうか。
          </p>
          <p>
            種明かしは、あれが「電波を飛ばす装置」ではなく「空芯トランスの片割れ」だからです。改札機の
            ループが作る磁界の中にカードのループが入ると、トランスの一次・二次巻線のように結合して
            電力とデータが渡ります。遠くへ放射する必要がないので、小ささは欠点になりません。
            そして小さなループの弱い誘導起電力を実用レベルに引き上げるのが、このツールで計算している
            共振コンデンサです。LとCを狙いの周波数でぴったり共振させると、回路のQ倍（数十倍）の電圧が
            コンデンサ両端に立ち上がります。
            {live
              ? `いまの入力（直径${formatNumber(loopDiameterMm, 0)}mm・${formatNumber(turns, 0)}巻）なら、L≈${formatNumber(live.inductanceNh, 1)}nH に C≈${formatNumber(live.capacitancePf, 1)}pF を組み合わせる計算です。`
              : ""}
          </p>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-sky-900/80">
          <span className="font-bold">たとえの破れ：</span>
          トランスの喩えは近距離（周長が波長より十分小さく、相手が磁界の届く範囲にいる）でだけ成り立ちます。
          {live ? `いまの条件の周長は ${formatNumber(live.circumferenceLambda, 3)}λ——` : ""}
          周長が波長に近づくか距離が波長スケールに離れると、結合ではなく放射が主役になり、
          このページの静電容量計算の前提（小型ループ近似）も崩れます。
        </p>
        <details className="mt-3 rounded-lg border border-sky-200 bg-white/70 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-sky-900">出典・さらに学ぶ</summary>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-sky-950/80">
            <li>
              <span className="font-semibold">C. A. Balanis, Antenna Theory: Analysis and Design, 4th ed. (2016), Ch. 5</span>
              （小型ループの放射理論・放射抵抗が (C/λ)⁴ に比例して急落する導出）
            </li>
            <li>
              <a
                className="font-semibold underline"
                href="https://doi.org/10.6028/bulletin.088"
                target="_blank"
                rel="noreferrer"
              >
                E. B. Rosa, “The Self and Mutual Inductances of Linear Conductors” (1908)
              </a>
              （本ツールの円形ループ自己インダクタンス式の原典）
            </li>
            <li>
              <span className="font-semibold">W. L. Stutzman &amp; G. A. Thiele, Antenna Theory and Design, 3rd ed. (2012), Ch. 5</span>
              （ループのインピーダンスと外部容量による共振設計）
            </li>
          </ul>
        </details>
      </Callout>
    </div>
  );
}
