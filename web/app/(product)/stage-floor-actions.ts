"use server";

import { withWorkflowLock } from "@/lib/orchestration/workflow-lock";
import { refresh } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { advanceExecution, cancelExecution, completeStep, failStep, startExecution } from "@/lib/orchestration/engine";
import { floorDefinition, isUuid, plainText, stageActionError, stageEndpoint, stageScopeFromForm } from "@/lib/studio/stage-floor";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import type { StageActionState, StageScope } from "@/lib/studio/stage-floor-types";

const ACTIONS = new Set(["create", "rename", "connect", "disconnect", "start", "complete", "fail", "cancel", "advance"]);

type Context = Awaited<ReturnType<typeof getWorkspaceContext>>;
type Row = Record<string, unknown>;

function result(message: string, workflowId?: string): StageActionState {
  refresh();
  return { ok: true, message, ...(workflowId ? { workflowId } : {}) };
}

async function ownedScope(context: Context, scope: StageScope): Promise<boolean> {
  const { supabase, workspaceId } = context;
  if (scope.channelId) {
    const { data, error } = await supabase.from("channels").select("id").eq("id", scope.channelId).eq("workspace_id", workspaceId).maybeSingle();
    if (error || !data) return false;
  }
  if (scope.productionId) {
    const { data, error } = await supabase.from("productions").select("id").eq("id", scope.productionId).eq("workspace_id", workspaceId).eq("channel_id", scope.channelId as string).maybeSingle();
    if (error || !data) return false;
  }
  return true;
}

async function floorWorkflow(context: Context, scope: StageScope, workflowId: string): Promise<Row | null> {
  const { data, error } = await context.supabase.from("workflows").select("id").eq("id", workflowId).eq("workspace_id", context.workspaceId).eq("definition->stage_floor", JSON.stringify(floorDefinition(scope).stage_floor)).maybeSingle();
  return error || !data ? null : data as Row;
}

async function running(context: Context, workflowId: string): Promise<boolean> {
  const { data, error } = await context.supabase.from("executions").select("id").eq("workspace_id", context.workspaceId).eq("workflow_id", workflowId).eq("status", "running").limit(1).maybeSingle();
  if (error) throw new Error("execution_state_unavailable");
  return Boolean(data);
}

async function endpointExists(context: Context, endpoint: { kind: "agent" | "lane"; id: string }): Promise<boolean> {
  const table = endpoint.kind === "agent" ? "agents" : "lanes";
  const { data, error } = await context.supabase.from(table).select("id").eq("id", endpoint.id).eq("workspace_id", context.workspaceId).maybeSingle();
  return !error && Boolean(data);
}

async function floorExecution(context: Context, workflowId: string, executionId: string): Promise<Row | null> {
  const { data, error } = await context.supabase.from("executions").select("id, status").eq("id", executionId).eq("workspace_id", context.workspaceId).eq("workflow_id", workflowId).eq("status", "running").maybeSingle();
  return error || !data ? null : data as Row;
}

async function floorStep(context: Context, executionId: string, stepId: string): Promise<Row | null> {
  const { data, error } = await context.supabase.from("execution_steps").select("id").eq("id", stepId).eq("workspace_id", context.workspaceId).eq("execution_id", executionId).eq("status", "running").maybeSingle();
  return error || !data ? null : data as Row;
}

