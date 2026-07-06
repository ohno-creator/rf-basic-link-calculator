import type { Metadata } from "next";
import { LteSignalMetricsPanel } from "@/app/tools/_components/LteSignalMetricsPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("lte-signal-metrics")!;

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

export default function LteSignalMetricsPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <LteSignalMetricsPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
