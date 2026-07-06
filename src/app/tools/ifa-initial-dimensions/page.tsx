import type { Metadata } from "next";
import { IfaDimensionsPanel } from "@/app/tools/_components/IfaDimensionsPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("ifa-initial-dimensions")!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.description,
  alternates: { canonical: tool.canonical },
  openGraph: { title: tool.metaTitle, description: tool.description, type: "website", siteName: "スタッフ株式会社", url: tool.canonical }
};

export default function IfaInitialDimensionsPage() {
  return <ToolLayout><BasicToolPageShell tool={tool}><IfaDimensionsPanel /></BasicToolPageShell></ToolLayout>;
}
