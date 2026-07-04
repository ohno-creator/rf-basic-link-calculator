"use client";

import { useEffect, useRef, useState } from "react";
import { HelpHint } from "./HelpHint";

export type NumberInputEmptyBehavior = "preserve" | "invalid";

type NumberInputProps = {
  id: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  emptyBehavior?: NumberInputEmptyBehavior;
  type?: "text" | "number";
  inputMode?: "decimal" | "text";
  className?: string;
  ariaInvalid?: boolean;
};

function formatDraft(value: number): string {
  return Number.isFinite(value) ? String(value) : "";
}

/**
 * 数値入力の共通コア。入力途中の文字列を保持し、離脱時にmin/maxへクランプする。
 * preserveは空欄で直前値を復元し、invalidはNaNを親へ通知して必須エラーを表示する。
 */
export function NumberInput({
  id,
  value,
  min,
  max,
  step,
  onChange,
  emptyBehavior = "preserve",
  type = "text",
  inputMode = typeof min === "number" && min >= 0 ? "decimal" : "text",
  className,
  ariaInvalid
}: NumberInputProps) {
  const [draft, setDraft] = useState(() => formatDraft(value));
  const committedRef = useRef(value);

  useEffect(() => {
    if (!Object.is(value, committedRef.current)) {
      committedRef.current = value;
      setDraft(formatDraft(value));
    }
  }, [value]);

  const commitInvalid = () => {
    if (!Number.isNaN(committedRef.current)) {
      committedRef.current = Number.NaN;
      onChange(Number.NaN);
    }
  };

  const handleChange = (raw: string) => {
    setDraft(raw);
    if (raw.trim() === "") {
      if (emptyBehavior === "invalid") commitInvalid();
      return;
    }

    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      committedRef.current = parsed;
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    const raw = draft.trim();
    const parsed = Number(raw);

    if (raw === "" || !Number.isFinite(parsed)) {
      if (emptyBehavior === "invalid") {
        commitInvalid();
        setDraft("");
      } else {
        setDraft(formatDraft(committedRef.current));
      }
      return;
    }

    let next = parsed;
    if (typeof min === "number" && next < min) next = min;
    if (typeof max === "number" && next > max) next = max;
    if (!Object.is(next, committedRef.current)) {
      committedRef.current = next;
      onChange(next);
    }
    setDraft(String(next));
  };

  return (
    <input
      id={id}
      className={className}
      type={type}
      inputMode={inputMode}
      min={min}
      max={max}
      step={step}
      value={draft}
      onChange={(event) => handleChange(event.target.value)}
      onBlur={handleBlur}
      aria-invalid={ariaInvalid}
    />
  );
}

type NumberFieldProps = {
  id: string;
  label: string;
  help?: string;
  unit?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  /** 任意：レンジスライダーを併せて表示（min/max指定時のみ有効）。 */
  showSlider?: boolean;
};

// アプリ共通の数値入力。文字列ドラフトで保持し、クリア・「-」・「1.」など編集途中でも
// 0に戻らずキーボードで直接入力できる。離脱時に min/max へクランプ。単位ピル・ヘルプ・任意スライダー。
export function NumberField({
  id,
  label,
  help,
  unit,
  value,
  min,
  max,
  step,
  onChange,
  showSlider = false
}: NumberFieldProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        {label}
        {help ? <HelpHint text={help} /> : null}
      </span>
      {help ? <span className="mt-1 block text-xs leading-relaxed text-slate-500">{help}</span> : null}
      <span className="mt-2 flex overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-staf/70 focus-within:ring-2 focus-within:ring-staf/40">
        <NumberInput
          id={id}
          className="min-w-0 flex-1 px-3 py-2.5 text-base font-semibold text-slate-950 outline-none"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={onChange}
        />
        {unit ? (
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
          value={Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label={`${label}のスライダー`}
          className="mt-2 w-full"
        />
      ) : null}
    </label>
  );
}
