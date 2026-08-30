import { createClient } from "@/lib/supabase/server";
import {
  createDefaultWorkflow,
  createHandoffRule,
  deleteHandoffRule,
  deleteWorkflow,
  startWorkflowExecution,
} from "@/app/(product)/actions";
import { PrelineCard } from "@/components/blocks/preline/preline-card";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";

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

export default async function OrchestrationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [
    { data: workflows },
    { data: lanes },
    { data: agents },
    { data: rules },
    { data: executions },
    { data: steps },
  ] = await Promise.all([
    supabase.from("workflows").select("id, name, description").order("created_at", { ascending: false }),
    supabase.from("lanes").select("id, name").order("name"),
    supabase.from("agents").select("id, name").order("name"),
    supabase.from("workflow_handoff_rules").select("id, workflow_id, position, source_kind, source_lane_id, source_agent_id, target_kind, target_lane_id, target_agent_id, trigger_event").order("position"),
    supabase.from("workflow_executions").select("id, workflow_id, status, current_lane_id, current_agent_id, context, started_at, completed_at, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("workflow_execution_steps").select("id, execution_id, handoff_rule_id, target_kind, target_lane_id, target_agent_id, status, input_payload, output_payload, error_message, started_at, completed_at").order("started_at", { ascending: true }),
  ]);

  const activeWorkflows = (workflows || []) as Workflow[];
  const activeLanes = (lanes || []) as Lane[];
  const activeAgents = (agents || []) as Agent[];
  const activeRules = (rules || []) as HandoffRule[];
  const activeExecutions = (executions || []) as Execution[];
  const activeSteps = (steps || []) as ExecutionStep[];

  return (
    <section className="product-page shell" data-archetype="B2-A">
      <div className="mb-8 space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
          Workflow Orchestration.
        </h1>
        <p className="text-base text-text-muted font-body">
          Define deterministic DAG handoff rules across lanes and agents with real-time execution telemetry.
        </p>
      </div>

      {params.error && (
        <p className="form-error mb-6" role="alert">
          {params.error === "workflow"
            ? "Workflow could not be saved."
            : params.error === "rule"
            ? "Handoff rule could not be created."
            : "Orchestration operation failed."}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Workflows & Handoff Rules */}
        <div className="lg:col-span-7 space-y-6">
          <PrelineCard
            kicker="DAG Configuration"
            title="Workflows & Handoffs"
            subtitle={`${activeWorkflows.length} configured workflows`}
            action={
              <form action={createDefaultWorkflow}>
                <button className="button button-outline text-xs" type="submit">
                  + Add Default Flow
                </button>
              </form>
            }
          >
            {activeWorkflows.length === 0 ? (
              <div className="empty-state p-4">
                <p>No workflows configured. Create a default DAG to begin.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeWorkflows.map((wf) => {
                  const wfRules = activeRules.filter((r) => r.workflow_id === wf.id);

                  return (
                    <div key={wf.id} className="p-4 border border-border-2 bg-surface-2 rounded-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <strong className="font-display text-base text-text">{wf.name}</strong>
                          <p className="text-xs text-text-muted font-body">{wf.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <form action={startWorkflowExecution}>
                            <input type="hidden" name="workflow_id" value={wf.id} />
                            <button className="button button-primary text-xs" type="submit">
                              Run Flow ▶
                            </button>
                          </form>
                          <form action={deleteWorkflow}>
                            <input type="hidden" name="workflow_id" value={wf.id} />
                            <button className="text-red hover:underline text-xs font-mono" type="submit">
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* Rule List */}
                      <div className="space-y-2 pt-2 border-t border-hairline">
                        <span className="font-mono text-xs text-text-faint uppercase">
                          Handoff Rules ({wfRules.length})
                        </span>
                        {wfRules.map((rule) => {
                          const srcName = rule.source_kind === "lane"
                            ? activeLanes.find((l) => l.id === rule.source_lane_id)?.name ?? "Unknown Lane"
                            : activeAgents.find((a) => a.id === rule.source_agent_id)?.name ?? "Unknown Agent";
                          const tgtName = rule.target_kind === "lane"
                            ? activeLanes.find((l) => l.id === rule.target_lane_id)?.name ?? "Unknown Lane"
                            : activeAgents.find((a) => a.id === rule.target_agent_id)?.name ?? "Unknown Agent";

                          return (
                            <div key={rule.id} className="p-2 border border-border bg-surface rounded-sm flex items-center justify-between text-xs font-mono">
                              <span>
                                {rule.position}. [{rule.source_kind}] {srcName} → [{rule.target_kind}] {tgtName} ({rule.trigger_event})
                              </span>
                              <form action={deleteHandoffRule}>
                                <input type="hidden" name="rule_id" value={rule.id} />
                                <button className="text-red hover:underline text-xs" type="submit">✕</button>
                              </form>
                            </div>
                          );
                        })}

                        {/* Add Rule Form */}
                        <form action={createHandoffRule} className="inline-form pt-2 gap-2 flex-wrap text-xs">
                          <input type="hidden" name="workflow_id" value={wf.id} />
                          <select name="source_kind" defaultValue="lane" className="bg-bg border border-border text-xs rounded-sm p-1">
                            <option value="lane">Source: Lane</option>
                            <option value="agent">Source: Agent</option>
                          </select>
                          <select name="source_id" className="bg-bg border border-border text-xs rounded-sm p-1">
                            {activeLanes.map((l) => (
                              <option key={l.id} value={l.id}>Lane: {l.name}</option>
                            ))}
                            {activeAgents.map((a) => (
                              <option key={a.id} value={a.id}>Agent: {a.name}</option>
                            ))}
                          </select>
                          <span>→</span>
                          <select name="target_kind" defaultValue="lane" className="bg-bg border border-border text-xs rounded-sm p-1">
                            <option value="lane">Target: Lane</option>
                            <option value="agent">Target: Agent</option>
                          </select>
                          <select name="target_id" className="bg-bg border border-border text-xs rounded-sm p-1">
                            {activeLanes.map((l) => (
                              <option key={l.id} value={l.id}>Lane: {l.name}</option>
                            ))}
                            {activeAgents.map((a) => (
                              <option key={a.id} value={a.id}>Agent: {a.name}</option>
                            ))}
                          </select>
                          <input name="trigger_event" defaultValue="completed" className="bg-bg border border-border text-xs rounded-sm p-1 w-24" />
                          <button className="button button-outline text-xs py-1" type="submit">+ Rule</button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </PrelineCard>
        </div>

        {/* Live Telemetry / Executions */}
        <div className="lg:col-span-5 space-y-6">
          <PrelineCard
            kicker="Live Telemetry"
            title="Execution Stream"
            subtitle="Real-time DAG progress & logs"
          >
            {activeExecutions.length === 0 ? (
              <p className="text-xs text-text-muted font-body">No executions started yet.</p>
            ) : (
              <div className="space-y-4">
                {activeExecutions.map((exec) => {
                  const execSteps = activeSteps.filter((s) => s.execution_id === exec.id);

                  return (
                    <div key={exec.id} className="p-4 border border-border-2 bg-surface-2 rounded-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-text font-semibold">
                          Run {exec.id.slice(0, 8)}
                        </span>
                        <FlowbiteBadge
                          color={exec.status === "completed" ? "lime" : exec.status === "running" ? "cyan" : "amber"}
                          size="sm"
                        >
                          {exec.status}
                        </FlowbiteBadge>
                      </div>

                      <div className="space-y-1 text-xs font-mono">
                        {execSteps.map((step, i) => (
                          <div key={step.id} className="flex items-center justify-between text-text-muted p-1 bg-surface rounded-sm">
                            <span>Step {i + 1}: {step.status}</span>
                            <span className="text-text-faint">{step.started_at ? new Date(step.started_at).toLocaleTimeString() : "queued"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </PrelineCard>
        </div>
      </div>
    </section>
  );
}
