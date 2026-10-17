import { defineConfig } from "tsdown";

export default defineConfig({
  dts: true,
  exports: true,
  externals: ["lib-server"],
});
