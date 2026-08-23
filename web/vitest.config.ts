import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  test: {
    include: ["tests/unit/**/*.test.ts", "lib/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: [
        "lib/auth/safe-redirect.ts",
        "lib/auth/signup-boundary.ts",
        "lib/contact-rate-limit.ts",
        "lib/orchestration/helpers.ts",
        "lib/stripe/webhook.ts",
        "lib/studio/caps.ts",
        "lib/studio/domain.ts",
        "lib/studio/export-data.ts",
        "lib/studio/ffmpeg.ts",
        "lib/studio/foundations.ts",
        "lib/studio/genplay.ts",
        "lib/studio/langfuse.ts",
        "lib/studio/navigation.ts",
        "lib/studio/secrets.ts",
        "lib/studio/worker.ts",
        "lib/studio/worker-auth.ts",
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
