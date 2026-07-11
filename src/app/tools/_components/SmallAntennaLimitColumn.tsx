import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";
import { calculateSmallAntennaLimit } from "@/lib/rf/antenna";
import { formatNumber } from "@/lib/rf/format";

type SmallAntennaLimitColumnProps = {
  frequencyMHz: number;
  radiusMm: number;
  targetBandwidthPercent: number;
};

const SMALL_24_GHZ_EXAMPLE = calculateSmallAntennaLimit({
  frequencyMHz: 2400,
  radiusMm: 3.5,
  targetBandwidthPercent: (100 / 2400) * 100
});

export function SmallAntennaLimitColumn({
  frequencyMHz,
  radiusMm,
  targetBandwidthPercent
}: SmallAntennaLimitColumnProps) {
  const result = calculateSmallAntennaLimit({ frequencyMHz, radiusMm, targetBandwidthPercent });
  const limitBandwidthMHz = frequencyMHz * result.maxFractionalBandwidthPercent / 100;
  const targetBandwidthMHz = frequencyMHz * targetBandwidthPercent / 100;

  return (
    <div data-testid="small-antenna-limit-column">
      <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
        <h2 className="text-base font-bold">コラム：小型・高効率・広帯域は、同時に取り切れない</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
          <p>
            アンテナを小さな球へ押し込むほど、周囲に蓄える電磁エネルギーが、外へ放射するエネルギーより急速に大きくなります。
            その比を表すQが上がると共振は鋭くなり、整合できる帯域は狭くなります。これは形状の工夫だけでは消せない物理制約です。
          </p>
          <p>
            現在の包含球半径では <strong className="tabular-nums">ka = {formatNumber(result.ka, 3)}</strong>、
            最小Qの目安は <strong className="tabular-nums">{formatNumber(result.chuQ, 1)}</strong>、1/Qで見た帯域上限は
            <strong className="tabular-nums" data-testid="small-antenna-column-bandwidth"> {formatNumber(result.maxFractionalBandwidthPercent, 2)}%</strong>
            （約 <span className="tabular-nums">{formatNumber(limitBandwidthMHz, 1)} MHz</span>）です。
            目標の <span className="tabular-nums">{formatNumber(targetBandwidthMHz, 1)} MHz</span> と同じ単位で比較できます。
          </p>
          <p>
            2.4GHzで半径3.5mmなら、計算上の上限は約
            <span className="tabular-nums"> {formatNumber(SMALL_24_GHZ_EXAMPLE.maxFractionalBandwidthPercent, 2)}%</span>
            （約 <span className="tabular-nums">{formatNumber(2400 * SMALL_24_GHZ_EXAMPLE.maxFractionalBandwidthPercent / 100, 1)} MHz</span>）。
            100MHzを要求する前に、GNDを含むアンテナ空間を広げる交渉が必要です。
          </p>
        </div>
        <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-sky-900">深掘り（式・適用条件・出典）</summary>
          <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80 break-words">
            <p>
              ka = 2πa/λ。ここでaは放射体だけでなく、放射に関与するGNDを含めて包む最小球の半径。
              電気的に小さい領域では Qmin = 1/(ka)³ + 1/(ka)、粗い比帯域上限を FBW ≈ 1/Qmin とする。
              許容VSWRをSと置く場合は FBW ≈ (S-1)/(Q√S) のように判定条件へ依存する。
            </p>
            <p>
              この値は損失のない受動アンテナに対する物理限界の目安で、実アンテナの達成値を保証しない。損失を増やせば見かけの帯域は
              広げられるが、放射効率を失う。能動・非フォスター整合には別の安定性と雑音の評価が必要になる。
            </p>
            <p>
              出典: <a className="font-semibold underline" href="https://doi.org/10.1063/1.1697938" target="_blank" rel="noreferrer">L. J. Chu (1948)</a>／
              <a className="font-semibold underline" href="https://ieeexplore.ieee.org/document/491132" target="_blank" rel="noreferrer">J. S. McLean (1996), Eq. 21</a>／
              <a className="font-semibold underline" href="https://ieeexplore.ieee.org/document/1697253" target="_blank" rel="noreferrer">H. A. Wheeler (1947)</a>。
            </p>
          </div>
        </details>
      </Callout>
    </div>
  );
}
