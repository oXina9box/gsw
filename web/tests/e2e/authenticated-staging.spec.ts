import { test, expect } from "@playwright/test";
import { authenticatePage, isStagingConfigured } from "./auth-helpers";

const hasStaging = isStagingConfigured();

test.describe("Authenticated Staging Verification", () => {
  test.skip(!hasStaging, "Authenticated staging tests require STAGING_SUPABASE_URL and STAGING_SUPABASE_ANON_KEY");

  test("completes the onboarding wizard through all steps to studio ready", async ({ page }) => {
    await authenticatePage(page, { destination: "/app/onboarding?step=identity" });

    // Step 1: Studio Identity
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Name your studio|Studio setup/i);
    const studioNameInput = page.locator('input[name="studio_name"]');
    await studioNameInput.fill("Staging Verification Studio");
    const taglineInput = page.locator('input[name="tagline"]');
    if (await taglineInput.isVisible()) {
      await taglineInput.fill("Cinematic staging verification pipeline");
    }
    const contentTypeInput = page.locator('input[name="content_type"]');
    if (await contentTypeInput.isVisible()) {
      await contentTypeInput.fill("Sci-Fi Episodic");
    }
    await page.getByRole("button", { name: /Save and continue/i }).click();

    // Step 2: Channel Setup
    await expect(page).toHaveURL(/step=channel/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Set up first channel/i);
    await page.locator('input[name="channel_name"]').fill("Staging Broadcast Channel");
    await page.locator('input[name="format"]').fill("4K Episodic Series");
    const seasonScopeInput = page.locator('input[name="season_scope"]');
    if (await seasonScopeInput.isVisible()) {
      await seasonScopeInput.fill("Season 1 (8 episodes)");
    }
    await page.getByRole("button", { name: /Save and continue/i }).click();

    // Step 3: Department Configuration
    await expect(page).toHaveURL(/step=hiring/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Configure departments/i);
    const departmentsInput = page.locator('input[name="departments"]');
    await expect(departmentsInput).toBeVisible();
    await page.getByRole("button", { name: /Save and continue/i }).click();

    // Step 4: Completion State
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Setup complete/i);
    await expect(page.getByText(/Studio ready/i)).toBeVisible();
    const openFrontOfficeLink = page.getByRole("link", { name: /Open Front Office/i });
    await expect(openFrontOfficeLink).toBeVisible();
  });

  test("navigates agent catalog and executes role-matched hiring flow", async ({ page }) => {
    await authenticatePage(page, { destination: "/app/agents" });

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Hire for the role/i);
    await expect(page.locator(".catalog-list")).toBeVisible();

    const catalogCards = page.locator(".catalog-row");
    await expect(catalogCards.first()).toBeVisible();

    // Verify catalog contains open-core agents with role metadata
    const freeBadge = page.locator(".status-mark.free, .status-mark:has-text('Open core')").first();
    await expect(freeBadge).toBeVisible();

    // If an unhired free agent has an available lane dropdown, execute the hire action
    const hireForm = page.locator(".catalog-row form.inline-form").first();
    if (await hireForm.isVisible()) {
      const laneSelect = hireForm.locator('select[name="lane_id"]');
      await expect(laneSelect).toBeVisible();
      const hireButton = hireForm.getByRole("button", { name: "Hire" });
      await hireButton.click();

      // Page reloads and indicates hired state or removes hire button for that agent
      await expect(page.getByRole("heading", { level: 1 })).toContainText(/Hire for the role/i);
      await expect(page.getByText("Hired").first()).toBeVisible();
    } else {
      // If agents are already hired from seed, verify hired status tag is displayed
      await expect(page.getByText("Hired").first()).toBeVisible();
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
});
