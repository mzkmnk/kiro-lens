import { defineConfig } from "vitest/config";

export default defineConfig({
  root: ".",
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/test-setup.ts"],
    include: ["**/*.{test,spec}.ts"],
    exclude: ["node_modules/**", "dist/**", "**/*.e2e.{js,ts}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "node_modules/",
        "src/test-setup.ts",
        "**/*.d.ts",
        "**/*.config.{js,ts}",
      ],
    },
  },
});
