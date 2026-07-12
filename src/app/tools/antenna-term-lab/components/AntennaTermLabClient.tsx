"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Search, Sparkles } from "lucide-react";
import { Card } from "@/components/Card";
import Link from "next/link";
import type { TermMeta, TermCategoryId } from "./types";
import { termComponentsMap } from "./terms";

const STORAGE_KEY = "antenna-term-lab-progress-v1";

const CATEGORY_LABELS: Record<TermCategoryId, string> = {
  physics: "電波の基本",
  parameters: "アンテナの性能",
  matching: "整合と給電",
  deployment: "実装と環境"
};

export const TERMS_METADATA: TermMeta[] = [
  // Group 1: 電波の基本
  {
    id: "frequency-wavelength",
    title: "周波数・波長",
    category: "physics",
    navLabel: "周波数・波長",
    description: "電波の細かさと実寸サイズの関係"
  },
  {
    id: "dielectric-constant",
    title: "誘電率",
    category: "physics",
    navLabel: "誘電率",
    description: "基板の中での波長短縮とパッチの小型化"
  },
  {
    id: "polarization",
    title: "偏波",
    category: "physics",
    navLabel: "偏波",
    description: "送信と受信の角度ずれによる結合ロス"
  },
  {
    id: "near-far-field",
    title: "近傍界・遠方界",
    category: "physics",
    navLabel: "近傍界・遠方界",
    description: "アンテナのすぐそばと十分に離れた場所の境界"
  },
  {
    id: "reciprocity",
    title: "相反性",
    category: "physics",
    navLabel: "相反性",
    description: "送受を入れ替えてもアンテナ特性が変わらない特性"
  },
  // Group 2: アンテナの性能
  {
    id: "antenna-gain",
    title: "利得（dBi）",
    category: "parameters",
    navLabel: "利得（dBi）",
    description: "等方球からのビーム集中度"
  },
  {
    id: "radiation-pattern",
    title: "指向性・放射パターン",
    category: "parameters",
    navLabel: "放射パターン",
    description: "アンテナの向きごとの電波の飛びやすさ"
  },
  {
    id: "beamwidth",
    title: "半値角（ビーム幅）",
    category: "parameters",
    navLabel: "半値角",
    description: "メインローブの電力が半分(-3dB)になる幅"
  },
  {
    id: "radiation-efficiency",
    title: "放射効率",
    category: "parameters",
    navLabel: "放射効率",
    description: "入力電力が熱にならずに電波として放射される割合"
  },
  {
    id: "effective-aperture",
    title: "実効面積",
    category: "parameters",
    navLabel: "実効面積",
    description: "アンテナが電波を拾うお椀の大きさ"
  },
  {
    id: "efficiency-gain-diff",
    title: "効率と利得の違い",
    category: "parameters",
    navLabel: "効率と利得",
    description: "アンテナ自身のロス(総量)とビーム集中(方向)の差"
  },
  // Group 3: 整合と給電
  {
    id: "vswr",
    title: "VSWR",
    category: "matching",
    navLabel: "VSWR",
    description: "進行波と反射波の干渉による定在波比"
  },
  {
    id: "return-loss-s11",
    title: "リターンロス・S11",
    category: "matching",
    navLabel: "S11",
    description: "反射した電力がどれくらい戻ってきたかの指標"
  },
  {
    id: "impedance-matching",
    title: "インピーダンス整合と50Ω",
    category: "matching",
    navLabel: "50Ω整合",
    description: "反射を防ぐための水道管の太さ合わせ"
  },
  {
    id: "resonance",
    title: "共振",
    category: "matching",
    navLabel: "共振",
    description: "アンテナ素子長と周波数の調和"
  },
  {
    id: "bandwidth-vswr2",
    title: "帯域幅（VSWR≤2帯域）",
    category: "matching",
    navLabel: "帯域幅",
    description: "反射が許容値以下に収まる周波数の幅"
  },
  {
    id: "cable-loss-sqrt-f",
    title: "ケーブル損失と√f",
    category: "matching",
    navLabel: "ケーブル損失",
    description: "周波数高騰に伴う挿入損失の特性"
  },
  // Group 4: 実装と環境
  {
    id: "ground-plane",
    title: "グランドプレーン",
    category: "deployment",
    navLabel: "グランドプレーン",
    description: "鏡像アンテナを作る金属グラウンド面積"
  },
  {
    id: "eirp",
    title: "EIRP",
    category: "deployment",
    navLabel: "EIRP",
    description: "見かけ上の等価等方輻射電力と法規"
  },
  {
    id: "isolation",
    title: "アイソレーション",
    category: "deployment",
    navLabel: "アイソレーション",
    description: "複数アンテナ同士の干渉結合量"
  },
  {
    id: "multipath-fading",
    title: "マルチパスとフェージング",
    category: "deployment",
    navLabel: "マルチパス",
    description: "複数経路の波の干渉による受信レベルうねり"
  }
];

type ProgressMap = Record<string, boolean>;

function loadProgress(): ProgressMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as ProgressMap) : {};
  } catch {
    return {};
  }
}

