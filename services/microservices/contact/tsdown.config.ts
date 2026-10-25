import { defineConfig } from "tsdown";

export default defineConfig({
  dts: true,
  deps: {
    alwaysBundle: ["lib", "lib-server"],
  },
  entry: "src/index.ts",
  exports: {
    devExports: true,
  },
});
