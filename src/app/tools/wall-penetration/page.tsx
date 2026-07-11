import type { Metadata } from "next";
import { WallPenetrationPanel } from "@/app/tools/_components/WallPenetrationPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("wall-penetration")!;
export const metadata: Metadata = { title: tool.metaTitle, description: tool.description, alternates: { canonical: tool.canonical } };
export default function WallPenetrationPage() { return <ToolLayout><BasicToolPageShell tool={tool}><WallPenetrationPanel /></BasicToolPageShell></ToolLayout>; }
