import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { compareScaffoldSource } from "./scaffold-normalize.mjs";
import { loadTools } from "./load-tools.mjs";

const argv = process.argv.slice(2), args = new Set(argv), slugArg = argv.find((arg) => !arg.startsWith("--"));
const check = args.has("--check"), force = args.has("--force"), all = args.has("--all") || check;
const pascal = (slug) => slug.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("");
const render = (tool) => `import type { Metadata } from "next";
import { ${tool.panel} } from "@/app/tools/_components/${tool.panel}";
import { BasicToolPageShell } from "@/components/BasicToolPageShell";
import { ToolLayout } from "@/components/ToolLayout";
import { getBasicTool } from "@/data/basicTools";

const tool = getBasicTool("${tool.slug}")!;

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

export default function ${pascal(tool.slug)}Page() {
  return (
    <ToolLayout>
      <BasicToolPageShell tool={tool}>
        <${tool.panel} />
      </BasicToolPageShell>
    </ToolLayout>
  );
}
`;
const candidates = loadTools().filter((tool) => tool.basic && tool.panel && (all || tool.slug === slugArg));
if (!all && !slugArg) throw new Error("slug または --all / --check を指定してください。");
if (!candidates.length) throw new Error(`生成対象がありません: ${slugArg ?? "registry"}`);
let failed = false;
for (const tool of candidates) {
  const path = join("src", "app", "tools", tool.slug, "page.tsx"), generated = render(tool);
  if (!existsSync(path)) {
    if (check) { console.error(`missing: ${path}`); failed = true; continue; }
    mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, generated); console.log(`created: ${path}`); continue;
  }
  if (compareScaffoldSource(readFileSync(path, "utf8"), generated) === "skip") { console.log(`skip: ${path}`); continue; }
  if (force && !check) { writeFileSync(path, generated); console.log(`overwritten: ${path}`); continue; }
  console.error(`conflict: ${path}`); failed = true;
}
if (failed) process.exitCode = 1;
