"use client";

import type { StageActionState, StageAgent, StageExecution, StageFloorProps, StageLane, StageRule, StageStep, StageWorkflow } from "@/lib/studio/stage-floor-types";
import styles from "./stage-floor.module.css";

type FormAction = (formData: FormData) => void;
type Scope = StageFloorProps["scope"];

type StageFloorControlsProps = Readonly<{
  scope: Scope;
  workflows: StageWorkflow[];
  workflowId: string;
  rules: StageRule[];
  agents: StageAgent[];
  lanes: StageLane[];
  filteredAgents: StageAgent[];
  agentQuery: string;
  selectedAgent: StageAgent | null;
  selectedLane: StageLane | null;
  executions: StageExecution[];
  steps: StageStep[];
  staffingHref: string;
  actionState: StageActionState;
  formAction: FormAction;
  pending: boolean;
  actionDisabled: boolean;
  graphEditingDisabled: boolean;
  onAgentQuery: (value: string) => void;
  onSelectAgent: (agentId: string) => void;
  onWorkflowChange: (workflowId: string) => void;
}>;

function ScopeFields({ scope }: { scope: Scope }) {
  return <><input type="hidden" name="kind" value={scope.kind} /><input type="hidden" name="channel_id" value={scope.channelId ?? ""} /><input type="hidden" name="production_id" value={scope.productionId ?? ""} /></>;
}

function endpointOptions(agents: StageAgent[], lanes: StageLane[]) {
  return <><optgroup label="Agents">{agents.map((agent) => <option key={agent.id} value={`agent:${agent.id}`}>{agent.name} · {agent.agent_type}</option>)}</optgroup><optgroup label="Lanes">{lanes.map((lane) => <option key={lane.id} value={`lane:${lane.id}`}>{lane.name} lane</option>)}</optgroup></>;
}

function endpointName(rule: StageRule, side: "source" | "target", agents: StageAgent[], lanes: StageLane[]) {
  const kind = side === "source" ? rule.source_kind : rule.target_kind;
  const id = side === "source" ? (kind === "agent" ? rule.source_agent_id : rule.source_lane_id) : (kind === "agent" ? rule.target_agent_id : rule.target_lane_id);
  return kind === "agent" ? agents.find((agent) => agent.id === id)?.name ?? "Unavailable agent" : lanes.find((lane) => lane.id === id)?.name ?? "Unavailable lane";
}

