import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/(product)/stage-floor-actions", () => ({
  stageFloorAction: async () => ({ ok: false, message: "" }),
}));

import { StageFloor } from "@/components/product/stage-floor";
import type { StageFloorProps } from "@/lib/studio/stage-floor-types";

const props: StageFloorProps = {
  title: "Stage M",
  staffingHref: "/app/staffing",
  scope: { kind: "marketing", channelId: "channel-1", productionId: null },
  initialWorkflowId: "workflow-1",
  data: {
    error: null,
    workflows: [{ id: "workflow-1", name: "Campaign release", description: "", definition: {}, updated_at: "2026-09-05T00:00:00Z" }],
    lanes: [{ id: "lane-1", name: "Editorial" }],
    agents: [{ id: "agent-1", name: "Rae", lane_id: "lane-1", agent_type: "editor", capabilities: ["cut"], protected_config: true, recommended_tier: "standard", model_tier_override: null }],
    rules: [{ id: "rule-1", workflow_id: "workflow-1", position: 1, source_kind: "agent", source_agent_id: "agent-1", source_lane_id: null, target_kind: "lane", target_agent_id: null, target_lane_id: "lane-1", trigger_event: "completion" }],
    executions: [],
    steps: [],
  },
};

describe("StageFloor", () => {
  it("renders the shared workbench, saved handoffs, and protected-agent summary", () => {
    const markup = renderToStaticMarkup(createElement(StageFloor, props));

    expect(markup).toContain("Stage M");
    expect(markup).toContain("Campaign release");
    expect(markup).toContain("Saved handoffs");
    expect(markup).toContain("Rae");
    expect(markup).toContain("Protected configuration");
    expect(markup).toContain("Connect endpoints");
    expect(markup).toContain("Runs track handoffs");
    expect(markup).not.toContain("system prompt");
  });

  it("renders recoverable empty and data-error states", () => {
    const markup = renderToStaticMarkup(createElement(StageFloor, {
      ...props,
      initialWorkflowId: undefined,
      data: { ...props.data, error: "Could not load this floor.", workflows: [], rules: [], agents: [], lanes: [] },
    }));

    expect(markup).toContain("No workflow yet");
    expect(markup).toContain("Could not load this floor.");
    expect(markup).toContain("Hire agents");
  });
});
