import type { ReactNode } from "react";

type InfoCardProps = {
  title: string;
  children: ReactNode;
  tone?: "neutral" | "blue" | "green" | "amber" | "rose";
};

const toneClasses = {
  neutral: "border-slate-200 bg-white",
  blue: "border-staf/20 bg-staf-light",
  green: "border-emerald-200 bg-emerald-50",
  amber: "border-amber-200 bg-amber-50",
  rose: "border-rose-200 bg-rose-50"
};

export function InfoCard({ title, children, tone = "neutral" }: InfoCardProps) {
  return (
    <div className={`rounded-lg border p-5 shadow-card ${toneClasses[tone]}`}>
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-slate-600">
        {children}
      </div>
    </div>
  );
}
