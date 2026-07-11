import type { Metadata } from "next";
import { BodyLossPanel } from "@/app/tools/_components/BodyLossPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";
const tool=getBasicTool("body-loss")!; export const metadata:Metadata={title:tool.metaTitle,description:tool.description,alternates:{canonical:tool.canonical}};
export default function BodyLossPage(){return <ToolLayout><BasicToolPageShell tool={tool}><BodyLossPanel/></BasicToolPageShell></ToolLayout>}
