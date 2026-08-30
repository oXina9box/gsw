import { createClient } from "@/lib/supabase/server";
import { CreateForm } from "@/components/product/create-form";
import { ExecutionLive } from "@/components/product/execution-live";
import { ProductionNodeWorkbench } from "@/components/product/production-node-workbench";
import { createDefaultWorkflow, createWorkflow, createHandoffRule, deleteHandoffRule, deleteWorkflow, startWorkflowExecution, updateWorkflow } from "@/app/(product)/actions";
import { filterAgentFilesForClient, sanitizeAgentFiles } from "@/lib/studio/agent-protection";
import { PrelineCard } from "@/components/blocks/preline/preline-card";

export const metadata = { title: "Orchestration" };

type Workflow = { id: string; name: string; description: string };
type Lane = { id: string; name: string; collaboration_mode: "forward" | "round_table" | null; pass_order: number[] | null; pass_cycles: number | null };
type Agent = { id: string; lane_id: string; name: string; agent_type: string; recommended_tier: "free" | "mid" | "quality" | null; model_tier_override: "free" | "mid" | "quality" | null; capabilities: string[] | null; protected_config: boolean };
type HandoffRule = {
  id: string;
  workflow_id: string;
  position: number;
  source_kind: "lane" | "agent";
  source_lane_id: string | null;
  source_agent_id: string | null;
  target_kind: "lane" | "agent";
  target_lane_id: string | null;
  target_agent_id: string | null;
  trigger_event: string;
};

