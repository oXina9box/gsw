import type { SupabaseClient } from "@supabase/supabase-js";
import { evaluateConditions, mapPayload } from "./helpers";

export { evaluateConditions, mapPayload } from "./helpers";

export type TriggerEvent = "completion" | "approval" | "manual" | "timeout";
export type NodeKind = "lane" | "agent";

export type HandoffRule = {
  id: string;
  workflow_id: string;
  position: number;
  source_kind: NodeKind;
  source_lane_id: string | null;
  source_agent_id: string | null;
  target_kind: NodeKind;
  target_lane_id: string | null;
  target_agent_id: string | null;
  trigger_event: TriggerEvent;
  conditions: unknown;
  payload_mapping: unknown;
};

export type Execution = {
  id: string;
  workspace_id: string;
  workflow_id: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  current_lane_id: string | null;
  current_agent_id: string | null;
  context: Record<string, unknown>;
};

export type Step = {
  id: string;
  execution_id: string;
  workspace_id: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
};

export type EngineResult = { ok: true } | { ok: false; error: string };

async function logEvent(
  supabase: SupabaseClient,
  workspaceId: string,
  executionId: string,
  eventType: string,
  actorId: string | null,
  payload: Record<string, unknown>,
) {
  await supabase.from("orchestration_events").insert({
    workspace_id: workspaceId,
    execution_id: executionId,
    event_type: eventType,
    actor_type: actorId ? "user" : "system",
    actor_id: actorId,
    payload,
  });
}

