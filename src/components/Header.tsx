"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, RadioTower, Search, X } from "lucide-react";
import { COLUMN_URL, CONTACT_URL } from "@/lib/rf/presets";
import { toolCategories, toolDirectory } from "@/data/toolDirectory";
import { recordRecentTool } from "@/lib/recentTools";
import { ToolSearchPalette } from "./ToolSearchPalette";

// ツールをカテゴリごとにまとめる（ツールスイッチャー用）。
const groupedTools = toolCategories
  .map((category) => ({
    ...category,
    tools: toolDirectory.filter((tool) => tool.category === category.id)
  }))
  .filter((group) => group.tools.length > 0);

function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) {
    return false;
  }
  return pathname === href || pathname === `${href}/`;
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  // ルート遷移でメニューを閉じる。
  useEffect(() => {
    setMobileOpen(false);
    setToolsOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // ツールページを開いたら「最近使ったツール」履歴へ記録（検索パレットの空クエリ表示用）。
  useEffect(() => {
    const match = pathname?.match(/^\/tools\/([^/]+)\/?$/);
    if (match) {
      recordRecentTool(match[1]);
    }
  }, [pathname]);

  // ⌘K / Ctrl+K でどのページからでも検索パレットを開く。
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
        setToolsOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // デスクトップのツールメニュー：外側クリック・Escで閉じる。
  useEffect(() => {
    if (!toolsOpen) {
      return;
    }
    const onPointer = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [toolsOpen]);

  // モバイルメニューを開いている間は背面スクロールをロック。
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
          aria-label="ホーム（ツール一覧）へ"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-staf text-white">
            <RadioTower aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-slate-950">RF Basic Link Calculator</span>
            <span className="block text-[11px] text-slate-500">アンテナ・無線 基礎計算ツール</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="メインナビゲーション">
          <button
            type="button"
            data-testid="header-search-button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-3 pr-2 text-sm text-slate-500 transition hover:border-staf/40 hover:text-staf-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
          >
            <Search aria-hidden="true" className="h-4 w-4" />
            ツールを検索
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
              ⌘K
            </kbd>
          </button>
          <div className="relative" ref={toolsRef}>
            <button
              type="button"
              aria-expanded={toolsOpen}
              aria-haspopup="true"
              onClick={() => setToolsOpen((open) => !open)}
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-staf-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
            >
              ツールを切り替え
              <ChevronDown aria-hidden="true" className={`h-4 w-4 transition ${toolsOpen ? "rotate-180" : ""}`} />
            </button>
            {toolsOpen ? (
              <div
                role="menu"
                aria-label="ツール一覧"
                className="absolute right-0 top-full mt-2 flex max-h-[min(70vh,40rem)] w-[38rem] max-w-[calc(100vw-2rem)] flex-col rounded-xl border border-slate-200 bg-white shadow-soft"
              >
                {/* 63件を目視で探さなくて済むよう、パネル先頭に検索への近道を置く */}
                <button
                  type="button"
                  onClick={() => {
                    setToolsOpen(false);
                    setSearchOpen(true);
                  }}
                  className="mx-4 mt-4 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 transition hover:border-staf/40 hover:text-staf-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
                >
                  <Search aria-hidden="true" className="h-4 w-4" />
                  キーワードで検索する（⌘K）
                </button>
                {/* 63件が縦に収まらないビューポートでも全ツールへ届くよう、パネル内スクロールにする */}
                <div className="grid gap-4 overflow-y-auto p-4 sm:grid-cols-2">
                  {groupedTools.map((group) => (
                    <div key={group.id}>
                      <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{group.label}</p>
                      <ul className="mt-1">
                        {group.tools.map((tool) => {
                          const active = isActivePath(pathname, tool.href);
                          return (
                            <li key={tool.href}>
                              <Link
                                role="menuitem"
                                href={tool.href}
                                aria-current={active ? "page" : undefined}
                                className={`block rounded-md px-2 py-1.5 transition ${
                                  active ? "bg-staf-light text-staf-dark" : "hover:bg-slate-50"
                                }`}
                              >
                                <span className="block text-sm font-semibold text-slate-900">{tool.name}</span>
                                <span className="block text-xs leading-snug text-slate-500">{tool.tagline}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-staf-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
          >
            ツール一覧
          </Link>
          <a
            href={COLUMN_URL}
            className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-staf-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
          >
            解説コラム
          </a>
          <a
            href={CONTACT_URL}
            className="ml-1 rounded-md bg-staf px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-staf-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
          >
            相談する
          </a>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            aria-label="ツールを検索"
            onClick={() => setSearchOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
          >
            <Search aria-hidden="true" className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "メニューを閉じる" : "メニューを開く"}
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
          >
            {mobileOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div id="mobile-menu" className="md:hidden">
          <div className="max-h-[calc(100vh-3.75rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
              className="mb-3 flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
            >
              <Search aria-hidden="true" className="h-4 w-4" />
              ツール名・キーワードで検索
            </button>
            <div className="flex flex-wrap gap-2">
              <Link href="/" className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800">
                ツール一覧
              </Link>
              <a href={COLUMN_URL} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800">
                解説コラム
              </a>
              <a href={CONTACT_URL} className="rounded-md bg-staf px-3 py-2 text-sm font-semibold text-white">
                相談する
              </a>
            </div>
            <div className="mt-4 space-y-4">
              {groupedTools.map((group) => (
                <div key={group.id}>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{group.label}</p>
                  <ul className="mt-1 divide-y divide-slate-100">
                    {group.tools.map((tool) => {
                      const active = isActivePath(pathname, tool.href);
                      return (
                        <li key={tool.href}>
                          <Link
                            href={tool.href}
                            aria-current={active ? "page" : undefined}
                            className={`flex min-h-[44px] items-center justify-between gap-3 py-2 ${
                              active ? "text-staf-dark" : "text-slate-800"
                            }`}
                          >
                            <span>
                              <span className="block text-sm font-semibold">{tool.name}</span>
                              <span className="block text-xs leading-snug text-slate-500">{tool.tagline}</span>
                            </span>
                            {active ? <span className="shrink-0 text-[10px] font-bold text-staf-dark">現在地</span> : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <ToolSearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
