import { TriangleAlert } from "lucide-react";
import { Callout } from "@/components/Callout";
import type { PropagationWarning } from "@/lib/rf/linkBudget";

type PropagationWarningsProps = {
  warnings: PropagationWarning[];
  compact?: boolean;
};

export function PropagationWarnings({ warnings, compact = false }: PropagationWarningsProps) {
  if (warnings.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <details className="group rounded-lg border border-amber-200 bg-amber-50 text-amber-950">
        <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-bold">
          <span className="flex items-center gap-2">
            <TriangleAlert aria-hidden="true" className="h-4 w-4" />
            伝搬モデルの注意
          </span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs">{warnings.length}件</span>
        </summary>
        <ul className="space-y-2 border-t border-amber-200 px-4 py-3 text-xs leading-relaxed">
          {warnings.map((warning) => <li key={warning.id}>{warning.message}</li>)}
        </ul>
      </details>
    );
  }

  return (
    <Callout
      tone="caution"
      size="md"
      icon={<TriangleAlert aria-hidden="true" className="h-5 w-5" />}
      title="伝搬モデルの注意"
    >
      <ul className="mt-2 space-y-2 text-sm leading-relaxed">
        {warnings.map((warning) => (
          <li key={warning.id}>{warning.message}</li>
        ))}
      </ul>
    </Callout>
  );
}
