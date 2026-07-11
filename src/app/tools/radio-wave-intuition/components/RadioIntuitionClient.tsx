"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Card } from "@/components/Card";
import { chapters } from "./chapters";

const STORAGE_KEY = "radio-intuition-progress-v1";

type ProgressMap = Record<string, boolean>;

function loadProgress(): ProgressMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as ProgressMap) : {};
  } catch {
    return {};
  }
}

/**
 * 「感覚でわかる電波」シェル。章ステッパー・進捗（localStorage）・前後ナビを担当し、
 * 章の中身は chapters/ 配下の各章コンポーネントに委譲する。
 */
export function RadioIntuitionClient() {
  const ordered = useMemo(() => [...chapters].sort((a, b) => a.meta.order - b.meta.order), []);
  const [currentId, setCurrentId] = useState(ordered[0]?.meta.id ?? "");
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const currentIndex = Math.max(
    0,
    ordered.findIndex((chapter) => chapter.meta.id === currentId)
  );
  const current = ordered[currentIndex];
  const doneCount = ordered.filter((chapter) => progress[chapter.meta.id]).length;

  const selectChapter = (id: string) => {
    setCurrentId(id);
  };

  const markDone = () => {
    const next = { ...progress, [current.meta.id]: !progress[current.meta.id] };
    setProgress(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // プライベートブラウズ等で保存できない場合は表示上の進捗のみ
    }
  };

  if (!current) {
    return null;
  }

  const CurrentComponent = current.Component;

  return (
    <section className="mx-auto max-w-5xl px-4 pb-8 pt-6 sm:px-6 lg:px-8" data-testid="tool-calculator">
      {/* ヒーロー */}
      <Card as="section" padding="lg" className="bg-gradient-to-br from-staf-light/60 to-white">
        <p className="flex items-center gap-2 text-sm font-bold text-staf-dark">
          <Sparkles aria-hidden="true" className="h-4 w-4" />
          感覚的にわかるアンテナ・電波シリーズ
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">感覚でわかる電波</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          式を覚える前に、まず「触って」電波の性質を身体に入れる学習モードです。各章のスライダーを動かして、
          波・dB・距離・アンテナ・障害物・ノイズの6つの直感をつかんでください。読み終える頃には、
          計算ツールの数字が「絵」として見えるようになります。
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-valuenow={doneCount}
            aria-valuemin={0}
            aria-valuemax={ordered.length}
            aria-label="体感済みの章数"
          >
            <div
              className="h-full rounded-full bg-staf transition-all"
              style={{ width: `${(doneCount / Math.max(1, ordered.length)) * 100}%` }}
            />
          </div>
          <span
            data-testid="intuition-progress"
            className="text-sm font-bold text-staf-dark"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {doneCount}/{ordered.length} 章
          </span>
        </div>
      </Card>

      {/* 章ステッパー */}
      <nav aria-label="章の一覧" className="mt-4 overflow-x-auto pb-1">
        <ol className="flex min-w-max gap-2">
          {ordered.map((chapter, index) => {
            const active = chapter.meta.id === current.meta.id;
            const done = Boolean(progress[chapter.meta.id]);
            return (
              <li key={chapter.meta.id}>
                <button
                  type="button"
                  onClick={() => selectChapter(chapter.meta.id)}
                  aria-current={active ? "step" : undefined}
                  data-testid={`intuition-nav-${chapter.meta.id}`}
                  className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${
                    active
                      ? "border-staf bg-staf text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                      active ? "bg-white/20 text-white" : done ? "bg-staf text-white" : "bg-slate-100 text-slate-500"
                    }`}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {done ? <CheckCircle2 aria-hidden="true" className="h-4 w-4" /> : index + 1}
                  </span>
                  {chapter.meta.navLabel}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* 章ヘッダー＋本文 */}
      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-staf-dark" style={{ fontVariantNumeric: "tabular-nums" }}>
          第{current.meta.order}章
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">{current.meta.title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{current.meta.lead}</p>
        <div className="mt-4">
          <CurrentComponent />
        </div>
      </div>

      {/* フッターナビ */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => selectChapter(ordered[currentIndex - 1].meta.id)}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition enabled:hover:border-staf/40 enabled:hover:text-staf-dark disabled:opacity-40"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          前の章
        </button>

        <button
          type="button"
          onClick={markDone}
          aria-pressed={Boolean(progress[current.meta.id])}
          data-testid="intuition-done-toggle"
          className={`inline-flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${
            progress[current.meta.id]
              ? "border-staf bg-staf text-white"
              : "border-staf/40 bg-white text-staf-dark hover:bg-staf-light"
          }`}
        >
          <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
          {progress[current.meta.id] ? "体感済み" : "この章を体感した"}
        </button>

        <button
          type="button"
          disabled={currentIndex === ordered.length - 1}
          onClick={() => selectChapter(ordered[currentIndex + 1].meta.id)}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition enabled:hover:border-staf/40 enabled:hover:text-staf-dark disabled:opacity-40"
        >
          次の章
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
