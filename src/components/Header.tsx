"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Home, Menu, RadioTower, Search, X } from "lucide-react";
import { toolDirectory } from "@/data/toolDirectory";
import { CONTACT_URL } from "@/lib/rf/presets";
import { recordRecentTool } from "@/lib/recentTools";
import { ToolSearchPalette } from "./ToolSearchPalette";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const match = pathname?.match(/^\/tools\/([^/]+)\/?$/);
    if (match) recordRecentTool(match[1]);
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setMobileOpen(false);
        setSearchOpen(true);
      }
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    window.requestAnimationFrame(() => {
      if (searchTriggerRef.current?.isConnected) searchTriggerRef.current.focus();
      else document.getElementById("mobile-menu-trigger")?.focus();
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="ホームへ" className="flex min-w-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-staf text-white"><RadioTower aria-hidden="true" className="h-5 w-5" /></span>
          <span className="truncate text-sm font-bold text-slate-950 sm:text-base">RF Basic Link Calculator</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="メインナビゲーション">
          <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"><Home aria-hidden="true" className="h-4 w-4" />ホーム</Link>
          <button type="button" data-testid="header-search-button" onClick={(event) => { searchTriggerRef.current = event.currentTarget; setSearchOpen(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"><Search aria-hidden="true" className="h-4 w-4" />検索 <kbd className="text-xs text-slate-400">⌘K</kbd></button>
          <Link href="/#tools" className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40">全ツール</Link>
          <a href={CONTACT_URL} className="ml-1 inline-flex min-h-11 items-center rounded-md bg-staf px-4 text-sm font-semibold text-white hover:bg-staf-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40">相談する</a>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <button type="button" aria-label="ツールを検索" onClick={(event) => { searchTriggerRef.current = event.currentTarget; setSearchOpen(true); }} className="inline-flex h-11 w-11 items-center justify-center rounded-md text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"><Search aria-hidden="true" className="h-5 w-5" /></button>
          <button type="button" aria-expanded={mobileOpen} id="mobile-menu-trigger" aria-controls="mobile-menu" aria-label={mobileOpen ? "メニューを閉じる" : "メニューを開く"} onClick={() => setMobileOpen((open) => !open)} className="inline-flex h-11 w-11 items-center justify-center rounded-md text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40">{mobileOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}</button>
        </div>
      </div>

      {mobileOpen ? (
        <nav id="mobile-menu" aria-label="モバイルナビゲーション" className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="grid gap-2">
            <Link href="/" className="flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">ホーム</Link>
            <button type="button" onClick={() => { setMobileOpen(false); setSearchOpen(true); }} className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"><Search aria-hidden="true" className="h-4 w-4" />ツールを検索</button>
            <Link href="/#tools" className="flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">全{toolDirectory.length}ツール</Link>
            <a href={CONTACT_URL} className="flex min-h-11 items-center rounded-lg bg-staf px-3 text-sm font-semibold text-white">相談する</a>
          </div>
        </nav>
      ) : null}

      <ToolSearchPalette open={searchOpen} onClose={closeSearch} />
    </header>
  );
}
