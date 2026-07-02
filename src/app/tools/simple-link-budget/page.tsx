import type { Metadata } from "next";
import { SimpleLinkBudgetPanel } from "@/app/tools/_components/SimpleLinkBudgetPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("simple-link-budget")!;

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

export default function SimpleLinkBudgetPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <SimpleLinkBudgetPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
