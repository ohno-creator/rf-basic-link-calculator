import type { Metadata } from "next";
import { DbmConverterPanel } from "@/app/tools/_components/DbmConverterPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("dbm-converter")!;

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

export default function DbmConverterPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <DbmConverterPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
