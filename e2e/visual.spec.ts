import { expect, test } from "@playwright/test";
import { tools } from "../src/data/tools";

test.describe("visual regression baseline", () => {
  // Set sufficient timeout for visual tests
  test.setTimeout(180000);

  const pages = [
    { name: "home", path: "/" },
    ...tools.map(t => ({ name: t.slug, path: `/tools/${t.slug}/` }))
  ];

  const viewports = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 375, height: 812 }
  ];

  for (const p of pages) {
    for (const vp of viewports) {
      test(`${p.name} - ${vp.name} visual screenshot`, async ({ page }) => {
        // Set viewport size
        await page.setViewportSize({ width: vp.width, height: vp.height });

        // Navigate to the target page
        await page.goto(p.path);

        // Wait for rendering to stabilize (especially animations or observers)
        await page.waitForTimeout(1000);

        // Visual screenshot comparison
        await expect(page).toHaveScreenshot(`${p.name}-${vp.name}.png`, {
          fullPage: true,
          maxDiffPixelRatio: 0.01
        });
      });
    }
  }
});
