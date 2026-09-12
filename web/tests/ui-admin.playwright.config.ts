import { defineConfig, devices } from "@playwright/test";
export default defineConfig({ testDir: "./e2e", testMatch: "ui-admin.spec.ts", workers: 1, use: { ...devices["Desktop Chrome"], trace: "retain-on-failure" } });
