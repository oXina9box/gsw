import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("server-only", () => ({}));
const client = vi.hoisted(() => {
  const result = { data: null, error: { message: "private database failure" } };
  const query = {
    select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue(result),
    limit: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue(result),
    then: (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve),
  };
  return { from: vi.fn(() => query) };
});
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => client }));
vi.mock("@/lib/studio/workspace", () => ({ getWorkspaceContext: async () => ({ supabase: client, workspaceId: "workspace-one" }) }));

describe("remaining workspace pages distinguish failed reads from empty data", () => {
  const pages = [
    ["orchestration", () => import("../../app/(product)/app/orchestration/page")],
    ["builder", () => import("../../app/(product)/app/builder/page")],
    ["agents", () => import("../../app/(product)/app/agents/page")],
    ["marketing", () => import("../../app/(product)/app/marketing/page")],
    ["front-office", () => import("../../app/(product)/app/front-office/page")],
    ["universe", () => import("../../app/(product)/app/universe/page")],
  ] as const;
  it.each(pages)("%s fails with a stable load message", async (_route, load) => {
    const { default: Page } = await load();
    await expect(Page({ searchParams: Promise.resolve({}) })).rejects.toThrow(/could not load/i);
  });
  const inlinePages = [
    ["billing", () => import("../../app/(product)/app/billing/page")],
    ["integrations", () => import("../../app/(product)/app/integrations/page")],
    ["social", () => import("../../app/(product)/app/social/page")],
  ] as const;
  it.each(inlinePages)("%s shows a load error rather than zero or empty data", async (_route, load) => {
    const { default: Page } = await load();
    const markup = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({}) }));
    expect(markup).toContain("could not load");
    expect(markup).not.toContain("Available Credits");
    expect(markup).not.toContain("private database failure");
  });
});
