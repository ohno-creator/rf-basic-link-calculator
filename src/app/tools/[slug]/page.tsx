import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";
import { manifestPanels, manifestSlugs } from "./panelRegistry";

/**
 * F1スパイク: レジストリ駆動の基本ツールページ（output: "export" 両立検証）。
 * 個別 page.tsx の完全同一ボイラープレート（正規化diff 0行を確認済み）を、
 * tools.ts のメタ＋panelRegistry の2点から静的生成する。
 */

type PageParams = { slug: string };

export function generateStaticParams(): PageParams[] {
  return manifestSlugs.map((slug) => ({ slug }));
}

// 台帳外slugへの動的アクセスを防ぐ（静的書き出しでは生成対象外だが明示する）
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getBasicTool(slug);
  if (!tool) {
    return {};
  }
  return {
    title: tool.metaTitle,
    description: tool.description,
    alternates: { canonical: tool.canonical },
    openGraph: {
      title: tool.metaTitle,
      description: tool.description,
      type: "website",
      siteName: "スタッフ株式会社",
      url: tool.canonical
    }
  };
}

export default async function ManifestToolPage({ params }: { params: Promise<PageParams> }) {
  const { slug } = await params;
  const tool = getBasicTool(slug);
  const Panel = manifestPanels[slug];
  if (!tool || !Panel) {
    notFound();
  }

  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <Panel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
