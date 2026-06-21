import type { Metadata } from "next";
import { HataColumn } from "@/app/tools/rf-basic-link-calculator/components/HataColumn";
import { PropagationExplorer } from "@/app/tools/rf-basic-link-calculator/components/PropagationExplorer";
import { PropagationMeasurementColumn } from "@/app/tools/rf-basic-link-calculator/components/PropagationMeasurementColumn";
import { TwoRayInterferenceLab } from "@/app/tools/rf-basic-link-calculator/components/TwoRayInterferenceLab";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("propagation-loss")!;

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

export default function PropagationLossPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <PropagationExplorer />
        <TwoRayInterferenceLab />
        <PropagationMeasurementColumn />
        <HataColumn />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
