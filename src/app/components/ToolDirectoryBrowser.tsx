"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, FlaskConical, Search, X } from "lucide-react";
import { Tooltip } from "@/components/Tooltip";
import { resolveToolIcon } from "@/components/toolIconMap";
import { toolCategories, toolDirectory, toolSubcategories, type DirectoryTool } from "@/data/toolDirectory";
import { searchTools } from "@/lib/toolSearch";

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

// ツールカード（密度優先: アイコン36px・padding控えめ・2行以内で収める）。
function ToolCard({ tool }: { tool: DirectoryTool }) {
  const Icon = resolveToolIcon(tool.icon);
  return (
    <Link
      href={tool.href}
      className="group flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white p-4 transition hover:-translate-y-0.5 hover:border-staf/30 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-staf/15 to-staf/5 text-staf-dark ring-1 ring-inset ring-staf/15 transition group-hover:from-staf group-hover:to-staf-dark group-hover:text-white">
        <Icon aria-hidden="true" strokeWidth={1.75} className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2 text-sm font-bold leading-tight text-slate-900 group-hover:text-staf-dark">
          {tool.name}
          <ArrowUpRight
            aria-hidden="true"
            className="h-3.5 w-3.5 shrink-0 text-staf-dark opacity-0 transition group-hover:opacity-100"
          />
        </span>
        <span className="mt-1 block text-xs leading-snug text-slate-600">{tool.tagline}</span>
      </span>
    </Link>
  );
}

// 検索＋カテゴリ絞り込みでツールを探せるようにする（発見性: 一覧が増えても破綻しない）。
export function ToolDirectoryBrowser() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    const restoreFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const requested = params.get("category");
      setActiveCategory(requested && toolCategories.some((category) => category.id === requested) ? requested : "all");
      setQuery(params.get("q") ?? "");
    };
    restoreFromUrl();
    window.addEventListener("popstate", restoreFromUrl);
    return () => window.removeEventListener("popstate", restoreFromUrl);
  }, []);

  const updateUrl = (nextQuery: string, nextCategory: string, mode: "push" | "replace") => {
    const url = new URL(window.location.href);
    if (nextQuery.trim()) url.searchParams.set("q", nextQuery);
    else url.searchParams.delete("q");
    if (nextCategory !== "all") url.searchParams.set("category", nextCategory);
    else url.searchParams.delete("category");
    window.history[mode === "push" ? "pushState" : "replaceState"]({}, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const changeQuery = (next: string) => {
    setQuery(next);
    updateUrl(next, activeCategory, "replace");
  };

  const changeCategory = (next: string) => {
    setActiveCategory(next);
    updateUrl(query, next, "push");
  };

  const trimmedQuery = query.trim();

  // 検索は同義語辞書込みの共通実装（⌘Kパレットと同じ toolSearch）を使う。
  // 「技適」「fresnel」「パスロス」のような name/tagline に無い語でもヒットする。
  const filtered = useMemo(() => {
    const base: DirectoryTool[] = trimmedQuery
      ? searchTools(trimmedQuery, toolDirectory.length).map((result) => result.tool)
      : toolDirectory;
    return base.filter((tool) => activeCategory === "all" || tool.category === activeCategory);
  }, [trimmedQuery, activeCategory]);

  const groups = toolCategories
    .map((category) => {
      const categoryTools = filtered.filter((tool) => tool.category === category.id);
      const subcats = toolSubcategories.filter((sub) => sub.categoryId === category.id);
      const subgroups =
        subcats.length > 0
          ? subcats
              .map((sub) => ({ ...sub, tools: categoryTools.filter((tool) => tool.subcategory === sub.id) }))
              .filter((sub) => sub.tools.length > 0)
          : null;
      const ungrouped = subgroups ? categoryTools.filter((tool) => !tool.subcategory) : [];
      return { ...category, tools: categoryTools, subgroups, ungrouped };
    })
    .filter((group) => group.tools.length > 0);

  const resetFilters = () => {
    setQuery("");
    setActiveCategory("all");
    updateUrl("", "all", "push");
  };

  return (
    <section id="tools" aria-labelledby="all-tools-title" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
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
      <div className="sticky top-[65px] z-30 border-y border-slate-200/70 bg-slate-50/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-slate-50/85">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => changeQuery(event.target.value)}
              placeholder="知りたいことを検索（例：届く、損失、アンテナ）"
              aria-label="ツールを検索"
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 outline-none transition focus:border-staf/50 focus:ring-2 focus:ring-staf/40"
            />
            {query ? (
              <button
                type="button"
                onClick={() => changeQuery("")}
                aria-label="検索をクリア"
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div role="group" aria-label="カテゴリで絞り込み" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible">
            <button
              type="button"
              aria-pressed={activeCategory === "all"}
              onClick={() => changeCategory("all")}
              className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                activeCategory === "all"
                  ? "border-staf bg-staf text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
              }`}
            >
              すべて
              <span className={activeCategory === "all" ? "text-white" : "text-slate-600"}>{toolDirectory.length}</span>
            </button>
            {toolCategories.map((category) => {
              const count = toolDirectory.filter((tool) => tool.category === category.id).length;
              const active = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => changeCategory(active ? "all" : category.id)}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-staf bg-staf text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
                  }`}
                >
                  {category.label}
                  <span className={active ? "text-white" : "text-slate-600"}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-4 text-sm text-slate-600 sm:px-6" aria-live="polite">
        <span className="font-semibold text-slate-900">{activeCategory === "all" ? "すべて" : toolCategories.find((category) => category.id === activeCategory)?.label}</span>
        {trimmedQuery ? `で「${trimmedQuery}」を検索` : "を表示"}：{filtered.length}件
      </div>

      {filtered.length === 0 ? (
        <div className="mx-auto mt-10 max-w-6xl px-4 sm:px-6">
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
        <div className="mt-6 space-y-8">
          {groups.map((group) => {
            const isResearch = group.id === "research";
            // 研究者モードは「すべて表示」で他カテゴリの下に並ぶときだけ、区切り線で明確に分ける。
            const dividerClass = isResearch && groups.length > 1 ? " mt-4 border-t border-slate-200 pt-8" : "";
            return (
            <section key={group.id} className={`mx-auto max-w-6xl px-6${dividerClass}`}>
              <div className="flex items-start gap-3">
                {isResearch ? (
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <FlaskConical aria-hidden="true" className="h-5 w-5" />
                  </span>
                ) : null}
                <div className="min-w-0 flex-1">
                  <h2 className="flex items-baseline gap-2 text-xl font-bold tracking-tight text-slate-950">
                    {group.label}
                    <span className="text-xs font-semibold text-slate-600">{group.tools.length}件</span>
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

              {group.subgroups ? (
                <div className="mt-4 space-y-5">
                  {group.subgroups.map((sub) => (
                    <div key={sub.id}>
                      <h3 className="flex items-baseline gap-2 text-sm font-bold text-slate-700">
                        {sub.label}
                        <span className="text-xs font-semibold text-slate-600">{sub.tools.length}件</span>
                      </h3>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {sub.tools.map((tool) => (
                          <ToolCard key={tool.href} tool={tool} />
                        ))}
                      </div>
                    </div>
                  ))}
                  {group.ungrouped.length > 0 ? (
                    <div>
                      <h3 className="text-sm font-bold text-slate-700">その他</h3>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {group.ungrouped.map((tool) => (
                          <ToolCard key={tool.href} tool={tool} />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {group.tools.map((tool) => (
                    <ToolCard key={tool.href} tool={tool} />
                  ))}
                </div>
              )}
            </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
