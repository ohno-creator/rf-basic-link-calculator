import type { Metadata } from "next";
import { CoaxCableLossPanel } from "@/app/tools/_components/CoaxCableLossPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("coaxial-cable-loss")!;

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

export default function CoaxialCableLossPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <CoaxCableLossPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
