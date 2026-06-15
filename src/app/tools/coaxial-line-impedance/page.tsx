import type { Metadata } from "next";
import { CoaxImpedancePanel } from "@/app/tools/rf-basic-link-calculator/components/CoaxImpedancePanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("coaxial-line-impedance")!;

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

export default function CoaxialLineImpedancePage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <CoaxImpedancePanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
