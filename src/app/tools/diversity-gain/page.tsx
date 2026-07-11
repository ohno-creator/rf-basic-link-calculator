import type { Metadata } from "next";
import { DiversityGainPanel } from "@/app/tools/_components/DiversityGainPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";
const tool = getBasicTool("diversity-gain")!;
export const metadata: Metadata = { title: tool.metaTitle, description: tool.description, alternates: { canonical: tool.canonical } };
export default function DiversityGainPage() { return <ToolLayout><BasicToolPageShell tool={tool}><DiversityGainPanel /></BasicToolPageShell></ToolLayout>; }
