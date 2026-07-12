"use client";

import type { ReactNode } from "react";
import { Compass, Lightbulb, Pause, Play, Wrench } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/Card";

export type TermFrameProps = {
  termId: string;
  title: string;
  experienceHint: string;
  experience: ReactNode;
  grasp: string[];
  iotPerspective: {
    text: string;
    toolHref: string;
    toolLabel: string;
  };
  deepDive: {
    formula?: string;
    body: ReactNode;
  };
};

export function TermFrame({
  termId,
  title,
  experience,
  experienceHint,
  grasp,
  iotPerspective,
  deepDive
}: TermFrameProps) {
  return (
    <div data-testid={`term-panel-${termId}`} className="space-y-4">
      {/* 1. 体感ゾーン */}
      <Card as="section" padding="lg">
        <p className="text-xs font-bold uppercase tracking-wide text-staf-dark">さわって体感</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{experienceHint}</p>
        <div className="mt-3">{experience}</div>
      </Card>

      {/* 2. つかむポイント ＆ 3. IoTの観点 */}
      <Card as="section" padding="lg">
        <div>
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
        </div>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-950">
            <Wrench aria-hidden="true" className="h-4 w-4 text-staf-dark" />
            IoTの観点
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{iotPerspective.text}</p>
          <div className="mt-3">
            <Link
              href={iotPerspective.toolHref}
              className="inline-flex items-center gap-1 rounded-md border border-staf/30 bg-white px-3 py-1.5 text-sm font-bold text-staf-dark transition hover:border-staf/60 hover:bg-staf-light"
            >
              <Compass aria-hidden="true" className="h-4 w-4" />
              {iotPerspective.toolLabel}
            </Link>
          </div>
        </div>

        {/* 4. 深掘り */}
        <details className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-900 focus:outline-none">
            深掘り（式と適用条件）
          </summary>
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
            {deepDive.formula ? (
              <p className="overflow-x-auto whitespace-pre-line rounded-md bg-slate-50 p-3 font-mono text-xs text-slate-800">
                {deepDive.formula}
              </p>
            ) : null}
            <div className="space-y-2">{deepDive.body}</div>
          </div>
        </details>
      </Card>
    </div>
  );
}

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