type Execution = {
  id: string;
  workflow_id: string;
  status: string;
  current_lane_id: string | null;
  current_agent_id: string | null;
  context: Record<string, unknown>;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

type ExecutionStep = {
  id: string;
  execution_id: string;
  handoff_rule_id: string | null;
  source_kind: "lane" | "agent" | null;
  source_lane_id: string | null;
  source_agent_id: string | null;
  target_kind: "lane" | "agent" | null;
  target_lane_id: string | null;
  target_agent_id: string | null;
  status: string;
  input_payload: Record<string, unknown>;
  output_payload: Record<string, unknown>;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

export default async function OrchestrationPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const [{ data: workflows }, { data: lanes }, { data: agents }, { data: files }, { data: executions }, { data: steps }, { data: rules }] = await Promise.all([
    supabase.from("workflows").select("id, name, description").order("name"),
    supabase.from("lanes").select("id, name, collaboration_mode, pass_order, pass_cycles").order("name"),
    supabase.from("agents").select("id, lane_id, name, agent_type, recommended_tier, model_tier_override, capabilities, protected_config").order("name"),
    supabase.from("agent_files").select("agent_id, role, soul, jobdescription, skills, memory, user_content"),
    supabase.from("executions").select("*").order("created_at", { ascending: false }),
    supabase.from("execution_steps").select("*").order("created_at"),
    supabase.from("handoff_rules").select("*").order("workflow_id, position"),
  ]);
  const params = await searchParams;
  const workflowList = (workflows as Workflow[] | null) ?? [];
  const laneList = (lanes as Lane[] | null) ?? [];
  const agentList = (agents as Agent[] | null) ?? [];
  const fileList = filterAgentFilesForClient(agentList, (files as Array<{ agent_id: string; role: string; soul: string; jobdescription: string; skills: string; memory: string; user_content: string }>) ?? []).map((file) => ({ ...sanitizeAgentFiles(false, file), agent_id: file.agent_id }));
  const executionList = (executions as Execution[] | null) ?? [];
  const stepList = (steps as ExecutionStep[] | null) ?? [];
  const ruleList = (rules as HandoffRule[] | null) ?? [];
  const workflowLatestExecution = new Map<string, Execution>();
  for (const execution of executionList) if (!workflowLatestExecution.has(execution.workflow_id)) workflowLatestExecution.set(execution.workflow_id, execution);
  const nodeAgents = agentList.map((agent) => {
    const workflowStatus: Record<string, string> = {};
    for (const workflow of workflowList) {
      const execution = workflowLatestExecution.get(workflow.id);
      const executionSteps = execution ? stepList.filter((step) => step.execution_id === execution.id) : [];
      const latestStep = [...executionSteps].reverse().find((step) => step.source_agent_id === agent.id || step.target_agent_id === agent.id);
      workflowStatus[workflow.id] = execution?.current_agent_id === agent.id ? "running" : latestStep?.status === "completed" ? "complete" : latestStep?.status === "failed" ? "blocked" : "ready";
    }
    return { ...agent, model: agent.model_tier_override ?? agent.recommended_tier ?? "free", workflowStatus, status: "ready", capability: Array.isArray(agent.capabilities) && agent.capabilities.length ? agent.capabilities.join(" · ") : "Production agent" };
  });
  const agentName = (id: string | null) => agentList.find((agent) => agent.id === id)?.name ?? "Lane handoff";
  const handoffDocuments = stepList.map((step, index) => ({
    id: step.id,
    workflow_id: executionList.find((execution) => execution.id === step.execution_id)?.workflow_id,
    title: `Handoff ${String(index + 1).padStart(2, "0")}`,
    source: step.source_agent_id ? agentName(step.source_agent_id) : "Lane handoff",
    source_id: step.source_agent_id ?? undefined,
    source_lane_id: step.source_lane_id ?? undefined,
    target: step.target_agent_id ? agentName(step.target_agent_id) : undefined,
    target_id: step.target_agent_id ?? undefined,
    target_lane_id: step.target_lane_id ?? undefined,
    status: step.status,
    kind: step.target_kind ?? "handoff",
    input_payload: step.input_payload,
    output_payload: step.output_payload,
    created_at: step.created_at,
  }));
  const targetName = (rule: HandoffRule) =>
    rule.target_kind === "lane"
      ? laneList.find((l) => l.id === rule.target_lane_id)?.name ?? "lane"
      : agentList.find((a) => a.id === rule.target_agent_id)?.name ?? "agent";
  return (
    <section className="product-page shell" data-archetype="B2-A">
      <h1>Agents move on rails.</h1>
      <p className="lede">Workflows, handoff rules, lanes, and executions with visible state.</p>
      {params.error && <p className="form-error" role="alert">Unable to save that orchestration record.</p>}

      <PrelineCard kicker="Production Workbench" title="Visual flow" subtitle="Ordered and lane-grouped canvas with inspector and context rail.">
        <ProductionNodeWorkbench
          workflows={workflowList}
          agents={nodeAgents}
          lanes={laneList}
          handoffRules={ruleList}
          files={fileList}
          documents={handoffDocuments}
        />
      </PrelineCard>

      <section className="builder-section">
        <div className="section-head">
          <h2>Workflows</h2>
          <div className="inline-form"><CreateForm action={createWorkflow} label="New workflow" field="name" placeholder="Campaign pipeline" /><form action={createDefaultWorkflow}><button className="button button-outline" type="submit">Add default template</button></form></div>
        </div>
        {workflowList.map((workflow) => (
          <article className="panel" key={workflow.id}>
            <div className="section-head">
              <div><h3>{workflow.name}</h3><form action={updateWorkflow} className="inline-form"><input type="hidden" name="workflow_id" value={workflow.id} /><input name="name" defaultValue={workflow.name} maxLength={120} required /><button className="button button-outline" type="submit">Rename</button></form></div>
              <form action={startWorkflowExecution} className="inline-form">
                <input type="hidden" name="workflow_id" value={workflow.id} />
                <label>Initial brief (JSON)<input name="brief" placeholder='{"channel": "main"}' defaultValue="{}" /></label>
                <button className="button button-outline" type="submit">Start execution</button>
              </form>
            </div>
              <form action={deleteWorkflow} className="inline-form">
                <input type="hidden" name="workflow_id" value={workflow.id} />
                <label className="check-row"><input name="confirm_delete" type="checkbox" required />Delete workflow</label>
                <button className="button button-outline" type="submit">Delete workflow</button>
              </form>
            <p className="muted">{workflow.description || "No description"}</p>
            <div className="section-head mt-6">
              <h4>Handoff rules</h4>
              <details>
                <summary className="text-link">New rule</summary>
                <form action={createHandoffRule} className="inline-form">
                  <input type="hidden" name="workflow_id" value={workflow.id} />
                  <label>From
                    <select name="source" required>
                      <option value="">Pick source…</option>
                      <optgroup label="Lanes">
                        {laneList.map((l) => (
                          <option key={l.id} value={`lane:${l.id}`}>{l.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Agents">
                        {agentList.map((a) => (
                          <option key={a.id} value={`agent:${a.id}`}>{a.name}</option>
                        ))}
                      </optgroup>
                    </select>
                  </label>
                  <label>To
                    <select name="target" required>
                      <option value="">Pick target…</option>
                      <optgroup label="Lanes">
                        {laneList.map((l) => (
                          <option key={l.id} value={`lane:${l.id}`}>{l.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Agents">
                        {agentList.map((a) => (
                          <option key={a.id} value={`agent:${a.id}`}>{a.name}</option>
                        ))}
                      </optgroup>
                    </select>
                  </label>
                  <label>Trigger
                    <select name="trigger_event" defaultValue="completion">
                      <option value="completion">On completion</option>
                      <option value="approval">On approval</option>
                      <option value="manual">Manual</option>
                      <option value="timeout">On timeout</option>
                    </select>
                  </label>
                  <label>Conditions (JSON)<input name="conditions" placeholder='[{"field":"status","value":"approved"}]' /></label>
                  <label>Payload mapping (JSON)<input name="payload_mapping" placeholder='{"documents":"documents"}' /></label>
                  <button className="button button-primary" type="submit">Add rule</button>
                </form>
              </details>
            </div>
            {ruleList.filter((rule) => rule.workflow_id === workflow.id).length === 0 ? (
              <p className="muted">No handoff rules yet.</p>
            ) : (
              <ul className="flow flow-grid">
                {ruleList.filter((rule) => rule.workflow_id === workflow.id).map((rule) => (
                  <li key={rule.id} className="rule-item">
                    <span className="dot cyan" />
                    <strong>#{rule.position} {rule.source_kind} → {targetName(rule)}</strong>
                    <small>{rule.trigger_event}</small>
                    <form action={deleteHandoffRule} className="inline-form mt-1">
                      <input type="hidden" name="rule_id" value={rule.id} />
                      <button className="button button-outline button-compact" type="submit">Remove</button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </section>

      <section className="builder-section">
        <div className="section-head">
          <h2>Executions</h2>
        </div>
        {executionList.length === 0 ? (
          <p className="muted">No executions yet. Start a workflow above.</p>
        ) : (
          <ExecutionLive executions={executionList} steps={stepList} rules={ruleList} />
        )}
      </section>
    </section>
  );
}
