import Link from "next/link";
import { ArrowRight, Compass, Eye, ListChecks, Target } from "lucide-react";
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
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header>
          <p className="text-sm font-semibold text-staf-dark">RF計算ツール</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">{tool.title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-700">
            {tool.description}
          </p>
          {tool.scopeNote ? (
            <p className="mt-3 flex max-w-3xl items-start gap-2 rounded-lg border border-staf/20 bg-staf-light px-3 py-2 text-sm leading-relaxed text-slate-700">
              <Compass aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-staf-dark" />
              <span>
                <span className="font-semibold text-staf-dark">対象：</span>
                {tool.scopeNote}
              </span>
            </p>
          ) : null}
        </header>

        <section className="mt-6 border-y border-slate-200 bg-slate-50/80 px-4 py-5 sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="lg:w-48 lg:shrink-0">
              <p className="text-xs font-semibold text-staf-dark">はじめての見方</p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-900">
                式より先に、ここだけ見れば大丈夫です。
              </p>
            </div>
            <div className="grid flex-1 gap-4 md:grid-cols-3 md:divide-x md:divide-slate-200">
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
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            用語が分からない場合は、ページ内の「？」や用語ミニ辞典を開いてください。まずは近いプリセットや初期値から動かすと、変化がつかみやすくなります。
          </p>
        </section>

        <div className="mt-8 space-y-6">{children}</div>

        <section className="mt-10">
          <h2 className="text-base font-semibold text-slate-950">ほかのツール</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-lg border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-staf/40 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                <p className="text-sm font-semibold text-slate-900 group-hover:text-staf">
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
