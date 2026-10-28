import { defineConfig } from "@playwright/test";

export default defineConfig({
  testMatch: "tests/*.e2e.ts",

  use: {
    baseURL: "http://localhost:4321",
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH,
    },
  },

  webServer: [
    {
      command: "pnpm --filter app-site dev",
      ignoreHTTPSErrors: true,
      name: "Website",
      reuseExistingServer: !process.env.CI,
      url: "http://localhost:4321",
    },
    {
      command: "pnpm --filter srv-contact dev",
      ignoreHTTPSErrors: true,
      name: "API Server",
      reuseExistingServer: !process.env.CI,
      port: 5000,
    },
  ],
});
