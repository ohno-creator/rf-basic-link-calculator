import type { Metadata } from "next";
import { FarFieldDistancePanel } from "@/app/tools/_components/FarFieldDistancePanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("far-field-distance")!;

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

export default function FarFieldDistancePage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <FarFieldDistancePanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
