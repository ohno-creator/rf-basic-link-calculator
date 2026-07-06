import type { Metadata } from "next";
import { NoiseFloorPanel } from "@/app/tools/_components/NoiseFloorPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("noise-floor")!;

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

export default function NoiseFloorPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <NoiseFloorPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
