import type { Metadata } from "next";
import { FrequencyWavelengthPanel } from "@/app/tools/rf-basic-link-calculator/components/FrequencyWavelengthPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("frequency-wavelength")!;

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

export default function FrequencyWavelengthPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <FrequencyWavelengthPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
