import type { Metadata } from "next";
import { FieldStrengthPanel } from "@/app/tools/_components/FieldStrengthPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("field-strength")!;

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

export default function FieldStrengthPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <FieldStrengthPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
