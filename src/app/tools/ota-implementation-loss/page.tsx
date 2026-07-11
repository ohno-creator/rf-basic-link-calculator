import type { Metadata } from "next";
import { OtaImplementationLossPanel } from "@/app/tools/_components/OtaImplementationLossPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("ota-implementation-loss")!;

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

export default function OtaImplementationLossPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <OtaImplementationLossPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
