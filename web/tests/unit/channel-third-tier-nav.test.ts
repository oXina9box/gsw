import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ pathname: "/app/channels/ch-1/staffing", search: "" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(navigation.search),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/app/(product)/actions", () => ({
  setChannelStaffAction: async () => {},
  updateChannel: async () => {},
  saveChannelMarketingBudget: async () => {},
}));

import { CHANNEL_VIEW_REGISTRY } from "@/lib/studio/channel-views";
import { StudioShell } from "@/components/product/studio-shell";
import { ChannelStaffingClient } from "@/components/product/channel-staffing-client";
import { ChannelMarketingClient } from "@/components/product/channel-marketing-client";
import { ChannelSocialClient } from "@/components/product/channel-social-client";
import { ChannelAssetsClient } from "@/components/product/channel-assets-client";
import { ChannelProductionClient } from "@/components/product/channel-production-client";

describe("Channel third-tier navigation", () => {
  it("keeps every view in the shared registry instead of a content dropdown", () => {
    expect(CHANNEL_VIEW_REGISTRY.dashboard).toEqual([]);
    expect(CHANNEL_VIEW_REGISTRY.marketing.map(({ id }) => id)).toContain("research");
    expect(CHANNEL_VIEW_REGISTRY.marketing.map(({ id }) => id)).toContain("stage-floor");
  });

  it("renders only the selected page children in the sidebar with a faded cyan current view", () => {
    navigation.pathname = "/app/channels/cinema-2/marketing";
    navigation.search = "view=research";
    const markup = renderToStaticMarkup(
      createElement(StudioShell, {
        studioName: "Test studio",
        channels: [{ id: "cinema", name: "Cinema", status: "active" }, { id: "cinema-2", name: "Cinema 2", status: "active" }],
      }, createElement("div", null, "Canvas"))
    );

    expect(markup).toContain('aria-label="Marketing views"');
    expect(markup).toContain("02 Research Hub");
    expect(markup).toContain("bg-cyan/10 text-cyan");
    expect(markup).toContain("/app/channels/cinema-2/marketing?view=research");
    expect(markup).not.toContain('aria-label="Channel Staffing views"');
    expect(markup).not.toContain("channel-third-tier-view-select");
  });

  it("does not create dashboard children or choose a fallback channel on Account", () => {
    navigation.pathname = "/app/channels/cinema";
    navigation.search = "view=anything";
    const dashboard = renderToStaticMarkup(
      createElement(StudioShell, {
        studioName: "Test studio",
        channels: [{ id: "cinema", name: "Cinema", status: "active" }],
      }, null)
    );
    expect(dashboard).not.toContain('aria-label="Dashboard views"');

    navigation.pathname = "/account";
    const account = renderToStaticMarkup(
      createElement(StudioShell, {
        studioName: "Test studio",
        channels: [{ id: "cinema", name: "Cinema", status: "active" }],
      }, null)
    );
    expect(account).not.toContain("/app/channels/cinema");
  });
});

describe("ChannelStaffingClient third-tier views", () => {
  const dummyAgents = [
    {
      id: "agent-1",
      name: "Specialist Alpha",
      capability: "Directing",
      model: "gpt-5",
      lanes: { name: "Directing", departments: { name: "Production" } },
    },
    {
      id: "agent-2",
      name: "Specialist Beta",
      capability: "Writing",
      model: "gpt-5",
      lanes: { name: "Screenplay", departments: { name: "Creative" } },
    },
  ];

  it("renders Hired agents view by default with assigned agents", () => {
    navigation.pathname = "/app/channels/ch-1/staffing";
    navigation.search = "";
    const markup = renderToStaticMarkup(
      createElement(ChannelStaffingClient, {
        channelId: "ch-1",
        channelName: "Test Channel",
        agents: dummyAgents,
        assignedAgentIds: ["agent-1"],
      })
    );

    expect(CHANNEL_VIEW_REGISTRY.staffing.map(({ label }) => label)).toEqual([
      "Hired agents - Channel", "Agents for hire", "Custom Agents",
    ]);
    expect(markup).toContain("Specialist Alpha");
    expect(markup).toContain("Department Quota &amp; Coverage Bar");
  });
});

describe("ChannelMarketingClient third-tier views", () => {
  const dummyChannel = {
    id: "ch-1",
    name: "Test Channel",
    status: "active",
    audience: "Adults",
    voice: "Dark",
    cadence: "Weekly",
    pillars: ["Drama"],
  };

  it("keeps every marketing view registered while rendering the resolved default", () => {
    navigation.pathname = "/app/channels/ch-1/marketing";
    navigation.search = "";
    const markup = renderToStaticMarkup(
      createElement(ChannelMarketingClient, {
        channel: dummyChannel,
        budgetData: null,
        productions: [],
        totalProductionCredits: 0,
        stageFloorSlot: createElement("div", { id: "test-stage-floor" }, "Stage Floor Rendered"),
      })
    );

    expect(markup).toContain("Channel Strategic Directives");
    expect(CHANNEL_VIEW_REGISTRY.marketing.map(({ label }) => label)).toEqual(expect.arrayContaining([
      "02 Research Hub", "07 Master Scheduling", "04 Merchandise Desk", "Marketing Stage Floor",
    ]));
  });
});

describe("ChannelSocialClient third-tier views", () => {
  it("renders YouTube, Tik-Tok, X, Instagram, Facebook, Telegram, Discord, Snapchat, Social Settings", () => {
    navigation.pathname = "/app/channels/ch-1/social";
    navigation.search = "";
    renderToStaticMarkup(createElement(ChannelSocialClient, {
      channelId: "ch-1",
      channelName: "Test Channel",
      connections: [],
      signals: [],
      releasePackages: [],
    }));

    expect(CHANNEL_VIEW_REGISTRY.social.map(({ label }) => label)).toEqual(expect.arrayContaining([
      "YouTube", "Tik-Tok", "X", "Instagram", "Facebook", "Telegram", "Discord", "Snapchat", "Social Settings",
    ]));
  });
});

describe("ChannelAssetsClient third-tier views", () => {
  it("renders DNA DataBase, Staffing Files, and Content options", () => {
    navigation.pathname = "/app/channels/ch-1/assets";
    navigation.search = "";
    renderToStaticMarkup(
      createElement(ChannelAssetsClient, {
        channelId: "ch-1",
        channelName: "Test Channel",
        bytesUsed: 1048576,
        dnaItems: [],
        assetItems: [],
      })
    );

    expect(CHANNEL_VIEW_REGISTRY.assets.map(({ label }) => label)).toEqual(["DNA DataBase", "Staffing Files", "Content"]);
  });
});

describe("ChannelProductionClient third-tier views", () => {
  it("renders Production Stage Floor view", () => {
    navigation.pathname = "/app/channels/ch-1/production";
    navigation.search = "";
    const markup = renderToStaticMarkup(
      createElement(ChannelProductionClient, {
        stageFloorSlot: createElement("div", { id: "prod-floor" }, "Production Floor"),
        slatesSlot: createElement("div", { id: "prod-slates" }, "Production Slates"),
      })
    );

    expect(CHANNEL_VIEW_REGISTRY.production.map(({ label }) => label)).toEqual(["Production Stage Floor"]);
    expect(markup).toContain("Production Floor");
    expect(markup).toContain("Production Slates");
  });
});
