import { defineConfig } from "tsdown";

export default defineConfig({
  dts: true,
  deps: {
    neverBundle: ["@google-cloud/secret-manager", "@google-cloud/tasks", "google-gax"],
  },
  exports: {
    devExports: true,
    packageJson: true,

    customExports: (exports) => {
      exports["./env.d.ts"] = "./env.d.ts";
      return exports;
    },
  },
});
