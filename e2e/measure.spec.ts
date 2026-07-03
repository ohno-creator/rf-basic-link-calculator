import { test } from "@playwright/test";
import { tools } from "../src/data/tools";
import * as fs from "fs";
import * as path from "path";

test("measure all tools and home page", async ({ page }) => {
  // Allow plenty of time for 25 pages * 2 viewports = 50 measurements
  test.setTimeout(180000);

  const results: Record<
    string,
    Record<
      string,
      { firstInputY: number | null; totalHeight: number; headings: string[] }
    >
  > = {};

  const pages = [
    { name: "home", path: "/" },
    ...tools.map(t => ({ name: t.slug, path: `/tools/${t.slug}/` }))
  ];

  const viewports = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 375, height: 812 }
  ];

  for (const p of pages) {
    results[p.name] = {};
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      
      // Navigate to the target page
      await page.goto(p.path);
      
      // Wait for layout/hydration stability
      await page.waitForTimeout(500);

      // Locate first interactive input element inside the main content area
      const firstInput = page.locator('#main-content input, #main-content select, #main-content button[type="button"], #main-content [role="radio"]').first();
      let firstInputY: number | null = null;
      if (await firstInput.count() > 0) {
        const box = await firstInput.boundingBox();
        if (box) {
          firstInputY = Math.round(box.y);
        }
      }

      // Measure total page height
      const totalHeight = await page.evaluate(() => document.body.scrollHeight);

      // Get H1 and H2 headings order
      const headings = await page.evaluate(() =>
        Array.from(document.querySelectorAll('h1,h2')).map(el => el.textContent?.trim() || "")
      );

      results[p.name][vp.name] = {
        firstInputY,
        totalHeight,
        headings
      };
    }
  }

  // Ensure directories exist
  const dir = path.join(__dirname, "../docs/handoff");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write JSON output
  fs.writeFileSync(
    path.join(dir, "ux0-metrics.json"),
    JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2),
    "utf-8"
  );
});
