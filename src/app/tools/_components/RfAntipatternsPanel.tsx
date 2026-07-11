"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Bug, CheckCircle2, ChevronDown, HelpCircle } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/Badge";
import { Card } from "@/components/Card";
import { columnSourceKindLabel } from "@/data/columnSources";
import {
  ANTIPATTERN_SEVERITY_ORDER,
  antipatternSeverityLabel,
  RF_ANTIPATTERNS,
  type AntipatternSeverity,
  type RfAntipattern
} from "@/data/rfAntipatterns";

type SeverityFilter = "all" | AntipatternSeverity;

/** 深刻度 → バッジのトーン（Callout/Badge の意味トークンに対応付け）。 */
const severityBadgeTone: Record<AntipatternSeverity, BadgeTone> = {
  critical: "danger",
  major: "warning",
  minor: "caution"
};

/** 深刻度フィルタチップの並び（「すべて」＋重い順）。 */
const FILTER_OPTIONS: readonly SeverityFilter[] = ["all", ...ANTIPATTERN_SEVERITY_ORDER];

function filterLabel(filter: SeverityFilter): string {
  return filter === "all" ? "すべて" : antipatternSeverityLabel[filter];
}

/** アンチパターン1件のアコーディオンカード。 */
function AntipatternCard({ pattern }: { pattern: RfAntipattern }) {
  return (
    <details
      data-testid={`antipattern-${pattern.id}`}
      className="group rounded-lg border border-slate-200 bg-white p-4 shadow-card"
    >
      <summary className="flex cursor-pointer items-start justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-staf/40">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={severityBadgeTone[pattern.severity]}>
              {antipatternSeverityLabel[pattern.severity]}
            </Badge>
            <h3 className="text-sm font-bold text-slate-950">{pattern.title}</h3>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-800">症状：</span>
            {pattern.symptom}
          </p>
        </div>
        <ChevronDown
          aria-hidden="true"
          className="mt-1 h-4 w-4 shrink-0 text-slate-500 transition group-open:rotate-180"
        />
      </summary>

      <div className="mt-4 space-y-4 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-700">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            <HelpCircle aria-hidden="true" className="h-3.5 w-3.5" />
            なぜ起きるか
          </p>
          <p className="mt-1">{pattern.whyItHappens}</p>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-800">
            <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
            数字で見る誤差
          </p>
          <p className="mt-1">{pattern.quantifiedError}</p>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
            <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
            正しいやり方
          </p>
          <p className="mt-1">{pattern.correctApproach}</p>
        </div>

        <div>
          <Link
            href={pattern.toolHref}
            className="inline-flex items-center gap-1.5 rounded-md border border-staf/40 bg-white px-4 py-2 text-sm font-bold text-staf-dark transition hover:bg-staf-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
          >
            {pattern.toolLabel}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-md bg-slate-50 px-3 py-2">
          <p className="text-xs font-bold text-slate-600">出典</p>
          <ul className="mt-1 space-y-1 text-xs text-slate-600">
            {pattern.sources.map((source) => (
              <li key={source.label} className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                <Badge tone="neutral">{columnSourceKindLabel[source.kind]}</Badge>
                {source.href ? (
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-staf-dark underline decoration-slate-300 underline-offset-2 hover:decoration-staf"
                  >
                    {source.label}
                  </a>
                ) : (
                  <span className="font-semibold text-slate-700">{source.label}</span>
                )}
                {source.locator ? <span className="text-slate-500">{source.locator}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}

/**
 * RFアンチパターン図鑑のクライアントシェル。
 * 深刻度フィルタ（すべて/致命的/重大/軽微）と、症状→なぜ→数字で見る誤差→正しいやり方→
 * 検証ツールへのリンク、という展開順のアコーディオン一覧を担当する。
 * データは @/data/rfAntipatterns（出典は @/data/columnSources の共有型）。
 */
export function RfAntipatternsPanel() {
  const [filter, setFilter] = useState<SeverityFilter>("all");

  // 重い順（critical→major→minor）にグループ化した固定の表示順。
  const ordered = useMemo(() => {
    return [...RF_ANTIPATTERNS].sort(
      (a, b) =>
        ANTIPATTERN_SEVERITY_ORDER.indexOf(a.severity) - ANTIPATTERN_SEVERITY_ORDER.indexOf(b.severity)
    );
  }, []);

  const visible = useMemo(
    () => (filter === "all" ? ordered : ordered.filter((pattern) => pattern.severity === filter)),
    [ordered, filter]
  );

  const countOf = (option: SeverityFilter) =>
    option === "all"
      ? RF_ANTIPATTERNS.length
      : RF_ANTIPATTERNS.filter((pattern) => pattern.severity === option).length;

  return (
    <section className="mx-auto max-w-5xl px-4 pb-8 pt-6 sm:px-6 lg:px-8" data-testid="tool-calculator">
      {/* ヒーロー */}
      <Card as="section" padding="lg" className="bg-gradient-to-br from-staf-light/60 to-white">
        <p className="flex items-center gap-2 text-sm font-bold text-staf-dark">
          <Bug aria-hidden="true" className="h-4 w-4" />
          学習クエストシリーズ
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">RFアンチパターン図鑑</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          無線設計で繰り返される「やってしまいがちな間違い」を、症状→原因→数字で見る誤差→正しいやり方の順で
          図鑑にしました。各パターンには誤差を自分の条件で再現できる計算ツールへのリンクが付いています。
          壊れ方を先に知っておくことが、リンクバジェットを読む一番の近道です。
        </p>
      </Card>

      {/* 深刻度フィルタ */}
      <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="深刻度で絞り込む">
        {FILTER_OPTIONS.map((option) => {
          const isSelected = option === filter;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              data-testid={`antipattern-filter-${option}`}
              onClick={() => setFilter(option)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${
                isSelected
                  ? "border-staf bg-staf text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
              }`}
            >
              {filterLabel(option)}
              <span
                className={`text-xs ${isSelected ? "text-white/80" : "text-slate-400"}`}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {countOf(option)}
              </span>
            </button>
          );
        })}
        <p
          data-testid="primary-result"
          className="ml-auto text-sm font-bold text-staf-dark"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          表示中 {visible.length} / {RF_ANTIPATTERNS.length} パターン
        </p>
      </div>

      {/* パターン一覧 */}
      <div className="mt-4 space-y-3">
        {visible.map((pattern) => (
          <AntipatternCard key={pattern.id} pattern={pattern} />
        ))}
      </div>
    </section>
  );
}
