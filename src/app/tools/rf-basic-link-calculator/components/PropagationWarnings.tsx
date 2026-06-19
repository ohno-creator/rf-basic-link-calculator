import { TriangleAlert } from "lucide-react";
import type { PropagationWarning } from "@/lib/rf/linkBudget";

type PropagationWarningsProps = {
  warnings: PropagationWarning[];
};

export function PropagationWarnings({ warnings }: PropagationWarningsProps) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950 shadow-sm">
      <div className="flex items-start gap-3">
        <TriangleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div>
          <h3 className="text-sm font-bold">伝搬モデルの注意</h3>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed">
            {warnings.map((warning) => (
              <li key={warning.id}>{warning.message}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
