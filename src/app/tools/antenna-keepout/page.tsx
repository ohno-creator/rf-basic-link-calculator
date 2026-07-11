import type { Metadata } from "next";
import { AntennaKeepoutPanel } from "@/app/tools/_components/AntennaKeepoutPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("antenna-keepout")!;
export const metadata: Metadata = { title: tool.metaTitle, description: tool.description, alternates: { canonical: tool.canonical } };

export default function AntennaKeepoutPage() {
  return <ToolLayout><BasicToolPageShell tool={tool}><AntennaKeepoutPanel /></BasicToolPageShell></ToolLayout>;
}
