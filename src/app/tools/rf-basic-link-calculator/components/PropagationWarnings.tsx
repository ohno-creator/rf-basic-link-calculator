import { TriangleAlert } from "lucide-react";
import { Callout } from "@/components/Callout";
import type { PropagationWarning } from "@/lib/rf/linkBudget";

type PropagationWarningsProps = {
  warnings: PropagationWarning[];
};

export function PropagationWarnings({ warnings }: PropagationWarningsProps) {
  if (warnings.length === 0) {
    return null;
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
