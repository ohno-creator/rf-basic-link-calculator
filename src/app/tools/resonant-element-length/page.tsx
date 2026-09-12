import type { Metadata } from "next";
import { ResonantElementLengthPanel } from "@/app/tools/_components/ResonantElementLengthPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("resonant-element-length")!;

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

export default function ResonantElementLengthPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <ResonantElementLengthPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
