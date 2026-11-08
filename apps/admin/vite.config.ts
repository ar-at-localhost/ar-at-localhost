import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      adapter: adapter({
        fallback: "index.html",
      }),

      compilerOptions: {
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
      },

      outDir: "dist/",
    }),
  ],
  test: {
    expect: { requireAssertions: true },
    projects: [
      {
        extends: "./vite.config.ts",
        test: {
          name: "browser",
          browser: {
            enabled: true,
            provider: playwright({
              launchOptions: {
                executablePath: process.env.CHROMIUM_PATH,
              },
            }),
            instances: [{ browser: "chromium", headless: true }],
          },
          include: ["src/**/*.test.ts", "src/**/*.svelte.test.ts"],
        },
      },
    ],
  },
});
