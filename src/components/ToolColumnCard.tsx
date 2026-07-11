import { Card, StateCard } from "@/components/Card";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { columnSourceKindLabel } from "@/data/columnSources";
import type { ToolColumn } from "@/data/columns/types";

type ToolColumnCardProps = {
  column: ToolColumn;
  /** panelが明示的に渡す現在入力（QuantRow.liveKeyと突き合わせて「いまの条件では」を表示）。 */
  live?: Record<string, string>;
};

/**
 * 構造化コラムの共通レンダラー（docs/column-guide.md §4.2 の実装）。
 * 表示・折りたたみ・出典書式をここで一元管理し、コラム本体はデータファイルだけで完結させる。
 */
export function ToolColumnCard({ column, live }: ToolColumnCardProps) {
  return (
    <Card as="section" padding="lg" data-testid={`tool-column-${column.id}`}>
      {/* 層1-2: 常時表示 */}
      <h2 className="text-base font-bold text-slate-950">{column.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{column.hook}</p>
      <div className="mt-3 space-y-3">
        {column.body.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className="text-sm leading-relaxed text-slate-600">
            {paragraph}
          </p>
        ))}
      </div>

      {column.analogy ? (
        <StateCard tone="info" padding="md" className="mt-4 text-sm leading-relaxed">
          <p>{column.analogy.text}</p>
          <p className="mt-2 text-xs">
            <span className="font-bold">たとえの破れ：</span>
            {column.analogy.limits}
          </p>
        </StateCard>
      ) : null}

      {/* 層3: 数値で見る（開いた状態） */}
      {column.quant ? (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-900">{column.quant.title}</h3>
          <dl className="mt-2 space-y-1.5">
            {column.quant.rows.map((row) => {
              const liveValue = row.liveKey && live ? live[row.liveKey] : undefined;
              return (
                <div
                  key={row.label}
                  className="grid grid-cols-[1fr_auto] items-baseline gap-3 rounded-lg bg-slate-50 px-3 py-2"
                >
                  <dt className="text-sm text-slate-600">
                    {row.label}
                    {row.note ? <span className="ml-1 text-xs text-slate-500">（{row.note}）</span> : null}
                  </dt>
                  <dd
                    className="text-right text-sm font-semibold text-slate-900"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {row.compute()}
                    {liveValue !== undefined ? (
                      <span className="ml-2 text-xs font-semibold text-staf-dark">いまの条件では {liveValue}</span>
                    ) : null}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      ) : null}

      {/* 層4: 導出（折りたたみ・毎回閉） */}
      {column.derivation ? (
        <div className="mt-4">
          <CollapsibleSection title={column.derivation.title}>
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
              {column.derivation.steps.map((step) => (
                <li key={step.slice(0, 24)}>{step}</li>
              ))}
            </ol>
          </CollapsibleSection>
        </div>
      ) : null}

      {/* 補助: よくある間違い（折りたたみ・毎回閉） */}
      {column.antiPatterns && column.antiPatterns.length > 0 ? (
        <div className="mt-3">
          <CollapsibleSection title="よくある間違い">
            <div className="space-y-3">
              {column.antiPatterns.map((item) => (
                <div key={item.mistake} className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-sm">
                  <p className="font-semibold text-slate-900">✗ {item.mistake}</p>
                  <p className="mt-1 text-slate-600">帰結: {item.consequence}</p>
                  <p className="mt-1 text-slate-600">回避: {item.fix}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      ) : null}

      {/* 層5: 出典＋鮮度フッター */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="text-xs font-semibold text-slate-500">出典</p>
        <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-slate-600">
          {column.sources.map((source) => (
            <li key={source.label}>
              {source.href ? (
                <a className="font-semibold text-staf-dark underline-offset-2 hover:underline" href={source.href} target="_blank" rel="noreferrer">
                  {source.label}
                </a>
              ) : (
                <span className="font-semibold">{source.label}</span>
              )}
              <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                {columnSourceKindLabel[source.kind]}
              </span>
              {source.locator ? <span className="ml-1 text-slate-500">{source.locator}</span> : null}
              {source.note ? <span className="ml-1 text-slate-500">— {source.note}</span> : null}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-slate-400">最終確認: {column.lastReviewed}</p>
      </div>
    </Card>
  );
}
