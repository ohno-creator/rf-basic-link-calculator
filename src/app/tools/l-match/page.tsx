import type { Metadata } from "next";
import { LMatchPanel } from "@/app/tools/_components/LMatchPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("l-match")!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.description,
  alternates: { canonical: tool.canonical },
  openGraph: { title: tool.metaTitle, description: tool.description, type: "website", siteName: "スタッフ株式会社", url: tool.canonical }
};

export default function LMatchPage() {
  return <ToolLayout><BasicToolPageShell tool={tool}><LMatchPanel /></BasicToolPageShell></ToolLayout>;
}
