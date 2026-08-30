"use client";

import { useState } from "react";
import { AgentNodeInspector, type InspectorAgent, type InspectorFiles, type InspectorLane } from "./agent-node-inspector";
import { HandoffContextRail, type HandoffDocument } from "./handoff-context-rail";
import { ProductionNodeCanvas, type ProductionAgent, type ProductionLane, type HandoffRule } from "./production-node-canvas";

type Props = {
  workflows: readonly { id: string; name: string }[];
  agents: readonly (ProductionAgent & InspectorAgent)[];
  lanes: readonly (ProductionLane & InspectorLane)[];
  handoffRules: readonly HandoffRule[];
  files: readonly InspectorFiles[];
  documents: readonly HandoffDocument[];
};

export function ProductionNodeWorkbench({ workflows, agents, lanes, handoffRules, files, documents }: Props) {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(agents[0]?.id ?? null);
  const [workflowId, setWorkflowId] = useState<string>(workflows[0]?.id ?? "");
  const visibleAgents = agents.map((agent) => ({ ...agent, status: workflowId ? agent.workflowStatus?.[workflowId] ?? "ready" : agent.status ?? "ready" }));
  const selected = visibleAgents.find((agent) => agent.id === selectedAgentId) ?? null;
  const selectedLane = selected ? lanes.find((lane) => lane.id === selected.lane_id) ?? null : null;
  const selectedFiles = selected ? files.find((file) => file.agent_id === selected.id) ?? null : null;
  const workflowRules = handoffRules.filter((rule) => !workflowId || rule.workflow_id === workflowId);
  const workflowDocuments = documents.filter((document) => !workflowId || document.workflow_id === workflowId);
  const selectedDocuments = selected
    ? workflowDocuments.filter(
        (document) =>
          document.source_id === selected.id ||
          document.target_id === selected.id ||
          (selected.lane_id && (document.source_lane_id === selected.lane_id || document.target_lane_id === selected.lane_id)),
      )
    : [];

  return <div className="production-node-workbench">
    <div className="node-workbench-toolbar"><label>Workflow<select value={workflowId} onChange={(event) => setWorkflowId(event.target.value)} disabled={!workflows.length}>{workflows.length ? workflows.map((workflow) => <option value={workflow.id} key={workflow.id}>{workflow.name}</option>) : <option value="">No workflow</option>}</select></label><p>{workflowRules.length} handoffs · {agents.length} agents</p></div>
    <ProductionNodeCanvas agents={visibleAgents} lanes={lanes} handoffRules={workflowRules} selectedAgentId={selectedAgentId} onSelectAgent={(agent) => setSelectedAgentId(agent.id)} />
    <div className="node-workbench-grid">
      <AgentNodeInspector agent={selected} lane={selectedLane} files={selectedFiles} handoffDocuments={selectedDocuments.map((document) => ({ id: document.id, title: document.title, status: document.status, source: document.source }))} />
      <HandoffContextRail documents={workflowDocuments} selectedAgentId={selectedAgentId} selectedLaneId={selected?.lane_id ?? null} />
    </div>
  </div>;
}
