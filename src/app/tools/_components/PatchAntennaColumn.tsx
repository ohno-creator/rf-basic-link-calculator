import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";
import { calculatePatchAntenna } from "@/lib/rf/antenna";
import { formatNumber } from "@/lib/rf/format";

type PatchAntennaColumnProps = {
  frequencyMHz: number;
  dielectricConstant: number;
  substrateHeightMm: number;
};

export function PatchAntennaColumn({
  frequencyMHz,
  dielectricConstant,
  substrateHeightMm
}: PatchAntennaColumnProps) {
  const result = calculatePatchAntenna({ frequencyMHz, dielectricConstant, substrateHeightMm });
  const fringeExtensionMm = result.deltaLM * 2000;

  return (
    <div data-testid="patch-antenna-column">
      <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
        <h2 className="text-base font-bold">コラム：パッチは、見えない電界のぶんだけ短く切る</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
          <p>
            パッチの金属板は端で突然終わりますが、電界はそこで止まらず、空気側へ弧を描いて染み出します。
            この<strong>フリンジ電界</strong>のぶんだけ、電波には金属板が実物より長く見えます。そこでCAD上の長さは、
            基板中の半波長から両端の伸びを引いて決めます。
          </p>
          <p>
            現在の条件では、見かけの比誘電率は
            <strong className="tabular-nums"> {formatNumber(result.effectiveEr, 2)}</strong>、両端を合わせた伸びは
            <strong className="tabular-nums" data-testid="patch-column-fringe"> {formatNumber(fringeExtensionMm, 2)} mm</strong>。
            その補正後の初期寸法が
            <strong className="tabular-nums"> W {formatNumber(result.widthM * 1000, 2)} mm × L {formatNumber(result.lengthM * 1000, 2)} mm</strong>
            です。
          </p>
          <p>
            ただし、これは無限に広いGNDと単純な給電を想定した伝送線路モデルの出発点です。給電位置、GND端、
            銅厚、基板損失、筐体で共振は動くため、最後はEM解析か試作実測で追い込みます。
          </p>
        </div>
        <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-sky-900">深掘り（式・適用条件・出典）</summary>
          <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80 break-words">
            <p>
              W = c₀/(2f₀)√(2/(εr+1))、εeff = (εr+1)/2 + (εr-1)/2·(1+12h/W)<sup>-1/2</sup>。
              端部補正 ΔL = 0.412h·((εeff+0.3)(W/h+0.264))/((εeff-0.258)(W/h+0.8)) を使い、
              L = c₀/(2f₀√εeff) - 2ΔL とする。
            </p>
            <p>
              εrだけで c₀/(2f₀√εr) と置くと、空気側への電界の染み出しと端部延長を落とすため、狙った共振周波数から
              数%級にずれることがある。薄い基板上の基本矩形パッチの初期設計に適用し、最終値とはみなさない。
            </p>
            <p>
              出典: C. A. Balanis, <i>Antenna Theory: Analysis and Design</i>, 4th ed., Sec. 14.2／
              <a className="font-semibold underline" href="https://ieeexplore.ieee.org/document/1622204" target="_blank" rel="noreferrer">
                E. O. Hammerstad, “Equations for Microstrip Circuit Design” (1975)
              </a>。
            </p>
          </div>
        </details>
      </Callout>
    </div>
  );
}
