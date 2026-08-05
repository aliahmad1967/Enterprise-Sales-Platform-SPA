import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["packages/**/*.test.{ts,tsx}", "apps/web/src/**/*.test.{ts,tsx}"],
    globals: true,
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      provider: "v8",
      include: ["packages/**/src/**", "apps/web/src/**"],
      exclude: ["**/node_modules/**", "**/dist/**", "**/src/seed.ts"],
    },
  },
  resolve: {
    alias: {
      "@esp/design-system": "/packages/design-system/src/index.ts",
      "@esp/ui": "/packages/ui/src/index.ts",
      "@esp/types": "/packages/types/src/index.ts",
      "@esp/utils": "/packages/utils/src/index.ts",
      "@esp/hooks": "/packages/hooks/src/index.ts",
      "@esp/services": "/packages/services/src/index.ts",
    },
  },
});
