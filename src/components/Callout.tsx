import type { ReactNode } from "react";
import type { CalloutTone } from "@/lib/ui/tones";

export type { CalloutTone } from "@/lib/ui/tones";
export type CalloutSize = "sm" | "md" | "lg";

// 注記・警告・情報・結果状態を表す共通サーフェス。tailwind.config の意味トークン
// （success/info/caution/warning/danger）に1対1で対応し、各所の手書きボックスを置き換える。
// トーン→クラスの単一ソース。カスタムレイアウト（ヒーロー帯など Callout で包めない箇所）からも
// 同じ配色を参照できるようエクスポートする。
export const calloutToneClass: Record<CalloutTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  info: "border-sky-200 bg-sky-50 text-sky-950",
  caution: "border-amber-200 bg-amber-50 text-amber-950",
  warning: "border-orange-200 bg-orange-50 text-orange-950",
  danger: "border-rose-200 bg-rose-50 text-rose-950",
  neutral: "border-slate-200 bg-white text-slate-950"
};

const sizeClass: Record<CalloutSize, string> = {
  sm: "rounded-lg p-3",
  md: "rounded-lg p-4",
  lg: "rounded-lg p-5"
};

// 結果判定レベル（ResultHero等）をトーンへ写像し、意味体系を1つに統一する。
export const LEVEL_TO_TONE = {
  excellent: "success",
  good: "info",
  caution: "caution",
  unstable: "warning",
  poor: "danger"
} as const;

type CalloutProps = {
  tone?: CalloutTone;
  size?: CalloutSize;
  icon?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function Callout({
  tone = "neutral",
  size = "md",
  icon,
  title,
  children,
  className = ""
}: CalloutProps) {
  return (
    <div className={`flex items-start gap-3 border ${calloutToneClass[tone]} ${sizeClass[size]} ${className}`.trim()}>
      {icon ? <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span> : null}
      <div className="min-w-0 flex-1">
        {title ? <p className="text-sm font-bold">{title}</p> : null}
        {children ? (
          <div className={`text-sm leading-relaxed ${title ? "mt-1" : ""}`.trim()}>{children}</div>
        ) : null}
      </div>
    </div>
  );
}
