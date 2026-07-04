import type { HTMLAttributes, ReactNode } from "react";
import { calloutToneClass, type CalloutTone } from "./Callout";

type CardVariant = "white" | "slate";
type CardPadding = "sm" | "md" | "lg";

const variantBg: Record<CardVariant, string> = {
  white: "bg-white",
  slate: "bg-slate-50"
};

const paddingClass: Record<CardPadding, string> = {
  sm: "p-3",
  md: "p-4",
  lg: "p-5"
};

type CardRadius = "md" | "lg";

const radiusClass: Record<CardRadius, string> = {
  md: "rounded-md",
  lg: "rounded-lg"
};

/**
 * Card が受けるHTMLタグの明示ユニオン。ElementType にしない理由:
 * three.js系ライブラリ（@react-three/fiber）が JSX.IntrinsicElements をグローバル拡張すると
 * ElementType 全域のprops交差で children が never に潰れるため、実使用タグに制約して免疫化する。
 */
type CardTag = "div" | "section" | "article" | "aside" | "li" | "figure";

type CardProps = {
  /** 既定は div。元が <section> 等のときは as="section" で意味付けを保つ。 */
  as?: CardTag;
  variant?: CardVariant;
  padding?: CardPadding;
  /** 入れ子・補助的な小カードは radius="md"。既定は rounded-lg。 */
  radius?: CardRadius;
  /** 既定で shadow-card。影なしの面では shadow={false}。 */
  shadow?: boolean;
  /** ナビゲーション用カード等で、ホバー時にわずかに持ち上げる共通インタラクションを付与。 */
  interactive?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "children">;

// アプリ標準のサーフェス（rounded-lg + border-slate-200 + bg + 任意のpadding/影）を1か所に集約。
// 状態色（注記・警告など）は持たせない。色付き面は StateCard / Callout を使う。
export function Card({
  as: Tag = "div",
  variant = "white",
  padding = "lg",
  radius = "lg",
  shadow = true,
  interactive = false,
  className = "",
  children,
  ...rest
}: CardProps) {
  const shadowClass = shadow ? " shadow-card" : "";
  const interactiveClass = interactive
    ? " transition hover:-translate-y-0.5 hover:border-staf/40 hover:shadow-card-hover"
    : "";
  return (
    <Tag
      className={`${radiusClass[radius]} border border-slate-200 ${paddingClass[padding]} ${variantBg[variant]}${shadowClass}${interactiveClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
}

type StateCardProps = {
  tone?: CalloutTone;
  padding?: CardPadding;
  radius?: CardRadius;
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "children">;

// 状態を表す色付きの面（Callout のメッセージ用レイアウトを持たない、汎用の色付きコンテナ）。
// トーン語彙は Callout と共有する。影は持たせない。
export function StateCard({
  tone = "neutral",
  padding = "md",
  radius = "lg",
  className = "",
  children,
  ...rest
}: StateCardProps) {
  return (
    <div className={`${radiusClass[radius]} border ${paddingClass[padding]} ${calloutToneClass[tone]} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
