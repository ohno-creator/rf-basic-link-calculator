import type { Metadata } from "next";
import { ElectricalLengthPanel } from "@/app/tools/_components/ElectricalLengthPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("electrical-length")!;

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

export default function ElectricalLengthPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <ElectricalLengthPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
