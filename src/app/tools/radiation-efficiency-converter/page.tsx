import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { getBasicTool } from "@/data/basicTools";
import { RadiationEfficiencyPanel } from "@/app/tools/_components/RadiationEfficiencyPanel";

const tool = getBasicTool("radiation-efficiency-converter")!;
export const metadata: Metadata = { title: tool.metaTitle, description: tool.description, alternates: { canonical: tool.canonical } };
export default function Page(){return <ToolLayout><BasicToolPageShell tool={tool}><RadiationEfficiencyPanel /></BasicToolPageShell></ToolLayout>}
