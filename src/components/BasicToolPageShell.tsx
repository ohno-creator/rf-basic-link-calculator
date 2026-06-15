import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { ConsultationCta } from "@/app/tools/rf-basic-link-calculator/components/ConsultationCta";
import { basicTools, type BasicToolMeta } from "@/data/basicTools";
import { COLUMN_URL } from "@/lib/rf/presets";

type BasicToolPageShellProps = {
  tool: BasicToolMeta;
  children: ReactNode;
};

export function BasicToolPageShell({ tool, children }: BasicToolPageShellProps) {
  const related = basicTools.filter((item) => item.slug !== tool.slug).slice(0, 6);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.title,
      applicationCategory: "EngineeringApplication",
      operatingSystem: "Web",
      url: tool.canonical,
      description: tool.description,
      offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
      provider: {
        "@type": "Organization",
        name: "スタッフ株式会社",
        url: "https://www.staf.co.jp/"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: "https://www.staf.co.jp/" },
        {
          "@type": "ListItem",
          position: 2,
          name: "アンテナ・無線 基礎計算ツール",
          item: "https://www.staf.co.jp/tools/rf-basic-link-calculator"
        },
        { "@type": "ListItem", position: 3, name: tool.title, item: tool.canonical }
      ]
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="パンくず" className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
          <Link className="hover:text-staf" href="/">
            ツール一覧
          </Link>
          <ChevronRight aria-hidden="true" className="h-3 w-3" />
          <span className="font-medium text-slate-700">{tool.title}</span>
        </nav>

        <header className="mt-4">
          <p className="text-sm font-semibold text-staf">基本計算ツール（単機能）</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">{tool.title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-700">
            {tool.description}
          </p>
        </header>

        <div className="mt-8 space-y-6">{children}</div>

        <section className="mt-10">
          <h2 className="text-base font-semibold text-slate-950">ほかの基本計算ツール</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/tools/${item.slug}`}
                className="group rounded-lg border border-slate-200 bg-white p-4 transition hover:border-staf/40 hover:shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-900 group-hover:text-staf">
                  {item.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {item.essenceLead}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-staf">
                  開く
                  <ArrowRight aria-hidden="true" className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-8">
          <ConsultationCta />
        </div>

        <p className="mt-6 text-sm">
          <a className="font-semibold text-staf hover:text-staf-dark" href={COLUMN_URL}>
            アンテナ・無線設計の詳しい解説コラムを読む
          </a>
        </p>
      </div>
    </>
  );
}
