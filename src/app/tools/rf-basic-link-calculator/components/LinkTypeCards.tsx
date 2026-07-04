"use client";

import {
  Antenna,
  Check,
  RadioTower,
  Router,
  SlidersHorizontal,
  Smartphone,
  type LucideIcon
} from "lucide-react";
import { Card, StateCard } from "@/components/Card";
import { Tooltip } from "@/components/Tooltip";
import { linkTypeOptions } from "@/data/linkBudgetOptions";
import type { LinkBudgetInput } from "@/lib/rf/linkBudget";

const linkTypeIcons: Record<LinkBudgetInput["linkType"], LucideIcon> = {
  cellular_base_station_to_iot_terminal: RadioTower,
  private_base_station_to_iot_terminal: Antenna,
  gateway_to_low_height_terminal: Router,
  terminal_to_terminal: Smartphone,
  custom: SlidersHorizontal
};

export function LinkTypeCards({
  value,
  selectedOption,
  modeText,
  onSelect
}: {
  value: LinkBudgetInput["linkType"];
  selectedOption: (typeof linkTypeOptions)[number];
  modeText: string;
  onSelect: (value: LinkBudgetInput["linkType"]) => void;
}) {
  return (
    <Card padding="md" shadow={false}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span id="linkType-label" className="text-sm font-semibold text-slate-950">
          通信形態
        </span>
        <Tooltip term="通信形態">
          送信側と受信側の高さ関係（基地局・ゲートウェイ・端末）を選びます。各カードに高さの目安・代表例・相性の良い伝搬モデルを表示します。アンテナ高の当たりや推奨モデルの目安に使います。
        </Tooltip>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        送信側と受信側の高さ関係に近いものを選びます。各カードに高さの目安と代表例を示しています。
      </p>
      <div role="radiogroup" aria-labelledby="linkType-label" className="mt-3 grid gap-2">
        {linkTypeOptions.map((option) => {
          const Icon = linkTypeIcons[option.value];
          const selected = option.value === value;

          return (
            <label
              key={option.value}
              className={`group relative flex cursor-pointer gap-3 rounded-lg border p-4 transition peer-focus-visible:ring-2 peer-focus-visible:ring-staf peer-focus-visible:ring-offset-2 ${
                selected
                  ? "border-staf bg-staf-light/40"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="linkType"
                value={option.value}
                checked={selected}
                onChange={() => onSelect(option.value)}
                className="peer sr-only"
              />
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  selected ? "bg-staf text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-950">{option.label}</span>
                  {selected ? <Check aria-hidden className="h-4 w-4 shrink-0 text-staf-dark" /> : null}
                </span>
                <span className="mt-1 flex flex-col gap-0.5 text-xs leading-relaxed text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-3">
                  <span>高さ: {option.heights}</span>
                  <span>例: {option.examples}</span>
                </span>
              </span>
            </label>
          );
        })}
      </div>
      <StateCard tone="info" padding="sm" radius="md" className="mt-3 space-y-2 text-xs leading-relaxed">
        <p>
          <span className="font-semibold">相性の良い伝搬モデル：</span>
          <span>{selectedOption.recommendedModels}</span>
        </p>
        <p>{modeText}</p>
      </StateCard>
    </Card>
  );
}
