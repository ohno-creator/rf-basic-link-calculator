import type { Metadata } from "next";
import { MeasurementSamplingPanel } from "@/app/tools/_components/MeasurementSamplingPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("measurement-sampling")!;

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

export default function MeasurementSamplingPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <MeasurementSamplingPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
