import type { Metadata } from "next";
import { PolarizationLossPanel } from "@/app/tools/_components/PolarizationLossPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("polarization-loss")!;

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

export default function PolarizationLossPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <PolarizationLossPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
