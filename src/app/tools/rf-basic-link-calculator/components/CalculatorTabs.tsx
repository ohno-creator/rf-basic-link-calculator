"use client";

import { useMemo, useState } from "react";
import {
  calculateLinkBudget,
  hasValidationErrors,
  type LinkBudgetInput,
  validateLinkBudgetInput
} from "@/lib/rf/linkBudget";
import { DbmConverterPanel } from "./DbmConverterPanel";
import { FrequencyWavelengthPanel } from "./FrequencyWavelengthPanel";
import { FsplPanel } from "./FsplPanel";
import { InputImpactGuide } from "./InputImpactGuide";
import { LinkActionsBar, type ShareState } from "./LinkActionsBar";
import { LinkBudgetPanel } from "./LinkBudgetPanel";
import { ResultCard } from "./ResultCard";
import { StickyResultSummary } from "./StickyResultSummary";

type CalculatorTabsProps = {
  input: LinkBudgetInput;
  onInputChange: (input: LinkBudgetInput) => void;
  onReset: () => void;
  onShare: () => void;
  shareState: ShareState;
};

type TabId = "link" | "frequency" | "dbm" | "fspl";

const tabs: Array<{ id: TabId; label: string; description: string }> = [
  { id: "link", label: "リンクバジェット簡易診断", description: "通信余裕を見る" },
  { id: "frequency", label: "周波数・波長", description: "アンテナサイズ感" },
  { id: "dbm", label: "dBm変換", description: "電力単位の変換" },
  { id: "fspl", label: "自由空間損失", description: "距離による損失" }
];

const RESULT_ANCHOR_ID = "link-budget-result";

export function CalculatorTabs({
  input,
  onInputChange,
  onReset,
  onShare,
  shareState
}: CalculatorTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("link");
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
        <h2 className="mt-2 text-2xl font-bold text-slate-950">
          入力を動かすと、結果・図解・改善案がリアルタイムで変わります
        </h2>
      </div>

      <div className="mb-5 grid gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm md:grid-cols-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              className={`rounded-md px-3 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-staf/30 ${
                isActive ? "bg-staf text-white shadow-sm" : "text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="block text-sm font-semibold">{tab.label}</span>
              <span className={`mt-1 block text-xs ${isActive ? "text-white/80" : "text-slate-500"}`}>
                {tab.description}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === "link" ? (
        <>
          <div className="mb-5">
            <LinkActionsBar onReset={onReset} onShare={onShare} shareState={shareState} />
          </div>
          <InputImpactGuide />
          <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <LinkBudgetPanel input={input} errors={errors} onChange={onInputChange} />
            <div id={RESULT_ANCHOR_ID} className="scroll-mt-24">
              <ResultCard input={input} result={result} errors={errors} />
            </div>
          </div>
          {result ? <StickyResultSummary result={result} targetId={RESULT_ANCHOR_ID} /> : null}
        </>
      ) : null}
      {activeTab === "frequency" ? <FrequencyWavelengthPanel /> : null}
      {activeTab === "dbm" ? <DbmConverterPanel /> : null}
      {activeTab === "fspl" ? <FsplPanel /> : null}
    </section>
  );
}
