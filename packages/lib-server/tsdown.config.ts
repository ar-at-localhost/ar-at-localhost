import { defineConfig } from "tsdown";

export default defineConfig({
  dts: {
    generator: "tsgo",
  },
  exports: {
    devExports: true,
    packageJson: true,
  },
});
