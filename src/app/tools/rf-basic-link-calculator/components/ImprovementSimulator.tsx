import { ArrowRight } from "lucide-react";
import { Card } from "@/components/Card";
import { simulateImprovements } from "@/lib/rf/chartData";
import { formatSigned } from "@/lib/rf/format";
import type { LinkBudgetInput, LinkBudgetResult } from "@/lib/rf/linkBudget";

type ImprovementSimulatorProps = {
  input: LinkBudgetInput;
  result: LinkBudgetResult;
};

export function ImprovementSimulator({ input, result }: ImprovementSimulatorProps) {
  const simulations = simulateImprovements(input);

  return (
    <Card as="section" padding="lg">
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
          <Card key={simulation.label} variant="slate" padding="md" shadow={false}>
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
          </Card>
        ))}
      </div>

      <p className="mt-5 text-sm leading-relaxed text-slate-600">
        アンテナ改善、配置改善、筐体影響の低減が通信余裕に効くことを確認できます。
      </p>
    </Card>
  );
}
