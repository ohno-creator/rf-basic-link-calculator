import type { Metadata } from "next";
import { CellularBandMapPanel } from "@/app/tools/_components/CellularBandMapPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("cellular-band-map")!;

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

export default function CellularBandMapPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <CellularBandMapPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
