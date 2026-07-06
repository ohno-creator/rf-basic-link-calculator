import type { Metadata } from "next";
import { AntennaIsolationPanel } from "@/app/tools/_components/AntennaIsolationPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("antenna-isolation")!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.description,
  alternates: { canonical: tool.canonical },
  openGraph: { title: tool.metaTitle, description: tool.description, type: "website", siteName: "スタッフ株式会社", url: tool.canonical }
};

export default function AntennaIsolationPage() {
  return <ToolLayout><BasicToolPageShell tool={tool}><AntennaIsolationPanel /></BasicToolPageShell></ToolLayout>;
}
