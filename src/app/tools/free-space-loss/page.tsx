import type { Metadata } from "next";
import { FsplPanel } from "@/app/tools/rf-basic-link-calculator/components/FsplPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("free-space-loss")!;

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

export default function FreeSpaceLossPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <FsplPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
