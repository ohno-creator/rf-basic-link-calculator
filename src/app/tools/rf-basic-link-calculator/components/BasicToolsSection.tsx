import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { basicTools } from "@/data/basicTools";

/**
 * リンクバジェット診断とは独立した「単機能の基本計算ツール」へのインデックス。
 * 各ツールは専用ページを持ち、入力に連動する動的な図と本質解説を備える。
 */
export function BasicToolsSection() {
  return (
    <section id="basic-tools" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5">
        <p className="text-sm font-semibold text-staf">基本計算ツール</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">単機能の計算ツール集</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          無線設計でよく使う基本計算を、単機能の専用ページにまとめました。各ページでは、入力に連動する図と解説で「その結果が何を意味するのか」まで確認できます。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {basicTools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-staf/40 hover:shadow-md"
          >
            <h3 className="text-lg font-bold text-slate-950 group-hover:text-staf">{tool.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{tool.description}</p>
            <code className="mt-3 block overflow-x-auto rounded-md bg-slate-950 px-3 py-2 text-xs text-white">
              {tool.formula}
            </code>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-staf">
              ツールを開く
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
