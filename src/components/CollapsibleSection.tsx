"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";
import { collapsibleStorageKey, resolveCollapsibleOpen } from "@/lib/ui/kit";

type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  /** 初回（SSR/静的HTML）の開閉。localStorage 復元前の表示に使う。 */
  defaultOpen?: boolean;
  /** 指定すると開閉状態を localStorage に記憶する（docs/ui-redesign-plan.md §2.7 の命名規約）。 */
  storageKey?: string;
};

// プログレッシブディスクロージャの標準手段（docs/ui-redesign-plan.md §2.6）。
// 中身は閉時も DOM に残し hidden で隠す（SEO・印刷CSS・クローラ対策）。開閉は button+region で制御。
export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  storageKey
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const regionId = useId();

  // マウント後に localStorage から復元する。SSR/静的HTMLは defaultOpen で描画されるため、
  // 初回描画は server と一致し、復元はここで行ってハイドレーションのずれを避ける。
  useEffect(() => {
    if (!storageKey) return;
    const stored = window.localStorage.getItem(collapsibleStorageKey(storageKey));
    setOpen(resolveCollapsibleOpen(stored, defaultOpen));
  }, [storageKey, defaultOpen]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (storageKey) {
      window.localStorage.setItem(collapsibleStorageKey(storageKey), next ? "open" : "closed");
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white/80 shadow-card">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={regionId}
        onClick={toggle}
        className="flex w-full items-center justify-between gap-3 p-4 text-left text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
      >
        {title}
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id={regionId}
        hidden={!open}
        className="px-4 pb-4 text-sm leading-relaxed text-slate-600"
      >
        {children}
      </div>
    </div>
  );
}