export function AntennaTermLabClient() {
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<TermCategoryId | "all">("all");
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const doneCount = TERMS_METADATA.filter((t) => progress[t.id]).length;

  const filteredTerms = useMemo(() => {
    return TERMS_METADATA.filter((term) => {
      const matchCat = activeCategory === "all" || term.category === activeCategory;
      const matchSearch =
        term.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        CATEGORY_LABELS[term.category].toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const currentTerm = useMemo(() => {
    return TERMS_METADATA.find((t) => t.id === selectedTermId) ?? null;
  }, [selectedTermId]);

  const currentTermIndex = useMemo(() => {
    if (!selectedTermId) return -1;
    return TERMS_METADATA.findIndex((t) => t.id === selectedTermId);
  }, [selectedTermId]);

  const handleToggleProgress = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const next = { ...progress, [id]: !progress[id] };
    setProgress(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handlePrevTerm = () => {
    if (currentTermIndex > 0) {
      setSelectedTermId(TERMS_METADATA[currentTermIndex - 1].id);
    }
  };

  const handleNextTerm = () => {
    if (currentTermIndex < TERMS_METADATA.length - 1) {
      setSelectedTermId(TERMS_METADATA[currentTermIndex + 1].id);
    }
  };

  const ActiveComponent = currentTerm ? termComponentsMap[currentTerm.id] : null;

  return (
    <section className="mx-auto max-w-5xl px-4 pb-8 pt-6 sm:px-6 lg:px-8" data-testid="tool-calculator">
      {/* ヒーローカード */}
      <Card as="section" padding="lg" className="bg-gradient-to-br from-staf-light/60 to-white">
        <div className="flex items-center justify-between gap-4">
          <p className="flex items-center gap-2 text-sm font-bold text-staf-dark">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            アンテナ用語の直感ラボ
          </p>
          <Link
            href="/tools/rf-learning-quest"
            className="text-xs font-bold text-staf hover:underline"
          >
            クエストで腕試し →
          </Link>
        </div>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">アンテナ用語の直感ラボ</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          アンテナ設計やIoT機器開発でつまずきやすい21個の基礎概念を、「触って」直感的に学べる学習室です。
          スライダーを動かし、IoT機器設計のどこで効くかを確認できます。
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-valuenow={doneCount}
            aria-valuemin={0}
            aria-valuemax={TERMS_METADATA.length}
            aria-label="理解済みの用語数"
          >
            <div
              className="h-full rounded-full bg-staf transition-all"
              style={{ width: `${(doneCount / TERMS_METADATA.length) * 100}%` }}
            />
          </div>
          <span
            data-testid="term-progress"
            className="text-sm font-bold text-staf-dark shrink-0"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {doneCount}/{TERMS_METADATA.length} 用語
          </span>
        </div>
      </Card>

      {!selectedTermId ? (
        // 一覧ビュー
        <div className="mt-6 space-y-6">
          {/* 検索 ＆ フィルター */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1">
              {(["all", "physics", "parameters", "matching", "deployment"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    activeCategory === cat
                      ? "bg-staf text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-staf/40 hover:text-staf-dark"
                  }`}
                >
                  {cat === "all" ? "すべて" : CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="用語を検索..."
                className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs font-medium placeholder:text-slate-400 focus:border-staf focus:outline-none sm:w-60"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* グリッド表示 */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTerms.map((term) => {
              const isDone = Boolean(progress[term.id]);
              return (
                <div
                  key={term.id}
                  className="group relative rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-staf/60 hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedTermId(term.id)}
                    data-testid={`term-${term.id}`}
                    className="flex h-full w-full flex-col justify-between rounded-lg p-4 pr-12 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        {CATEGORY_LABELS[term.category]}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-staf">
                      {term.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {term.description}
                    </p>
                    <div className="mt-4 flex items-center justify-end text-[11px] font-bold text-staf">
                    体感する <ChevronRight className="h-3 w-3" />
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleToggleProgress(term.id, e)}
                    className={`absolute right-4 top-4 rounded-full text-slate-300 hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${isDone ? "text-staf" : ""}`}
                    aria-label={`${term.title}の進捗を切り替え`}
                  >
                    <CheckCircle2 className="h-5 w-5 rounded-full bg-white fill-current" />
                  </button>
                </div>
              );
            })}
          </div>

          {filteredTerms.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-12">
              該当する用語が見つかりませんでした。
            </p>
          )}
        </div>
      ) : (
        // 詳細ビュー
        <div className="mt-6 space-y-4">
          {/* パンくず ＆ 戻るリンク */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setSelectedTermId(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-staf-dark"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              用語一覧に戻る
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>{CATEGORY_LABELS[currentTerm!.category]}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-semibold text-slate-700">{currentTerm!.title}</span>
            </div>
          </div>

          {/* タイトルセクションと進捗チェック */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">{currentTerm!.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{currentTerm!.description}</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleProgress(currentTerm!.id)}
              aria-pressed={Boolean(progress[currentTerm!.id])}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${
                progress[currentTerm!.id]
                  ? "border-staf bg-staf text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {progress[currentTerm!.id] ? "理解した！" : "この用語を理解する"}
            </button>
          </div>

          {/* 用語パネル本体 */}
          <div className="mt-4">
            {ActiveComponent ? (
              <ActiveComponent />
            ) : (
              <p className="text-sm text-slate-500">この用語の体感コンテンツは準備中です。</p>
            )}
          </div>

          {/* 前後の用語へのナビゲーション */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={currentTermIndex === 0}
              onClick={handlePrevTerm}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition enabled:hover:border-staf/40 enabled:hover:text-staf-dark disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              前の用語
            </button>
            <button
              type="button"
              disabled={currentTermIndex === TERMS_METADATA.length - 1}
              onClick={handleNextTerm}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition enabled:hover:border-staf/40 enabled:hover:text-staf-dark disabled:opacity-40"
            >
              次の用語
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
