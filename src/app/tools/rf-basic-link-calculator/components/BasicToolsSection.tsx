import { CoaxImpedancePanel } from "./CoaxImpedancePanel";
import { FresnelZonePanel } from "./FresnelZonePanel";
import { PropagationLossPanel } from "./PropagationLossPanel";
import { VswrConverterPanel } from "./VswrConverterPanel";

/**
 * リンクバジェット診断とは独立した「単機能の基本計算ツール」をまとめるセクション。
 * それぞれが1つの値を計算し、その場で意味を解説する。
 */
export function BasicToolsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5">
        <p className="text-sm font-semibold text-staf">基本計算ツール</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">
          単機能の計算ツール集
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          リンクバジェット診断とは別に、無線設計でよく使う基本計算を、入力するとその場で結果と意味が分かる単機能ツールとしてまとめました。
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <VswrConverterPanel />
        <CoaxImpedancePanel />
        <FresnelZonePanel />
        <PropagationLossPanel />
      </div>
    </section>
  );
}
