import type { Metadata } from "next";
import { RainAttenuationPanel } from "@/app/tools/_components/RainAttenuationPanel";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("rain-attenuation")!;

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

export default function RainAttenuationPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <RainAttenuationPanel />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
