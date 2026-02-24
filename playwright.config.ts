import { defineConfig, devices } from "@playwright/test";

const port = 5173;
const baseURL = process.env.BASE_URL ?? `http://localhost:${port}`;
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "blob" : "html",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  // webServer: [
  //   {
  //     command: "npm run dev",
  //     cwd: "apps/backend",
  //     url: "http://localhost:3001/api/health",
  //     reuseExistingServer: !process.env.CI,
  //   },
  //   {
  //     command: `npm run dev -- --port ${port}`,
  //     cwd: "apps/frontend",
  //     reuseExistingServer: !process.env.CI,
  //     url: baseURL,
  //   },
  // ],
  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },

    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },

    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
  ],
});
