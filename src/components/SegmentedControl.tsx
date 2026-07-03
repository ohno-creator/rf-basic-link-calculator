"use client";

import { useRef, type KeyboardEvent } from "react";
import { nextRovingIndex } from "@/lib/ui/kit";

type SegmentedOption<T extends string> = {
  id: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** radiogroup のラベル（スクリーンリーダー用）。 */
  ariaLabel: string;
  className?: string;
};

// 表示モード等の排他切替の統一部品（docs/ui-redesign-plan.md §2.4）。
// radiogroup＋ロービング tabindex＋矢印キー巡回。タップ高さ py-2（≥40px, Fitts's Law）。
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = ""
}: SegmentedControlProps<T>) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKey = (event: KeyboardEvent, index: number) => {
    const next = nextRovingIndex(index, event.key, options.length);
    if (next < 0) return;
    event.preventDefault();
    onChange(options[next].id);
    buttonRefs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`inline-flex rounded-lg bg-slate-100 p-1 text-sm font-bold ${className}`.trim()}
    >
      {options.map((option, index) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.id)}
            onKeyDown={(event) => handleKey(event, index)}
            className={`rounded-md px-4 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${
              active ? "bg-white text-staf-dark shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
