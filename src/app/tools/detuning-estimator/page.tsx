import type { Metadata } from "next";
import { DetuningEstimatorPanel } from "@/app/tools/_components/DetuningEstimatorPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("detuning-estimator")!;

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

export default function DetuningEstimatorPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <DetuningEstimatorPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
