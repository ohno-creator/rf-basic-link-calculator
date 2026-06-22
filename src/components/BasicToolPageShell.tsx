import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { ConsultationCta } from "@/app/tools/rf-basic-link-calculator/components/ConsultationCta";
import type { BasicToolMeta } from "@/data/basicTools";
import { toolDirectory } from "@/data/toolDirectory";
import { COLUMN_URL } from "@/lib/rf/presets";

type BasicToolPageShellProps = {
  tool: BasicToolMeta;
  children: ReactNode;
};

// 看板ツール（リンクバジェット診断・RF学習クエスト）は必ず関連導線に含める。
const flagshipHrefs = ["/tools/rf-basic-link-calculator", "/tools/rf-learning-quest"];

export function BasicToolPageShell({ tool, children }: BasicToolPageShellProps) {
  const currentHref = `/tools/${tool.slug}`;
  const others = toolDirectory.filter((item) => item.href !== currentHref);
  const related = [
    ...others.filter((item) => flagshipHrefs.includes(item.href)),
    ...others.filter((item) => !flagshipHrefs.includes(item.href))
  ].slice(0, 6);

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
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header>
          <p className="text-sm font-semibold text-staf">基本計算ツール（単機能）</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">{tool.title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-700">
            {tool.description}
          </p>
        </header>

        <div className="mt-8 space-y-6">{children}</div>

        <section className="mt-10">
          <h2 className="text-base font-semibold text-slate-950">ほかのツール</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-lg border border-slate-200 bg-white p-4 transition hover:border-staf/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                <p className="text-sm font-semibold text-slate-900 group-hover:text-staf">
                  {item.name}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
                  {item.tagline}
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
