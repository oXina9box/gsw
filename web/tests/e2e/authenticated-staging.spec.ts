import { test, expect } from "@playwright/test";
import { authenticatePage, isStagingConfigured } from "./auth-helpers";

const hasStaging = isStagingConfigured();

test.describe("Authenticated Staging Verification", () => {
  test.skip(!hasStaging, "Authenticated staging tests require STAGING_SUPABASE_URL and STAGING_SUPABASE_ANON_KEY");

  test("opens the onboarding modal with studio essentials and the seven-step rail", async ({ page }) => {
    await authenticatePage(page, { destination: "/app?step=identity" });

    // Mandatory onboarding: incomplete profile auto-opens the setup dialog.
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("#onboarding-modal-title")).toContainText(/Studio Setup · Create Studio essentials/i);

    // Step 1 form fields are present.
    await expect(dialog.locator('input[name="studio_name"]')).toBeVisible();
    await expect(dialog.locator('input[name="tagline"]')).toBeVisible();

    // Rail renders all seven steps with the first step current.
    const rail = dialog.getByRole("navigation", { name: "Setup progress" });
    await expect(rail).toBeVisible();
    await expect(rail.locator("span.onboarding-rail-step")).toHaveCount(7);
    await expect(rail.locator("span.onboarding-rail-step.is-current")).toHaveCount(1);
  });

  test("renders the agent catalog cards and exposes the hiring flow", async ({ page }) => {
    await authenticatePage(page, { destination: "/app/agents" });

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Hire for the role/i);

    // Catalog renders as PrelineCard grid: at least one card with an Open core or Protected badge.
    const cards = page.locator("section.product-page div.grid > div");
    await expect(cards.first()).toBeVisible();
    await expect(page.getByText(/Open core|Protected/).first()).toBeVisible();

    // If a hire form is available (unhired agent with matching lanes), the lane select and Hire button render.
    const hireForm = page.locator("form.inline-form").first();
    if (await hireForm.isVisible()) {
      await expect(hireForm.locator('select[name="lane_id"]')).toBeVisible();
      await expect(hireForm.getByRole("button", { name: "Hire" })).toBeVisible();
    } else {
      // Otherwise the seed is fully hired or lanes are missing: hired tags or fallback links must render.
      await expect(page.getByText(/Hired|Create lane|Unlock/).first()).toBeVisible();
    }
  });

  test("renders production detail with workflow progress, artifacts, and job controls", async ({ page }) => {
    await authenticatePage(page, { destination: "/app" });

    // Find any existing production link from Front Office
    let productionLink = page.locator('a[href^="/app/productions/"]').first();

    if (!(await productionLink.isVisible())) {
      // Check channels page if not linked directly on front office overview
      await page.goto("/app/channels");
      const channelCard = page.locator(".channel-card").first();
      if (await channelCard.isVisible()) {
        await channelCard.click();
        productionLink = page.locator('a[href^="/app/productions/"]').first();
      }
    }

    if (await productionLink.isVisible()) {
      await productionLink.click();
    } else {
      // Fallback to direct navigation if staging seed production exists
      await page.goto("/app/builder");
    }

    // When on a production page, verify workflow stage, progress bar, and generation panels
    if (page.url().includes("/app/productions/")) {
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("heading", { name: /Production workflow/i })).toBeVisible();
      await expect(page.getByRole("heading", { name: /Stage Artifacts/i })).toBeVisible();
      await expect(page.getByRole("heading", { name: /Jobs & Generation/i })).toBeVisible();
      await expect(page.locator(".progress-bar, .production-progress")).toBeVisible();
    } else {
      // If no production exists yet, verify studio workflow surface renders
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });
  test("studio shell sidenav navigates modules on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await authenticatePage(page, { destination: "/app" });
    const sidenav = page.getByRole("navigation", { name: "Studio modules" });
    await expect(sidenav).toBeVisible();
    await sidenav.getByRole("link", { name: "Channels" }).click();
    await expect(page).toHaveURL(/\/app\/channels$/);
    await sidenav.getByRole("link", { name: "Billing" }).click();
    await expect(page).toHaveURL(/\/app\/billing$/);
  });

  test("studio shell drawer opens and closes below md breakpoint", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await authenticatePage(page, { destination: "/app" });
    const aside = page.locator("#studio-sidenav");
    // transform-offscreen: assert bounding box, not toBeHidden
    await expect.poll(async () => (await aside.boundingBox())?.x).toBeLessThan(0);
    await page.getByRole("button", { name: "Toggle navigation" }).click();
    await expect.poll(async () => (await aside.boundingBox())?.x).toBeGreaterThanOrEqual(0);
    await page.getByRole("navigation", { name: "Studio modules" }).getByRole("link", { name: "Marketing" }).click();
    await expect(page).toHaveURL(/\/app\/marketing$/);
    await expect.poll(async () => (await aside.boundingBox())?.x).toBeLessThan(0);
  });
});
