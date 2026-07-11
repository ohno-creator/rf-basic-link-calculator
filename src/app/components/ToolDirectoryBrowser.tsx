"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AppWindow,
  ArrowUpRight,
  BookOpenCheck,
  Box,
  Building2,
  Cable,
  Calculator,
  CircuitBoard,
  FlaskConical,
  Gauge,
  type LucideIcon,
  RadioTower,
  Repeat,
  Ruler,
  Search,
  Spline,
  Waves,
  X
} from "lucide-react";
import { Tooltip } from "@/components/Tooltip";
import { toolCategories, toolDirectory } from "@/data/toolDirectory";

const iconMap: Record<string, LucideIcon> = {
  gauge: Gauge,
  calculator: Calculator,
  waves: Waves,
  spline: Spline,
  building: Building2,
  book: BookOpenCheck,
  radio: RadioTower,
  repeat: Repeat,
  ruler: Ruler,
  activity: Activity,
  cable: Cable,
  circuit: CircuitBoard,
  box: Box,
  window: AppWindow,
  aperture: Spline,
  satellite: RadioTower,
  scan: Ruler,
  radar: Waves,
  panel: CircuitBoard,
  refresh: Repeat,
  antenna: RadioTower,
  orbit: Activity,
  grid: CircuitBoard,
  mirror: Box
};

const researchModeGuide = [
  {
    title: "何を見る区画？",
    body: "普通のリンク計算だけでは分かりにくい「小さすぎる」「近すぎる」「面で反射させたい」といった限界やクセを見ます。"
  },
  {
    title: "実務での使いどころ",
    body: "小型端末のアンテナが入らない、MIMOの間隔が狭い、反射板で死角を減らしたい、という設計レビュー前の一次判断に使えます。"
  },
  {
    title: "まず見る数値",
    body: "判定文を先に読み、次にグラフで入力を少し動かします。式の細部より「どの条件で急に厳しくなるか」を見るのがコツです。"
  }
];

const researchTerms = [
  {
    term: "ka",
    description:
      "アンテナの外形が波長に対してどれだけ小さいかを表す数です。ざっくり、小さい箱に長い波長を押し込むほど厳しい、という目印です。"
  },
  {
    term: "Q",
    description:
      "共振の鋭さです。Qが高いほどピンポイントに合いますが、使える周波数幅は狭くなります。"
  },
  {
    term: "Fraunhofer距離",
    description:
      "アンテナから十分離れて、電波を平らな波として扱いやすくなる距離です。大きなアンテナほど遠くなります。"
  },
  {
    term: "RIS",
    description:
      "電波を反射・制御して、届きにくい場所へ通り道を作る面です。魔法の板ではなく、面積・距離・角度で効き方が変わります。"
  }
];

