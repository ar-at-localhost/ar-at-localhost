import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  exports: {
    devExports: true,

    customExports: (exports) => {
      exports["./env.d.ts"] = "./env.d.ts";
      exports["./svelte"] = "./src/svelte.ts";
      return exports;
    },

    packageJson: true,
  },
});
