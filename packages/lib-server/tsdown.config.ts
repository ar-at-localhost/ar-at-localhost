import { defineConfig } from "tsdown";

export default defineConfig({
  dts: true,
  exports: {
    devExports: true,
    packageJson: true,
  },
});
