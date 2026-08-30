export type FlowAgent = Readonly<{ id: string; lane_id: string | null }>;

export type FlowRule = Readonly<{
  position?: number | null;
  source_kind: "lane" | "agent";
  source_lane_id?: string | null;
  source_agent_id?: string | null;
  target_kind: "lane" | "agent";
  target_lane_id?: string | null;
  target_agent_id?: string | null;
}>;

function endpointAgents<T extends FlowAgent>(agents: readonly T[], kind: "lane" | "agent", laneId?: string | null, agentId?: string | null) {
  return kind === "lane" ? agents.filter((agent) => agent.lane_id === laneId) : agents.filter((agent) => agent.id === agentId);
}

export function orderAgentsForFlow<T extends FlowAgent>(agents: readonly T[], rules: readonly FlowRule[]): T[] {
  const orderedRules = [...rules].sort((a, b) => (a.position ?? Number.MAX_SAFE_INTEGER) - (b.position ?? Number.MAX_SAFE_INTEGER));
  const candidates = orderedRules.flatMap((rule) => [
    ...endpointAgents(agents, rule.source_kind, rule.source_lane_id, rule.source_agent_id),
    ...endpointAgents(agents, rule.target_kind, rule.target_lane_id, rule.target_agent_id),
  ]);
  const connectedIds = new Set(candidates.map((agent) => agent.id));
  const connected = candidates.filter((agent, index) => candidates.findIndex((candidate) => candidate.id === agent.id) === index);
  return [...connected, ...agents.filter((agent) => !connectedIds.has(agent.id))];
}

export type HandoffEndpoint = Readonly<{ source_id?: string | null; target_id?: string | null; source_lane_id?: string | null; target_lane_id?: string | null }>;

export function getHandoffDirection(document: HandoffEndpoint, selectedAgentId: string | null | undefined): "outbound" | "inbound" | "related" {
  if (selectedAgentId && document.source_id === selectedAgentId) return "outbound";
  if (selectedAgentId && document.target_id === selectedAgentId) return "inbound";
  return "related";
}

export function isHandoffRelevantToAgent(
  document: HandoffEndpoint,
  agent: { id: string; lane_id?: string | null } | null | undefined,
): boolean {
  if (!agent) return true;
  if (document.source_id === agent.id || document.target_id === agent.id) return true;
  if (agent.lane_id && (document.source_lane_id === agent.lane_id || document.target_lane_id === agent.lane_id)) return true;
  return false;
}
