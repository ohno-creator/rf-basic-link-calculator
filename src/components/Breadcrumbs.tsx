"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { toolCategories, toolDirectory } from "@/data/toolDirectory";

// ルートから現在のツールを特定し、全ツールページで一貫したパンくずを出す。
export function Breadcrumbs() {
  const pathname = usePathname();
  if (!pathname || pathname === "/") {
    return null;
  }
  const normalized = pathname.replace(/\/$/, "");
  const tool = toolDirectory.find((item) => item.href === normalized);
  if (!tool) {
    return null;
  }
  const category = toolCategories.find((item) => item.id === tool.category);

  return (
    <nav aria-label="パンくず" className="border-b border-slate-200 bg-white/60">
      <ol className="mx-auto flex max-w-7xl flex-wrap items-center gap-1.5 px-4 py-2 text-xs text-slate-500 sm:px-6 lg:px-8">
        <li>
          <Link
            href="/"
            className="rounded hover:text-staf-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
          >
            ホーム
          </Link>
        </li>
        {category ? (
          <>
            <li aria-hidden="true">
              <ChevronRight className="h-3 w-3" />
            </li>
            <li>
              <Link
                href={`/?category=${category.id}#tools`}
                className="rounded hover:text-staf-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                {category.label}
              </Link>
            </li>
          </>
        ) : null}
        <li aria-hidden="true">
          <ChevronRight className="h-3 w-3" />
        </li>
        <li aria-current="page" className="font-semibold text-slate-700">
          {tool.name}
        </li>
      </ol>
    </nav>
  );
}
