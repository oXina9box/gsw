import { expect, test } from "@playwright/test";

const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

test.skip(!hasSupabase && !process.env.CI, "Protected-route smoke tests require Supabase configuration");

test("signed-out visitors are sent to login", async ({ page }) => {
  expect(hasSupabase, "CI must provide Supabase configuration for protected-route smoke tests").toBe(true);
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login\?next=%2Fapp$/);
});

for (const route of [
  "/app/studio",
  "/app/assets",
  "/app/marketing",
  "/app/staffing",
  "/app/orchestration",
  "/app/onboarding",
  "/app/universe",
  "/app/social",
  "/app/front-office",
  "/app/channels",
  "/app/agents",
  "/app/builder",
  "/app/billing",
  "/app/integrations",
  "/account",
]) {
  test(`signed-out visitors cannot open ${route}`, async ({ page }) => {
    expect(hasSupabase, "CI must provide Supabase configuration for protected-route smoke tests").toBe(true);
    await page.goto(route);
    await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(route)}$`));
  });
}