export async function stageFloorAction(_previous: StageActionState, formData: FormData): Promise<StageActionState> {
  const action = formData.get("action");
  const scope = stageScopeFromForm(formData);
  if (typeof action !== "string" || !ACTIONS.has(action) || !scope) return stageActionError("Invalid stage floor request.");

  try {
    const context = await getWorkspaceContext();
    if (!(await ownedScope(context, scope))) return stageActionError("Stage floor is unavailable.");
    const workflowField = formData.get("workflow_id");
    if (action !== "create" && (typeof workflowField !== "string" || !isUuid(workflowField) || !(await floorWorkflow(context, scope, workflowField)))) return stageActionError("Workflow is unavailable on this floor.");
    const workflowId = typeof workflowField === "string" ? workflowField : "";

    // Execution tables are server-owned (migration 0005). Privileged calls follow scoped ownership checks.
    const admin = createAdminClient();
    const { data: rate, error: rateError } = await admin.rpc("check_rate_limit", {
      rate_key: `stage-floor:${context.workspaceId}:${context.user.id}`,
      rate_limit: 60,
      window_start: new Date(Date.now() - 60_000).toISOString(),
    });
    if (rateError || !rate || rate.allowed !== true) return stageActionError("Too many changes, or the request limit is unavailable. Wait a minute and try again.");

    if (action === "create") {
      const name = plainText(formData.get("name"), 120);
      if (!name) return stageActionError("Enter a workflow name.");
      const { data, error } = await context.supabase.from("workflows").insert({ workspace_id: context.workspaceId, name, definition: floorDefinition(scope) }).select("id").single();
      if (error || !data) return stageActionError("Unable to create workflow. Choose a unique name and try again.");
      return result("Workflow created.", (data as Row).id as string);
    }

    const perform = async (): Promise<StageActionState> => {
      if (action === "rename") {
        if (await running(context, workflowId)) return stageActionError("Running workflows cannot be edited.");
        const name = plainText(formData.get("name"), 120);
        if (!name) return stageActionError("Enter a workflow name.");
        const { error } = await context.supabase.from("workflows").update({ name, updated_at: new Date().toISOString() }).eq("id", workflowId).eq("workspace_id", context.workspaceId).eq("definition->stage_floor", JSON.stringify(floorDefinition(scope).stage_floor));
        return error ? stageActionError("Unable to rename workflow. Choose a unique name and try again.") : result("Workflow renamed.", workflowId);
      }

      if (action === "connect") {
        const source = stageEndpoint(formData.get("source"));
        const target = stageEndpoint(formData.get("target"));
        const trigger = formData.get("trigger_event");
        if (!source || !target || (trigger !== "completion" && trigger !== "manual")) return stageActionError("Choose valid handoff endpoints.");
        if (source.kind === target.kind && source.id === target.id) return stageActionError("A handoff cannot connect a node to itself.");
        if (await running(context, workflowId)) return stageActionError("Running workflows cannot be edited.");
        if (!(await endpointExists(context, source)) || !(await endpointExists(context, target))) return stageActionError("Choose workspace agents or lanes.");
        const { data: duplicate, error: duplicateError } = await context.supabase.from("handoff_rules").select("id").eq("workspace_id", context.workspaceId).eq("workflow_id", workflowId).eq("source_kind", source.kind).eq(source.kind === "agent" ? "source_agent_id" : "source_lane_id", source.id).eq("target_kind", target.kind).eq(target.kind === "agent" ? "target_agent_id" : "target_lane_id", target.id).eq("trigger_event", trigger).maybeSingle();
        if (duplicateError) return stageActionError("Unable to connect handoff.");
        if (duplicate) return stageActionError("This handoff already exists.");
        const { data: highest, error: positionError } = await context.supabase.from("handoff_rules").select("position").eq("workspace_id", context.workspaceId).eq("workflow_id", workflowId).order("position", { ascending: false }).limit(1).maybeSingle();
        if (positionError) return stageActionError("Unable to connect handoff.");
        const position = typeof (highest as Row | null)?.position === "number" ? ((highest as Row).position as number) + 1 : 0;
        const { error } = await context.supabase.from("handoff_rules").insert({
          workspace_id: context.workspaceId, workflow_id: workflowId, position, source_kind: source.kind, source_agent_id: source.kind === "agent" ? source.id : null, source_lane_id: source.kind === "lane" ? source.id : null,
          target_kind: target.kind, target_agent_id: target.kind === "agent" ? target.id : null, target_lane_id: target.kind === "lane" ? target.id : null, trigger_event: trigger, conditions: [], payload_mapping: {},
        });
        return error ? stageActionError("Unable to connect handoff.") : result("Handoff connected.", workflowId);
      }

      if (action === "disconnect") {
        const ruleId = formData.get("rule_id");
        if (typeof ruleId !== "string" || !isUuid(ruleId)) return stageActionError("Choose a handoff to disconnect.");
        if (await running(context, workflowId)) return stageActionError("Running workflows cannot be edited.");
        const { data: rule, error: ruleError } = await context.supabase.from("handoff_rules").select("id").eq("id", ruleId).eq("workspace_id", context.workspaceId).eq("workflow_id", workflowId).maybeSingle();
        if (ruleError || !rule) return stageActionError("Handoff is unavailable on this floor.");
        const { error } = await context.supabase.from("handoff_rules").delete().eq("id", ruleId).eq("workspace_id", context.workspaceId).eq("workflow_id", workflowId);
        return error ? stageActionError("Unable to disconnect handoff.") : result("Handoff disconnected.", workflowId);
      }

      if (action === "start") {
        if (await running(context, workflowId)) return stageActionError("This workflow already has a running execution.");
        const { data: rules, error: rulesError } = await context.supabase.from("handoff_rules").select("id").eq("workspace_id", context.workspaceId).eq("workflow_id", workflowId);
        if (rulesError || !rules?.length) return stageActionError("Add a handoff before starting this workflow.");
        const brief = plainText(formData.get("brief"), 4_000);
        if (!brief) return stageActionError("Enter a brief of up to 4,000 characters.");
        const engine = await startExecution(admin, context.workspaceId, workflowId, { brief }, context.user.id);
        return engine.ok ? result("Workflow started.", workflowId) : stageActionError("Unable to start workflow.");
      }

      const executionId = formData.get("execution_id");
      if (typeof executionId !== "string" || !isUuid(executionId) || !(await floorExecution(context, workflowId, executionId))) return stageActionError("Execution is unavailable on this floor.");
      if (action === "advance") {
        const { data: activeStep, error: stepError } = await context.supabase.from("execution_steps").select("id").eq("workspace_id", context.workspaceId).eq("execution_id", executionId).eq("status", "running").limit(1).maybeSingle();
        if (stepError || activeStep) return stageActionError("Complete the current step before continuing.");
        const engine = await advanceExecution(admin, executionId, "manual", context.user.id);
        return engine.ok ? result("Manual handoff continued.", workflowId) : stageActionError("Unable to continue this handoff.");
      }
      if (action === "cancel") {
        const engine = await cancelExecution(admin, executionId, context.user.id);
        return engine.ok ? result("Execution cancelled.", workflowId) : stageActionError("Unable to cancel execution.");
      }
      const stepId = formData.get("step_id");
      if (typeof stepId !== "string" || !isUuid(stepId) || !(await floorStep(context, executionId, stepId))) return stageActionError("Step is unavailable on this floor.");
      if (action === "complete") {
        const output = plainText(formData.get("output"), 10_000);
        if (!output) return stageActionError("Enter completed output of up to 10,000 characters.");
        const engine = await completeStep(admin, stepId, { result: output }, context.user.id);
        return engine.ok ? result("Step completed.", workflowId) : stageActionError("Unable to complete step.");
      }
      const errorMessage = plainText(formData.get("error_message"), 2_000);
      if (!errorMessage) return stageActionError("Enter an error message.");
      const engine = await failStep(admin, stepId, errorMessage, context.user.id);
      return engine.ok ? result("Step failed.", workflowId) : stageActionError("Unable to fail step.");
    };
    if (["rename", "connect", "disconnect"].includes(action)) {
      const locked = await withWorkflowLock(context.supabase, context.workspaceId, workflowId, perform);
      return "error" in locked ? stageActionError("This workflow is busy. Retry shortly; contact support if this persists.") : locked;
    }
    return await perform();
  } catch {
    console.error("[stage-floor] action_failed", typeof action === "string" ? action : "invalid");
    return stageActionError("Unable to update stage floor.");
  }
}
