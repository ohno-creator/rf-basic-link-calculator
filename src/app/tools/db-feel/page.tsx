import type { Metadata } from "next";
import { DbFeelPanel } from "@/app/tools/_components/DbFeelPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("db-feel")!;

export const metadata: Metadata = {
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

export default function DbFeelPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <DbFeelPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
