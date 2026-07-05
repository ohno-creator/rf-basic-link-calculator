import type { ReactNode } from "react";
import { Card } from "@/components/Card";
import { DiagramExportButton } from "@/components/DiagramExportButton";

type ChartFrameProps = {
  /** 小ラベル（例: 滝グラフ）。省略可。 */
  eyebrow?: string;
  /** 図タイトル（Headingロール）。 */
  title: string;
  /** 図の読み方・前提の説明。 */
  description?: ReactNode;
  /** 右上に置く補助要素（凡例チップ・現在値バッジ等）。 */
  aside?: ReactNode;
  /** 指定すると図を SVG/PNG で保存できる（H7）。ファイル名の元。 */
  exportName?: string;
  /** figcaption（計算条件・出典など。レポート貼付時に文脈を保つ）。 */
  caption?: ReactNode;
  /** Card の面（入れ子で使う場合は slate）。 */
  variant?: "white" | "slate";
  padding?: "sm" | "md" | "lg";
  children: ReactNode;
};

/**
 * 図版の統一フレーム（design-base-v4 §1 v4-5）。
 * figure > ヘッダー（タイトル/説明＋aside） + 図本体（保存アクション付き） + figcaption の定型。
 * 図タイトル・説明のタイポと余白を単一ソース化し、エクスポート導線を標準装備する。
 */
export function ChartFrame({
  eyebrow,
  title,
  description,
  aside,
  exportName,
  caption,
  variant = "white",
  padding = "lg",
  children
}: ChartFrameProps) {
  const body = exportName ? (
    <DiagramExportButton filenameBase={exportName}>{children}</DiagramExportButton>
  ) : (
    children
  );

  return (
    <Card as="figure" variant={variant} padding={padding}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {eyebrow ? <p className="text-sm font-semibold text-staf-dark">{eyebrow}</p> : null}
          <p className={`text-base font-bold text-slate-950 ${eyebrow ? "mt-1" : ""}`.trim()}>{title}</p>
          {description ? (
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">{description}</p>
          ) : null}
        </div>
        {aside}
      </div>
      <div className="mt-4">{body}</div>
      {caption ? (
        <figcaption className="mt-3 text-xs leading-relaxed text-slate-500">{caption}</figcaption>
      ) : null}
    </Card>
  );
}
