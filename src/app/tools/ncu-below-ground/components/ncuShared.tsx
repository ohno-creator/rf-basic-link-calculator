"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { LinkJudgementLevel } from "@/lib/rf/judgement";

// NCUツールの共有ヘルパー・小コンポーネント（複数パネルで使う横断部品）。
export const judgementTone: Record<LinkJudgementLevel, string> = {
  excellent: "border-emerald-200 bg-emerald-50 text-emerald-800",
  good: "border-sky-200 bg-sky-50 text-sky-800",
  caution: "border-amber-200 bg-amber-50 text-amber-800",
  unstable: "border-orange-200 bg-orange-50 text-orange-800",
  poor: "border-rose-200 bg-rose-50 text-rose-800"
};

export function formatSigned(value: number, unit = "dB") {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)} ${unit}`;
}

export function formatDistance(distanceM: number) {
  if (distanceM >= 1000) {
    return `${(distanceM / 1000).toFixed(distanceM >= 10_000 ? 0 : 2)} km`;
  }

  return `${distanceM.toFixed(distanceM >= 100 ? 0 : 1)} m`;
}

export const purposeCards = [
  {
    id: "estimate",
    label: "現場前に見積もる",
    description: "写真・図面・距離から、危険因子と通信余裕レンジを先に見る。"
  },
  {
    id: "field",
    label: "現場で原因を追い込む",
    description: "RSSI/RSRPの差分から、蓋・水分・配置・車両・反射を切り分ける。"
  }
] as const;

export type WorkMode = (typeof purposeCards)[number]["id"];

export function SectionTitle({
  icon: Icon,
  eyebrow,
  title,
  children
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-staf/10 text-staf-dark">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-staf-dark">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{children}</p>
      </div>
    </div>
  );
}

export function findOptionLabel<T extends string>(
  options: Array<{ value: T; label: string }>,
  value: T
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}
