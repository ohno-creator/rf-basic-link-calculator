import type { Metadata } from "next";
import { GroundPlaneSizePanel } from "@/app/tools/_components/GroundPlaneSizePanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";
const tool = getBasicTool("ground-plane-size")!;
export const metadata: Metadata = { title: tool.metaTitle, description: tool.description, alternates: { canonical: tool.canonical } };
export default function GroundPlaneSizePage() { return <ToolLayout><BasicToolPageShell tool={tool}><GroundPlaneSizePanel /></BasicToolPageShell></ToolLayout>; }
