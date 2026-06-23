import type { Metadata } from "next";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";
import { AntennaToolPanel } from "../_components/AntennaToolPanel";

const tool = getBasicTool("patch-antenna-dimensions")!;

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

export default function PatchAntennaDimensionsPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <AntennaToolPanel toolId="patch-antenna-dimensions" />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
