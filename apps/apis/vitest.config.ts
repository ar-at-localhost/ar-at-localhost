import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["./src/**/*.test.ts"],
    globalSetup: ["./src/test/global.ts"],
  },
});
