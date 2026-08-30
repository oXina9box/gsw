import { describe, expect, it } from "vitest";
import { getHandoffDirection, isHandoffRelevantToAgent, orderAgentsForFlow } from "../../lib/orchestration/visual-flow";
import { filterAgentFilesForClient, sanitizeAgentFiles } from "../../lib/studio/agent-protection";

const agents = [
  { id: "writer", lane_id: "story" },
  { id: "editor", lane_id: "story" },
  { id: "director", lane_id: "video" },
  { id: "publisher", lane_id: "launch" },
];

describe("production visual flow", () => {
  it("orders direct agent handoffs by rule position", () => {
    const rules = [
      { position: 1, source_kind: "agent", source_agent_id: "editor", source_lane_id: null, target_kind: "agent", target_agent_id: "director", target_lane_id: null },
      { position: 0, source_kind: "agent", source_agent_id: "writer", source_lane_id: null, target_kind: "agent", target_agent_id: "editor", target_lane_id: null },
    ] as const;
    expect(orderAgentsForFlow(agents, rules).map(({ id }) => id)).toEqual(["writer", "editor", "director", "publisher"]);
  });

  it("expands lane handoffs into every agent in each lane", () => {
    const rules = [
      { position: 0, source_kind: "lane", source_agent_id: null, source_lane_id: "story", target_kind: "lane", target_agent_id: null, target_lane_id: "video" },
    ] as const;
    expect(orderAgentsForFlow(agents, rules).map(({ id }) => id)).toEqual(["writer", "editor", "director", "publisher"]);
  });

  it("deduplicates repeated nodes and keeps unconnected agents visible", () => {
    const rules = [
      { position: 0, source_kind: "agent", source_agent_id: "director", source_lane_id: null, target_kind: "agent", target_agent_id: "writer", target_lane_id: null },
      { position: 1, source_kind: "agent", source_agent_id: "writer", source_lane_id: null, target_kind: "agent", target_agent_id: "director", target_lane_id: null },
    ] as const;
    expect(orderAgentsForFlow(agents, rules).map(({ id }) => id)).toEqual(["director", "writer", "editor", "publisher"]);
  });

  it("filters protected agent files before client serialization", () => {
    const files = [
      { agent_id: "public", role: "public role" },
      { agent_id: "sealed", role: "SECRET PROMPT" },
    ];
    expect(filterAgentFilesForClient([
      { id: "public", protected_config: false },
      { id: "sealed", protected_config: true },
    ], files)).toEqual([{ agent_id: "public", role: "public role" }]);
  });

  it("masks every protected file field", () => {
    const masked = sanitizeAgentFiles(true, { agent_id: "sealed", role: "SECRET", soul: "SECRET", jobdescription: "SECRET", skills: "SECRET", memory: "SECRET", user_content: "SECRET" });
    expect(masked.agent_id).toBeUndefined();
    expect(Object.values(masked).every((value) => value === "Protected Configuration — Proprietary Studio Agent")).toBe(true);
  });

  it("labels handoffs from source and target IDs", () => {
    expect(getHandoffDirection({ source_id: "writer", target_id: "editor" }, "writer")).toBe("outbound");
    expect(getHandoffDirection({ source_id: "writer", target_id: "editor" }, "editor")).toBe("inbound");
    expect(getHandoffDirection({ source_id: "writer", target_id: "editor" }, "other")).toBe("related");
  });

  it("includes lane handoffs for agents in that lane", () => {
    const laneHandoff = { source_lane_id: "story", target_lane_id: "video" };
    expect(isHandoffRelevantToAgent(laneHandoff, { id: "writer", lane_id: "story" })).toBe(true);
    expect(isHandoffRelevantToAgent(laneHandoff, { id: "director", lane_id: "video" })).toBe(true);
    expect(isHandoffRelevantToAgent(laneHandoff, { id: "publisher", lane_id: "launch" })).toBe(false);
    expect(isHandoffRelevantToAgent({ source_id: "writer", target_id: "editor" }, { id: "writer", lane_id: "story" })).toBe(true);
  });
});
