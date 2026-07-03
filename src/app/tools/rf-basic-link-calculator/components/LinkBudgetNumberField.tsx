"use client";

import { Card } from "@/components/Card";
import { NumberInput } from "@/components/NumberField";
import { Tooltip } from "@/components/Tooltip";
import type { LinkBudgetInput } from "@/lib/rf/linkBudget";

type LinkBudgetNumberFieldProps = {
  id: keyof LinkBudgetInput;
  label: string;
  unit: string;
  description: string;
  tooltip: string;
  example: string;
  range: string;
  min: number;
  max: number;
  step: number;
  value: number;
  error?: string;
  onChange: (value: number) => void;
};

export function LinkBudgetNumberField({
  id,
  label,
  unit,
  description,
  tooltip,
  example,
  range,
  min,
  max,
  step,
  value,
  error,
  onChange
}: LinkBudgetNumberFieldProps) {
  const htmlId = String(id);
  const sliderValue = Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;

  return (
    <Card padding="md" shadow={false}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={htmlId} className="text-sm font-semibold text-slate-950">
          {label}
        </label>
        <Tooltip term={unit}>{tooltip}</Tooltip>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px]">
        <NumberInput
          id={htmlId}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          emptyBehavior="invalid"
          className="h-11 rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 shadow-card focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
          onChange={onChange}
          ariaInvalid={Boolean(error)}
        />
        <div className="flex h-11 items-center justify-center rounded-md bg-slate-50 text-sm font-semibold text-slate-700">
          {unit}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        className="mt-4 w-full"
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={`${label}のスライダー`}
      />
      <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
        <span>入力例: {example}</span>
        <span>推奨レンジ: {range}</span>
      </div>
      {error ? <p className="mt-2 text-sm font-medium text-rose-700">{error}</p> : null}
    </Card>
  );
}
