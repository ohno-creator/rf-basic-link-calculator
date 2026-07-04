import { Accordion } from "@/components/Accordion";
import { COLUMN_URL } from "@/lib/rf/presets";
import type { ReactNode } from "react";

type FormulaExplanationCardProps = {
  title: string;
  formula: string;
  children: ReactNode;
  /** BasicToolPageShell側にコラム導線がある場合はfalseにして重複を避ける。 */
  showColumnLink?: boolean;
};

export function FormulaExplanationCard({
  title,
  formula,
  children,
  showColumnLink = true
}: FormulaExplanationCardProps) {
  return (
    <div className="space-y-3">
      <Accordion title={title}>
        <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-white">
          <code>{formula}</code>
        </pre>
        <div className="mt-3">{children}</div>
      </Accordion>
      {showColumnLink ? (
        <a className="text-sm font-semibold text-staf-dark hover:text-staf-dark" href={COLUMN_URL}>
          この計算の詳しい解説を読む
        </a>
      ) : null}
    </div>
  );
}
