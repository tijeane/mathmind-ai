import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "."),
      // server-only throws outside the Next bundler; unit tests import
      // modules that use it (e.g. lib/ai/gateway.ts).
      "server-only": path.resolve(process.cwd(), "tests/mocks/server-only.ts"),
    },
  },
});