export function StageFloorControls({ scope, workflows, workflowId, rules, agents, lanes, filteredAgents, agentQuery, selectedAgent, selectedLane, executions, steps, staffingHref, actionState, formAction, pending, actionDisabled, graphEditingDisabled, onAgentQuery, onSelectAgent, onWorkflowChange }: StageFloorControlsProps) {
  const workflow = workflows.find((item) => item.id === workflowId) ?? null;
  const runningExecution = executions.find((execution) => execution.status === "running") ?? null;
  const currentStep = runningExecution ? steps.find((step) => step.execution_id === runningExecution.id && step.status === "running") ?? null : null;
  const controlsDisabled = actionDisabled || pending;
  const graphControlsDisabled = graphEditingDisabled || pending;

  return <>
    <section className={styles.workflowBar} aria-label="Workflow controls">
      <div className={styles.workflowSelectWrap}>
        <label htmlFor="stage-floor-workflow">Workflow</label>
        <select id="stage-floor-workflow" value={workflowId} onChange={(event) => onWorkflowChange(event.target.value)} disabled={!workflows.length || pending}>
          {workflows.length ? workflows.map((item) => <option key={item.id} value={item.id}>{item.name}</option>) : <option value="">No workflow yet</option>}
        </select>
      </div>
      <form action={formAction} className={styles.inlineForm}>
        <ScopeFields scope={scope} /><input type="hidden" name="action" value="create" />
        <label className={styles.srOnly} htmlFor="stage-floor-create">New workflow name</label>
        <input id="stage-floor-create" name="name" required maxLength={120} placeholder="Name a workflow" disabled={controlsDisabled} />
        <button type="submit" className={styles.secondaryButton} disabled={controlsDisabled}>{pending ? "Saving…" : "Create"}</button>
      </form>
      {workflow && <form action={formAction} className={styles.inlineForm} key={workflow.id}>
        <ScopeFields scope={scope} /><input type="hidden" name="action" value="rename" /><input type="hidden" name="workflow_id" value={workflow.id} />
        <label className={styles.srOnly} htmlFor="stage-floor-rename">Rename current workflow</label>
        <input id="stage-floor-rename" name="name" required maxLength={120} defaultValue={workflow.name} disabled={graphControlsDisabled} />
        <button type="submit" className={styles.quietButton} disabled={graphControlsDisabled}>Rename</button>
      </form>}
      <form action={formAction} className={styles.runForm}>
        <ScopeFields scope={scope} /><input type="hidden" name="action" value="start" /><input type="hidden" name="workflow_id" value={workflowId} />
        <label className={styles.srOnly} htmlFor="stage-floor-brief">Initial brief</label>
        <input id="stage-floor-brief" name="brief" maxLength={4000} required placeholder="Initial brief for this run" disabled={controlsDisabled || !workflowId || !rules.length || Boolean(runningExecution)} />
        <button type="submit" className={styles.primaryButton} disabled={controlsDisabled || !workflowId || !rules.length || Boolean(runningExecution)}>{runningExecution ? "Run in progress" : "Start run"}</button>
      </form>
    </section>
    {actionState.message && <p className={`${styles.actionMessage} ${actionState.ok ? styles.actionSuccess : styles.actionError}`} role={actionState.ok ? "status" : "alert"}>{actionState.message}</p>}
    <aside className={styles.agentPool} aria-label="Hired agent pool">
      <div className={styles.panelHeading}><div><p className={styles.eyebrow}>Workspace pool</p><h2>Hired agents</h2></div><a href={staffingHref}>Hire agents</a></div>
      <p className={styles.muted}>All workspace departments are available here. Connected nodes are shown in the map.</p>
      <label className={styles.searchLabel} htmlFor="stage-floor-agent-search">Search agents</label>
      <input id="stage-floor-agent-search" type="search" value={agentQuery} onChange={(event) => onAgentQuery(event.target.value)} placeholder="Name, type, capability" />
      <div className={styles.agentList}>{filteredAgents.length ? filteredAgents.map((agent) => <button type="button" key={agent.id} className={`${styles.agentItem} ${selectedAgent?.id === agent.id ? styles.agentItemSelected : ""}`} onClick={() => onSelectAgent(agent.id)}><span><b>{agent.name}</b><small>{agent.agent_type}</small></span><i aria-label={agent.protected_config ? "Protected configuration" : "Configurable"}>{agent.protected_config ? "Protected" : "Ready"}</i></button>) : <p className={styles.emptyCopy}>{agents.length ? "No hired agents match this search." : "No hired agents yet."}</p>}</div>
    </aside>
    <aside className={styles.inspector} aria-label="Selected node inspector">
      <div className={styles.panelHeading}><div><p className={styles.eyebrow}>Inspector</p><h2>{selectedAgent?.name ?? selectedLane?.name ?? "Select a node"}</h2></div>{selectedAgent?.protected_config && <span className={styles.protectedBadge}>Protected</span>}</div>
      {selectedAgent ? <dl className={styles.inspectorList}><div><dt>Role</dt><dd>{selectedAgent.agent_type}</dd></div><div><dt>Lane</dt><dd>{lanes.find((lane) => lane.id === selectedAgent.lane_id)?.name ?? "Unassigned"}</dd></div><div><dt>Model</dt><dd>{selectedAgent.model_tier_override ?? selectedAgent.recommended_tier ?? "Workspace default"}</dd></div><div><dt>Capabilities</dt><dd>{selectedAgent.capabilities?.length ? selectedAgent.capabilities.join(", ") : "No capabilities recorded"}</dd></div></dl> : <p className={styles.emptyCopy}>Choose an agent in the pool or graph to view its summary.</p>}
      {selectedLane && <p className={styles.protectedNote}>{agents.filter((agent) => agent.lane_id === selectedLane.id).length} hired agents belong to this lane.</p>}
      {selectedAgent?.protected_config && <p className={styles.protectedNote}>Protected configuration. Prompt files and provider secrets are not shown here.</p>}
    </aside>
    <section className={styles.connectionPanel} aria-label="Connect workflow endpoints">
      <div className={styles.panelHeading}><div><p className={styles.eyebrow}>Graph editor</p><h2>Connect endpoints</h2></div><span>{rules.length} saved</span></div>
      <p className={styles.muted}>Connect the agent pool or lanes with an explicit handoff. A running graph stays locked.</p>
      <form action={formAction} className={styles.connectForm}>
        <ScopeFields scope={scope} /><input type="hidden" name="action" value="connect" /><input type="hidden" name="workflow_id" value={workflowId} />
        <label htmlFor="stage-floor-source">From<select id="stage-floor-source" aria-label="From" name="source" required disabled={graphControlsDisabled || !workflowId || (!agents.length && !lanes.length)}><option value="">Choose endpoint</option>{endpointOptions(agents, lanes)}</select></label>
        <label htmlFor="stage-floor-target">To<select id="stage-floor-target" aria-label="To" name="target" required disabled={graphControlsDisabled || !workflowId || (!agents.length && !lanes.length)}><option value="">Choose endpoint</option>{endpointOptions(agents, lanes)}</select></label>
        <label htmlFor="stage-floor-trigger">When<select id="stage-floor-trigger" aria-label="When" name="trigger_event" defaultValue="completion" disabled={graphControlsDisabled || !workflowId || (!agents.length && !lanes.length)}><option value="completion">Completion</option><option value="manual">Manual</option></select></label>
        <button type="submit" className={styles.secondaryButton} disabled={graphControlsDisabled || !workflowId || (!agents.length && !lanes.length)}>Connect</button>
      </form>
      {rules.length > 0 && <form action={formAction} className={styles.disconnectForm}>
        <ScopeFields scope={scope} /><input type="hidden" name="action" value="disconnect" /><input type="hidden" name="workflow_id" value={workflowId} />
        <label>Saved handoff<select name="rule_id" required disabled={graphControlsDisabled}>{rules.map((rule) => <option key={rule.id} value={rule.id}>{endpointName(rule, "source", agents, lanes)} → {endpointName(rule, "target", agents, lanes)}</option>)}</select></label>
        <button type="submit" className={styles.quietButton} disabled={graphControlsDisabled}>Disconnect</button>
      </form>}
    </section>
    <section className={styles.runHistory} aria-label="Run history and step output">
      <div className={styles.panelHeading}><div><p className={styles.eyebrow}>Execution log</p><h2>Runs track handoffs</h2></div>{runningExecution && <span className={styles.runningBadge}>Running</span>}</div>
      {executions.length ? <ol className={styles.executionList}>{executions.map((execution) => <li key={execution.id}><div><b>{execution.status}</b><small>{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(execution.created_at))}</small></div><span>{steps.filter((step) => step.execution_id === execution.id).length} steps</span></li>)}</ol> : <p className={styles.emptyCopy}>No runs have started for this workflow.</p>}
      {currentStep && <div className={styles.currentStep}><p>Current step ready for a human update.</p><form action={formAction}><ScopeFields scope={scope} /><input type="hidden" name="action" value="complete" /><input type="hidden" name="workflow_id" value={workflowId} /><input type="hidden" name="execution_id" value={runningExecution?.id} /><input type="hidden" name="step_id" value={currentStep.id} /><label className={styles.srOnly} htmlFor="stage-floor-output">Completed output</label><textarea id="stage-floor-output" name="output" required maxLength={10000} placeholder="Plain-text completed output" disabled={controlsDisabled} /><button type="submit" className={styles.secondaryButton} disabled={controlsDisabled}>Complete step</button></form><form action={formAction}><ScopeFields scope={scope} /><input type="hidden" name="action" value="fail" /><input type="hidden" name="workflow_id" value={workflowId} /><input type="hidden" name="execution_id" value={runningExecution?.id} /><input type="hidden" name="step_id" value={currentStep.id} /><label className={styles.srOnly} htmlFor="stage-floor-error">Failure message</label><input id="stage-floor-error" name="error_message" required maxLength={2000} placeholder="Explain what needs attention" disabled={controlsDisabled} /><button type="submit" className={styles.dangerButton} disabled={controlsDisabled}>Fail step</button></form></div>}
      {runningExecution && !currentStep && <form action={formAction} className={styles.cancelForm}><ScopeFields scope={scope} /><input type="hidden" name="action" value="advance" /><input type="hidden" name="workflow_id" value={workflowId} /><input type="hidden" name="execution_id" value={runningExecution.id} /><button type="submit" className={styles.secondaryButton} disabled={controlsDisabled}>Continue manual handoff</button></form>}
      {steps.length > 0 && <div className={styles.stepOutputs}>{steps.map((step, index) => <details key={step.id}><summary>Step {index + 1} · {step.status}</summary>{step.error_message && <p>{step.error_message}</p>}<pre>{typeof step.output_payload.result === "string" ? step.output_payload.result : JSON.stringify(step.output_payload, null, 2)}</pre></details>)}</div>}
      {runningExecution && <form action={formAction} className={styles.cancelForm}><ScopeFields scope={scope} /><input type="hidden" name="action" value="cancel" /><input type="hidden" name="workflow_id" value={workflowId} /><input type="hidden" name="execution_id" value={runningExecution.id} /><button type="submit" className={styles.quietButton} disabled={controlsDisabled}>Cancel run</button></form>}
    </section>
  </>;
}
