import { defineConfig } from "tsdown";

export default defineConfig({
  dts: true,
  deps: {
    alwaysBundle: ["lib", "lib-server", "valibot", "drizzle-orm"],
    neverBundle: ["@google-cloud/secret-manager", "@google-cloud/tasks", "google-gax"],
    onlyBundle: false,
  },
  entry: "src/index.ts",
  exports: {
    devExports: true,
  },
});
