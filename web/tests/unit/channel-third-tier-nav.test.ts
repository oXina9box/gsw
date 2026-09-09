import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/(product)/actions", () => ({
  setChannelStaffAction: async () => {},
  updateChannel: async () => {},
  saveChannelMarketingBudget: async () => {},
}));

import { ChannelSubnav } from "@/components/product/channel-subnav";
import { ChannelStaffingClient } from "@/components/product/channel-staffing-client";
import { ChannelMarketingClient } from "@/components/product/channel-marketing-client";
import { ChannelSocialClient } from "@/components/product/channel-social-client";
import { ChannelAssetsClient } from "@/components/product/channel-assets-client";
import { ChannelProductionClient } from "@/components/product/channel-production-client";

describe("ChannelSubnav third-tier dropdown", () => {
  it("returns null for dashboard activeTab", () => {
    const markup = renderToStaticMarkup(
      createElement(ChannelSubnav, {
        activeTab: "dashboard",
        activeView: "overview",
        groups: [{ items: [{ id: "overview", label: "Overview" }] }],
      })
    );
    expect(markup).toBe("");
  });

  it("renders select with aria-label Page view and grouped options", () => {
    const markup = renderToStaticMarkup(
      createElement(ChannelSubnav, {
        activeTab: "marketing",
        activeView: "research",
        groups: [
          {
            label: "Pre-Film",
            items: [{ id: "research", label: "02 Research Hub" }],
          },
          {
            items: [{ id: "stage-floor", label: "Marketing Stage Floor" }],
          },
        ],
      })
    );

    expect(markup).toContain('aria-label="Page view"');
    expect(markup).toContain('label="Pre-Film"');
    expect(markup).toContain("02 Research Hub");
    expect(markup).toContain("Marketing Stage Floor");
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
    const markup = renderToStaticMarkup(
      createElement(ChannelStaffingClient, {
        channelId: "ch-1",
        channelName: "Test Channel",
        agents: dummyAgents,
        assignedAgentIds: ["agent-1"],
      })
    );

    expect(markup).toContain("Hired agents - Channel");
    expect(markup).toContain("Agents for hire");
    expect(markup).toContain("Custom Agents");
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

  it("renders Pre-Film, Content, Post file groups and stage-floor option", () => {
    const markup = renderToStaticMarkup(
      createElement(ChannelMarketingClient, {
        channel: dummyChannel,
        budgetData: null,
        productions: [],
        totalProductionCredits: 0,
        stageFloorSlot: createElement("div", { id: "test-stage-floor" }, "Stage Floor Rendered"),
      })
    );

    expect(markup).toContain("Pre-Film");
    expect(markup).toContain("01 Directives &amp; Onboarding");
    expect(markup).toContain("02 Research Hub");
    expect(markup).toContain("Content");
    expect(markup).toContain("07 Master Scheduling");
    expect(markup).toContain("Post file");
    expect(markup).toContain("04 Merchandise Desk");
    expect(markup).toContain("Marketing Stage Floor");
  });
});

describe("ChannelSocialClient third-tier views", () => {
  it("renders YouTube, Tik-Tok, X, Instagram, Facebook, Telegram, Discord, Snapchat, Social Settings", () => {
    const markup = renderToStaticMarkup(
      createElement(ChannelSocialClient, {
        channelId: "ch-1",
        channelName: "Test Channel",
        connections: [],
        signals: [],
        releasePackages: [],
      })
    );

    expect(markup).toContain("YouTube");
    expect(markup).toContain("Tik-Tok");
    expect(markup).toContain("X");
    expect(markup).toContain("Instagram");
    expect(markup).toContain("Facebook");
    expect(markup).toContain("Telegram");
    expect(markup).toContain("Discord");
    expect(markup).toContain("Snapchat");
    expect(markup).toContain("Social Settings");
  });
});

describe("ChannelAssetsClient third-tier views", () => {
  it("renders DNA DataBase, Staffing Files, and Content options", () => {
    const markup = renderToStaticMarkup(
      createElement(ChannelAssetsClient, {
        channelId: "ch-1",
        channelName: "Test Channel",
        bytesUsed: 1048576,
        dnaItems: [],
        assetItems: [],
      })
    );

    expect(markup).toContain("DNA DataBase");
    expect(markup).toContain("Staffing Files");
    expect(markup).toContain("Content");
    expect(markup).toContain("Workspace Vault Telemetry");
  });
});

describe("ChannelProductionClient third-tier views", () => {
  it("renders Production Stage Floor view", () => {
    const markup = renderToStaticMarkup(
      createElement(ChannelProductionClient, {
        stageFloorSlot: createElement("div", { id: "prod-floor" }, "Production Floor"),
        slatesSlot: createElement("div", { id: "prod-slates" }, "Production Slates"),
      })
    );

    expect(markup).toContain("Production Stage Floor");
    expect(markup).toContain("Production Floor");
    expect(markup).toContain("Production Slates");
  });
});
