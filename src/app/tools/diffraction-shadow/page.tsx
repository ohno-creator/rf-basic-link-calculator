import type { Metadata } from "next";
import { DiffractionShadowPanel } from "@/app/tools/_components/DiffractionShadowPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("diffraction-shadow")!;

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

export default function DiffractionShadowPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <DiffractionShadowPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
