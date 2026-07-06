import type { Metadata } from "next";
import { PointingMarginPanel } from "@/app/tools/_components/PointingMarginPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("pointing-margin")!;

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

export default function PointingMarginPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <PointingMarginPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
