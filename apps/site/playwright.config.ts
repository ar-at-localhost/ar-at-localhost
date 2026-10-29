import { defineConfig } from "@playwright/test";

const SITE_PORT = 3001;
const SITE_URL = `http://localhost:${SITE_PORT}`;
const SRV_PORT = 5001;
const PUBLIC_SRV_URL = `http://localhost:${SRV_PORT}`;

export default defineConfig({
  testMatch: "tests/*.e2e.ts",

  use: {
    baseURL: SITE_URL,
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
      url: SITE_URL,
      env: {
        PORT: SITE_PORT.toString(),
        PUBLIC_SRV_URL,
      },
    },
    {
      command: "pnpm --filter srv-contact dev",
      ignoreHTTPSErrors: true,
      name: "API Server",
      reuseExistingServer: !process.env.CI,
      port: SRV_PORT,
      env: {
        PORT: SRV_PORT.toString(),
        CORS_ALLOW: SITE_URL,
      },
    },
  ],
});
