import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";
import { calculateRadiationResistance, type ShortAntennaKind } from "@/lib/rf/antenna";
import { formatNumber } from "@/lib/rf/format";

type RadiationResistanceColumnProps = {
  frequencyMHz: number;
  lengthMm: number;
  lossResistanceOhm: number;
  kind: ShortAntennaKind;
};

export function RadiationResistanceColumn({
  frequencyMHz,
  lengthMm,
  lossResistanceOhm,
  kind
}: RadiationResistanceColumnProps) {
  const result = calculateRadiationResistance({ frequencyMHz, lengthMm, lossResistanceOhm, kind });
  const isMonopole = kind === "monopole";

  return (
    <div data-testid="radiation-resistance-column">
      <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
        <h2 className="text-base font-bold">コラム：S11が良くても、電力は空へ出たとは限らない</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
          <p>
            ネットワークアナライザが見るのは、端子へ戻ってきた電力です。戻らなかった電力が電波になったのか、
            コイルや導体の熱になったのかまでは区別しません。整合の良さと放射の良さは、別々に確かめる必要があります。
          </p>
          <p>
            現在の{isMonopole ? "短いモノポール" : "短いダイポール"}では、放射抵抗は
            <strong className="tabular-nums" data-testid="radiation-column-resistance"> {formatNumber(result.radiationResistanceOhm, 2)} Ω</strong>、
            損失抵抗 <span className="tabular-nums">{formatNumber(lossResistanceOhm, 2)} Ω</span> を含めた放射効率は
            <strong className="tabular-nums"> {formatNumber(result.efficiencyPercent, 1)}%</strong> です。
            放射抵抗が小さいほど、わずか数Ωの損失が効率を大きく奪います。
          </p>
          <p>
            例えば放射抵抗1Ω、損失抵抗9Ωなら、端子を50Ωへ完全整合しても放射効率は10%です。残る90%は熱になります。
            S11やVSWRだけで合否を決めず、OTA測定のTRP、利得、放射効率まで確認します。
          </p>
        </div>
        <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-sky-900">深掘り（式・適用条件・出典）</summary>
          <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80 break-words">
            <p>
              三角形電流分布を仮定する短い線状アンテナでは、ダイポール全長 l に対して
              Rr ≈ 20π²(l/λ)²、完全導体の無限地板上に立つモノポール高さ h に対して
              Rr ≈ 40π²(h/λ)²。効率は η = Rr/(Rr+Rloss) で求める。
            </p>
            <p>
              lまたはhが波長に比べて十分短く、細線かつ正弦波ではなく三角形の電流分布で近似できる範囲が前提。
              実機の有限GND、整合回路、誘電体、筐体電流は別途評価する。
            </p>
            <p>
              出典: C. A. Balanis, <i>Antenna Theory: Analysis and Design</i>, 4th ed., Ch. 4／
              W. L. Stutzman &amp; G. A. Thiele, <i>Antenna Theory and Design</i>, 3rd ed., Sec. 2.6／
              <a className="font-semibold underline" href="https://ieeexplore.ieee.org/document/1142106" target="_blank" rel="noreferrer">
                H. A. Wheeler, “Small antennas” (1975)
              </a>。
            </p>
          </div>
        </details>
      </Callout>
    </div>
  );
}
