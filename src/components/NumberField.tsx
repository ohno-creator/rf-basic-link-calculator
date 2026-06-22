"use client";

import { useEffect, useRef, useState } from "react";
import { HelpHint } from "./HelpHint";

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
  const [draft, setDraft] = useState(() => String(value));
  const committedRef = useRef(value);

  useEffect(() => {
    if (value !== committedRef.current) {
      committedRef.current = value;
      setDraft(String(value));
    }
  }, [value]);

  const handleChange = (raw: string) => {
    setDraft(raw);
    const parsed = Number(raw);
    if (raw.trim() !== "" && Number.isFinite(parsed)) {
      committedRef.current = parsed;
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    let next = committedRef.current;
    if (typeof min === "number" && next < min) {
      next = min;
    }
    if (typeof max === "number" && next > max) {
      next = max;
    }
    if (next !== committedRef.current) {
      committedRef.current = next;
      onChange(next);
    }
    setDraft(String(next));
  };

  return (
    <label className="block" htmlFor={id}>
      <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
        {label}
        {help ? <HelpHint text={help} /> : null}
      </span>
      {help ? <span className="mt-1 block text-xs leading-relaxed text-slate-500">{help}</span> : null}
      <span className="mt-2 flex overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-staf/70 focus-within:ring-2 focus-within:ring-staf/15">
        <input
          id={id}
          className="min-w-0 flex-1 px-3 py-2.5 text-base font-semibold text-slate-950 outline-none"
          type="text"
          inputMode={typeof min === "number" && min >= 0 ? "decimal" : "text"}
          step={step}
          value={draft}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={handleBlur}
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
