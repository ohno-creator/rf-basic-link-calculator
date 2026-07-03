"use client";

import { useEffect, useRef, type RefObject } from "react";

// ポップオーバー（ツールチップ/ヘルプ）共通の「閉じる」挙動。
// 開いている間だけ、外側クリック（mousedown）と Escape で閉じる。
// Tooltip と HelpHint が同一実装を重複して持っていたのを1つに集約（docs/ui-redesign-plan.md §2.3）。
export function usePopoverDismiss(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void
): void {
  // onClose を ref 経由で参照し、effect の依存を [open, ref] に保つ（毎レンダーの再購読を避ける）。
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onCloseRef.current();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, ref]);
}
