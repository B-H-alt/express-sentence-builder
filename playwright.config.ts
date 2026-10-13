import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:8090",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      testIgnore: "**/ipad-flow.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      testIgnore: "**/ipad-flow.spec.ts",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "ipad-portrait",
      testMatch: "**/ipad-flow.spec.ts",
      use: { ...devices["iPad Pro 11"], browserName: "chromium" },
    },
    {
      name: "ipad-landscape",
      testMatch: "**/ipad-flow.spec.ts",
      use: { ...devices["iPad Pro 11 landscape"], browserName: "chromium" },
    },
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 8090",
    url: "http://127.0.0.1:8090",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
