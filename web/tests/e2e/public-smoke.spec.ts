import { expect, test } from "@playwright/test";

test("the public studio entry point renders", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle(/Gem Studio/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Make the impossible feel scheduled");
  await expect(page.getByRole("link", { name: /Create your Studio/ }).first()).toBeVisible();
});

test("the public detail routes render", async ({ page }) => {
  const routes = [
    ["/studio", "Thirteen departments. One moving picture."],
    ["/system", "The system is the creative."],
    ["/social-workshop", "The afterlife of a good frame."],
  ] as const;

  for (const [path, heading] of routes) {
    const response = await page.goto(path);
    expect(response?.ok()).toBe(true);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
  }
});

test("draft owner and legal content stays unpublished", async ({ page }) => {
  for (const path of ["/core-values", "/terms", "/privacy"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
  }
});

test("mobile navigation opens and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Open navigation" });
  await menu.click();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toHaveClass(/is-open/);
  await page.getByRole("button", { name: "Close navigation" }).click();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).not.toHaveClass(/is-open/);
});
