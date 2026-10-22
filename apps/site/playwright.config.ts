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
      command: "secretspec run pnpm --filter site dev",
      ignoreHTTPSErrors: true,
      name: "Website",
      reuseExistingServer: !process.env.CI,
      url: "http://localhost:4321",
      env: {
        PUBLIC_SRV_URL: "http://localhost:5001",
      },
    },
    {
      command: "secretspec run pnpm --filter api dev",
      ignoreHTTPSErrors: true,
      name: "API Server",
      reuseExistingServer: !process.env.CI,
      port: 5001,
      env: {
        PORT: "5001",
      },
    },
  ],
});
