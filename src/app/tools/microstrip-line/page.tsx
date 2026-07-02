import type { Metadata } from "next";
import { MicrostripLinePanel } from "@/app/tools/_components/MicrostripLinePanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("microstrip-line")!;

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

export default function MicrostripLinePage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <MicrostripLinePanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
