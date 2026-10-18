import { defineConfig } from "tsdown";

export default defineConfig({
  dts: true,
  entry: "src/index.ts",
  exports: {
    bin: "./src/index.ts",
    devExports: true,
  },
});
