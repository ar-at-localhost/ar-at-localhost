import { defineConfig } from "vitest/config";

export default defineConfig({
  assetsInclude: ["*.html"],
  test: {
    include: ["./src/**/*.test.ts"],
    globalSetup: ["./src/test/global.ts"],
  },
});
