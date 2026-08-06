import type { Metadata } from "next";
import { RealizedGainPanel } from "@/app/tools/_components/RealizedGainPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("realized-gain")!;

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

export default function RealizedGainPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <RealizedGainPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
