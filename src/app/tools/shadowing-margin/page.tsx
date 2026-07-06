import type { Metadata } from "next";
import { ShadowingMarginPanel } from "@/app/tools/_components/ShadowingMarginPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("shadowing-margin")!;

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

export default function ShadowingMarginPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <ShadowingMarginPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
