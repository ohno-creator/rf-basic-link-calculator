"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  calculateLinkBudget,
  hasValidationErrors,
  type LinkBudgetInput,
  validateLinkBudgetInput
} from "@/lib/rf/linkBudget";
import { LinkActionsBar, type ShareState } from "./LinkActionsBar";
import { LinkBudgetPanel } from "./LinkBudgetPanel";
import { ResultDetails } from "./ResultDetails";
import { ResultHero } from "./ResultHero";
import { StickyResultSummary } from "./StickyResultSummary";

type CalculatorTabsProps = {
  input: LinkBudgetInput;
  onInputChange: (input: LinkBudgetInput) => void;
  onReset: () => void;
  onShare: () => void;
  shareState: ShareState;
};

const RESULT_ANCHOR_ID = "link-budget-result";

const relatedTools = [
  { href: "/tools/frequency-wavelength", label: "周波数・波長" },
  { href: "/tools/dbm-converter", label: "dBm 変換" },
  { href: "/tools/free-space-loss", label: "自由空間損失" }
];

// 滝グラフのバーをクリックしたとき、対応する入力スライダーへスクロール＋フォーカス（フォーカスリングで強調）。
function jumpToInput(key: keyof LinkBudgetInput) {
  const element = document.getElementById(String(key));
  if (!element) {
    return;
  }
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => {
    (element as HTMLElement).focus({ preventScroll: true });
  }, 220);
}

export function CalculatorTabs({
  input,
  onInputChange,
  onReset,
  onShare,
  shareState
}: CalculatorTabsProps) {
  const errors = useMemo(() => validateLinkBudgetInput(input), [input]);
  const result = useMemo(() => {
    if (hasValidationErrors(errors)) {
      return null;
    }

    try {
      return calculateLinkBudget(input);
    } catch {
      return null;
    }
  }, [errors, input]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5">
        <p className="text-sm font-semibold text-staf">メイン診断</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          入力を動かすと、右の滝グラフと判定がその場で変わります
        </h2>
      </div>

      <div className="mb-5">
        <LinkActionsBar onReset={onReset} onShare={onShare} shareState={shareState} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <LinkBudgetPanel input={input} errors={errors} onChange={onInputChange} />
        <div
          id={RESULT_ANCHOR_ID}
          className="scroll-mt-24 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-1"
        >
          <ResultHero input={input} result={result} errors={errors} onStepSelect={jumpToInput} />
        </div>
      </div>

      <div className="mt-6">
        <ResultDetails input={input} result={result} />
      </div>

      {result ? (
        <StickyResultSummary result={result} input={input} targetId={RESULT_ANCHOR_ID} />
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-4">
        <span className="text-sm font-semibold text-slate-700">単位・損失の単機能ツール</span>
        <div className="flex flex-wrap gap-2">
          {relatedTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-staf/40 hover:text-staf"
            >
              {tool.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
