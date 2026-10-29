import { defineConfig } from "tsdown";

export default defineConfig({
  dts: true,
  deps: {
    alwaysBundle: ["lib", "lib-server", "valibot", "drizzle-orm"],
    onlyBundle: false,
  },
  entry: "src/index.ts",
  exports: {
    devExports: true,
  },
});
