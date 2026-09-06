"use client";

import { useMemo, useState } from "react";
import type { StageAgent, StageLane, StageRule } from "@/lib/studio/stage-floor-types";
import styles from "./stage-floor.module.css";

type StageFloorCanvasProps = Readonly<{
  agents: StageAgent[];
  lanes: StageLane[];
  rules: StageRule[];
  selectedNodeKey: string | null;
  onSelectNode: (nodeKey: string) => void;
}>;

function endpointLabel(rule: StageRule, agents: StageAgent[], lanes: StageLane[], side: "source" | "target") {
  const kind = side === "source" ? rule.source_kind : rule.target_kind;
  const agentId = side === "source" ? rule.source_agent_id : rule.target_agent_id;
  const laneId = side === "source" ? rule.source_lane_id : rule.target_lane_id;
  if (kind === "agent") return agents.find((agent) => agent.id === agentId)?.name ?? "Unavailable agent";
  return lanes.find((lane) => lane.id === laneId)?.name ?? "Unavailable lane";
}

export function StageFloorCanvas({ agents, lanes, rules, selectedNodeKey, onSelectNode }: StageFloorCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const nodes = useMemo(() => {
    const connectedAgents = new Set(rules.flatMap((rule) => [rule.source_agent_id, rule.target_agent_id]).filter(Boolean));
    const connectedLanes = new Set(rules.flatMap((rule) => [rule.source_lane_id, rule.target_lane_id]).filter(Boolean));
    const raw = [
      ...agents.map((agent) => ({ key: `agent:${agent.id}`, label: agent.name, detail: agent.agent_type, connected: connectedAgents.has(agent.id), agentId: agent.id })),
      ...lanes.map((lane) => ({ key: `lane:${lane.id}`, label: lane.name, detail: "lane", connected: connectedLanes.has(lane.id), agentId: null })),
    ];
    const columns = Math.max(3, Math.min(4, Math.ceil(Math.sqrt(raw.length))));
    return raw.map((node, index) => ({ ...node, x: 90 + (index % columns) * 205, y: 85 + Math.floor(index / columns) * 165 }));
  }, [agents, lanes, rules]);
  const nodeByKey = new Map(nodes.map((node) => [node.key, node]));
  const columns = Math.max(3, Math.min(4, Math.ceil(Math.sqrt(nodes.length))));
  const graphWidth = Math.max(900, 110 + columns * 205);
  const graphHeight = Math.max(540, 120 + Math.ceil(nodes.length / columns) * 165);

  return <section className={styles.canvasPanel} aria-label="Saved workflow graph">
    <header className={styles.canvasHeader}>
      <div>
        <p className={styles.eyebrow}>Persisted graph</p>
        <h2>Handoff map</h2>
        <p>Lines appear only for saved handoff rules.</p>
      </div>
      <div className={styles.zoomControls} role="group" aria-label="Graph zoom">
        <button type="button" onClick={() => setZoom((current) => Math.max(0.8, current - 0.2))} disabled={zoom <= 0.8} aria-label="Zoom out">−</button>
        <button type="button" onClick={() => setZoom(1)} aria-label="Reset graph zoom">Reset</button>
        <button type="button" onClick={() => setZoom((current) => Math.min(1.2, current + 0.2))} disabled={zoom >= 1.2} aria-label="Zoom in">+</button>
      </div>
    </header>
    <div className={styles.graphViewport} aria-label="Graph canvas; scroll to pan">
      <div className={styles.graphWorld} style={{ transform: `scale(${zoom})`, width: `${graphWidth}px`, height: `${graphHeight}px` }}>
        <svg className={styles.graphEdges} viewBox={`0 0 ${graphWidth} ${graphHeight}`} preserveAspectRatio="none" aria-hidden="true">
          <defs><marker id="stage-floor-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" /></marker></defs>
          {rules.map((rule) => {
            const source = nodeByKey.get(`${rule.source_kind}:${rule.source_kind === "agent" ? rule.source_agent_id : rule.source_lane_id}`);
            const target = nodeByKey.get(`${rule.target_kind}:${rule.target_kind === "agent" ? rule.target_agent_id : rule.target_lane_id}`);
            if (!source || !target) return null;
            const sourceOnLeft = source.x <= target.x;
            const startX = source.x + (sourceOnLeft ? 144 : 0);
            const endX = target.x + (sourceOnLeft ? 0 : 144);
            return <path key={rule.id} d={`M ${startX} ${source.y + 38} C ${startX + (sourceOnLeft ? 65 : -65)} ${source.y + 38}, ${endX + (sourceOnLeft ? -65 : 65)} ${target.y + 38}, ${endX} ${target.y + 38}`} markerEnd="url(#stage-floor-arrow)" />;
          })}
        </svg>
        {nodes.map((node) => <button
          type="button"
          key={node.key}
          className={`${styles.graphNode} ${node.connected ? styles.connectedNode : ""} ${node.key === selectedNodeKey ? styles.selectedNode : ""}`}
          style={{ left: `${node.x}px`, top: `${node.y}px` }}
          onClick={() => onSelectNode(node.key)}
          aria-pressed={node.key === selectedNodeKey}
          aria-label={`${node.label}, ${node.detail}${node.connected ? ", connected" : ", not connected"}`}
        ><span>{node.label}</span><small>{node.detail}</small></button>)}
        {!nodes.length && <p className={styles.canvasEmpty}>Hire agents to place them on this floor.</p>}
      </div>
    </div>
    <div className={styles.handoffList}>
      <strong>Saved handoffs</strong>
      {rules.length ? <ul>{rules.map((rule) => <li key={rule.id}><span>{endpointLabel(rule, agents, lanes, "source")}</span><b>→</b><span>{endpointLabel(rule, agents, lanes, "target")}</span><small>{rule.trigger_event}</small></li>)}</ul> : <p>No saved handoffs in this workflow.</p>}
    </div>
  </section>;
}
