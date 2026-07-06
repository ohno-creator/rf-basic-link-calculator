import type { Metadata } from "next";
import { MismatchRangeImpactPanel } from "@/app/tools/_components/MismatchRangeImpactPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("mismatch-range-impact")!;

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

export default function MismatchRangeImpactPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <MismatchRangeImpactPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