// 検索＋カテゴリ絞り込みでツールを探せるようにする（発見性: 一覧が増えても破綻しない）。
export function ToolDirectoryBrowser() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // パンくず等から `/?category=<id>#tools` で来たとき、そのカテゴリを初期選択する（回遊）。
  // 静的export互換のためクライアントマウント後にURLを読む（useSearchParamsのSuspense不要）。
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("category");
    if (requested && toolCategories.some((category) => category.id === requested)) {
      setActiveCategory(requested);
    }
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      toolDirectory.filter((tool) => {
        const matchesQuery =
          !normalizedQuery ||
          tool.name.toLowerCase().includes(normalizedQuery) ||
          tool.tagline.toLowerCase().includes(normalizedQuery);
        const matchesCategory = activeCategory === "all" || tool.category === activeCategory;
        return matchesQuery && matchesCategory;
      }),
    [normalizedQuery, activeCategory]
  );

  const groups = toolCategories
    .map((category) => ({
      ...category,
      tools: filtered.filter((tool) => tool.category === category.id)
    }))
    .filter((group) => group.tools.length > 0);

  const resetFilters = () => {
    setQuery("");
    setActiveCategory("all");
  };

  return (
    <section id="tools" aria-labelledby="all-tools-title" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6 pb-5">
        <p className="text-sm font-semibold text-staf-dark">ツール一覧</p>
        <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <h2 id="all-tools-title" className="text-2xl font-bold tracking-tight text-slate-950">
            すべての計算ツールから探す
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600">
            名前が分かる場合は検索、扱いたい分野が決まっている場合はカテゴリで絞り込めます。
          </p>
        </div>
      </div>
      {/* 検索＋カテゴリ絞り込みバー: スクロール中も操作できるよう sticky（ヘッダー直下に吸着） */}
      <div className="sticky top-[57px] z-30 border-y border-slate-200/70 bg-slate-50/85 backdrop-blur supports-[backdrop-filter]:bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-6 py-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="知りたいことを検索（例：届く、損失、アンテナ）"
              aria-label="ツールを検索"
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 outline-none transition focus:border-staf/50 focus:ring-2 focus:ring-staf/40"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="検索をクリア"
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div role="group" aria-label="カテゴリで絞り込み" className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                activeCategory === "all"
                  ? "border-staf bg-staf text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
              }`}
            >
              すべて
              <span className={activeCategory === "all" ? "text-white/80" : "text-slate-400"}>{toolDirectory.length}</span>
            </button>
            {toolCategories.map((category) => {
              const count = toolDirectory.filter((tool) => tool.category === category.id).length;
              const active = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveCategory(active ? "all" : category.id)}
                  className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-staf bg-staf text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
                  }`}
                >
                  {category.label}
                  <span className={active ? "text-white/80" : "text-slate-400"}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mx-auto mt-10 max-w-6xl px-6">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-sm font-semibold text-slate-700">「{query}」に一致するツールは見つかりませんでした。</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-staf/40 hover:text-staf-dark"
            >
              <X aria-hidden="true" className="h-4 w-4" />
              検索・絞り込みをクリア
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {groups.map((group) => {
            const isResearch = group.id === "research";
            // 研究者モードは「すべて表示」で他カテゴリの下に並ぶときだけ、区切り線で明確に分ける。
            const dividerClass = isResearch && groups.length > 1 ? " mt-4 border-t border-slate-200 pt-10" : "";
            return (
            <section key={group.id} className={`mx-auto max-w-6xl px-6${dividerClass}`}>
              <div className="flex items-start gap-3">
                {isResearch ? (
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <FlaskConical aria-hidden="true" className="h-5 w-5" />
                  </span>
                ) : null}
                <div>
                  <h2 className="flex items-baseline gap-2 text-xl font-bold tracking-tight text-slate-950">
                    {group.label}
                    <span className="text-xs font-semibold text-slate-400">{group.tools.length}件</span>
                  </h2>
                  <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500">{group.description}</p>
                  {isResearch ? (
                    <div className="mt-4 space-y-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        {researchModeGuide.map((item) => (
                          <div key={item.title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.body}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">よく出る用語：</span>
                        {researchTerms.map((item) => (
                          <Tooltip key={item.term} term={item.term}>
                            {item.description}
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.tools.map((tool) => {
                  const Icon = iconMap[tool.icon] ?? Gauge;
                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="group flex items-start gap-4 rounded-2xl border border-slate-200/70 bg-white p-6 transition hover:-translate-y-0.5 hover:border-staf/30 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-staf/15 to-staf/5 text-staf-dark ring-1 ring-inset ring-staf/15 transition group-hover:from-staf group-hover:to-staf-dark group-hover:text-white">
                        <Icon aria-hidden="true" strokeWidth={1.75} className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2 text-base font-bold leading-tight text-slate-900 group-hover:text-staf-dark">
                          {tool.name}
                          <ArrowUpRight
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0 text-staf-dark opacity-0 transition group-hover:opacity-100"
                          />
                        </span>
                        <span className="mt-1.5 block text-sm leading-relaxed text-slate-600">{tool.tagline}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