async function failExecution(supabase: SupabaseClient, execution: Execution, reason: string) {
  await supabase
    .from("executions")
    .update({ status: "failed", completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", execution.id);
  await logEvent(supabase, execution.workspace_id, execution.id, "execution_failed", null, { reason });
}

function ruleSourceId(rule: HandoffRule) {
  return rule.source_kind === "lane" ? rule.source_lane_id : rule.source_agent_id;
}

function ruleTargetId(rule: HandoffRule) {
  return rule.target_kind === "lane" ? rule.target_lane_id : rule.target_agent_id;
}

async function targetExists(supabase: SupabaseClient, workspaceId: string, rule: HandoffRule): Promise<boolean> {
  const table = rule.target_kind === "lane" ? "lanes" : "agents";
  const id = ruleTargetId(rule);
  if (!id) return false;
  const { data } = await supabase.from(table).select("id").eq("id", id).eq("workspace_id", workspaceId).maybeSingle();
  return Boolean(data);
}

async function runRule(supabase: SupabaseClient, execution: Execution, rule: HandoffRule, actorId: string | null): Promise<EngineResult> {
  if (!(await targetExists(supabase, execution.workspace_id, rule))) {
    await supabase.from("execution_steps").insert({
      workspace_id: execution.workspace_id,
      execution_id: execution.id,
      handoff_rule_id: rule.id,
      source_kind: rule.source_kind,
      source_lane_id: rule.source_lane_id,
      source_agent_id: rule.source_agent_id,
      target_kind: rule.target_kind,
      target_lane_id: rule.target_lane_id,
      target_agent_id: rule.target_agent_id,
      status: "failed",
      input_payload: execution.context,
      error_message: "Handoff target no longer exists",
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });
    await failExecution(supabase, execution, "handoff_target_missing");
    return { ok: false, error: "handoff_target_missing" };
  }

  if (!evaluateConditions(execution.context, rule.conditions)) {
    await supabase.from("execution_steps").insert({
      workspace_id: execution.workspace_id,
      execution_id: execution.id,
      handoff_rule_id: rule.id,
      source_kind: rule.source_kind,
      source_lane_id: rule.source_lane_id,
      source_agent_id: rule.source_agent_id,
      target_kind: rule.target_kind,
      target_lane_id: rule.target_lane_id,
      target_agent_id: rule.target_agent_id,
      status: "skipped",
      input_payload: execution.context,
      completed_at: new Date().toISOString(),
    });
    await logEvent(supabase, execution.workspace_id, execution.id, "handoff_skipped", actorId, { rule_id: rule.id });
    return { ok: true };
  }

  const mapped = mapPayload(execution.context, rule.payload_mapping);
  const { error } = await supabase.from("execution_steps").insert({
    workspace_id: execution.workspace_id,
    execution_id: execution.id,
    handoff_rule_id: rule.id,
    source_kind: rule.source_kind,
    source_lane_id: rule.source_lane_id,
    source_agent_id: rule.source_agent_id,
    target_kind: rule.target_kind,
    target_lane_id: rule.target_lane_id,
    target_agent_id: rule.target_agent_id,
    status: "running",
    input_payload: execution.context,
    output_payload: mapped,
    started_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: error.message };

  const nextContext = { ...execution.context, ...mapped };
  await supabase
    .from("executions")
    .update({
      current_lane_id: rule.target_kind === "lane" ? rule.target_lane_id : null,
      current_agent_id: rule.target_kind === "agent" ? rule.target_agent_id : null,
      context: nextContext,
      updated_at: new Date().toISOString(),
    })
    .eq("id", execution.id);
  await logEvent(supabase, execution.workspace_id, execution.id, "handoff_triggered", actorId, { rule_id: rule.id });
  return { ok: true };
}

async function loadRules(supabase: SupabaseClient, workflowId: string): Promise<HandoffRule[]> {
  const { data } = await supabase
    .from("handoff_rules")
    .select("id, workflow_id, position, source_kind, source_lane_id, source_agent_id, target_kind, target_lane_id, target_agent_id, trigger_event, conditions, payload_mapping")
    .eq("workflow_id", workflowId)
    .order("position")
    .order("created_at");
  return (data as HandoffRule[] | null) ?? [];
}

export async function startExecution(
  supabase: SupabaseClient,
  workspaceId: string,
  workflowId: string,
  brief: Record<string, unknown>,
  actorId: string | null,
): Promise<EngineResult & { executionId?: string }> {
  const { data: workflow } = await supabase.from("workflows").select("id").eq("id", workflowId).eq("workspace_id", workspaceId).maybeSingle();
  if (!workflow) return { ok: false, error: "workflow_not_found" };

  const rules = await loadRules(supabase, workflowId);
  const now = new Date().toISOString();
  const { data: execution, error } = await supabase
    .from("executions")
    .insert({
      workspace_id: workspaceId,
      workflow_id: workflowId,
      status: "running",
      context: brief,
      started_at: now,
      updated_at: now,
    })
    .select("id, workspace_id, workflow_id, status, current_lane_id, current_agent_id, context")
    .single();
  if (error || !execution) return { ok: false, error: error?.message ?? "execution_insert_failed" };
  const created = execution as Execution;
  await logEvent(supabase, workspaceId, created.id, "execution_started", actorId, { workflow_id: workflowId });

  if (rules.length === 0) {
    await supabase.from("executions").update({ status: "completed", completed_at: now, updated_at: now }).eq("id", created.id);
    await logEvent(supabase, workspaceId, created.id, "execution_completed", null, { reason: "no_rules" });
    return { ok: true, executionId: created.id };
  }

  const firstRule = rules.find((rule) => evaluateConditions(created.context, rule.conditions));
  if (!firstRule) {
    await supabase.from("executions").update({ status: "completed", completed_at: now, updated_at: now }).eq("id", created.id);
    await logEvent(supabase, workspaceId, created.id, "execution_completed", null, { reason: "no_matching_rule" });
    return { ok: true, executionId: created.id };
  }
  const first = await runRule(supabase, created, firstRule, actorId);
  if (!first.ok) return first;
  return { ok: true, executionId: created.id };
}

export async function advanceExecution(
  supabase: SupabaseClient,
  executionId: string,
  trigger: TriggerEvent,
  actorId: string | null,
): Promise<EngineResult> {
  const { data: execution } = await supabase
    .from("executions")
    .select("id, workspace_id, workflow_id, status, current_lane_id, current_agent_id, context")
    .eq("id", executionId)
    .maybeSingle();
  if (!execution) return { ok: false, error: "execution_not_found" };
  const current = execution as Execution;
  if (current.status !== "running") return { ok: false, error: "execution_not_running" };

  const rules = await loadRules(supabase, current.workflow_id);
  const position: { kind: NodeKind; id: string } | null = current.current_agent_id
    ? { kind: "agent", id: current.current_agent_id }
    : current.current_lane_id
      ? { kind: "lane", id: current.current_lane_id }
      : null;

  const sourceRules = position
    ? rules.filter((rule) => rule.source_kind === position.kind && ruleSourceId(rule) === position.id)
    : [];

  if (sourceRules.length === 0) {
    const now = new Date().toISOString();
    await supabase.from("executions").update({ status: "completed", completed_at: now, updated_at: now }).eq("id", current.id);
    await logEvent(supabase, current.workspace_id, current.id, "execution_completed", actorId, { reason: "no_further_rules" });
    return { ok: true };
  }

  const triggerRules = sourceRules.filter((rule) => rule.trigger_event === trigger);
  const next = triggerRules.find((rule) => evaluateConditions(current.context, rule.conditions));
  if (!next) {
    if (triggerRules.length) await logEvent(supabase, current.workspace_id, current.id, "handoff_conditions_unmet", actorId, { trigger });
    return { ok: true };
  }
  return runRule(supabase, current, next, actorId);
}

export async function completeStep(
  supabase: SupabaseClient,
  stepId: string,
  output: Record<string, unknown> | null,
  actorId: string | null,
): Promise<EngineResult> {
  const { data: step } = await supabase
    .from("execution_steps")
    .select("id, execution_id, workspace_id, status")
    .eq("id", stepId)
    .maybeSingle();
  if (!step) return { ok: false, error: "step_not_found" };
  const current = step as Step;
  if (current.status !== "running") return { ok: false, error: "step_not_running" };

  const { error } = await supabase
    .from("execution_steps")
    .update({ status: "completed", completed_at: new Date().toISOString(), ...(output ? { output_payload: output } : {}) })
    .eq("id", stepId);
  if (error) return { ok: false, error: error.message };

  const { data: execution } = await supabase
    .from("executions")
    .select("id, workspace_id, workflow_id, status, current_lane_id, current_agent_id, context")
    .eq("id", current.execution_id)
    .maybeSingle();
  if (!execution) return { ok: false, error: "execution_not_found" };
  const live = execution as Execution;
  const nextContext = output ? { ...live.context, ...output } : live.context;

  if (output) {
    await supabase
      .from("executions")
      .update({ context: nextContext, updated_at: new Date().toISOString() })
      .eq("id", live.id);
  }
  await logEvent(supabase, live.workspace_id, live.id, "step_completed", actorId, { step_id: stepId });
  return advanceExecution(supabase, live.id, "completion", actorId);
}

export async function failStep(
  supabase: SupabaseClient,
  stepId: string,
  errorMessage: string,
  actorId: string | null,
): Promise<EngineResult> {
  const { data: step } = await supabase
    .from("execution_steps")
    .select("id, execution_id, workspace_id, status")
    .eq("id", stepId)
    .maybeSingle();
  if (!step) return { ok: false, error: "step_not_found" };
  const current = step as Step;
  if (current.status !== "running") return { ok: false, error: "step_not_running" };

  const { error } = await supabase
    .from("execution_steps")
    .update({ status: "failed", error_message: errorMessage, completed_at: new Date().toISOString() })
    .eq("id", stepId);
  if (error) return { ok: false, error: error.message };

  const { data: execution } = await supabase
    .from("executions")
    .select("id, workspace_id, workflow_id, status, current_lane_id, current_agent_id, context")
    .eq("id", current.execution_id)
    .maybeSingle();
  if (!execution) return { ok: false, error: "execution_not_found" };
  await logEvent(supabase, current.workspace_id, current.execution_id, "step_failed", actorId, { step_id: stepId });
  await failExecution(supabase, execution as Execution, errorMessage || "step_failed");
  return { ok: true };
}

export async function cancelExecution(supabase: SupabaseClient, executionId: string, actorId: string | null): Promise<EngineResult> {
  const { data: execution } = await supabase
    .from("executions")
    .select("id, workspace_id, workflow_id, status, current_lane_id, current_agent_id, context")
    .eq("id", executionId)
    .maybeSingle();
  if (!execution) return { ok: false, error: "execution_not_found" };
  const current = execution as Execution;
  if (current.status !== "running" && current.status !== "pending") return { ok: false, error: "execution_not_active" };
  const now = new Date().toISOString();
  await supabase.from("executions").update({ status: "cancelled", completed_at: now, updated_at: now }).eq("id", current.id);
  await supabase.from("execution_steps").update({ status: "skipped", completed_at: now }).eq("execution_id", current.id).eq("status", "running");
  await logEvent(supabase, current.workspace_id, current.id, "execution_cancelled", actorId, {});
  return { ok: true };
}
