import { defineConfig } from "tsdown";

export default defineConfig({
  dts: true,
  exports: {
    devExports: true,

    customExports: (exports) => {
      exports["./env.d.ts"] = "./env.d.ts";
      return exports;
    },

    packageJson: true,
  },
});
