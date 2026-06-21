"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  Crown,
  ExternalLink,
  FileDown,
  FlaskConical,
  Gauge,
  Radio,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Swords,
  Target,
  Trophy,
  XCircle,
  Zap,
  type LucideIcon
} from "lucide-react";
import {
  antennaSeoLinks,
  questModes,
  rfQuestLessons,
  type QuestLesson,
  type QuestModeId,
  type QuestSource
} from "@/data/rfLearningQuestLessons";

type ProgressMap = Record<string, boolean>;
type AnswerMap = Record<string, number>;
type DisplayChoice = {
  choice: string;
  originalIndex: number;
};

type LevelUpState = {
  level: number;
  title: string;
  message: string;
};

type CertificationAttempt = {
  lessonIds: string[];
  answers: AnswerMap;
  startedAt: string;
};

type CertificateRecord = {
  mode: QuestModeId;
  modeLabel: string;
  recipientName: string;
  companyName: string;
  issuedAt: string;
  score: number;
  certificateId: string;
};

type CertificationState = {
  attempts: Partial<Record<QuestModeId, CertificationAttempt>>;
  certificates: Partial<Record<QuestModeId, CertificateRecord>>;
};

const STORAGE_KEY = "rf-learning-quest-progress:v2";
const CERTIFICATION_STORAGE_KEY = "rf-learning-quest-certification:v1";
const CERTIFICATION_QUESTION_COUNT = 10;

const modeIconMap: Record<QuestModeId, LucideIcon> = {
  intro: BookOpen,
  beginner: Sparkles,
  apprentice: Swords,
  practitioner: ShieldCheck,
  expert: Crown,
  researcher: FlaskConical
};

const chapterTitles: Record<QuestModeId, string[]> = {
  intro: [
    "電波と波長",
    "dBと電力",
    "アンテナ構造",
    "GNDと偏波",
    "筐体実装",
    "VSWRと効率",
    "ケーブル設置",
    "LPWAと屋外",
    "OTA測定",
    "基地局アンテナ",
    "MIMOとアレイ",
    "測定メタデータ",
    "リンク余裕",
    "遮蔽と反射",
    "フレネル",
    "セルラーIoT",
    "アンテナ選定",
    "現場トラブル",
    "研究の入口",
    "総仕上げ"
  ],
  beginner: [
    "dBの基礎",
    "dBmとEIRP",
    "周波数と波長",
    "アンテナ利得",
    "受信感度",
    "リンク余裕",
    "ケーブル損失",
    "自由空間",
    "LPWA距離感",
    "初心者ボス"
  ],
  apprentice: [
    "地面反射",
    "フレネル",
    "金属近接",
    "筐体損失",
    "偏波ミスマッチ",
    "人体遮蔽",
    "設置ばらつき",
    "実測補正",
    "低高度端末",
    "見習いボス"
  ],
  practitioner: [
    "通信形態",
    "Hataの範囲",
    "COST231",
    "Log-distance",
    "2波モデル",
    "端末近傍",
    "アンテナ高",
    "信頼率",
    "現地補正",
    "実務者ボス"
  ],
  expert: [
    "SUI",
    "COST231 WI",
    "3GPP",
    "GISクラッタ",
    "基地局チルト",
    "MIMO配置",
    "干渉管理",
    "複数実測点",
    "運用設計",
    "玄人ボス"
  ],
  researcher: [
    "公開測定データ",
    "環境特徴量",
    "残差分布",
    "LoRa実測",
    "地理入力",
    "Rel-19",
    "端末アンテナ",
    "偏波と近傍界",
    "モデル管理",
    "研究者ボス"
  ]
};

const finalAntennaAchievement = {
  threshold: 700,
  title: "アンテナ賢者",
  description: "全700問を攻略し、研究と現場をつなげられます。"
};

const antennaAchievementBadges = [
  { threshold: 20, title: "波長の羅針盤", description: "λ/2・λ/4のサイズ感が見えてきます。" },
  { threshold: 60, title: "VSWRゲージ", description: "整合だけでなく効率を見る目が育ちます。" },
  { threshold: 120, title: "実装ルーペ", description: "筐体、GND、ケーブルの影響を疑える段階です。" },
  { threshold: 220, title: "近傍損失ハンター", description: "地面・人体・金属近接をリンク余裕へ落とし込めます。" },
  { threshold: 360, title: "アンテナ設計士", description: "モデル選択と実測補正を組み合わせて説明できます。" },
  { threshold: 520, title: "基地局配置マスター", description: "チルト、方位、干渉、GISの前提を意識できます。" },
  finalAntennaAchievement
];

const primaryGuildMission = {
  lessonId: "intro-staf-whip-lambda",
  title: "λ/2・λ/4を読む",
  description: "920MHzホイップのサイズ感を押さえる"
};

const guildMissions = [
  primaryGuildMission,
  {
    lessonId: "intro-staf-vswr-unitless",
    title: "VSWRの罠を避ける",
    description: "低VSWRだけで距離を断定しない"
  },
  {
    lessonId: "intro-staf-cable-install",
    title: "設置トラブルを潰す",
    description: "金属近接とケーブル曲げを確認する"
  }
];

