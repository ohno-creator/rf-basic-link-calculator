"use client";

import { HelpHint } from "./HelpHint";
import { NumberInput, type NumberInputEmptyBehavior } from "./NumberField";

export type FieldUnitSelect = {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  ariaLabel?: string;
};

type FieldCommonProps = {
  id: string;
  label: string;
  /** ヘルプ文。既定ではラベル横の HelpHint（アイコン）のみに出す（常時表示しない・D3解消）。 */
  help?: string;
  /** "hint"=HelpHintのみ（既定）／"inline"=旧NumberField互換で本文も併記（移行用の暫定指定）。 */
  helpDisplay?: "hint" | "inline";
  /** 常時表示する1行補足（最大1行・text-xs）。help とは別。 */
  description?: string;
  /** 入力例（"920" など）。入力欄下に「例: 920」で表示。 */
  example?: string;
  /** 単位ピル（固定表示）。unitSelect とは排他。 */
  unit?: string;
  /** 単位セレクト（距離のm/km等）。unit とは排他。DistanceField を吸収。 */
  unitSelect?: FieldUnitSelect;
  min?: number;
  max?: number;
  step?: number;
  /** レンジスライダー併設（min/max指定時のみ）。 */
  showSlider?: boolean;
  error?: string;
};

type FieldProps =
  | (FieldCommonProps & { nullable?: false; value: number; emptyBehavior?: NumberInputEmptyBehavior; onChange: (value: number) => void })
  | (FieldCommonProps & { nullable: true; value: number | null; onChange: (value: number | null) => void });

/**
 * アプリ共通の数値入力（UI Kit v2）。NumberInput コアを合成し、5変種
 * （LinkBudgetNumberField / ResearchNumberField / OptionalNumberField / DistanceField / 生input）を
 * 1つに吸収する。help は HelpHint のみに一本化し（D3解消）、常時表示は description（1行）に限定する。
 * 設計は docs/ui-redesign-plan.md §2.2。
 */
export function Field(props: FieldProps) {
  const {
    id,
    label,
    help,
    helpDisplay = "hint",
    description,
    example,
    unit,
    unitSelect,
    min,
    max,
    step,
    showSlider = false,
    error
  } = props;

  // nullable は空欄=null。内部 NumberInput は number(NaN=空) で扱い、境界で null と相互変換する。
  const nullable = props.nullable === true;
  const numericValue = nullable ? (props.value ?? Number.NaN) : props.value;
  const emptyBehavior: NumberInputEmptyBehavior = nullable
    ? "invalid"
    : (props.emptyBehavior ?? "preserve");

  const handleChange = (next: number) => {
    if (nullable) {
      props.onChange(Number.isNaN(next) ? null : next);
    } else {
      props.onChange(next);
    }
  };

  const sliderValue =
    typeof min === "number" && typeof max === "number"
      ? Math.min(max, Math.max(min, Number.isFinite(numericValue) ? numericValue : min))
      : min ?? 0;

  return (
    <label className="block" htmlFor={id}>
      <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        {label}
        {help ? <HelpHint text={help} /> : null}
      </span>

      {help && helpDisplay === "inline" ? (
        <span className="mt-1 block text-xs leading-relaxed text-slate-500">{help}</span>
      ) : null}
      {description ? (
        <span className="mt-1 block text-xs leading-relaxed text-slate-500">{description}</span>
      ) : null}

      <span className="mt-2 flex overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-staf/70 focus-within:ring-2 focus-within:ring-staf/40">
        <NumberInput
          id={id}
          className="min-w-0 flex-1 px-3 py-2.5 text-base font-semibold text-slate-950 outline-none"
          value={numericValue}
          min={min}
          max={max}
          step={step}
          emptyBehavior={emptyBehavior}
          onChange={handleChange}
          ariaInvalid={Boolean(error)}
        />
        {unitSelect ? (
          <select
            className="min-w-20 border-l border-slate-200 bg-slate-50 px-2 text-sm font-semibold text-slate-600 outline-none focus:bg-white"
            value={unitSelect.value}
            onChange={(event) => unitSelect.onChange(event.target.value)}
            aria-label={unitSelect.ariaLabel ?? `${label}の単位`}
          >
            {unitSelect.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : unit ? (
          <span className="flex min-w-20 items-center justify-center bg-slate-50 px-3 text-sm font-semibold text-slate-600">
            {unit}
          </span>
        ) : null}
      </span>

      {showSlider && typeof min === "number" && typeof max === "number" ? (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onChange={(event) => handleChange(Number(event.target.value))}
          aria-label={`${label}のスライダー`}
          className="mt-2 w-full"
        />
      ) : null}

      {example || error ? (
        <span className="mt-1 flex flex-wrap justify-between gap-2 text-xs">
          {example ? <span className="text-slate-500">例: {example}</span> : <span />}
          {error ? <span className="font-medium text-rose-700">{error}</span> : null}
        </span>
      ) : null}
    </label>
  );
}
