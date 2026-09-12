import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ failedTable: "", filters: [] as string[] }));
vi.mock("@/lib/studio/workspace", () => ({ getWorkspaceContext: async () => ({
  workspaceId: "workspace-a",
  supabase: { from: (table: string) => {
    const query = {
      select: () => query,
      eq: (field: string, value: string) => { if (field === "workspace_id") state.filters.push(`${table}:${value}`); return query; },
      order: () => query,
      limit: () => query,
      maybeSingle: () => query,
      then: (resolve: (value: unknown) => unknown) => Promise.resolve(resolve({
        data: table === "channels" ? { id: "channel-a", name: "Actual studio", status: "active" } : [],
        error: state.failedTable === table ? { message: "private database detail" } : null,
      })),
    };
    return query;
  } },
}) }));
vi.mock("@/components/product/stage-floor-section", () => ({ StageFloorSection: () => null }));
vi.mock("@/app/(product)/actions", () => ({}));

import Dashboard from "@/app/(product)/app/channels/[channelId]/page";
import Assets from "@/app/(product)/app/channels/[channelId]/assets/page";
import Social from "@/app/(product)/app/channels/[channelId]/social/page";
import Marketing from "@/app/(product)/app/channels/[channelId]/marketing/page";
import Staffing from "@/app/(product)/app/channels/[channelId]/staffing/page";
import Production from "@/app/(product)/app/channels/[channelId]/production/page";

const props = { params: Promise.resolve({ channelId: "channel-a" }), searchParams: Promise.resolve({}) };
const cases = [
  ["dashboard", () => Dashboard(props), "productions"],
  ["assets", () => Assets(props), "workspace_storage_usage"],
  ["social", () => Social(props), "social_connections"],
  ["marketing", () => Marketing(props), "channel_marketing_budgets"],
  ["staffing", () => Staffing(props), "channel_staff"],
  ["production", () => Production(props), "productions"],
] as const;

beforeEach(() => { state.failedTable = ""; state.filters = []; });

describe.each(cases)("%s loader", (_name, load, table) => {
  it("does not turn a database failure into empty or successful operational data", async () => {
    state.failedTable = table;
    await expect(load()).rejects.toThrow("could not load");
  });
  it("loads real data with explicit workspace filters", async () => {
    await expect(load()).resolves.toBeTruthy();
    expect(state.filters).toContain("channels:workspace-a");
    expect(state.filters).toContain(`${table}:workspace-a`);
  });
});
