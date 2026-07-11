import { Accordion } from "@/components/Accordion";
import { Callout } from "@/components/Callout";

export function DiversityGainColumn() {
  return <section className="mt-8 space-y-4" aria-labelledby="diversity-column-title"><div><p className="text-sm font-semibold text-staf-dark">設計コラム</p><h2 id="diversity-column-title" className="mt-1 text-xl font-bold text-slate-950">アンテナ2本の価値は「平均」より深い落ち込みで現れる</h2></div><Accordion title="選択ダイバーシティとは"><p className="text-sm leading-relaxed text-slate-700">2本の受信レベルを比べ、その瞬間に良い方を選ぶ方式です。独立なレイリーフェージングなら、両方が同時に深く落ちる確率が積になるため、1%アウテージ点で約10.2dBの改善が得られます。</p></Accordion><Accordion title="相関が高いと効果が減る"><div className="space-y-3 text-sm leading-relaxed text-slate-700"><p>2本が同じ場所・同じ偏波・同じパターンを見ると同時に落ちやすくなります。本ツールのρeは一様到来を仮定した間隔モデルであり、実装結合や筐体は含みません。</p><Callout tone="caution" size="sm">最終判断は実測ECC、放射パターン、OTAフェージング試験で確認してください。</Callout></div></Accordion></section>;
}
