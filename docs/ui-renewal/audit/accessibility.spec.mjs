import playwrightTest from "file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/.ui-renewal-20260913/app/node_modules/@playwright/test/index.js";
import AxeBuilder from "file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/.ui-renewal-20260913/app/node_modules/@axe-core/playwright/dist/index.js";
import fs from "node:fs";

const { expect, test } = playwrightTest;

const registrySource = fs.readFileSync(
  "/Users/pc141/Documents/RF Basic Link Calculator/.ui-renewal-20260913/app/src/data/tools.ts",
  "utf8"
);
const slugs = [...registrySource.matchAll(/"slug"\s*:\s*"([^"]+)"/g)].map((match) => match[1]);
const routes = ["/", ...slugs.map((slug) => `/tools/${slug}/`)];
const failureReport = [];
let completedScans = 0;
const viewport = process.env.RF_A11Y_VIEWPORT === "mobile" ? "390x844" : "desktop-chrome";
const reportName = viewport === "390x844" ? "all-pages-axe-mobile-audit.json" : "all-pages-axe-audit.json";

test.afterAll(() => {
  fs.writeFileSync(
    `/Users/pc141/Documents/RF Basic Link Calculator/.ui-renewal-20260913/app/docs/ui-renewal/logs/${reportName}`,
    `${JSON.stringify({
      recordedAt: new Date().toISOString(),
      viewport,
      registeredPages: routes.length,
      completedScans,
      status: completedScans === routes.length ? "complete" : "incomplete",
      failures: failureReport
    }, null, 2)}\n`,
    "utf8"
  );
});

test.describe("all registered pages have no serious or critical WCAG 2.1 A/AA axe violations", () => {
  for (const route of routes) {
    test(route, async ({ page }) => {
      test.setTimeout(60000);
      await page.goto(route);
      await page.locator("body").waitFor({ state: "visible" });
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const violations = result.violations
        .filter((item) => item.impact === "serious" || item.impact === "critical")
        .map((item) => ({
          id: item.id,
          impact: item.impact,
          nodes: item.nodes.map((node) => ({ target: node.target, html: node.html }))
        }));
      completedScans += 1;
      if (violations.length > 0) failureReport.push({ route, violations });
      expect(violations).toEqual([]);
    });
  }
});
