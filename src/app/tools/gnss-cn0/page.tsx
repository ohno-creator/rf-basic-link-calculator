import type { Metadata } from "next";
import { GnssCn0Panel } from "@/app/tools/_components/GnssCn0Panel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("gnss-cn0")!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.description,
  alternates: { canonical: tool.canonical },
  openGraph: { title: tool.metaTitle, description: tool.description, type: "website", siteName: "スタッフ株式会社", url: tool.canonical }
};

export default function GnssCn0Page() {
  return <ToolLayout><BasicToolPageShell tool={tool}><GnssCn0Panel /></BasicToolPageShell></ToolLayout>;
}
