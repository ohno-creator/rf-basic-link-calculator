"use client";

import { Check, Link2, RotateCcw, TriangleAlert } from "lucide-react";

export type ShareState = "idle" | "copied" | "error";

type LinkActionsBarProps = {
  onReset: () => void;
  onShare: () => void;
  shareState: ShareState;
};

function shareLabel(state: ShareState): string {
  if (state === "copied") {
    return "リンクをコピーしました";
  }
  if (state === "error") {
    return "コピーできませんでした";
  }
  return "条件を共有リンクでコピー";
}

export function LinkActionsBar({ onReset, onShare, shareState }: LinkActionsBarProps) {
  const ShareIcon = shareState === "copied" ? Check : shareState === "error" ? TriangleAlert : Link2;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-card">
      <p className="text-xs leading-relaxed text-slate-500">
        入力した条件はこの端末に自動保存され、URLにも反映されます。共有リンクを送れば、同じ条件をそのまま開けます。
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onShare}
          aria-live="polite"
          className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
            shareState === "copied"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : shareState === "error"
                ? "border-rose-300 bg-rose-50 text-rose-700"
                : "border-staf bg-white text-staf-dark hover:bg-staf-light"
          }`}
        >
          <ShareIcon aria-hidden="true" className="h-4 w-4" />
          {shareLabel(shareState)}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          初期値に戻す
        </button>
      </div>
    </div>
  );
}
