import type { Metadata } from "next";
import { VswrConverterPanel } from "@/app/tools/_components/VswrConverterPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("vswr-return-loss")!;

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

export default function VswrReturnLossPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <VswrConverterPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
