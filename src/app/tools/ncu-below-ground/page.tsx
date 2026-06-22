import type { Metadata } from "next";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";
import { NcuBelowGroundClient } from "./components/NcuBelowGroundClient";

const tool = getBasicTool("ncu-below-ground")!;

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

export default function NcuBelowGroundPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <NcuBelowGroundClient />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
