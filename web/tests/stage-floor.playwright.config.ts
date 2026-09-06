import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e", testMatch: "stage-floor.spec.ts", workers: 1,
  use: { ...devices["Desktop Chrome"], trace: "retain-on-failure" },
});
