import playwrightTest from "file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/.ui-renewal-20260913/app/node_modules/@playwright/test/index.js";

const { defineConfig, devices } = playwrightTest;
const mobile = process.env.RF_A11Y_VIEWPORT === "mobile";
const staticPreview = process.env.RF_A11Y_STATIC === "1";

export default defineConfig({
  testDir: "/Users/pc141/Documents/RF Basic Link Calculator/.ui-renewal-20260913/app/docs/ui-renewal/audit",
  testMatch: "accessibility.spec.mjs",
  reporter: [["list"]],
  workers: 4,
  use: {
    baseURL: staticPreview
      ? "http://127.0.0.1:4173/rf-basic-link-calculator"
      : "http://localhost:3000"
  },
  projects: [{
    name: mobile ? "chromium-mobile" : "chromium-desktop",
    use: {
      ...devices["Desktop Chrome"],
      viewport: mobile ? { width: 390, height: 844 } : devices["Desktop Chrome"].viewport
    }
  }],
  webServer: staticPreview
    ? undefined
    : {
        command: "npm run dev",
        cwd: "/Users/pc141/Documents/RF Basic Link Calculator/.ui-renewal-20260913/app",
        url: "http://localhost:3000/tools/rf-basic-link-calculator/",
        reuseExistingServer: true,
        timeout: 120000
      }
});
