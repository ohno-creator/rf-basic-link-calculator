import type { ReactNode } from "react";

type TooltipProps = {
  term: string;
  children: ReactNode;
};

export function Tooltip({ term, children }: TooltipProps) {
  return (
    <span className="group relative inline-flex items-center">
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-full border border-staf/20 bg-white px-2 py-0.5 text-xs font-semibold text-staf shadow-sm transition hover:border-staf/50 focus:outline-none focus:ring-2 focus:ring-staf/30"
        aria-label={`${term}の説明`}
      >
        {term}
        <span aria-hidden="true" className="text-[10px]">
          ?
        </span>
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-slate-200 bg-white p-3 text-left text-xs leading-relaxed text-slate-700 opacity-0 shadow-soft transition group-hover:opacity-100 group-focus-within:opacity-100 sm:left-0 sm:right-auto"
      >
        {children}
      </span>
    </span>
  );
}
