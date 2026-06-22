import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type SectionHeadingProps = {
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  as?: "h2" | "h3";
};

// 共通のセクション見出し。eyebrow は白地でAAを満たす staf-dark を使う（text-staf は4.07:1で不足）。
export function SectionHeading({ icon: Icon, eyebrow, title, children, as: HeadingTag = "h2" }: SectionHeadingProps) {
  return (
    <div className="mb-4 flex items-start gap-3">
      {Icon ? (
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-staf/10 text-staf">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      ) : null}
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-wider text-staf-dark">{eyebrow}</p> : null}
        <HeadingTag className="mt-1 text-xl font-bold tracking-tight text-slate-950">{title}</HeadingTag>
        {children ? <p className="mt-1 text-sm leading-relaxed text-slate-600">{children}</p> : null}
      </div>
    </div>
  );
}
