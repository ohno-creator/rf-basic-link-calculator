import Link from "next/link";
import { ArrowRight, Eye, ListChecks, Target } from "lucide-react";
import type { ReactNode } from "react";
import { ConsultationCta } from "@/app/tools/_components/ConsultationCta";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { HelpHint } from "@/components/HelpHint";
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
  const beginnerItems = [
    {
      title: "何を決める？",
      body: tool.beginnerGuide.purpose,
      icon: Target
    },
    {
      title: "何を入れる？",
      body: tool.beginnerGuide.inputs,
      icon: ListChecks
    },
    {
      title: "結果をどう読む？",
      body: tool.beginnerGuide.result,
      icon: Eye
    }
  ];

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
        { "@type": "ListItem", position: 2, name: tool.title, item: tool.canonical }
      ]
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">{tool.title}</h1>
            {tool.scopeNote ? <HelpHint text={tool.scopeNote} /> : null}
          </div>
          <p className="mt-2 line-clamp-2 max-w-prose text-sm leading-relaxed text-slate-600">
            {tool.description}
          </p>
        </header>

        <div className="mt-4">
          <CollapsibleSection title="はじめての見方" defaultOpen={false} storageKey="beginner-guide">
            <div className="grid gap-4 md:grid-cols-3 md:divide-x md:divide-slate-200">
              {beginnerItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="md:pl-4 first:md:pl-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <Icon aria-hidden="true" className="h-4 w-4 text-staf-dark" />
                      {item.title}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>
        </div>

        <div data-testid="tool-calculator" className="mt-6 space-y-6">{children}</div>

        <section className="mt-8">
          <h2 className="text-base font-bold text-slate-950">ほかのツール</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-lg border border-slate-200 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:border-staf/40 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                <p className="text-sm font-semibold text-slate-900 group-hover:text-staf-dark">
                  {item.name}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
                  {item.tagline}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-staf-dark">
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
          <a className="font-semibold text-staf-dark hover:text-staf-dark" href={COLUMN_URL}>
            アンテナ・無線設計の詳しい解説コラムを読む
          </a>
        </p>
      </div>
    </>
  );
}
