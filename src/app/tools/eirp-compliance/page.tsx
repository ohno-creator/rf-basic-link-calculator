import type { Metadata } from "next";
import { EirpCompliancePanel } from "@/app/tools/_components/EirpCompliancePanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("eirp-compliance")!;

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

export default function EirpCompliancePage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <EirpCompliancePanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
