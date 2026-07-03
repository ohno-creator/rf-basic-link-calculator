import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 disabled:cursor-not-allowed disabled:opacity-60";

const variantClass: Record<Variant, string> = {
  primary: "bg-staf text-white shadow-card hover:bg-staf-dark",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:border-staf/40 hover:text-staf-dark",
  ghost: "text-slate-700 hover:bg-slate-100 hover:text-staf-dark"
};

const sizeClass: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm"
};

// 共通のボタン見た目。ボタン要素・内部リンク・外部リンクで一貫したスタイルを使う。
export function buttonClasses(variant: Variant = "primary", size: Size = "md", className = ""): string {
  return `${base} ${variantClass[variant]} ${sizeClass[size]} ${className}`.trim();
}

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant, size, className, children, ...rest }: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({ href, variant, size, className, children }: ButtonLinkProps) {
  const classes = buttonClasses(variant, size, className);
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
