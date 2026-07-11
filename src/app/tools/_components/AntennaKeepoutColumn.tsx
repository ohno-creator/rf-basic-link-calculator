import { Accordion } from "@/components/Accordion";
import { Callout } from "@/components/Callout";

export function AntennaKeepoutColumn() {
  return (
    <section className="mt-8 space-y-4" aria-labelledby="keepout-column-title">
      <div>
        <p className="text-sm font-semibold text-staf-dark">設計コラム</p>
        <h2 id="keepout-column-title" className="mt-1 text-xl font-bold text-slate-950">
          空き面積が同じでも、アンテナは置けるとは限らない
        </h2>
      </div>
      <Accordion title="WとHを別々に見る理由">
        <p className="text-sm leading-relaxed text-slate-700">
          アンテナの給電方向、基板端、GND端の向きには意味があります。幅の余りで高さ不足を相殺したり、
          自動的に90度回転したりせず、データシートの基準図と同じ向きで各辺を比較してください。
        </p>
      </Accordion>
      <Accordion title="代表値から製品設計へ">
        <div className="space-y-3 text-sm leading-relaxed text-slate-700">
          <p>
            表の値はJohanson、Ignion、Molex、Taoglas等の代表的な推奨実装を整理した初期目安です。
            同じ周波数・同じアンテナ種別でも品番ごとに必要GND、禁止銅箔、基板端条件が変わります。
          </p>
          <Callout tone="caution" size="sm">
            部品選定後は対象品番の最新データシートを正とし、筐体・電池・ケーブルを含む実装状態で
            S11と放射効率を確認してください。
          </Callout>
        </div>
      </Accordion>
    </section>
  );
}
