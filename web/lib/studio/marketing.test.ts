import { describe, expect, it } from "vitest";
import {
  AGENT_FILE_NAMES,
  evaluateMarketingChecklist,
  MARKETING_AGENT_ROLES,
  validateMarketingHandoff,
} from "./marketing";

describe("marketing agent catalog roles", () => {
  it("defines six exact marketing agent roles", () => {
    expect(MARKETING_AGENT_ROLES).toHaveLength(6);
    const slugs = MARKETING_AGENT_ROLES.map((r) => r.slug);
    expect(slugs).toEqual([
      "marketing-director",
      "studio-brand-designer",
      "channel-discovery",
      "channel-branding",
      "channel-content-designer",
      "media-agent",
    ]);
  });

  it("every role enforces the six-file schema", () => {
    expect(AGENT_FILE_NAMES).toEqual(["role", "soul", "jobdescription", "skills", "memory", "user_content"]);
    for (const role of MARKETING_AGENT_ROLES) {
      expect(role.files).toEqual(AGENT_FILE_NAMES);
    }
  });
});

describe("marketing checklist evaluation", () => {
  it("evaluates completed and deferred items correctly", () => {
    const checklist = evaluateMarketingChecklist({
      studio_identity: {
        studio_name_status: "provided",
        studio_name: "Aura Films",
        brand_colors: ["#ea0070", "#7000ea"],
        content_direction_status: "provided",
        content_direction: "Film",
      },
      channel_setup: {
        channel_name: "Aura Prime",
      },
      lane_handoffs: {
        studio_brand_approved: true,
        channel_discovery_approved: true,
        media_plan_approved: true,
      },
    });

    expect(checklist.every((item) => item.status === "complete")).toBe(true);
  });

  it("identifies missing or deferred items", () => {
    const checklist = evaluateMarketingChecklist({
      studio_identity: {
        studio_name_status: "deferred",
      },
      channel_setup: {},
      lane_handoffs: {},
    });

    const nameItem = checklist.find((i) => i.id === "studio_name");
    expect(nameItem?.status).toBe("deferred");

    const channelItem = checklist.find((i) => i.id === "channel_name");
    expect(channelItem?.status).toBe("missing");
  });
});

describe("marketing handoff validation", () => {
  it("requires all three approvals before handoff", () => {
    expect(validateMarketingHandoff({
      studio_brand_approved: true,
      channel_discovery_approved: true,
      media_plan_approved: true,
    }).valid).toBe(true);

    expect(validateMarketingHandoff({
      studio_brand_approved: true,
      channel_discovery_approved: false,
      media_plan_approved: true,
    }).valid).toBe(false);
  });
});
