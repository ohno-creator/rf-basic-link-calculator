import { test } from "@playwright/test";
import { tools } from "../src/data/tools";
import AxeBuilder from "@axe-core/playwright";
import * as fs from "fs";
import * as path from "path";

test("axe accessibility scan", async ({ page }) => {
  // Allow ample time for 25 pages
  test.setTimeout(180000);

  const pages = [
    { name: "home", path: "/" },
    ...tools.map(t => ({ name: t.slug, path: `/tools/${t.slug}/` }))
  ];

  interface NodeSummary {
    target: unknown;
    html: string;
    failureSummary: string;
  }

  interface ViolationSummary {
    id: string;
    impact: string;
    description: string;
    help: string;
    helpUrl: string;
    nodes: NodeSummary[];
  }

  const allViolations: Record<string, ViolationSummary[]> = {};

  for (const p of pages) {
    // Navigate to the target page
    await page.goto(p.path);
    await page.waitForTimeout(500);

    // Run Axe scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    // Filter for serious and critical violations
    const targetViolations = accessibilityScanResults.violations.filter(
      v => v.impact === "serious" || v.impact === "critical"
    );

    if (targetViolations.length > 0) {
      allViolations[p.name] = targetViolations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.map(n => ({
          target: n.target,
          html: n.html,
          failureSummary: n.failureSummary
        }))
      }));
    }
  }

  // Ensure directories exist
  const dir = path.join(__dirname, "../docs/handoff");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Generate Markdown report
  let mdContent = `# アクセシビリティ基準線 (UX-0 Axe Baseline)\n\n`;
  mdContent += `**作成日時**: ${new Date().toISOString()}\n\n`;
  mdContent += `重大(serious/critical)なアクセシビリティ違反の一覧です。現状の違反を記録し、今後の改善の基準線とします。\n\n`;

  const totalViolationsCount = Object.values(allViolations).reduce(
    (acc, curr) => acc + curr.length,
    0
  );
  mdContent += `### 統計情報\n`;
  mdContent += `- 調査ページ数: ${pages.length}\n`;
  mdContent += `- 違反ありページ数: ${Object.keys(allViolations).length}\n`;
  mdContent += `- 重大違反(種類数)の総和: ${totalViolationsCount}\n\n`;

  mdContent += `## 違反詳細\n\n`;

  if (Object.keys(allViolations).length === 0) {
    mdContent += `重大なアクセシビリティ違反は検出されませんでした。\n`;
  } else {
    for (const [pageName, violations] of Object.entries(allViolations)) {
      mdContent += `### [${pageName}](file:///tools/${pageName}/) (${violations.length}件の重大違反)\n\n`;
      for (const v of violations) {
        mdContent += `#### 🔴 [${v.impact.toUpperCase()}] ${v.id}: ${v.help}\n`;
        mdContent += `- **説明**: ${v.description}\n`;
        mdContent += `- **詳細リンク**: [${v.helpUrl}](${v.helpUrl})\n`;
        mdContent += `- **対象要素**:\n`;
        for (const node of v.nodes) {
          mdContent += `  \`\`\`html\n  ${node.html}\n  \`\`\`\n`;
          mdContent += `  - セレクタ: \`${JSON.stringify(node.target)}\`\n`;
          mdContent += `  - 修正要約: ${node.failureSummary}\n\n`;
        }
      }
      mdContent += `---\n\n`;
    }
  }

  // Write markdown file
  fs.writeFileSync(path.join(dir, "ux0-axe.md"), mdContent, "utf-8");
});
