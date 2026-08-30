"use client";

import { useMemo, useState } from "react";
import { orderAgentsForFlow, type FlowRule } from "@/lib/orchestration/visual-flow";

export type ProductionAgent = {
  id: string;
  name: string;
  lane_id: string;
  model?: string | null;
  status?: "ready" | "running" | "complete" | "blocked" | string;
  capability?: string | null;
  latestHandoff?: string | null;
  workflowStatus?: Readonly<Record<string, string>>;
};

export type ProductionLane = { id: string; name: string; color?: string | null };
export type HandoffRule = FlowRule & Readonly<{ id: string; workflow_id?: string }>;

type Props = {
  agents: readonly ProductionAgent[];
  lanes?: readonly ProductionLane[];
  handoffRules?: readonly HandoffRule[];
  selectedAgentId?: string | null;
  onSelectAgent?: (agent: ProductionAgent) => void;
};

const statusColor: Record<string, string> = { complete: "var(--color-lime)", running: "var(--color-cyan)", blocked: "var(--color-red)", ready: "var(--color-pink)" };

export function ProductionNodeCanvas({ agents, lanes = [], handoffRules = [], selectedAgentId, onSelectAgent }: Props) {
  const [mode, setMode] = useState<"ordered" | "grouped">("ordered");
  const [internalSelected, setInternalSelected] = useState<string | null>(selectedAgentId ?? agents[0]?.id ?? null);
  const activeId = selectedAgentId ?? internalSelected;
  const ordered = useMemo(() => orderAgentsForFlow(agents, handoffRules), [agents, handoffRules]);
  const visible = mode === "ordered" ? ordered : agents;
  const laneName = (agent: ProductionAgent) => lanes.find((lane) => lane.id === agent.lane_id)?.name ?? "Unassigned";
  const select = (agent: ProductionAgent) => { setInternalSelected(agent.id); onSelectAgent?.(agent); };

  return <section className="production-node-canvas" aria-label="Production agent flow">
    <header className="node-canvas-header">
      <div><p className="kicker">Agent orchestration</p><h2>Production flow</h2><p className="node-canvas-subtitle">Typed handoffs keep every creative decision in sequence.</p></div>
      <div className="node-mode-toggle" role="group" aria-label="Flow layout mode">
        {(["ordered", "grouped"] as const).map((option) => <button key={option} type="button" className={mode === option ? "is-active" : ""} aria-pressed={mode === option} onClick={() => setMode(option)}>{option === "ordered" ? "01—Ordered" : "Group by lane"}</button>)}
      </div>
    </header>
    <div className={`node-canvas-surface node-canvas-${mode}`}>
      <div className="node-canvas-meta"><span>{visible.length} agents</span><span className="node-canvas-legend"><i className="legend-dot legend-running" /> active <i className="legend-dot legend-complete" /> complete</span></div>
      {visible.length === 0 ? <div className="node-canvas-empty"><strong>No agents hired yet.</strong><p>Add agents in Lanes & agents, then connect them with handoff rules.</p></div> : mode === "grouped" ? <div className="node-lane-groups">{(lanes.length ? lanes : [{ id: "unassigned", name: "Unassigned" }]).map((lane) => {
        const members = visible.filter((agent) => lane.id === (agent.lane_id || "unassigned"));
        if (!members.length) return null;
        return <div className="node-lane-group" key={lane.id}><div className="node-lane-heading"><span>{lane.name}</span><b>{String(members.length).padStart(2, "0")}</b></div><div className="node-lane-members">{members.map((agent) => <AgentNode key={agent.id} agent={agent} sequence={visible.indexOf(agent)} selected={agent.id === activeId} lane={laneName(agent)} onSelect={select} />)}</div></div>;
      })}</div> : <div className="node-flow-wrap"><svg className="node-flow-edges" aria-hidden="true" viewBox={`0 0 ${Math.max(visible.length * 220, 440)} 160`} preserveAspectRatio="none">{visible.slice(0, -1).map((agent, index) => <line key={`${agent.id}-${visible[index + 1].id}`} x1={index * 220 + 176} y1="80" x2={(index + 1) * 220 + 14} y2="80" />)}</svg><div className="node-flow-track">{visible.map((agent, index) => <AgentNode key={agent.id} agent={agent} sequence={index} selected={agent.id === activeId} lane={laneName(agent)} onSelect={select} />)}</div></div>}
    </div>
  </section>;
}

function AgentNode({ agent, sequence, selected, lane, onSelect }: { agent: ProductionAgent; sequence: number; selected: boolean; lane: string; onSelect: (agent: ProductionAgent) => void }) {
  const status = agent.status ?? "ready";
  return <button type="button" className={`production-agent-node ${selected ? "is-selected" : ""}`} aria-label={`Select agent ${agent.name}`} aria-pressed={selected} tabIndex={0} onClick={() => onSelect(agent)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(agent); } }}>
    <span className="agent-node-index">{String(sequence + 1).padStart(2, "0")} · {lane}</span><span className="agent-node-signal" style={{ background: statusColor[status] ?? "var(--color-pink)" }} /><strong>{agent.name}</strong><small>{agent.capability ?? "Production agent"}</small><span className="agent-node-model">{agent.model ?? "Model unassigned"}</span>{agent.latestHandoff && <span className="agent-node-handoff">↳ {agent.latestHandoff}</span>}
  </button>;
}
