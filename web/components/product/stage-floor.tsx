"use client";

import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
import { stageFloorAction } from "@/app/(product)/stage-floor-actions";
import type { StageActionState, StageFloorProps } from "@/lib/studio/stage-floor-types";
import { StageFloorCanvas } from "./stage-floor-canvas";
import { StageFloorControls } from "./stage-floor-controls";
import styles from "./stage-floor.module.css";

const initialActionState: StageActionState = { ok: false, message: "" };

function titleFor(kind: StageFloorProps["scope"]["kind"], supplied?: string) {
  if (supplied) return supplied;
  return kind === "marketing" ? "Stage M" : kind === "social" ? "Stage S" : "Production";
}

function updateWorkflowInHistory(workflowId: string) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (workflowId) url.searchParams.set("workflow", workflowId); else url.searchParams.delete("workflow");
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

export function StageFloor({ scope, data, title, initialWorkflowId, staffingHref }: StageFloorProps) {
  const fallbackWorkflowId = data.workflows.find((workflow) => workflow.id === initialWorkflowId)?.id ?? data.workflows[0]?.id ?? "";
  const [workflowId, setWorkflowId] = useState(fallbackWorkflowId);
  const activeWorkflowId = data.workflows.some((workflow) => workflow.id === workflowId) ? workflowId : fallbackWorkflowId;
  const [agentQuery, setAgentQuery] = useState("");
  const [selectedNodeKey, setSelectedNodeKey] = useState(data.agents[0] ? `agent:${data.agents[0].id}` : null);
  const selectedAgent = data.agents.find((agent) => selectedNodeKey === `agent:${agent.id}`) ?? null;
  const selectedLane = data.lanes.find((lane) => selectedNodeKey === `lane:${lane.id}`) ?? null;
  const actionWithSelection = useCallback(async (previous: StageActionState, formData: FormData) => {
    const result = await stageFloorAction(previous, formData);
    if (formData.get("action") === "create" && result.workflowId) {
      setWorkflowId(result.workflowId);
      updateWorkflowInHistory(result.workflowId);
    }
    return result;
  }, []);
  const [actionState, formAction, pending] = useActionState(actionWithSelection, initialActionState);
  const workflowRules = data.rules.filter((rule) => rule.workflow_id === activeWorkflowId);
  const workflowExecutions = data.executions.filter((execution) => execution.workflow_id === activeWorkflowId);
  const workflowExecutionIds = new Set(workflowExecutions.map((execution) => execution.id));
  const workflowSteps = data.steps.filter((step) => workflowExecutionIds.has(step.execution_id));
  const filteredAgents = useMemo(() => {
    const query = agentQuery.trim().toLowerCase();
    if (!query) return data.agents;
    return data.agents.filter((agent) => [agent.name, agent.agent_type, ...(agent.capabilities ?? [])].some((value) => value.toLowerCase().includes(query)));
  }, [agentQuery, data.agents]);

  useEffect(() => {
    function syncHistorySelection() {
      const next = new URL(window.location.href).searchParams.get("workflow");
      if (next && data.workflows.some((workflow) => workflow.id === next)) setWorkflowId(next);
    }
    window.addEventListener("popstate", syncHistorySelection);
    return () => window.removeEventListener("popstate", syncHistorySelection);
  }, [data.workflows]);

  function chooseWorkflow(nextId: string) {
    setWorkflowId(nextId);
    updateWorkflowInHistory(nextId);
  }

  const running = workflowExecutions.some((execution) => execution.status === "running");
  const actionDisabled = Boolean(data.error);
  const graphEditingDisabled = actionDisabled || running;

  return <section className={styles.stageFloor} data-testid="stage-floor">
    <header className={styles.stageHeader}>
      <div><p className={styles.eyebrow}>Stage Floor</p><h2>{titleFor(scope.kind, title)}</h2></div>
      <p>Connect your team. Shape the handoffs. Build and run your department pipeline.</p>
    </header>
    {data.error && <div className={styles.dataError} role="alert"><strong>Floor data is unavailable.</strong><span>{data.error}</span></div>}
    <StageFloorControls
      scope={scope}
      workflows={data.workflows}
      workflowId={activeWorkflowId}
      rules={workflowRules}
      agents={data.agents}
      lanes={data.lanes}
      filteredAgents={filteredAgents}
      agentQuery={agentQuery}
      selectedAgent={selectedAgent}
      selectedLane={selectedLane}
      executions={workflowExecutions}
      steps={workflowSteps}
      staffingHref={staffingHref}
      actionState={actionState}
      formAction={formAction}
      pending={pending}
      actionDisabled={actionDisabled}
      graphEditingDisabled={graphEditingDisabled}
      onAgentQuery={setAgentQuery}
      onSelectAgent={(agentId) => setSelectedNodeKey(`agent:${agentId}`)}
      onWorkflowChange={chooseWorkflow}
    />
    <StageFloorCanvas agents={data.agents} lanes={data.lanes} rules={workflowRules} selectedNodeKey={selectedNodeKey} onSelectNode={setSelectedNodeKey} />
  </section>;
}
