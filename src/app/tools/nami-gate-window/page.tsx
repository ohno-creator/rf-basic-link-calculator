import type { Metadata } from "next";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";
import { NamiGateClient } from "./components/NamiGateClient";

const tool = getBasicTool("nami-gate-window")!;

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

export default function NamiGateWindowPage() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <NamiGateClient />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
