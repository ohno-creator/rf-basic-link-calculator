import type { Metadata } from "next";
import { FresnelDeepDive } from "@/app/tools/_components/FresnelDeepDive";
import { FresnelZonePanel } from "@/app/tools/_components/FresnelZonePanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("fresnel-zone")!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.description,
  alternates: { canonical: tool.canonical },
  openGraph: {
    title: tool.metaTitle,
    description: tool.description,
    type: "website",
    siteName: "スタッフ株式会社",
    url: tool.canonical
  }
};

export default function FresnelZonePage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <FresnelZonePanel />
        <FresnelDeepDive />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
