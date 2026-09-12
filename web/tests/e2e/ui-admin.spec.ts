import { test, expect } from "@playwright/test";
import { startUiAdminFixture } from "../fixtures/ui-admin-server";

let fixture: Awaited<ReturnType<typeof startUiAdminFixture>>;
test.beforeAll(async () => { fixture = await startUiAdminFixture(); });
test.afterAll(async () => { await fixture?.server.close(); });

test("pink story stays readable and all nine social identities render", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(new URL("/public-review", fixture.url).href);
    const finale = page.locator("#next");
    await finale.scrollIntoViewIfNeeded();
    await expect(finale).toContainText("YOUR NEXT");
    await expect(finale.locator("h2")).toHaveCSS("color", "oklch(0.02 0 0)");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await finale.screenshot({ path: `test-results/ui-admin-public-${width}.png` });
    const socials = page.getByRole("navigation", { name: "Social links" });
    await expect(socials.locator("svg")).toHaveCount(9);
    await socials.screenshot({ path: `test-results/ui-admin-socials-${width}.png` });
  }
});

test("dashboard is exact, nested views select one page, and history restores", async ({ page }) => {
  await page.goto(fixture.url);
  await expect(page.getByTestId("page-title")).toHaveText("Dashboard");
  await expect(page.getByRole("heading", { name: "Productions", exact: true })).toHaveCount(1);
  await expect(page.getByRole("complementary", { name: "Studio update" })).toContainText("Local studio update");
  await page.getByRole("button", { name: "Next update" }).click();
  await expect(page.getByRole("complementary", { name: "Studio update" })).toContainText("Second studio update");
  await page.getByRole("link", { name: "Marketing", exact: true }).click();
  await expect(page).toHaveURL(/\/marketing$/);
  await page.getByRole("link", { name: "02 Research Hub", exact: true }).click();
  await expect(page).toHaveURL(/\/marketing\?view=research$/);
  await expect(page.getByText("Channel & Audience Research Hub", { exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/marketing$/);
  await page.goForward();
  await expect(page).toHaveURL(/view=research/);
  await page.reload();
  await expect(page.getByRole("link", { name: "02 Research Hub", exact: true })).toHaveAttribute("aria-current", "page");
});

test("site update carousel keeps an explicit pause after hover leaves", async ({ page }) => {
  await page.goto(fixture.url);
  const update = page.getByRole("complementary", { name: "Studio update" });
  await expect(update).toContainText("Local studio update");
  await update.getByRole("button", { name: "Pause updates" }).click();
  await update.hover();
  await page.mouse.move(8, 8);
  await page.waitForTimeout(8200);
  await expect(update).toContainText("Local studio update");
  await expect(update.getByRole("button", { name: "Play updates" })).toBeVisible();
});

test("reduced motion prevents automatic site update rotation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(fixture.url);
  const update = page.getByRole("complementary", { name: "Studio update" });
  await expect(update).toContainText("Local studio update");
  await page.waitForTimeout(8200);
  await expect(update).toContainText("Local studio update");
  await page.screenshot({ path: "test-results/ui-admin-shell-390.png", fullPage: true });
});

test("all channel clients render honest populated and empty states without overflow", async ({ page }) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const segment of ["staffing", "marketing", "social", "assets", "production"]) {
      await page.goto(`${fixture.url}/${segment}`);
      await expect(page.getByTestId("channel-content")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (segment === "social") await expect(page.getByText(/No active audience comments/)).toBeVisible();
      if (segment === "assets") await expect(page.getByText(/0 records · 4\.0 KB stored/)).toBeVisible();
    }
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(fixture.url);
  await page.screenshot({ path: "test-results/ui-admin-shell-390-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Toggle navigation" }).last().click();
  await expect(page.locator("#studio-sidenav")).toHaveClass(/translate-x-0/);
  await expect(page.getByRole("navigation", { name: "Studio modules" })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(fixture.url);
  await page.screenshot({ path: "test-results/ui-admin-shell-1440.png", fullPage: true });
});