const emptyCertificateForms: Record<QuestModeId, { recipientName: string; companyName: string }> = {
  intro: { recipientName: "", companyName: "" },
  beginner: { recipientName: "", companyName: "" },
  apprentice: { recipientName: "", companyName: "" },
  practitioner: { recipientName: "", companyName: "" },
  expert: { recipientName: "", companyName: "" },
  researcher: { recipientName: "", companyName: "" }
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

function loadCertificationState(): CertificationState {
  if (typeof window === "undefined") {
    return { attempts: {}, certificates: {} };
  }

  try {
    const raw = window.localStorage.getItem(CERTIFICATION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CertificationState) : { attempts: {}, certificates: {} };
  } catch {
    return { attempts: {}, certificates: {} };
  }
}

function saveCertificationState(state: CertificationState) {
  try {
    window.localStorage.setItem(CERTIFICATION_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 保存できない環境では、現在セッションだけで進める。
  }
}

function levelFromCompleted(completedCount: number): number {
  return Math.max(1, Math.floor(completedCount / 5) + 1);
}

function rankName(completedCount: number): string {
  if (completedCount >= 700) return "アンテナ賢者";
  if (completedCount >= 600) return "研究者";
  if (completedCount >= 500) return "基地局配置マスター";
  if (completedCount >= 350) return "アンテナ実務者";
  if (completedCount >= 200) return "実装見習い";
  if (completedCount >= 100) return "アンテナ入門者";
  return "初学者";
}

function chapterTitleFor(modeId: QuestModeId, chapter: number): string {
  const titles = chapterTitles[modeId];
  return titles[chapter - 1] ?? "総合演習";
}

function nextAchievement(completedCount: number) {
  return antennaAchievementBadges.find((badge) => completedCount < badge.threshold) ?? finalAntennaAchievement;
}

function unlockedAchievements(completedCount: number) {
  return antennaAchievementBadges.filter((badge) => completedCount >= badge.threshold);
}

function addUniqueLink(map: Map<string, QuestSource>, link: QuestSource) {
  if (!map.has(link.href)) {
    map.set(link.href, link);
  }
}

function seoLinksForLesson(lesson: QuestLesson): QuestSource[] {
  const links = new Map<string, QuestSource>();
  const lessonText = `${lesson.id} ${lesson.title} ${lesson.question} ${lesson.column}`;
  const productLink = antennaSeoLinks.find((link) => link.href.includes("/product/antenna"));
  const frequencyLink = antennaSeoLinks.find((link) => link.href.includes("/frequency"));
  const mediaLink = antennaSeoLinks.find((link) => link.href.includes("/media"));
  const downloadLink = antennaSeoLinks.find((link) => link.href.includes("/download"));
  const contactLink = antennaSeoLinks.find((link) => link.href.includes("/contact"));

  if (lesson.sources?.some((source) => source.href.includes("staf.co.jp"))) {
    for (const source of lesson.sources) {
      if (source.href.includes("staf.co.jp")) {
        addUniqueLink(links, source);
      }
    }
  }

  if (productLink) {
    addUniqueLink(links, productLink);
  }

  if (frequencyLink && /920|LPWA|LTE|5G|Sub6|Wi-Fi|Bluetooth|BLE|ミリ波|周波数|波長|λ/.test(lessonText)) {
    addUniqueLink(links, frequencyLink);
  }

  if (mediaLink && /VSWR|効率|FPC|PCB|板金|ホイップ|筐体|金属|ケーブル|GND|グランド|アンテナ/.test(lessonText)) {
    addUniqueLink(links, mediaLink);
  }

  if (downloadLink) {
    addUniqueLink(links, downloadLink);
  }
  if (contactLink) {
    addUniqueLink(links, contactLink);
  }

  return Array.from(links.values()).slice(0, 5);
}

function nextIncompleteLesson(modeId: QuestModeId, progress: ProgressMap): QuestLesson {
  const lessons = rfQuestLessons
    .filter((lesson) => lesson.mode === modeId)
    .sort((a, b) => a.stage - b.stage);
  return lessons.find((lesson) => !progress[lesson.id]) ?? lessons[0];
}

function randomUnit(): number {
  if (typeof window !== "undefined" && window.crypto) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return values[0] / 0xffffffff;
  }

  return Math.random();
}

function hashString(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededRandom(seed: string): () => number {
  let state = hashString(seed) || 1;

  return () => {
    state = Math.imul(1664525, state) + 1013904223;
    return (state >>> 0) / 0x100000000;
  };
}

function shuffleChoices(lesson: QuestLesson, seed?: string): DisplayChoice[] {
  const random = seed ? seededRandom(seed) : randomUnit;
  const choices = lesson.choices.map((choice, originalIndex) => ({ choice, originalIndex }));

  for (let index = choices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [choices[index], choices[swapIndex]] = [choices[swapIndex], choices[index]];
  }

  return choices;
}

function pickRandomLessons(modeId: QuestModeId): QuestLesson[] {
  return rfQuestLessons
    .filter((lesson) => lesson.mode === modeId)
    .map((lesson) => ({ lesson, order: randomUnit() }))
    .sort((a, b) => a.order - b.order)
    .slice(0, CERTIFICATION_QUESTION_COUNT)
    .map(({ lesson }) => lesson);
}

function certificateIdFor(mode: QuestModeId, issuedAt: string): string {
  const stamp = issuedAt.replace(/\D/g, "").slice(0, 14);
  return `RFQ-${mode.toUpperCase()}-${stamp}`;
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
    <section className="grid gap-3 lg:grid-cols-3 xl:grid-cols-6">
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
  modeId,
  lessons,
  activeLesson,
  progress,
  onSelect
}: {
  modeId: QuestModeId;
  lessons: QuestLesson[];
  activeLesson: QuestLesson;
  progress: ProgressMap;
  onSelect: (lesson: QuestLesson) => void;
}) {
  const chapterCount = Math.ceil(lessons.length / 10);
  const chapters = Array.from({ length: chapterCount }, (_, index) => index + 1).map((chapter) => {
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
        <span className="text-xs font-semibold text-slate-400">{chapterCount}章×10問</span>
      </div>
      <div className="mt-3 max-h-[68vh] space-y-3 overflow-y-auto pr-1">
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
              <p className="mt-0.5 px-1 text-[11px] font-semibold text-staf">
                {chapterTitleFor(modeId, chapter.chapter)}
              </p>
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

function AntennaGuildPanel({
  completedCount,
  progress,
  onJump
}: {
  completedCount: number;
  progress: ProgressMap;
  onJump: (lesson: QuestLesson) => void;
}) {
  const nextBadge = nextAchievement(completedCount);
  const unlocked = unlockedAchievements(completedCount);
  const nextMission = guildMissions.find((mission) => !progress[mission.lessonId]) ?? primaryGuildMission;
  const nextMissionLesson = rfQuestLessons.find((lesson) => lesson.id === nextMission.lessonId);

  return (
    <section className="rounded-lg border border-staf/20 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-staf">
            <Radio aria-hidden="true" className="h-4 w-4" />
            アンテナギルド
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">今日の修行と実績</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            アンテナメーカーの学習導線として、波長、整合、放射効率、筐体実装、設置トラブルを短い問題で積み上げます。迷ったら今日の修行から始めてください。
          </p>
        </div>
        <div className="min-w-48 rounded-md border border-staf/20 bg-staf-light p-3">
          <p className="text-xs font-bold text-staf">次の称号</p>
          <p className="mt-1 text-sm font-bold text-slate-950">{nextBadge.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            あと{Math.max(0, nextBadge.threshold - completedCount)}問で解放
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-3 sm:grid-cols-3">
          {guildMissions.map((mission) => {
            const lesson = rfQuestLessons.find((item) => item.id === mission.lessonId);
            const done = Boolean(progress[mission.lessonId]);

            return (
              <button
                key={mission.lessonId}
                type="button"
                className={`rounded-lg border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-staf/20 ${
                  done
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-staf/30 hover:bg-white"
                }`}
                onClick={() => lesson && onJump(lesson)}
              >
                <span className="flex items-center gap-2 text-sm font-bold">
                  {done ? (
                    <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-emerald-700" />
                  ) : (
                    <Target aria-hidden="true" className="h-4 w-4 text-staf" />
                  )}
                  {mission.title}
                </span>
                <span className="mt-1 block text-xs leading-relaxed">{mission.description}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-950">
            <Gauge aria-hidden="true" className="h-4 w-4 text-staf" />
            実績スロット
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {antennaAchievementBadges.slice(0, 6).map((badge) => {
              const earned = completedCount >= badge.threshold;
              return (
                <span
                  key={badge.title}
                  title={badge.description}
                  className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                    earned
                      ? "border-staf/30 bg-white text-staf"
                      : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {earned ? "獲得 " : "未解放 "}
                  {badge.title}
                </span>
              );
            })}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            獲得済み {unlocked.length}/{antennaAchievementBadges.length}。称号は修了証の前段階として、学習の寄り道を楽しくするための目印です。
          </p>
          {nextMissionLesson ? (
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1 rounded-md border border-staf/30 bg-white px-3 py-2 text-xs font-bold text-staf transition hover:bg-staf-light"
              onClick={() => onJump(nextMissionLesson)}
            >
              次の修行へ
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {antennaSeoLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-staf transition hover:border-staf/40 hover:bg-staf-light"
          >
            {link.label}
            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>
    </section>
  );
}

function LessonBattle({
  lesson,
  selectedChoice,
  isCompleted,
  nextLesson,
  streak,
  onAnswer,
  onClearAnswer,
  onNext
}: {
  lesson: QuestLesson;
  selectedChoice?: number;
  isCompleted: boolean;
  nextLesson: QuestLesson;
  streak: number;
  onAnswer: (choiceIndex: number) => void;
  onClearAnswer: () => void;
  onNext: () => void;
}) {
  const answered = selectedChoice !== undefined;
  const correct = selectedChoice === lesson.correctIndex;
  const chapter = Math.ceil(lesson.stage / 10);
  const isBossStage = lesson.stage % 10 === 0;
  const displayedChoices = useMemo(() => shuffleChoices(lesson), [lesson]);
  const actionLinks = seoLinksForLesson(lesson);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-400">
            第{chapter}章 {chapterTitleFor(lesson.mode, chapter)} / STAGE {lesson.stage} {isBossStage ? "・ボス戦" : "・通常戦"}
          </p>
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
          {displayedChoices.map(({ choice, originalIndex }) => {
            const isSelected = selectedChoice === originalIndex;
            const isCorrect = originalIndex === lesson.correctIndex;
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
                className={`min-h-16 rounded-md border px-3 py-3 text-left text-sm font-semibold transition disabled:cursor-default ${tone}`}
                onClick={() => onAnswer(originalIndex)}
                disabled={answered}
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
            {correct ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-md border border-emerald-200 bg-white/80 p-3">
                  <p className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <Zap aria-hidden="true" className="h-3.5 w-3.5" />
                    連続正解コンボ
                  </p>
                  <p className="mt-1 text-lg font-bold text-emerald-800">{streak} COMBO</p>
                </div>
                <div className="rounded-md border border-staf/20 bg-white/80 p-3">
                  <p className="text-xs font-bold text-slate-500">アンテナ勘</p>
                  <p className="mt-1 text-sm font-bold text-slate-950">
                    +{Math.min(99, Math.max(1, streak * 3))} / 設計メモに残したい知識
                  </p>
                </div>
              </div>
            ) : null}
            {!correct ? (
              <div className="mt-3 rounded-md border border-amber-200 bg-white/80 p-3">
                <p className="text-xs font-bold text-amber-900">
                  もう一度挑戦できます。左のステージ番号を再クリックするか、このボタンで回答をクリアしてください。
                </p>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-bold text-amber-900 transition hover:bg-amber-100"
                  onClick={onClearAnswer}
                >
                  <RefreshCw aria-hidden="true" className="h-4 w-4" />
                  回答をクリアして再挑戦
                </button>
              </div>
            ) : null}
            <Link
              href={lesson.appLink.href}
              className="mt-3 inline-flex items-center gap-1 rounded-md bg-staf px-3 py-2 text-sm font-bold text-white transition hover:bg-staf-dark"
            >
              {lesson.appLink.label}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <div className="mt-3 rounded-md border border-slate-200 bg-white/80 p-3">
              <p className="text-xs font-bold text-slate-500">次の討伐</p>
              <p className="mt-1 text-sm font-bold text-slate-950">
                STAGE {nextLesson.stage}：{nextLesson.title}
              </p>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 rounded-md border border-staf/30 bg-white px-3 py-2 text-sm font-bold text-staf transition hover:bg-staf-light"
                onClick={onNext}
              >
                次の問題へ
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
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
            <div className="mt-4 rounded-md border border-staf/20 bg-staf-light p-3">
              <p className="flex items-center gap-2 text-xs font-bold text-staf">
                <Radio aria-hidden="true" className="h-3.5 w-3.5" />
                アンテナ設計の次の一手
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                学んだ用語を、製品選定、周波数帯の確認、資料請求、相談へつなげられます。
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {actionLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-1 rounded-full border border-staf/25 bg-white px-2.5 py-1 text-xs font-bold text-staf transition hover:bg-white/70"
                  >
                    {link.label}
                    <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </details>
        </div>
      ) : null}
    </article>
  );
}

function CertificateView({
  certificate,
  printTarget = false
}: {
  certificate: CertificateRecord;
  printTarget?: boolean;
}) {
  const issuedDate = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(certificate.issuedAt));

  return (
    <section className={`${printTarget ? "rf-certificate-print" : ""} rounded-lg border-4 border-staf bg-white p-8 text-center shadow-sm`}>
      <p className="text-xs font-bold uppercase tracking-[0.32em] text-staf">RF Learning Quest</p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">修了証明書</h2>
      <p className="mt-5 text-sm font-semibold text-slate-500">Certificate of Completion</p>
      <div className="mx-auto mt-6 max-w-2xl border-y border-slate-200 py-6">
        <p className="text-sm font-bold text-slate-500">会社名</p>
        <p className="mt-1 text-2xl font-bold text-slate-950">{certificate.companyName}</p>
        <p className="mt-5 text-sm font-bold text-slate-500">氏名</p>
        <p className="mt-1 text-3xl font-bold text-slate-950">{certificate.recipientName}</p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-slate-700">
        上記の方は、スタッフ株式会社 RF Basic Link Calculator の
        <span className="font-bold text-slate-950"> {certificate.modeLabel} </span>
        において、全ステージを攻略し、ランダム修了試験10問で100点を達成したことを証明します。
      </p>
      <div className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-md border border-slate-200 p-3">
          <p className="text-xs font-bold text-slate-500">修了モード</p>
          <p className="mt-1 font-bold text-slate-950">{certificate.modeLabel}</p>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <p className="text-xs font-bold text-slate-500">修了試験</p>
          <p className="mt-1 font-bold text-slate-950">{certificate.score}/100 点</p>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <p className="text-xs font-bold text-slate-500">発行日</p>
          <p className="mt-1 font-bold text-slate-950">{issuedDate}</p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4 text-left text-xs text-slate-500">
        <div>
          <p className="font-bold text-slate-700">証明書ID</p>
          <p>{certificate.certificateId}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-700">スタッフ株式会社</p>
          <p>RF Basic Link Calculator</p>
        </div>
      </div>
    </section>
  );
}

function CertificationPanel({
  mode,
  lessons,
  completedInMode,
  certificationState,
  certificateForm,
  notice,
  onStartAttempt,
  onAnswer,
  onClearAnswer,
  onFormChange,
  onIssueCertificate,
  onPrintCertificate
}: {
  mode: (typeof questModes)[number];
  lessons: QuestLesson[];
  completedInMode: number;
  certificationState: CertificationState;
  certificateForm: { recipientName: string; companyName: string };
  notice: { mode: QuestModeId; tone: "success" | "error"; message: string } | null;
  onStartAttempt: (mode: QuestModeId) => void;
  onAnswer: (mode: QuestModeId, lessonId: string, choiceIndex: number) => void;
  onClearAnswer: (mode: QuestModeId, lessonId: string) => void;
  onFormChange: (mode: QuestModeId, field: "recipientName" | "companyName", value: string) => void;
  onIssueCertificate: (mode: QuestModeId) => void;
  onPrintCertificate: (certificate: CertificateRecord) => void;
}) {
  const unlocked = completedInMode === lessons.length;
  const attempt = certificationState.attempts[mode.id];
  const certificate = certificationState.certificates[mode.id];
  const examLessons =
    attempt?.lessonIds
      .map((lessonId) => rfQuestLessons.find((lesson) => lesson.id === lessonId))
      .filter((lesson): lesson is QuestLesson => Boolean(lesson)) ?? [];
  const answeredCount = examLessons.filter((lesson) => attempt?.answers[lesson.id] !== undefined).length;
  const correctCount = examLessons.filter((lesson) => attempt?.answers[lesson.id] === lesson.correctIndex).length;
  const score = correctCount * 10;
  const finished = examLessons.length === CERTIFICATION_QUESTION_COUNT && answeredCount === CERTIFICATION_QUESTION_COUNT;
  const passed = finished && correctCount === CERTIFICATION_QUESTION_COUNT;
  const modeNotice = notice?.mode === mode.id ? notice : null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-staf">
            <Award aria-hidden="true" className="h-4 w-4" />
            {mode.label} 修了試験
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">ランダム10問で100点ならPDF修了書を出力</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            このモードの{lessons.length}問をすべて攻略すると、同じモードからランダムに10問を出題します。誤答した問題は問題名をクリックして回答をクリアし、再挑戦できます。
          </p>
        </div>
        <div className="min-w-40 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          <p className="text-xs font-bold text-slate-500">モード進捗</p>
          <p className="mt-1 text-lg font-bold text-slate-950">
            {completedInMode}/{lessons.length}
          </p>
          <ProgressBar value={completedInMode} max={lessons.length} />
        </div>
      </div>

      {!unlocked ? (
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-700">修了試験はまだロック中です。</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            残り{lessons.length - completedInMode}問を攻略すると、このモードのランダム修了試験が解放されます。
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4">
            <div>
              <p className="text-sm font-bold text-emerald-900">修了試験が解放されています。</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                10問すべて正解すると、名前と会社名入りの修了書をPDF保存できます。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onStartAttempt(mode.id)}
                className="inline-flex items-center gap-2 rounded-md bg-staf px-4 py-2 text-sm font-bold text-white transition hover:bg-staf-dark"
              >
                <Shuffle aria-hidden="true" className="h-4 w-4" />
                {attempt ? "ランダム10問を引き直す" : "修了試験を開始"}
              </button>
              {certificate ? (
                <button
                  type="button"
                  onClick={() => onPrintCertificate(certificate)}
                  className="inline-flex items-center gap-2 rounded-md border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
                >
                  <FileDown aria-hidden="true" className="h-4 w-4" />
                  修了書を再出力
                </button>
              ) : null}
            </div>
          </div>

          {attempt && examLessons.length ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-950">修了試験スコア</p>
                  <p className="mt-1 text-xs text-slate-500">現在の回答で採点します。100点になるまで誤答を再挑戦できます。</p>
                </div>
                <div className="rounded-md bg-white px-4 py-2 text-right">
                  <p className="text-xs font-bold text-slate-500">SCORE</p>
                  <p className={`text-2xl font-bold ${passed ? "text-emerald-700" : "text-slate-950"}`}>{score}/100</p>
                </div>
              </div>

              {finished && !passed ? (
                <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
                  満点まであと{CERTIFICATION_QUESTION_COUNT - correctCount}問です。誤答した問題名をクリックして回答をクリアし、再挑戦してください。
                </div>
              ) : null}

              <div className="mt-4 grid gap-3">
                {examLessons.map((lesson, index) => {
                  const selectedChoice = attempt.answers[lesson.id];
                  const answered = selectedChoice !== undefined;
                  const correct = selectedChoice === lesson.correctIndex;
                  const wrong = answered && !correct;
                  const displayedChoices = shuffleChoices(lesson, `${attempt.startedAt}:${lesson.id}`);

                  return (
                    <section
                      key={lesson.id}
                      data-testid="cert-question"
                      className={`rounded-md border bg-white p-4 ${
                        correct
                          ? "border-emerald-200"
                          : wrong
                            ? "border-amber-300"
                            : "border-slate-200"
                      }`}
                    >
                      <button
                        type="button"
                        data-testid="cert-question-title"
                        className={`flex w-full items-center justify-between gap-3 text-left text-sm font-bold ${
                          wrong ? "text-amber-900 underline decoration-amber-300 underline-offset-4" : "text-slate-950"
                        }`}
                        onClick={() => wrong && onClearAnswer(mode.id, lesson.id)}
                        disabled={!wrong}
                      >
                        <span>
                          問題{index + 1}：STAGE {lesson.stage} {lesson.title}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                            correct
                              ? "bg-emerald-100 text-emerald-800"
                              : wrong
                                ? "bg-amber-100 text-amber-900"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {correct ? (
                            <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                          ) : wrong ? (
                            <XCircle aria-hidden="true" className="h-3.5 w-3.5" />
                          ) : (
                            <CircleHelp aria-hidden="true" className="h-3.5 w-3.5" />
                          )}
                          {correct ? "正解" : wrong ? "再挑戦可" : "未回答"}
                        </span>
                      </button>
                      <p data-testid="cert-question-text" className="mt-3 text-sm font-semibold leading-relaxed text-slate-800">
                        {lesson.question}
                      </p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {displayedChoices.map(({ choice, originalIndex }) => {
                          const isSelected = selectedChoice === originalIndex;
                          const isCorrectChoice = originalIndex === lesson.correctIndex;
                          const tone =
                            answered && isCorrectChoice
                              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                              : answered && isSelected
                                ? "border-rose-300 bg-rose-50 text-rose-900"
                                : "border-slate-200 bg-white text-slate-700 hover:border-staf/40";

                          return (
                            <button
                              key={choice}
                              type="button"
                              className={`min-h-14 rounded-md border px-3 py-2 text-left text-sm font-semibold transition disabled:cursor-default ${tone}`}
                              onClick={() => onAnswer(mode.id, lesson.id, originalIndex)}
                              disabled={answered}
                            >
                              {choice}
                            </button>
                          );
                        })}
                      </div>
                      {wrong ? (
                        <button
                          type="button"
                          className="mt-3 inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
                          onClick={() => onClearAnswer(mode.id, lesson.id)}
                        >
                          <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
                          この問題を再挑戦
                        </button>
                      ) : null}
                    </section>
                  );
                })}
              </div>
            </div>
          ) : null}

          {passed ? (
            <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
              <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                  <Trophy aria-hidden="true" className="h-4 w-4" />
                  100点達成
                </p>
                <p className="mt-2 text-sm leading-relaxed text-emerald-900">
                  修了書に記載する氏名と会社名を入力してください。ボタンを押すとブラウザの印刷画面が開くので、保存先でPDFを選べます。
                </p>
                <label className="mt-4 block text-sm font-bold text-slate-700">
                  氏名
                  <input
                    value={certificateForm.recipientName}
                    onChange={(event) => onFormChange(mode.id, "recipientName", event.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/15"
                    placeholder="例：山田 太郎"
                  />
                </label>
                <label className="mt-3 block text-sm font-bold text-slate-700">
                  会社名
                  <input
                    value={certificateForm.companyName}
                    onChange={(event) => onFormChange(mode.id, "companyName", event.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/15"
                    placeholder="例：スタッフ株式会社"
                  />
                </label>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-staf px-4 py-2 text-sm font-bold text-white transition hover:bg-staf-dark"
                  onClick={() => onIssueCertificate(mode.id)}
                >
                  <FileDown aria-hidden="true" className="h-4 w-4" />
                  PDF修了書を出力
                </button>
                {modeNotice ? (
                  <p
                    className={`mt-3 rounded-md border p-2 text-xs font-bold ${
                      modeNotice.tone === "success"
                        ? "border-emerald-200 bg-white text-emerald-800"
                        : "border-rose-200 bg-rose-50 text-rose-800"
                    }`}
                  >
                    {modeNotice.message}
                  </p>
                ) : null}
              </section>

              <CertificateView
                certificate={
                  certificate ?? {
                    mode: mode.id,
                    modeLabel: mode.label,
                    recipientName: certificateForm.recipientName || "氏名未入力",
                    companyName: certificateForm.companyName || "会社名未入力",
                    issuedAt: new Date().toISOString(),
                    score: 100,
                    certificateId: certificateIdFor(mode.id, new Date().toISOString())
                  }
                }
              />
            </div>
          ) : certificate ? (
            <CertificateView certificate={certificate} />
          ) : null}
        </div>
      )}
    </section>
  );
}

export function RfLearningQuestClient() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [activeMode, setActiveMode] = useState<QuestModeId>("intro");
  const [activeLessonId, setActiveLessonId] = useState<string>("intro-rf");
  const [levelUp, setLevelUp] = useState<LevelUpState | null>(null);
  const [streak, setStreak] = useState(0);
  const [certificationState, setCertificationState] = useState<CertificationState>({
    attempts: {},
    certificates: {}
  });
  const [certificateForms, setCertificateForms] =
    useState<Record<QuestModeId, { recipientName: string; companyName: string }>>(emptyCertificateForms);
  const [certificateNotice, setCertificateNotice] = useState<{
    mode: QuestModeId;
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [printableCertificate, setPrintableCertificate] = useState<CertificateRecord | null>(null);

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
  const nextLevelAt = currentLevel * 5;
  const remainingToNextLevel =
    completedCount >= rfQuestLessons.length ? 0 : Math.max(1, nextLevelAt - completedCount);
  const nextLesson = useMemo(() => {
    const nextInMode = lessonsInMode.find((lesson) => lesson.stage > activeLesson.stage);

    if (nextInMode) {
      return nextInMode;
    }

    const activeModeIndex = questModes.findIndex((mode) => mode.id === activeMode);
    for (let offset = 1; offset <= questModes.length; offset += 1) {
      const nextMode = questModes[(activeModeIndex + offset + questModes.length) % questModes.length].id;
      const firstInNextMode = rfQuestLessons
        .filter((lesson) => lesson.mode === nextMode)
        .sort((a, b) => a.stage - b.stage)[0];

      if (firstInNextMode) {
        return firstInNextMode;
      }
    }

    return activeLesson;
  }, [activeLesson, activeMode, lessonsInMode]);

  useEffect(() => {
    const stored = loadProgress();
    const storedCertification = loadCertificationState();
    setProgress(stored);
    setCertificationState(storedCertification);
    setCertificateForms(() => {
      const next = { ...emptyCertificateForms };
      for (const mode of questModes) {
        const certificate = storedCertification.certificates[mode.id];
        if (certificate) {
          next[mode.id] = {
            recipientName: certificate.recipientName,
            companyName: certificate.companyName
          };
        }
      }
      return next;
    });
    const firstMode = questModes[0].id;
    setActiveLessonId(nextIncompleteLesson(firstMode, stored).id);
  }, []);

  function selectMode(mode: QuestModeId) {
    setActiveMode(mode);
    setActiveLessonId(nextIncompleteLesson(mode, progress).id);
  }

  function clearWrongLessonAnswer(lesson: QuestLesson) {
    setAnswers((current) => {
      const selectedChoice = current[lesson.id];

      if (selectedChoice === undefined || selectedChoice === lesson.correctIndex) {
        return current;
      }

      const next = { ...current };
      delete next[lesson.id];
      return next;
    });
  }

  function selectLesson(lesson: QuestLesson) {
    clearWrongLessonAnswer(lesson);
    setActiveLessonId(lesson.id);
  }

  function answerLesson(lesson: QuestLesson, choiceIndex: number) {
    setAnswers((current) => ({ ...current, [lesson.id]: choiceIndex }));

    if (choiceIndex !== lesson.correctIndex) {
      setStreak(0);
      return;
    }

    if (progress[lesson.id]) {
      return;
    }

    setStreak((current) => current + 1);
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
              ? "全700問を攻略しました。アンテナ構造、実装、リンク設計、最新研究、掲示板で定番の誤解までひと通り確認済みです。"
              : `${afterCount}問クリア。アンテナギルドの称号や未攻略ステージへ進めます。`
        });
      }

      return next;
    });
  }

  function resetProgress() {
    setProgress({});
    setAnswers({});
    saveProgress({});
    setCertificationState({ attempts: {}, certificates: {} });
    saveCertificationState({ attempts: {}, certificates: {} });
    setCertificateForms(emptyCertificateForms);
    setCertificateNotice(null);
    setLevelUp(null);
    setStreak(0);
    setActiveMode("intro");
    setActiveLessonId("intro-rf");
  }

  function goToLesson(lesson: QuestLesson) {
    setActiveMode(lesson.mode);
    setActiveLessonId(lesson.id);
    setLevelUp(null);
  }

  function startCertificationAttempt(mode: QuestModeId) {
    const lessonIds = pickRandomLessons(mode).map((lesson) => lesson.id);
    setCertificateNotice(null);
    setCertificationState((current) => {
      const next: CertificationState = {
        attempts: {
          ...current.attempts,
          [mode]: {
            lessonIds,
            answers: {},
            startedAt: new Date().toISOString()
          }
        },
        certificates: current.certificates
      };
      saveCertificationState(next);
      return next;
    });
  }

  function answerCertificationQuestion(mode: QuestModeId, lessonId: string, choiceIndex: number) {
    setCertificationState((current) => {
      const attempt = current.attempts[mode];

      if (!attempt || attempt.answers[lessonId] !== undefined) {
        return current;
      }

      const next: CertificationState = {
        attempts: {
          ...current.attempts,
          [mode]: {
            ...attempt,
            answers: {
              ...attempt.answers,
              [lessonId]: choiceIndex
            }
          }
        },
        certificates: current.certificates
      };
      saveCertificationState(next);
      return next;
    });
  }

  function clearCertificationAnswer(mode: QuestModeId, lessonId: string) {
    setCertificationState((current) => {
      const attempt = current.attempts[mode];
      const lesson = rfQuestLessons.find((item) => item.id === lessonId);

      if (!attempt || !lesson || attempt.answers[lessonId] === undefined || attempt.answers[lessonId] === lesson.correctIndex) {
        return current;
      }

      const nextAnswers = { ...attempt.answers };
      delete nextAnswers[lessonId];

      const next: CertificationState = {
        attempts: {
          ...current.attempts,
          [mode]: {
            ...attempt,
            answers: nextAnswers
          }
        },
        certificates: current.certificates
      };
      saveCertificationState(next);
      return next;
    });
  }

  function updateCertificateForm(
    mode: QuestModeId,
    field: "recipientName" | "companyName",
    value: string
  ) {
    setCertificateForms((current) => ({
      ...current,
      [mode]: {
        ...current[mode],
        [field]: value
      }
    }));
  }

  function printCertificate(certificate: CertificateRecord) {
    setPrintableCertificate(certificate);
    setCertificateNotice({
      mode: certificate.mode,
      tone: "success",
      message: "PDF出力の準備ができました。印刷画面でPDF保存を選択してください。"
    });
    window.setTimeout(() => {
      document.body.classList.add("rf-certificate-printing");
      window.print();
      window.setTimeout(() => document.body.classList.remove("rf-certificate-printing"), 500);
    }, 0);
  }

  function issueCertificate(mode: QuestModeId) {
    const attempt = certificationState.attempts[mode];
    const modeMeta = questModes.find((item) => item.id === mode);
    const form = certificateForms[mode];
    const examLessons =
      attempt?.lessonIds
        .map((lessonId) => rfQuestLessons.find((lesson) => lesson.id === lessonId))
        .filter((lesson): lesson is QuestLesson => Boolean(lesson)) ?? [];
    const answeredCount = examLessons.filter((lesson) => attempt?.answers[lesson.id] !== undefined).length;
    const correctCount = examLessons.filter((lesson) => attempt?.answers[lesson.id] === lesson.correctIndex).length;

    if (!attempt || !modeMeta || answeredCount !== CERTIFICATION_QUESTION_COUNT || correctCount !== CERTIFICATION_QUESTION_COUNT) {
      setCertificateNotice({
        mode,
        tone: "error",
        message: "修了書を出力するには、ランダム10問で100点を達成してください。"
      });
      return;
    }

    const recipientName = form.recipientName.trim();
    const companyName = form.companyName.trim();

    if (!recipientName || !companyName) {
      setCertificateNotice({
        mode,
        tone: "error",
        message: "修了書に記載する氏名と会社名を入力してください。"
      });
      return;
    }

    const issuedAt = new Date().toISOString();
    const certificate: CertificateRecord = {
      mode,
      modeLabel: modeMeta.label,
      recipientName,
      companyName,
      issuedAt,
      score: 100,
      certificateId: certificateIdFor(mode, issuedAt)
    };

    setCertificationState((current) => {
      const next: CertificationState = {
        attempts: current.attempts,
        certificates: {
          ...current.certificates,
          [mode]: certificate
        }
      };
      saveCertificationState(next);
      return next;
    });
    printCertificate(certificate);
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
              問題を倒して、アンテナ設計の勘を育てる
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
              入門、初心者、見習い、実務者、玄人、研究者の6モードで合計700問。選択肢は表示ごとにランダム化され、1問ごとに即答え、解説、関連ツール、現場コラムを確認できます。
              波長、VSWR、放射効率、GND、筐体、ケーブル、基地局アンテナ、最新研究まで、アンテナメーカーの現場目線で進められます。
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
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold">
              <div className="rounded-md bg-white/70 p-2">
                <p className="text-slate-500">連続正解</p>
                <p className="text-base text-staf">{streak}</p>
              </div>
              <div className="rounded-md bg-white/70 p-2">
                <p className="text-slate-500">次Lvまで</p>
                <p className="text-base text-staf">{remainingToNextLevel}問</p>
              </div>
            </div>
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

      <div className="mt-5">
        <AntennaGuildPanel completedCount={completedCount} progress={progress} onJump={goToLesson} />
      </div>

      <div className="mt-5">
        <CertificationPanel
          mode={activeModeMeta}
          lessons={lessonsInMode}
          completedInMode={completedInMode}
          certificationState={certificationState}
          certificateForm={certificateForms[activeMode]}
          notice={certificateNotice}
          onStartAttempt={startCertificationAttempt}
          onAnswer={answerCertificationQuestion}
          onClearAnswer={clearCertificationAnswer}
          onFormChange={updateCertificateForm}
          onIssueCertificate={issueCertificate}
          onPrintCertificate={printCertificate}
        />
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
            modeId={activeMode}
            lessons={lessonsInMode}
            activeLesson={activeLesson}
            progress={progress}
            onSelect={selectLesson}
          />
        </aside>

        <LessonBattle
          lesson={activeLesson}
          selectedChoice={answers[activeLesson.id]}
          isCompleted={Boolean(progress[activeLesson.id])}
          nextLesson={nextLesson}
          streak={streak}
          onAnswer={(choiceIndex) => answerLesson(activeLesson, choiceIndex)}
          onClearAnswer={() => clearWrongLessonAnswer(activeLesson)}
          onNext={() => goToLesson(nextLesson)}
        />
      </section>
      {printableCertificate ? (
        <div className="rf-certificate-print-source">
          <CertificateView certificate={printableCertificate} printTarget />
        </div>
      ) : null}
    </main>
  );
}
