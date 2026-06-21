"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  Crown,
  FlaskConical,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  type LucideIcon
} from "lucide-react";
import {
  questModes,
  rfQuestLessons,
  type QuestLesson,
  type QuestModeId
} from "@/data/rfLearningQuestLessons";

type ProgressMap = Record<string, boolean>;
type AnswerMap = Record<string, number>;

type LevelUpState = {
  level: number;
  title: string;
  message: string;
};

const STORAGE_KEY = "rf-learning-quest-progress:v2";

const modeIconMap: Record<QuestModeId, LucideIcon> = {
  beginner: Sparkles,
  apprentice: Swords,
  practitioner: ShieldCheck,
  expert: Crown,
  researcher: FlaskConical
};

function loadProgress(): ProgressMap {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: ProgressMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // 保存できない環境では、現在セッションだけで進める。
  }
}

function levelFromCompleted(completedCount: number): number {
  return Math.max(1, Math.floor(completedCount / 5) + 1);
}

function rankName(completedCount: number): string {
  if (completedCount >= 250) return "RF賢者";
  if (completedCount >= 200) return "研究者";
  if (completedCount >= 150) return "玄人";
  if (completedCount >= 100) return "実務者";
  if (completedCount >= 50) return "見習い";
  return "初心者";
}

function nextIncompleteLesson(modeId: QuestModeId, progress: ProgressMap): QuestLesson {
  const lessons = rfQuestLessons
    .filter((lesson) => lesson.mode === modeId)
    .sort((a, b) => a.stage - b.stage);
  return lessons.find((lesson) => !progress[lesson.id]) ?? lessons[0];
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-staf transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
}

