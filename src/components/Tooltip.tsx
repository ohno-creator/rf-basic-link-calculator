"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

type TooltipProps = {
  term: string;
  children: ReactNode;
};

// 用語インラインのヘルプ。HelpHint と同じダーク吹き出し・タップ開閉・aria-describedby に統一。
export function Tooltip({ term, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className="group/tip relative inline-flex items-center">
      <button
        type="button"
        aria-describedby={tooltipId}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1 rounded-full border border-staf/30 bg-white px-2 py-0.5 text-xs font-semibold text-staf-dark shadow-card transition hover:border-staf/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
      >
        {term}
        <span aria-hidden="true" className="text-[10px]">
          ?
        </span>
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute left-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-slate-700 bg-slate-900 p-3 text-left text-xs leading-relaxed text-white shadow-xl group-hover/tip:block group-focus-within/tip:block ${
          open ? "block" : "hidden"
        }`}
      >
        {children}
      </span>
    </span>
  );
}
