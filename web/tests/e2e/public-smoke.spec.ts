import { expect, test } from "@playwright/test";

test("the public studio entry point renders", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle(/Gem Studio/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /Create Studio|Open workspace/ }).first()).toBeVisible();
});

test("the public detail routes render", async ({ page }) => {
  const routes = [
    "/studio",
    "/system",
    "/social-workshop",
    "/gallery",
    "/portfolio",
    "/pricing",
    "/docs",
    "/contact",
  ];

  for (const path of routes) {
    const response = await page.goto(path);
    expect(response?.ok()).toBe(true);
    const headings = page.getByRole("heading", { level: 1 });
    await expect(headings).toHaveCount(1);
    await expect(headings.first()).toBeVisible();
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
  const openButton = page.getByRole("button", { name: "Open menu" });
  await openButton.click();
  const nav = page.getByRole("navigation", { name: "Primary navigation" }).first();
  await expect(nav).toBeVisible();
  const closeButton = page.getByRole("button", { name: "Close menu" });
  await closeButton.click();
});
