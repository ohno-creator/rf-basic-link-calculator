import type { Metadata } from "next";
import { MetalPlaneEffectPanel } from "@/app/tools/_components/MetalPlaneEffectPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("metal-plane-effect")!;

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

export default function MetalPlaneEffectPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <MetalPlaneEffectPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
