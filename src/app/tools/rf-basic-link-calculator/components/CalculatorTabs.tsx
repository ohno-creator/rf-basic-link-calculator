"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  calculateLinkBudget,
  hasValidationErrors,
  type LinkBudgetInput,
  validateLinkBudgetInput
} from "@/lib/rf/linkBudget";
import { resolveLinkBudgetErrors } from "@/lib/linkBudgetErrorMessages";
import { HataColumn } from "@/app/tools/_components/HataColumn";
import { LinkAssumptionDiagram } from "./LinkAssumptionDiagram";
import { LinkActionsBar, type ShareState } from "./LinkActionsBar";
import { GuidedLinkBudget } from "./GuidedLinkBudget";
import { LinkBudgetPanel } from "./LinkBudgetPanel";
import { ResearchDistanceSheet } from "./ResearchDistanceSheet";
import { ResultDetails } from "./ResultDetails";
import { ResultHero } from "./ResultHero";
import { StickyResultSummary } from "./StickyResultSummary";
import { CompactLinkBudgetPanel } from "./CompactLinkBudgetPanel";

export type CalculatorMode = "guided" | "expert";

type CalculatorTabsProps = {
  input: LinkBudgetInput;
  onInputChange: (input: LinkBudgetInput) => void;
  onReset: () => void;
  onShare: () => void;
  shareState: ShareState;
  mode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
};

const RESULT_ANCHOR_ID = "link-budget-result";

const relatedTools = [
  { href: "/tools/ncu-below-ground", label: "GL以下NCU診断" },
  { href: "/tools/frequency-wavelength", label: "周波数・波長" },
  { href: "/tools/dbm-converter", label: "dBm 変換" },
  { href: "/tools/free-space-loss", label: "自由空間損失" }
];

const sheets = [
  {
    id: "link-budget",
    label: "リンクバジェット",
    description: "現在の距離で通信成立の余裕を見る"
  },
  {
    id: "research-distance",
    label: "研究ベース距離計算",
    description: "信頼率とばらつき込みで最大距離を逆算する"
  }
] as const;

type SheetId = (typeof sheets)[number]["id"];

// 滝グラフのバーをクリックしたとき、対応する入力スライダーへスクロール＋フォーカス（フォーカスリングで強調）。
function jumpToInput(key: keyof LinkBudgetInput) {
  const element = document.getElementById(String(key));
  if (!element) {
    return;
  }
  // 折りたたみ（端末近傍損失の内訳など）の中にある入力は、先に開いてからスクロール・フォーカスする。
  const collapsible = element.closest("details");
  if (collapsible && !collapsible.open) {
    collapsible.open = true;
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
  shareState,
  mode,
  onModeChange
}: CalculatorTabsProps) {
  const [activeSheet, setActiveSheet] = useState<SheetId>("link-budget");
  const [inputMode, setInputMode] = useState<"quick" | "guided">("quick");
  const errors = useMemo(() => validateLinkBudgetInput(input), [input]);
  // コード → 表示用の日本語文言はUI境界のここで解決し、以降の表示コンポーネントへは文言を渡す。
  const errorMessages = useMemo(() => resolveLinkBudgetErrors(errors), [errors]);
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
    <section className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8 lg:pb-10">
      <div className="mb-5">
        <p className="text-sm font-semibold text-staf-dark">メイン診断</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          リンクバジェットと研究ベース距離計算を切り替えて確認できます
        </h2>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="入力モード"
          className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-card"
        >
          {(
            [
              { id: "guided", label: "かんたん" },
              { id: "expert", label: "詳細" }
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={mode === option.id}
              data-testid={`calculator-mode-${option.id}`}
              onClick={() => onModeChange(option.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${
                mode === option.id ? "bg-staf text-white" : "text-slate-600 hover:text-staf-dark"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <LinkActionsBar onReset={onReset} onShare={onShare} shareState={shareState} />
      </div>

      <div className="mb-5 rounded-lg border border-slate-200 bg-white p-2 shadow-card">
        <div role="tablist" aria-label="計算シート" className="grid gap-2 sm:grid-cols-2">
          {sheets.map((sheet) => {
            const selected = activeSheet === sheet.id;
            return (
              <button
                key={sheet.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`rounded-md px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-staf/40 ${
                  selected ? "bg-staf text-white shadow-card" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => setActiveSheet(sheet.id)}
              >
                <span className="block text-sm font-bold">{sheet.label}</span>
                <span className={`mt-1 block text-xs ${selected ? "text-white/85" : "text-slate-500"}`}>
                  {sheet.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeSheet === "link-budget" && mode === "guided" ? (
        <GuidedLinkBudget
          input={input}
          result={result}
          onChange={onInputChange}
          onOpenExpert={() => onModeChange("expert")}
        />
      ) : null}

      {activeSheet === "link-budget" && mode === "expert" ? (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-2 shadow-card">
            <div role="group" aria-label="入力表示" className="grid flex-1 grid-cols-2 gap-1 sm:flex-none">
              <button
                type="button"
                aria-pressed={inputMode === "quick"}
                onClick={() => setInputMode("quick")}
                className={`rounded-md px-4 py-2 text-sm font-bold transition ${inputMode === "quick" ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                クイック調整
              </button>
              <button
                type="button"
                aria-pressed={inputMode === "guided"}
                onClick={() => setInputMode("guided")}
                className={`rounded-md px-4 py-2 text-sm font-bold transition ${inputMode === "guided" ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                解説付き入力
              </button>
            </div>
            <p className="px-2 text-xs text-slate-500">入力値はそのまま、表示だけ切り替わります</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="order-2 lg:order-1">
              {inputMode === "quick" ? (
                <CompactLinkBudgetPanel input={input} errors={errorMessages} onChange={onInputChange} />
              ) : (
                <LinkBudgetPanel input={input} errors={errorMessages} onChange={onInputChange} />
              )}
            </div>
            <div
              id={RESULT_ANCHOR_ID}
              className="order-1 scroll-mt-24 lg:order-2 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1"
            >
              <ResultHero
                input={input}
                result={result}
                errors={errorMessages}
                onStepSelect={jumpToInput}
                compact={inputMode === "quick"}
              />
            </div>
          </div>

          {result ? (
            <div className="mt-6">
              <LinkAssumptionDiagram input={input} result={result} />
            </div>
          ) : null}

          <div className="mt-6">
            <ResultDetails input={input} result={result} />
          </div>
        </>
      ) : null}

      {activeSheet === "research-distance" ? <ResearchDistanceSheet baseInput={input} /> : null}

      {result && activeSheet === "link-budget" && mode === "expert" ? (
        <StickyResultSummary result={result} input={input} targetId={RESULT_ANCHOR_ID} />
      ) : null}

      <div className="mt-8">
        <HataColumn />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-4">
        <span className="text-sm font-semibold text-slate-700">単位・損失の単機能ツール</span>
        <div className="flex flex-wrap gap-2">
          {relatedTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-staf/40 hover:text-staf-dark"
            >
              {tool.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