function LevelUpPanel({ levelUp, onClose }: { levelUp: LevelUpState; onClose: () => void }) {
  return (
    <section className="rounded-lg border border-amber-300 bg-amber-50 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-amber-900">
            <Trophy aria-hidden="true" className="h-4 w-4" />
            レベルアップ
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Lv.{levelUp.level} {levelUp.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-amber-950">{levelUp.message}</p>
        </div>
        <button
          type="button"
          className="rounded-md border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
          onClick={onClose}
        >
          冒険へ戻る
        </button>
      </div>
    </section>
  );
}

function ModeSelector({
  activeMode,
  progress,
  onSelect
}: {
  activeMode: QuestModeId;
  progress: ProgressMap;
  onSelect: (mode: QuestModeId) => void;
}) {
  return (
    <section className="grid gap-3 lg:grid-cols-5">
      {questModes.map((mode) => {
        const Icon = modeIconMap[mode.id];
        const lessons = rfQuestLessons.filter((lesson) => lesson.mode === mode.id);
        const completed = lessons.filter((lesson) => progress[lesson.id]).length;
        const selected = activeMode === mode.id;

        return (
          <button
            key={mode.id}
            type="button"
            className={`rounded-lg border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-staf/25 ${
              selected
                ? "border-staf bg-staf text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-staf/30 hover:bg-slate-50"
            }`}
            onClick={() => onSelect(mode.id)}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-bold">
                <Icon aria-hidden="true" className="h-4 w-4" />
                {mode.label}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${selected ? "bg-white/20" : "bg-slate-100"}`}>
                {mode.badge}
              </span>
            </span>
            <span className={`mt-2 block text-xs leading-relaxed ${selected ? "text-white/85" : "text-slate-500"}`}>
              {mode.description}
            </span>
            <span className="mt-3 block">
              <ProgressBar value={completed} max={lessons.length} />
            </span>
            <span className={`mt-1 block text-xs font-bold ${selected ? "text-white" : "text-slate-500"}`}>
              {completed}/{lessons.length} 問クリア
            </span>
          </button>
        );
      })}
    </section>
  );
}

function StageMap({
  lessons,
  activeLesson,
  progress,
  onSelect
}: {
  lessons: QuestLesson[];
  activeLesson: QuestLesson;
  progress: ProgressMap;
  onSelect: (lesson: QuestLesson) => void;
}) {
  const chapters = [1, 2, 3, 4, 5].map((chapter) => {
    const from = (chapter - 1) * 10 + 1;
    const to = chapter * 10;
    return {
      chapter,
      from,
      to,
      lessons: lessons.filter((lesson) => lesson.stage >= from && lesson.stage <= to)
    };
  });

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-950">ステージ選択</h2>
        <span className="text-xs font-semibold text-slate-400">5章×10問</span>
      </div>
      <div className="mt-3 space-y-3">
        {chapters.map((chapter) => {
          const completed = chapter.lessons.filter((lesson) => progress[lesson.id]).length;

          return (
            <div key={chapter.chapter} className="rounded-md border border-slate-100 bg-slate-50 p-2">
              <div className="flex items-center justify-between gap-2 px-1">
                <p className="text-[11px] font-bold text-slate-600">
                  第{chapter.chapter}章 STAGE {chapter.from}-{chapter.to}
                </p>
                <p className="text-[11px] font-bold text-slate-400">{completed}/10</p>
              </div>
              <div className="mt-2 grid grid-cols-5 gap-1.5">
                {chapter.lessons.map((lesson) => {
                  const done = Boolean(progress[lesson.id]);
                  const selected = lesson.id === activeLesson.id;

                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      className={`aspect-square rounded-md border text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-staf/25 ${
                        selected
                          ? "border-staf bg-staf text-white"
                          : done
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-white text-slate-500 hover:border-staf/30"
                      }`}
                      onClick={() => onSelect(lesson)}
                      aria-label={`ステージ${lesson.stage} ${lesson.title}`}
                    >
                      {done ? "✓" : lesson.stage}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LessonBattle({
  lesson,
  selectedChoice,
  isCompleted,
  onAnswer
}: {
  lesson: QuestLesson;
  selectedChoice?: number;
  isCompleted: boolean;
  onAnswer: (choiceIndex: number) => void;
}) {
  const answered = selectedChoice !== undefined;
  const correct = selectedChoice === lesson.correctIndex;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-400">STAGE {lesson.stage}</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">{lesson.title}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">対戦相手：{lesson.enemy}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
            isCompleted ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
          ) : (
            <CircleHelp aria-hidden="true" className="h-3.5 w-3.5" />
          )}
          {isCompleted ? "攻略済み" : "挑戦中"}
        </span>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-bold text-staf">QUESTION</p>
        <p className="mt-1 text-base font-bold leading-relaxed text-slate-950">{lesson.question}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {lesson.choices.map((choice, choiceIndex) => {
            const isSelected = selectedChoice === choiceIndex;
            const isCorrect = choiceIndex === lesson.correctIndex;
            const tone =
              answered && isCorrect
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : answered && isSelected
                  ? "border-rose-300 bg-rose-50 text-rose-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-staf/40";

            return (
              <button
                key={choice}
                type="button"
                className={`min-h-16 rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${tone}`}
                onClick={() => onAnswer(choiceIndex)}
              >
                {choice}
              </button>
            );
          })}
        </div>
      </div>

      {answered ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <section className={`rounded-lg border p-4 ${correct ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
            <p className="flex items-center gap-2 text-sm font-bold text-slate-950">
              {correct ? (
                <ShieldCheck aria-hidden="true" className="h-4 w-4 text-emerald-700" />
              ) : (
                <Sparkles aria-hidden="true" className="h-4 w-4 text-amber-700" />
              )}
              {correct ? "正解" : "惜しい"}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{lesson.immediateAnswer}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{lesson.explanation}</p>
            <p className="mt-3 rounded-md border border-white/70 bg-white/70 p-2 text-xs font-bold text-slate-700">
              獲得：{lesson.reward}
            </p>
            <Link
              href={lesson.appLink.href}
              className="mt-3 inline-flex items-center gap-1 rounded-md bg-staf px-3 py-2 text-sm font-bold text-white transition hover:bg-staf-dark"
            >
              {lesson.appLink.label}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </section>

          <details open className="rounded-lg border border-slate-200 bg-white p-4">
            <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-950">
              <BookOpen aria-hidden="true" className="h-4 w-4 text-staf" />
              現場コラム
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{lesson.column}</p>
            {lesson.sources?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {lesson.sources.map((source) => (
                  <a
                    key={source.href}
                    href={source.href}
                    className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-bold text-staf transition hover:border-staf/40"
                  >
                    {source.label}
                  </a>
                ))}
              </div>
            ) : null}
          </details>
        </div>
      ) : null}
    </article>
  );
}

export function RfLearningQuestClient() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [activeMode, setActiveMode] = useState<QuestModeId>("beginner");
  const [activeLessonId, setActiveLessonId] = useState<string>("beginner-db-3db");
  const [levelUp, setLevelUp] = useState<LevelUpState | null>(null);

  const completedCount = useMemo(
    () => rfQuestLessons.filter((lesson) => progress[lesson.id]).length,
    [progress]
  );
  const currentLevel = levelFromCompleted(completedCount);
  const xp = completedCount * 120;

  const lessonsInMode = useMemo(
    () => rfQuestLessons.filter((lesson) => lesson.mode === activeMode).sort((a, b) => a.stage - b.stage),
    [activeMode]
  );
  const activeLesson =
    rfQuestLessons.find((lesson) => lesson.id === activeLessonId && lesson.mode === activeMode) ??
    lessonsInMode[0];
  const activeModeMeta = questModes.find((mode) => mode.id === activeMode) ?? questModes[0];
  const completedInMode = lessonsInMode.filter((lesson) => progress[lesson.id]).length;

  useEffect(() => {
    const stored = loadProgress();
    setProgress(stored);
    const firstMode = questModes[0].id;
    setActiveLessonId(nextIncompleteLesson(firstMode, stored).id);
  }, []);

  function selectMode(mode: QuestModeId) {
    setActiveMode(mode);
    setActiveLessonId(nextIncompleteLesson(mode, progress).id);
  }

  function answerLesson(lesson: QuestLesson, choiceIndex: number) {
    setAnswers((current) => ({ ...current, [lesson.id]: choiceIndex }));

    if (choiceIndex !== lesson.correctIndex || progress[lesson.id]) {
      return;
    }

    setProgress((current) => {
      const beforeCount = rfQuestLessons.filter((item) => current[item.id]).length;
      const next = { ...current, [lesson.id]: true };
      const afterCount = beforeCount + 1;
      const beforeLevel = levelFromCompleted(beforeCount);
      const afterLevel = levelFromCompleted(afterCount);
      saveProgress(next);

      if (afterLevel > beforeLevel || afterCount === rfQuestLessons.length) {
        setLevelUp({
          level: afterLevel,
          title: rankName(afterCount),
          message:
            afterCount === rfQuestLessons.length
              ? "全250問を攻略しました。リンク設計の基礎、実務、研究動向までひと通り確認済みです。"
              : `${afterCount}問クリア。次のモードや未攻略ステージへ進めます。`
        });
      }

      return next;
    });
  }

  function resetProgress() {
    setProgress({});
    setAnswers({});
    saveProgress({});
    setLevelUp(null);
    setActiveMode("beginner");
    setActiveLessonId("beginner-db-3db");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-staf">
              <Swords aria-hidden="true" className="h-4 w-4" />
              RF学習クエスト
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              問題を倒して、リンク設計の勘を育てる
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
              初心者、見習い、実務者、玄人、研究者の5モードで合計250問。1問ごとに即答え、解説、関連ツール、現場コラムを確認できます。
              進捗はこのブラウザに保存されます。
            </p>
          </div>
          <div className="min-w-56 rounded-lg border border-staf/20 bg-staf-light p-4 text-staf">
            <p className="text-xs font-bold">冒険進捗</p>
            <p className="mt-1 text-2xl font-bold">
              {completedCount}/{rfQuestLessons.length}
            </p>
            <p className="text-xs font-semibold">
              Lv.{currentLevel} {rankName(completedCount)} / XP {xp}
            </p>
            <div className="mt-3">
              <ProgressBar value={completedCount} max={rfQuestLessons.length} />
            </div>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1 rounded-md border border-staf/30 bg-white px-2.5 py-1.5 text-xs font-bold text-staf"
              onClick={resetProgress}
            >
              <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
              リセット
            </button>
          </div>
        </div>
      </section>

      {levelUp ? (
        <div className="mt-5">
          <LevelUpPanel levelUp={levelUp} onClose={() => setLevelUp(null)} />
        </div>
      ) : null}

      <div className="mt-5">
        <ModeSelector activeMode={activeMode} progress={progress} onSelect={selectMode} />
      </div>

      <section className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr] lg:items-start">
        <aside className="space-y-4 lg:sticky lg:top-6">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400">{activeModeMeta.label}</p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">{activeModeMeta.title}</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{activeModeMeta.description}</p>
            <div className="mt-3">
              <ProgressBar value={completedInMode} max={lessonsInMode.length} />
            </div>
            <p className="mt-1 text-xs font-bold text-slate-500">
              {completedInMode}/{lessonsInMode.length} 問クリア
            </p>
          </section>

          <StageMap
            lessons={lessonsInMode}
            activeLesson={activeLesson}
            progress={progress}
            onSelect={(lesson) => setActiveLessonId(lesson.id)}
          />
        </aside>

        <LessonBattle
          lesson={activeLesson}
          selectedChoice={answers[activeLesson.id]}
          isCompleted={Boolean(progress[activeLesson.id])}
          onAnswer={(choiceIndex) => answerLesson(activeLesson, choiceIndex)}
        />
      </section>
    </main>
  );
}
