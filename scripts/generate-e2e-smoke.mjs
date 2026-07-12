import { writeFileSync } from "node:fs";
import { loadTools } from "./load-tools.mjs";

const basicTools = loadTools().filter((tool) => tool.basic);
const cases = basicTools.map((tool) => `  { slug: "${tool.slug}", title: ${JSON.stringify(tool.basic.title)} },`).join("\n");
const output = `// scripts/generate-e2e-smoke.mjs から生成。直接編集しないでください。
import { expect, test } from "@playwright/test";

const tools = [
${cases}
];

for (const tool of tools) {
  test(\`basic smoke: \${tool.slug}\`, async ({ page }) => {
    await page.goto(\`/tools/\${tool.slug}/\`);
    const calculator = page.getByTestId("tool-calculator");
    await expect(calculator).toBeVisible();
    const primary = calculator.getByTestId("primary-result");
    if (await primary.count()) await expect(primary).toBeAttached();
  });
}
`;
writeFileSync("e2e/smoke.generated.spec.ts", output);
console.log(`generated: e2e/smoke.generated.spec.ts (${basicTools.length} tools)`);
