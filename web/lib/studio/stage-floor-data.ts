import { emptyStageFloor, floorDefinition, isStageScope } from "./stage-floor";
import { getWorkspaceContext } from "./workspace";
import type { StageAgent, StageExecution, StageFloorData, StageLane, StageRule, StageScope, StageStep, StageWorkflow } from "./stage-floor-types";

type QueryResult<T> = Readonly<{ data: T | null; error: { message: string } | null }>;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function string(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function safeWorkflow(value: unknown): StageWorkflow {
  const row = record(value);
  return { id: string(row.id), name: string(row.name), description: string(row.description), definition: { stage_floor: record(row.definition).stage_floor }, updated_at: string(row.updated_at) };
}

function safeAgent(value: unknown): StageAgent {
  const row = record(value);
  return {
    id: string(row.id), name: string(row.name), lane_id: nullableString(row.lane_id), agent_type: string(row.agent_type),
    capabilities: Array.isArray(row.capabilities) ? row.capabilities.filter((item): item is string => typeof item === "string") : null,
    protected_config: row.protected_config === true, recommended_tier: nullableString(row.recommended_tier), model_tier_override: nullableString(row.model_tier_override),
  };
}

function safeLane(value: unknown): StageLane {
  const row = record(value);
  return { id: string(row.id), name: string(row.name) };
}

function safeRule(value: unknown): StageRule {
  const row = record(value);
  const trigger = string(row.trigger_event);
  return {
    id: string(row.id), workflow_id: string(row.workflow_id), position: typeof row.position === "number" ? row.position : 0,
    source_kind: row.source_kind === "lane" ? "lane" : "agent", source_agent_id: nullableString(row.source_agent_id), source_lane_id: nullableString(row.source_lane_id),
    target_kind: row.target_kind === "lane" ? "lane" : "agent", target_agent_id: nullableString(row.target_agent_id), target_lane_id: nullableString(row.target_lane_id),
    trigger_event: trigger === "approval" || trigger === "manual" || trigger === "timeout" ? trigger : "completion",
  };
}

function safeExecution(value: unknown): StageExecution {
  const row = record(value);
  return { id: string(row.id), workflow_id: string(row.workflow_id), status: string(row.status), current_agent_id: nullableString(row.current_agent_id), current_lane_id: nullableString(row.current_lane_id), created_at: string(row.created_at) };
}

function safeStep(value: unknown): StageStep {
  const row = record(value);
  return {
    id: string(row.id), execution_id: string(row.execution_id), handoff_rule_id: nullableString(row.handoff_rule_id), status: string(row.status),
    target_agent_id: nullableString(row.target_agent_id), target_lane_id: nullableString(row.target_lane_id), error_message: nullableString(row.error_message),
    created_at: string(row.created_at), output_payload: record(row.output_payload),
  };
}

async function requireOwnedScope(supabase: Awaited<ReturnType<typeof getWorkspaceContext>>["supabase"], workspaceId: string, scope: StageScope): Promise<void> {
  if (scope.channelId) {
    const channel = await supabase.from("channels").select("id").eq("id", scope.channelId).eq("workspace_id", workspaceId).maybeSingle() as QueryResult<{ id: string }>;
    if (channel.error) throw new Error("scope_read_failed");
    if (!channel.data) throw new Error("Stage floor scope is unavailable");
  }
  if (scope.productionId) {
    const production = await supabase.from("productions").select("id").eq("id", scope.productionId).eq("workspace_id", workspaceId).eq("channel_id", scope.channelId as string).maybeSingle() as QueryResult<{ id: string }>;
    if (production.error) throw new Error("scope_read_failed");
    if (!production.data) throw new Error("Stage floor scope is unavailable");
  }
}

export async function loadStageFloor(scope: StageScope): Promise<StageFloorData> {
  if (!isStageScope(scope)) throw new Error("Invalid stage floor scope");
  const { supabase, workspaceId } = await getWorkspaceContext();
  try {
    await requireOwnedScope(supabase, workspaceId, scope);
    const workflowResponse = await supabase
      .from("workflows")
      .select("id, name, description, definition, updated_at")
      .eq("workspace_id", workspaceId)
      .eq("definition->stage_floor", JSON.stringify(floorDefinition(scope).stage_floor))
      .order("name", { ascending: true })
      .order("id", { ascending: true }) as QueryResult<unknown[]>;
    if (workflowResponse.error || !workflowResponse.data) throw new Error("workflow_read_failed");
    const workflows = workflowResponse.data.map(safeWorkflow);
    const workflowIds = workflows.map((workflow) => workflow.id).filter(Boolean);
    const [agentResponse, laneResponse] = await Promise.all([
      supabase.from("agents").select("id, name, lane_id, agent_type, capabilities, protected_config, recommended_tier, model_tier_override").eq("workspace_id", workspaceId).order("name", { ascending: true }).order("id", { ascending: true }) as unknown as Promise<QueryResult<unknown[]>>,
      supabase.from("lanes").select("id, name").eq("workspace_id", workspaceId).order("name", { ascending: true }).order("id", { ascending: true }) as unknown as Promise<QueryResult<unknown[]>>,
    ]);
    if (agentResponse.error || laneResponse.error || !agentResponse.data || !laneResponse.data) throw new Error("roster_read_failed");
    if (!workflowIds.length) return { workflows, agents: agentResponse.data.map(safeAgent), lanes: laneResponse.data.map(safeLane), rules: [], executions: [], steps: [], error: null };

    const [ruleResponse, executionResponse] = await Promise.all([
      supabase.from("handoff_rules").select("id, workflow_id, position, source_kind, source_agent_id, source_lane_id, target_kind, target_agent_id, target_lane_id, trigger_event").eq("workspace_id", workspaceId).in("workflow_id", workflowIds).order("workflow_id", { ascending: true }).order("position", { ascending: true }).order("id", { ascending: true }) as unknown as Promise<QueryResult<unknown[]>>,
      supabase.from("executions").select("id, workflow_id, status, current_agent_id, current_lane_id, created_at").eq("workspace_id", workspaceId).in("workflow_id", workflowIds).order("created_at", { ascending: false }).order("id", { ascending: true }) as unknown as Promise<QueryResult<unknown[]>>,
    ]);
    if (ruleResponse.error || executionResponse.error || !ruleResponse.data || !executionResponse.data) throw new Error("execution_read_failed");
    const rules = ruleResponse.data.map(safeRule);
    const executions = executionResponse.data.map(safeExecution);
    const executionIds = executions.map((execution) => execution.id).filter(Boolean);
    if (!executionIds.length) return { workflows, agents: agentResponse.data.map(safeAgent), lanes: laneResponse.data.map(safeLane), rules, executions, steps: [], error: null };
    const stepResponse = await supabase.from("execution_steps").select("id, execution_id, handoff_rule_id, status, target_agent_id, target_lane_id, error_message, created_at, output_payload").eq("workspace_id", workspaceId).in("execution_id", executionIds).order("created_at", { ascending: true }).order("id", { ascending: true }) as QueryResult<unknown[]>;
    if (stepResponse.error || !stepResponse.data) throw new Error("step_read_failed");
    return { workflows, agents: agentResponse.data.map(safeAgent), lanes: laneResponse.data.map(safeLane), rules, executions, steps: stepResponse.data.map(safeStep), error: null };
  } catch (error) {
    if (error instanceof Error && error.message === "Stage floor scope is unavailable") throw error;
    console.error("[stage-floor] load_failed");
    return emptyStageFloor("Unable to load stage floor");
  }
}
