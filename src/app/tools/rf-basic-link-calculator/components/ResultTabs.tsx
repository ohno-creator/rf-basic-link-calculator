"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/Card";
import type { LinkBudgetInput, LinkBudgetResult } from "@/lib/rf/linkBudget";
import { BeginnerExplanation } from "./BeginnerExplanation";
import { DistancePowerChart } from "./DistancePowerChart";
import { ImprovementSimulator } from "./ImprovementSimulator";
import { LinkMarginGauge } from "./LinkMarginGauge";
import { NextCheckpoints } from "./NextCheckpoints";
import { RadioPathDiagram } from "./RadioPathDiagram";
import { ResultReadingGuide } from "./ResultReadingGuide";
import { SensitivityLineVisual } from "./SensitivityLineVisual";
import { SignalFlowDiagram } from "./SignalFlowDiagram";
import { TwoRayInterferenceLab } from "./TwoRayInterferenceLab";

type ResultTabsProps = {
  input: LinkBudgetInput;
  result: LinkBudgetResult;
};

const tabs = [
  { id: "read", label: "読み方" },
  { id: "diagrams", label: "図解で詳しく（6種）" },
  { id: "improve", label: "改善する" }
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ResultTabs({ input, result }: ResultTabsProps) {
  const [active, setActive] = useState<TabId>("read");
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>(
    {} as Record<TabId, HTMLButtonElement | null>
  );

  function selectAndFocus(id: TabId) {
    setActive(id);
    requestAnimationFrame(() => tabRefs.current[id]?.focus());
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const index = tabs.findIndex((tab) => tab.id === active);
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectAndFocus(tabs[(index + 1) % tabs.length].id);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectAndFocus(tabs[(index - 1 + tabs.length) % tabs.length].id);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectAndFocus(tabs[0].id);
    } else if (event.key === "End") {
      event.preventDefault();
      selectAndFocus(tabs[tabs.length - 1].id);
    }
  }

  return (
    <Card as="section" padding="md" className="sm:p-5">
      <div role="tablist" aria-label="結果の詳細" className="flex gap-2 overflow-x-auto" onKeyDown={onKeyDown}>
        {tabs.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-staf/30 ${
                selected ? "bg-staf text-white shadow-card" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div id={`panel-${active}`} role="tabpanel" aria-labelledby={`tab-${active}`} className="mt-5 space-y-5">
        {active === "read" ? (
          <>
            <ResultReadingGuide input={input} result={result} />
            <BeginnerExplanation input={input} result={result} />
          </>
        ) : null}
        {active === "diagrams" ? (
          <>
            <RadioPathDiagram input={input} result={result} />
            <SignalFlowDiagram input={input} result={result} />
            <LinkMarginGauge result={result} />
            <DistancePowerChart input={input} />
            <SensitivityLineVisual input={input} result={result} />
            <TwoRayInterferenceLab
              frequencyMHz={input.frequencyMHz}
              txHeightM={input.txAntennaHeightM}
              rxHeightM={input.rxAntennaHeightM}
            />
          </>
        ) : null}
        {active === "improve" ? (
          <>
            <ImprovementSimulator input={input} result={result} />
            <NextCheckpoints />
          </>
        ) : null}
      </div>
    </Card>
  );
}
