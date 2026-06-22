import type { ReactNode } from "react";

export type StatTone = "staf" | "sky" | "emerald" | "rose" | "amber" | "neutral";
export type StatSize = "sm" | "md" | "lg";

// 結果・指標の主役数値を統一する。桁幅を tabular-nums で固定し、値/単位/ラベル/トーン/サイズの
// 組み合わせを1か所に集約する。背景は持たせない（既存グリッドへ素直に置けるよう合成可能に保つ）。
const toneText: Record<StatTone, string> = {
  staf: "text-staf-dark",
  sky: "text-sky-900",
  emerald: "text-emerald-900",
  rose: "text-rose-900",
  amber: "text-amber-900",
  neutral: "text-slate-950"
};

const sizeText: Record<StatSize, string> = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl md:text-4xl"
};

type StatProps = {
  label?: ReactNode;
  value: ReactNode;
  unit?: string;
  tone?: StatTone;
  size?: StatSize;
  note?: ReactNode;
  align?: "left" | "right";
  className?: string;
};

export function Stat({
  label,
  value,
  unit,
  tone = "neutral",
  size = "md",
  note,
  align = "left",
  className = ""
}: StatProps) {
  return (
    <div className={`${align === "right" ? "text-right" : "text-left"} ${className}`.trim()}>
      {label ? <p className="text-xs font-semibold text-slate-500">{label}</p> : null}
      <p className={`font-bold tabular-nums ${sizeText[size]} ${toneText[tone]} ${label ? "mt-1" : ""}`.trim()}>
        {value}
        {unit ? <span className="ml-1.5 text-base font-semibold">{unit}</span> : null}
      </p>
      {note ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{note}</p> : null}
    </div>
  );
}
