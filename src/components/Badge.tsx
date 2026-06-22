import type { ReactNode } from "react";

export type BadgeTone = "success" | "info" | "caution" | "warning" | "danger" | "neutral";
export type BadgeSize = "xs" | "sm";

// 状態を表す小さなピル（合否・良否チップ等）。Callout と同じトーン語彙を共有し、
// 各所で手書きしている -100 背景 / -800 文字のピルを1つに集約する。
const toneClass: Record<BadgeTone, string> = {
  success: "bg-emerald-100 text-emerald-800",
  info: "bg-sky-100 text-sky-800",
  caution: "bg-amber-100 text-amber-800",
  warning: "bg-orange-100 text-orange-800",
  danger: "bg-rose-100 text-rose-800",
  neutral: "bg-slate-100 text-slate-700"
};

const sizeClass: Record<BadgeSize, string> = {
  xs: "px-2 py-0.5 text-[11px]",
  sm: "px-2.5 py-1 text-xs"
};

type BadgeProps = {
  tone?: BadgeTone;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
};

export function Badge({ tone = "neutral", size = "xs", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${toneClass[tone]} ${sizeClass[size]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
