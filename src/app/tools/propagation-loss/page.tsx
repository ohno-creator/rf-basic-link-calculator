import type { Metadata } from "next";
import { PropagationExplorer } from "@/app/tools/_components/PropagationExplorer";
import { PropagationMeasurementColumn } from "@/app/tools/_components/PropagationMeasurementColumn";
import { TwoRayInterferenceLab } from "@/app/tools/_components/TwoRayInterferenceLab";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolColumnCard } from "@/components/ToolColumnCard";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";
import { hataColumn } from "@/data/columns/hata";

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
        <ToolColumnCard column={hataColumn} />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
