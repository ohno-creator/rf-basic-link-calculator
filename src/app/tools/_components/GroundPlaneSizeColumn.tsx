import { Accordion } from "@/components/Accordion";
import { Callout } from "@/components/Callout";

export function GroundPlaneSizeColumn() {
  return <section className="mt-8 space-y-4" aria-labelledby="ground-plane-column-title"><div><p className="text-sm font-semibold text-staf-dark">設計コラム</p><h2 id="ground-plane-column-title" className="mt-1 text-xl font-bold text-slate-950">アンテナだけでなく、基板GNDも放射体の一部</h2></div><Accordion title="なぜλ/4が目安？"><p className="text-sm leading-relaxed text-slate-700">モノポールや多くの小型PCBアンテナは、基板GNDを対向する放射体として利用します。最長辺が短くなると電流分布が形成しにくくなり、共振ずれ、整合悪化、放射効率低下が重なります。</p></Accordion><Accordion title="この表で決め切れないもの"><div className="space-y-3 text-sm leading-relaxed text-slate-700"><p>同じGND長でも幅、層構成、給電位置、筐体、ケーブル、電池で結果は変わります。本値はλ/4系アンテナの初期目安です。</p><Callout tone="caution" size="sm">最終判断は対象アンテナの評価基板条件と比較し、実装状態でS11・効率・放射パターンを測定してください。</Callout></div></Accordion></section>;
}
