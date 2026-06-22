"use client";

import { useEffect, useId, useRef, useState } from "react";

// アプリ共通のヘルプツールチップ（単一の正本）。
// デスクトップはホバー/フォーカス、タッチ端末はタップで開閉。タッチターゲットを実質40px以上に
// 拡張し、aria-describedby で本文をスクリーンリーダーに渡す（aria-label は操作名で二重読み回避）。
export function HelpHint({ text }: { text: string }) {
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
    <span ref={ref} className="group/hint relative inline-flex align-middle">
      <button
        type="button"
        aria-label="説明を表示"
        aria-describedby={tooltipId}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-sky-300 bg-sky-50 text-[11px] font-bold text-sky-700 transition before:absolute before:-inset-2.5 before:content-[''] hover:bg-sky-100 hover:text-sky-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        ?
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-white shadow-xl group-hover/hint:block group-focus-within/hint:block sm:w-72 ${
          open ? "block" : "hidden"
        }`}
      >
        {text}
      </span>
    </span>
  );
}
