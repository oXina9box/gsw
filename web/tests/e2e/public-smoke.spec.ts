import { expect, test } from "@playwright/test";

test("the public studio entry point renders", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle(/Gem Studio/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /Create your Studio|Open your Studio/ }).first()).toBeVisible();
});

test("shell preservation: desktop navigation and footer stay visible", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Footer navigation" })).toBeVisible();
  const studioLink = page.getByRole("link", { name: "The Studio" }).first();
  await expect(studioLink).toBeVisible();
  expect(await studioLink.getAttribute("href")).toBe("/studio");
});

test("concept worlds gallery interaction and announcements", async ({ page }) => {
  await page.goto("/");

  const sciFiBtn = page.getByRole("button", { name: /Beyond the signal/i });
  const fantasyBtn = page.getByRole("button", { name: /Where embers wake/i });

  await expect(sciFiBtn).toHaveAttribute("aria-pressed", "true");
  await expect(fantasyBtn).toHaveAttribute("aria-pressed", "false");

  await fantasyBtn.click();

  await expect(fantasyBtn).toHaveAttribute("aria-pressed", "true");
  await expect(sciFiBtn).toHaveAttribute("aria-pressed", "false");

  const liveRegion = page.locator('[aria-live="polite"]');
  await expect(liveRegion).toContainText(/Where embers wake/i);
});

test("ambient motion pause toggle and reduced motion support", async ({ page }) => {
  await page.goto("/");
  const motionBtn = page.getByRole("button", { name: /ambient motion/i });
  await expect(motionBtn).toBeVisible();
  await expect(motionBtn).toHaveAttribute("aria-pressed", "false");
  await expect(motionBtn).toHaveText(/Pause/i);

  await motionBtn.click();
  await expect(motionBtn).toHaveAttribute("aria-pressed", "true");
  await expect(motionBtn).toHaveText(/Resume/i);
});

test("no horizontal overflow across viewports", async ({ page }) => {
  const viewports = [
    { width: 320, height: 800 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    await page.setViewportSize(vp);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBe(false);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
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
