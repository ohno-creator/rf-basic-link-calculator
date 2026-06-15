import Link from "next/link";
import { RadioTower } from "lucide-react";
import { COLUMN_URL, CONTACT_URL } from "@/lib/rf/presets";

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="RF Basic Link Calculator">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-staf text-white">
            <RadioTower aria-hidden="true" className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-normal text-slate-950">
              RF Basic Link Calculator
            </span>
            <span className="block text-xs text-slate-500">Staf Corporation</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
          <Link className="hover:text-staf" href="/">
            ツール一覧
          </Link>
          <a className="hover:text-staf" href={COLUMN_URL}>
            解説コラム
          </a>
          <a
            className="rounded-md bg-staf px-4 py-2 text-white shadow-sm transition hover:bg-staf-dark"
            href={CONTACT_URL}
          >
            相談する
          </a>
        </nav>
      </div>
    </header>
  );
}
