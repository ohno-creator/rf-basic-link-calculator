"use client";

import type { ReactNode } from "react";
import { BookOpen, Compass, Lightbulb, Pause, Play, Wrench } from "lucide-react";
import Link from "next/link";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";

type ColumnSourceLink = {
  label: string;
  href?: string;
  note?: string;
};

type ChapterFrameProps = {
  chapterId: string;
  /** 体感ゾーン本体（インタラクティブSVG＋スライダー群）。 */
  experience: ReactNode;
  /** 体感の操作ガイド1行（例:「周波数を動かして、波の細かさを見てください」）。 */
  experienceHint: string;
  /** つかむポイント（2〜3個・各1文）。 */
  grasp: string[];
  /** 実務への接続。既存ツールへの内部リンク。 */
  practice: { text: string; toolHref: string; toolLabel: string };
  /** 玄人向け深掘り（折りたたみ）。formulaは等幅・改行可。 */
  deepDive: { formula?: string; body: ReactNode };
  /** 章コラム（E1様式: 物語＋たとえの破れ＋details出典）。 */
  column: { title: string; body: ReactNode; breakNote: string; sources: ColumnSourceLink[] };
};

/**
 * 「感覚でわかる電波」の章共通テンプレート。
 * 体感 → つかむ → 実務へ → 深掘り → コラム の順序と見た目を全章で統一する。
 */
export function ChapterFrame({
  chapterId,
  experience,
  experienceHint,
  grasp,
  practice,
  deepDive,
  column
}: ChapterFrameProps) {
  return (
    <div data-testid={`intuition-chapter-${chapterId}`} className="space-y-4">
      <Card as="section" padding="lg">
        <p className="text-xs font-bold uppercase tracking-wide text-staf-dark">さわって体感</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{experienceHint}</p>
        <div className="mt-3">{experience}</div>
      </Card>

      <Card as="section" padding="lg">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-950">
          <Lightbulb aria-hidden="true" className="h-5 w-5 text-amber-500" />
          ここをつかむ
        </h3>
        <ul className="mt-3 space-y-2">
          {grasp.map((point) => (
            <li key={point} className="flex gap-2 text-sm leading-relaxed text-slate-600">
              <span aria-hidden="true" className="mt-0.5 shrink-0 font-bold text-staf">
                ✓
              </span>
              {point}
            </li>
          ))}
        </ul>

        <div className="slate">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-950">
            <Wrench aria-hidden="true" className="h-4 w-4 text-staf-dark" />
            実務ではこう使う
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{practice.text}</p>
          <Link
            href={practice.toolHref}
            className="mt-2 inline-flex items-center gap-1 rounded-md border border-staf/30 bg-white px-3 py-1.5 text-sm font-bold text-staf-dark transition hover:border-staf/60 hover:bg-staf-light"
          >
            <Compass aria-hidden="true" className="h-4 w-4" />
            {practice.toolLabel}
          </Link>
        </div>

        <details className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-900">
            深掘り（式と適用条件・玄人向け）
          </summary>
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
            {deepDive.formula ? (
              <p className="overflow-x-auto whitespace-pre-line rounded-md bg-slate-50 p-3 font-mono text-xs text-slate-800">
                {deepDive.formula}
              </p>
            ) : null}
            {deepDive.body}
          </div>
        </details>
      </Card>

      <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
        <h3 className="text-base font-bold">コラム：{column.title}</h3>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">{column.body}</div>
        <p className="mt-3 text-xs leading-relaxed text-sky-900/80">
          <span className="font-bold">たとえの破れ：</span>
          {column.breakNote}
        </p>
        <details className="mt-3 rounded-lg border border-sky-200 bg-white/70 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-sky-900">出典・さらに学ぶ</summary>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-sky-950/80">
            {column.sources.map((source) => (
              <li key={source.label}>
                {source.href ? (
                  <a className="font-semibold underline" href={source.href} target="_blank" rel="noreferrer">
                    {source.label}
                  </a>
                ) : (
                  <span className="font-semibold">{source.label}</span>
                )}
                {source.note ? <span>（{source.note}）</span> : null}
              </li>
            ))}
          </ul>
        </details>
      </Callout>
    </div>
  );
}

/** 体感ゾーン用の再生/停止ボタン（全章共通の見た目・aria）。 */
export function PlayPauseButton({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={playing}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-staf/40 hover:text-staf-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
    >
      {playing ? (
        <>
          <Pause aria-hidden="true" className="h-3.5 w-3.5" />
          動きを止める
        </>
      ) : (
        <>
          <Play aria-hidden="true" className="h-3.5 w-3.5" />
          動きを見る
        </>
      )}
    </button>
  );
}
