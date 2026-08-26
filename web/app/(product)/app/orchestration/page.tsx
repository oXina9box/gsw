import { createClient } from "@/lib/supabase/server";
import { CreateForm } from "@/components/product/create-form";
import { ExecutionLive } from "@/components/product/execution-live";
import { createDefaultWorkflow, createWorkflow, createHandoffRule, deleteHandoffRule, deleteWorkflow, startWorkflowExecution, updateWorkflow } from "@/app/(product)/actions";

export const metadata = { title: "Orchestration" };

type Workflow = { id: string; name: string; description: string };
type Lane = { id: string; name: string };
type Agent = { id: string; name: string };
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
  target_kind: "lane" | "agent" | null;
  target_lane_id: string | null;
  target_agent_id: string | null;
  status: string;
  input_payload: Record<string, unknown>;
  output_payload: Record<string, unknown>;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
};

export default async function OrchestrationPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const [{ data: workflows }, { data: lanes }, { data: agents }, { data: executions }, { data: steps }, { data: rules }] = await Promise.all([
    supabase.from("workflows").select("id, name, description").order("name"),
    supabase.from("lanes").select("id, name").order("name"),
    supabase.from("agents").select("id, name").order("name"),
    supabase.from("executions").select("*").order("created_at", { ascending: false }),
    supabase.from("execution_steps").select("*").order("created_at"),
    supabase.from("handoff_rules").select("*").order("workflow_id, position"),
  ]);
  const params = await searchParams;
  const workflowList = (workflows as Workflow[] | null) ?? [];
  const laneList = (lanes as Lane[] | null) ?? [];
  const agentList = (agents as Agent[] | null) ?? [];
  const executionList = (executions as Execution[] | null) ?? [];
  const stepList = (steps as ExecutionStep[] | null) ?? [];
  const ruleList = (rules as HandoffRule[] | null) ?? [];
  const targetName = (rule: HandoffRule) =>
    rule.target_kind === "lane"
      ? laneList.find((l) => l.id === rule.target_lane_id)?.name ?? "lane"
      : agentList.find((a) => a.id === rule.target_agent_id)?.name ?? "agent";
  return (
    <section className="product-page shell">
      <h1>Orchestration</h1>
      {params.error && <p className="form-error" role="alert">Unable to save that orchestration record.</p>}

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
            <div className="section-head" style={{ marginTop: "1.5rem" }}>
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
              <ul className="flow" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", marginTop: "0.5rem" }}>
                {ruleList.filter((rule) => rule.workflow_id === workflow.id).map((rule) => (
                  <li key={rule.id} style={{ listStyle: "none" }}>
                    <span className="dot cyan" />
                    <strong>#{rule.position} {rule.source_kind} → {targetName(rule)}</strong>
                    <small>{rule.trigger_event}</small>
                    <form action={deleteHandoffRule} className="inline-form" style={{ marginTop: "0.25rem" }}>
                      <input type="hidden" name="rule_id" value={rule.id} />
                      <button className="button button-outline" type="submit" style={{ padding: "0.2rem 0.5rem", minHeight: "unset", fontSize: "0.75rem" }}>Remove</button>
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
