import { ArrowRight, MessageSquareText } from "lucide-react";
import { simulateImprovements } from "@/lib/rf/chartData";
import { formatSigned } from "@/lib/rf/format";
import type { LinkBudgetInput, LinkBudgetResult } from "@/lib/rf/linkBudget";
import { CONTACT_URL } from "@/lib/rf/presets";

type ImprovementSimulatorProps = {
  input: LinkBudgetInput;
  result: LinkBudgetResult;
};

export function ImprovementSimulator({ input, result }: ImprovementSimulatorProps) {
  const simulations = simulateImprovements(input);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-950">改善したらどうなる？</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            どの改善がリンクマージンに効くのかを、現在条件から比較します。
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 px-4 py-3 text-right">
          <p className="text-xs text-slate-500">現在のリンクマージン</p>
          <p className="text-xl font-bold text-slate-950">
            {formatSigned(result.linkMarginDb, "dB")}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {simulations.map((simulation) => (
          <div key={simulation.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-950">{simulation.label}</p>
              <ArrowRight aria-hidden="true" className="h-4 w-4 text-staf-dark" />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              {simulation.description}
            </p>
            <p className="mt-3 text-2xl font-bold text-staf-dark">
              {formatSigned(simulation.marginDb, "dB")}
            </p>
            <p className="text-xs font-medium text-slate-500">
              現在比 {formatSigned(simulation.deltaDb, "dB")}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-staf/20 bg-staf-light p-4">
        <p className="text-sm leading-relaxed text-slate-700">
          アンテナ改善、配置改善、筐体影響の低減が通信余裕に効くことを確認できます。
          実機条件に合わせた改善案は、スタッフ株式会社へご相談ください。
        </p>
        <a
          className="mt-3 inline-flex items-center gap-2 rounded-md bg-staf px-4 py-2 text-sm font-semibold text-white transition hover:bg-staf-dark"
          href={CONTACT_URL}
        >
          <MessageSquareText aria-hidden="true" className="h-4 w-4" />
          改善案を相談する
        </a>
      </div>
    </section>
  );
}
