import type { Metadata } from "next";
import { VswrBandwidthQPanel } from "@/app/tools/_components/VswrBandwidthQPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("vswr-bandwidth-q")!;

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

export default function VswrBandwidthQPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <VswrBandwidthQPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
