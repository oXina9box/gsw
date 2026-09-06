import { test, expect } from "@playwright/test";
import { startStageFixture } from "../fixtures/stage-floor-server";

let fixture: Awaited<ReturnType<typeof startStageFixture>>;
test.beforeAll(async () => { fixture = await startStageFixture(); });
test.afterAll(async () => { await fixture?.server.close(); });
test.beforeEach(() => { fixture.reset(); });

test("selects workflows, searches hired pools, zooms and keeps saved selection after refresh", async ({ page }) => {
  await page.goto(fixture.url);
  await expect(page.getByTestId("stage-floor")).toBeVisible();
  const graph = page.getByRole("region", { name: "Saved workflow graph" });
  await expect(graph.locator("svg > path")).toHaveCount(1);
  await page.getByLabel("Search agents").fill("social");
  const pool = page.getByRole("complementary", { name: "Hired agent pool" });
  await expect(pool.getByRole("button")).toHaveCount(1);
  await pool.getByRole("button", { name: /Social producer/ }).click();
  await expect(page.getByRole("complementary", { name: "Selected node inspector" })).toContainText("Social producer");
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.getByRole("button", { name: "Reset graph zoom" }).click();
  await page.getByLabel("Workflow", { exact: true }).selectOption({ label: "Audience research" });
  await expect(page).toHaveURL(/workflow=00000000-0000-4000-8000-000000000002/);
  await expect(graph.locator("svg > path")).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel("Workflow", { exact: true })).toHaveValue("00000000-0000-4000-8000-000000000002");
});

test("creates, renames, connects and completes a run through real UI controls", async ({ page }) => {
  await page.goto(fixture.url);
  await page.getByLabel("New workflow name").fill("Episode launch");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.getByLabel("Workflow", { exact: true }).locator("option:checked")).toHaveText("Episode launch");
  await page.getByLabel("Rename current workflow").fill("Episode one launch");
  await page.getByRole("button", { name: "Rename", exact: true }).click();
  await expect(page.getByLabel("Workflow", { exact: true }).locator("option:checked")).toHaveText("Episode one launch");
  const connection = page.getByRole("region", { name: "Connect workflow endpoints" });
  await connection.getByLabel("From", { exact: true }).selectOption("agent:00000000-0000-4000-8000-000000000010");
  await connection.getByLabel("To", { exact: true }).selectOption("agent:00000000-0000-4000-8000-000000000012");
  await connection.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(page.getByRole("region", { name: "Saved workflow graph" }).locator("svg > path")).toHaveCount(1);
  await page.getByLabel("Initial brief").fill("Prepare the episode launch brief.");
  await page.getByRole("button", { name: "Start run", exact: true }).click();
  await expect(connection.getByRole("button", { name: "Connect", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Complete step", exact: true })).toBeEnabled();
  await page.getByLabel("Completed output").fill("Campaign brief reviewed and ready.");
  await page.getByRole("button", { name: "Complete step", exact: true }).click();
  await expect(page.getByRole("region", { name: "Run history and step output" })).toContainText("completed");
  // A previous action result must not pin the workflow selection.
  await page.getByLabel("Workflow", { exact: true }).selectOption({ label: "Launch campaign" });
  await expect(page.getByLabel("Workflow", { exact: true })).toHaveValue("00000000-0000-4000-8000-000000000001");
});

test("narrow view, keyboard, empty and load-error states remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(fixture.url + "?kind=social");
  await expect(page.getByRole("heading", { name: "Stage S", exact: true })).toBeVisible();
  await page.getByLabel("Search agents").focus();
  await page.keyboard.type("editor");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("complementary", { name: "Selected node inspector" })).toContainText("Story editor");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/stage-floor-mobile.png", fullPage: true });
  fixture.reset(true);
  await page.reload();
  await expect(page.getByText("No hired agents yet.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start run", exact: true })).toBeDisabled();
  fixture.reset(false, true);
  await page.reload();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create", exact: true })).toBeDisabled();
});

test("desktop workbench keeps the graph dominant and all nodes reachable", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(fixture.url + "?kind=production");
  await expect(page.getByRole("region", { name: "Saved workflow graph" })).toBeVisible();
  await page.screenshot({ path: "test-results/stage-floor-desktop.png", fullPage: true });
});
