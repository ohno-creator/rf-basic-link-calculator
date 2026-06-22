import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

type AccordionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-lg border border-slate-200 bg-white/80 p-4 shadow-card"
    >
      <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-staf/30">
        {title}
        <ChevronDown
          aria-hidden="true"
          className="h-4 w-4 text-slate-500 transition group-open:rotate-180"
        />
      </summary>
      <div className="mt-3 text-sm leading-relaxed text-slate-600">{children}</div>
    </details>
  );
}
