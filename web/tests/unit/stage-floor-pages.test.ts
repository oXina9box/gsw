import { beforeEach, describe, expect, it, vi } from "vitest";
import { isValidElement, type ReactNode } from "react";
import { StageFloorSection } from "@/components/product/stage-floor-section";
import MarketingPage from "@/app/(product)/app/marketing/page";
import SocialPage from "@/app/(product)/app/social/page";
import ChannelMarketingPage from "@/app/(product)/app/channels/[channelId]/marketing/page";
import ChannelSocialPage from "@/app/(product)/app/channels/[channelId]/social/page";
import ChannelProductionPage from "@/app/(product)/app/channels/[channelId]/production/page";
import ProductionPage from "@/app/(product)/app/productions/[productionId]/page";

vi.mock("@/app/(product)/actions", () => new Proxy({}, { has: () => true, get: (_, name) => name === "then" ? undefined : vi.fn() }));

const channelId = "10000000-0000-4000-8000-000000000001";
const productionId = "20000000-0000-4000-8000-000000000001";
const context = vi.hoisted(() => ({ workspaceId: "workspace", supabase: { from: vi.fn() } }));
vi.mock("@/lib/studio/workspace", () => ({ getWorkspaceContext: vi.fn(async () => context) }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(async () => context.supabase) }));
vi.mock("@/components/product/stage-floor-section", () => ({ StageFloorSection: () => null }));

function floors(node: ReactNode): Record<string, unknown>[] {
  if (Array.isArray(node)) return node.flatMap(floors);
  if (!isValidElement<{ children?: ReactNode }>(node)) return [];
  if (node.type === StageFloorSection) return [node.props];
  return floors(node.props.children);
}

beforeEach(() => {
  context.supabase.from.mockImplementation((table: string) => {
    const item = table === "channels"
      ? { id: channelId, name: "Test channel", status: "active" }
      : table === "productions"
        ? { id: productionId, channel_id: channelId, workspace_id: "workspace", title: "Test episode", status: "draft" }
        : null;
    const builder: Record<string, unknown> = {};
    for (const method of ["select", "eq", "order", "limit", "in"]) builder[method] = () => builder;
    builder.maybeSingle = builder.single = () => Promise.resolve({ data: item, error: null });
    builder.then = (resolve: (value: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve);
    return builder;
  });
});

describe("designated Stage Floor pages", () => {
  it("mounts studio Marketing and Social workshops with isolated scope and URL selection", async () => {
    const searchParams = Promise.resolve({ workflow: "chosen" });
    expect(floors(await MarketingPage({ searchParams }))).toEqual([expect.objectContaining({ kind: "marketing", workflowId: "chosen" })]);
    expect(floors(await SocialPage({ searchParams }))).toEqual([expect.objectContaining({ kind: "social", workflowId: "chosen" })]);
  });
  it.each([
    ["marketing", ChannelMarketingPage], ["social", ChannelSocialPage], ["production", ChannelProductionPage],
  ] as const)("mounts channel %s workshop scoped to this channel", async (kind, Page) => {
    const result = await Page({ params: Promise.resolve({ channelId }), searchParams: Promise.resolve({ workflow: "chosen" }) });
    expect(floors(result)).toEqual([expect.objectContaining({ kind, channelId, workflowId: "chosen" })]);
  });
  it("mounts production workshop scoped to both episode and channel", async () => {
    const result = await ProductionPage({ params: Promise.resolve({ productionId }), searchParams: Promise.resolve({ workflow: "chosen" }) });
    expect(floors(result)).toEqual([expect.objectContaining({ kind: "production", channelId, productionId, workflowId: "chosen" })]);
  });
});
