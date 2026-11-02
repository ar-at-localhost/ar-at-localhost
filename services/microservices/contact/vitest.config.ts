import { defineConfig } from "vitest/config";

export default defineConfig({
  assetsInclude: ["*.html"],
  test: {
    environment: "node",
    include: ["./src/**/*.test.ts"],
    globalSetup: ["./src/test-setup.ts"],
  },
});
