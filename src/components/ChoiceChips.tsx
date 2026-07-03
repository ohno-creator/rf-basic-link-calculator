"use client";

import {
  CHOICE_CHIP_SEVERITY_ORDER,
  choiceChipSeverityLabel,
  choiceChipToneClass,
  type ChoiceChipSeverity
} from "@/lib/ui/kit";
import { HelpHint } from "./HelpHint";

export type ChoiceChipOption<T extends string> = {
  value: T;
  label: string;
  /** 選択時に下部へ表示する1〜2行の補足。 */
  description?: string;
  /** 選択肢の「効きやすさ」目安（色分け）。グループ内で個別指定。 */
  severity?: ChoiceChipSeverity;
};

type ChoiceChipsProps<T extends string> = {
  label?: string;
  help?: string;
  value: T;
  options: Array<ChoiceChipOption<T>>;
  onChange: (value: T) => void;
  /** 重症度の凡例（緑=有利〜赤=不利）を先頭に表示する。既定 false。 */
  showLegend?: boolean;
};

/**
 * ドロップダウンより速くタップで選べる、重症度カラー付きのチップ選択UI。
 * NcuBelowGroundClient のローカル実装を昇格したもの。
 * - タップ高さ py-2（≥40px）
 * - 重症度は各 option.severity で個別指定（共有辞書の同名value衝突を回避）
 * - showLegend で「緑=有利〜赤=不利」の凡例1行を先頭に表示
 * 数値計算は lib/rf 側が担い、severity は色分けのための目安。
 */
export function ChoiceChips<T extends string>({
  label,
  help,
  value,
  options,
  onChange,
  showLegend = false
}: ChoiceChipsProps<T>) {
  const selected = options.find((option) => option.value === value);

  return (
    <div>
      {label ? (
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          {label}
          {help ? <HelpHint text={help} /> : null}
        </div>
      ) : null}

      {showLegend ? (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          {CHOICE_CHIP_SEVERITY_ORDER.map((severity) => (
            <span key={severity} className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${choiceChipToneClass[severity].dot}`} aria-hidden="true" />
              {choiceChipSeverityLabel[severity]}
            </span>
          ))}
        </div>
      ) : null}

      <div className={`${label || showLegend ? "mt-2" : ""} flex flex-wrap gap-2`}>
        {options.map((option) => {
          const isSelected = option.value === value;
          const tone = choiceChipToneClass[option.severity ?? "warn"];
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              title={option.description}
              onClick={() => onChange(option.value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                isSelected
                  ? tone.selected
                  : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-slate-900"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${tone.dot}`} aria-hidden="true" />
              {option.label}
            </button>
          );
        })}
      </div>

      {selected?.description ? (
        <p className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
          <span className="font-bold text-slate-800">{selected.label}：</span>
          {selected.description}
        </p>
      ) : null}
    </div>
  );
}
