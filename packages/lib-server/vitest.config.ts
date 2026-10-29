import { defineConfig } from "vitest/config";

export default defineConfig({
  assetsInclude: ["src/templates/**/*.html"],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
