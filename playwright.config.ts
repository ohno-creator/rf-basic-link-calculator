import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"]],
  testMatch: process.env.TEST_VISUAL
    ? ["**/measure.spec.ts", "**/visual.spec.ts", "**/axe.spec.ts"]
    : ["**/tools.spec.ts"],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry"
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000/tools/rf-basic-link-calculator/",
    reuseExistingServer: true,
    timeout: 120000
  }
});
