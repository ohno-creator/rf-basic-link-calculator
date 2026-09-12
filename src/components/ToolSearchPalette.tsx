"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, History, Search, Sparkles, X } from "lucide-react";
import { getSearchableTools, searchTools, type SearchableTool } from "@/lib/toolSearch";
import { loadRecentToolSlugs } from "@/lib/recentTools";
import { toolCategories } from "@/data/toolDirectory";
import { resolveToolIcon } from "./toolIconMap";

type ToolSearchPaletteProps = {
  open: boolean;
  onClose: () => void;
};

const MAX_RESULTS = 10;

/** クエリ空のときに出す定番の入口（迷ったらここ、の3本）。 */
const startHereSlugs = ["rf-basic-link-calculator", "simple-link-budget", "frequency-wavelength"];

const categoryLabel = new Map<string, string>(
  toolCategories.map((category) => [category.id, category.label])
);

type PaletteItem = {
  tool: SearchableTool;
  /** 空クエリ時のグループ見出し（recent / start）。検索時は undefined。 */
  group?: "recent" | "start";
};

function ResultRow({
  item,
  active,
  id,
  onSelect,
  onHover
}: {
  item: PaletteItem;
  active: boolean;
  id: string;
  onSelect: () => void;
  onHover: () => void;
}) {
  const Icon = resolveToolIcon(item.tool.icon);
  return (
    <li id={id} role="option" aria-selected={active}>
      <Link
        href={item.tool.href}
        onClick={onSelect}
        onMouseMove={onHover}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition ${
          active ? "bg-staf-light/70 ring-1 ring-inset ring-staf/30" : "hover:bg-slate-50"
        }`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-staf-dark">
          <Icon aria-hidden="true" strokeWidth={1.75} className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-slate-900">{item.tool.name}</span>
          <span className="block truncate text-xs text-slate-500">{item.tool.tagline}</span>
        </span>
        <span className="hidden shrink-0 items-center gap-2 sm:flex">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            {categoryLabel.get(item.tool.category) ?? item.tool.category}
          </span>
          {active ? <CornerDownLeft aria-hidden="true" className="h-3.5 w-3.5 text-staf-dark" /> : null}
        </span>
      </Link>
    </li>
  );
}

/**
 * ⌘K で全ページから開けるツール検索パレット。
 * 名前・タグライン・別名辞書（同義語/英語/略語/ひらがな）を横断検索し、
 * 空クエリでは「最近使ったツール」と定番の入口を提示する。
 */
export function ToolSearchPalette({ open, onClose }: ToolSearchPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // 開くたびに初期化し、入力へフォーカス。履歴もこのタイミングで読む（SSR安全）。
  useEffect(() => {
    if (!open) {
      return;
    }
    setQuery("");
    setActiveIndex(0);
    setRecentSlugs(loadRecentToolSlugs());
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  const items = useMemo<PaletteItem[]>(() => {
    const trimmed = query.trim();
    if (trimmed) {
      return searchTools(trimmed, MAX_RESULTS).map((result) => ({ tool: result.tool }));
    }
    // 空クエリ: 最近使った → 定番入口（重複は除く）
    const all = getSearchableTools();
    const bySlug = new Map(all.map((tool) => [tool.slug, tool]));
    const recent = recentSlugs
      .map((slug) => bySlug.get(slug))
      .filter((tool): tool is SearchableTool => Boolean(tool))
      .slice(0, 5)
      .map((tool) => ({ tool, group: "recent" as const }));
    const recentSet = new Set(recent.map((item) => item.tool.slug));
    const start = startHereSlugs
      .filter((slug) => !recentSet.has(slug))
      .map((slug) => bySlug.get(slug))
      .filter((tool): tool is SearchableTool => Boolean(tool))
      .map((tool) => ({ tool, group: "start" as const }));
    return [...recent, ...start];
  }, [query, recentSlugs]);

  // 結果が変わったら先頭を選択し直す。
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // アクティブ行を常に可視範囲へ。
  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    const activeEl = list.querySelector(`#tool-palette-option-${activeIndex}`);
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, items.length]);

  if (!open) {
    return null;
  }

  const clampIndex = (index: number) => Math.min(Math.max(index, 0), Math.max(items.length - 1, 0));

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => clampIndex(index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => clampIndex(index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = items[activeIndex];
      if (item) {
        onClose();
        router.push(item.tool.href);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  // 空クエリ時のグループ見出しを行の手前に差し込むためのヘルパー。
  const groupHeading = (item: PaletteItem, index: number) => {
    if (!item.group) {
      return null;
    }
    const prev = items[index - 1];
    if (prev && prev.group === item.group) {
      return null;
    }
    return item.group === "recent" ? (
      <li key={`heading-${item.group}`} aria-hidden="true" className="flex items-center gap-1.5 px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <History aria-hidden="true" className="h-3 w-3" />
        最近使ったツール
      </li>
    ) : (
      <li key={`heading-${item.group}`} aria-hidden="true" className="flex items-center gap-1.5 px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <Sparkles aria-hidden="true" className="h-3 w-3" />
        まずはここから
      </li>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="ツール検索"
        data-testid="tool-search-palette"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onKeyDown={handleKeyDown}
      >
        <div className="relative border-b border-slate-100">
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ツール名・キーワードで検索（例: 技適、届かない、FSPL）"
            aria-label="ツールを検索"
            role="combobox"
            aria-expanded="true"
            aria-controls="tool-palette-listbox"
            aria-activedescendant={items.length > 0 ? `tool-palette-option-${activeIndex}` : undefined}
            className="w-full bg-transparent py-4 pl-11 pr-12 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="検索を閉じる"
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        {items.length > 0 ? (
          <ul
            ref={listRef}
            id="tool-palette-listbox"
            role="listbox"
            aria-label="検索結果"
            className="max-h-[50vh] overflow-y-auto p-2"
          >
            {items.map((item, index) => (
              <Fragment key={item.tool.slug}>
                {groupHeading(item, index)}
                <ResultRow
                  item={item}
                  id={`tool-palette-option-${index}`}
                  active={index === activeIndex}
                  onSelect={onClose}
                  onHover={() => setActiveIndex(index)}
                />
              </Fragment>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-semibold text-slate-700">「{query}」に一致するツールがありません</p>
            <p className="mt-1 text-xs text-slate-500">別の言い方（例:「届かない」「損失」「利得」）や英語名でも探せます</p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-400">
          <span>↑↓ で選択・Enter で開く・Esc で閉じる</span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>全{getSearchableTools().length}ツール</span>
        </div>
      </div>
    </div>
  );
}
