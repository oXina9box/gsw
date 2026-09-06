import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  workspace: {
    workspaceId: "11111111-1111-4111-8111-111111111111",
    user: { id: "22222222-2222-4222-8222-222222222222" },
    supabase: null as unknown,
  },
  refresh: vi.fn(),
  admin: { rpc: vi.fn() },
  createAdmin: vi.fn(),
  engine: {
    startExecution: vi.fn(),
    advanceExecution: vi.fn(),
    completeStep: vi.fn(),
    failStep: vi.fn(),
    cancelExecution: vi.fn(),
  },
}));

vi.mock("@/lib/studio/workspace", () => ({ getWorkspaceContext: vi.fn(async () => state.workspace) }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: state.createAdmin }));
vi.mock("next/cache", () => ({ refresh: state.refresh }));
vi.mock("@/lib/orchestration/engine", () => state.engine);

import { loadStageFloor } from "../../lib/studio/stage-floor-data";
import { stageFloorAction } from "../../app/(product)/stage-floor-actions";
import { isStageScope, plainText, stageEndpoint, stageScopeFromForm } from "../../lib/studio/stage-floor";

const workspaceId = state.workspace.workspaceId;
const channelId = "33333333-3333-4333-8333-333333333333";
const productionId = "55555555-5555-4555-8555-555555555555";
const workflowId = "66666666-6666-4666-8666-666666666666";
const otherWorkflowId = "77777777-7777-4777-8777-777777777777";
const agentId = "88888888-8888-4888-8888-888888888888";
const laneId = "99999999-9999-4999-8999-999999999999";
const executionId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const stepId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

type Row = Record<string, unknown>;

function createSupabase(seed: Record<string, Row[]>, failingTable?: string) {
  const writes: Array<{ table: string; kind: string; value?: Row }> = [];
  const from = (table: string) => {
    const filters: Array<(row: Row) => boolean> = [];
    let mode: "read" | "insert" | "update" | "delete" = "read";
    let value: Row | undefined;
    let take: number | undefined;
    const result = () => {
      if (failingTable === table) return { data: null, error: { message: "database unavailable" } };
      let data = (seed[table] ?? []).filter((row) => filters.every((filter) => filter(row)));
      if (mode === "insert") {
        const inserted = { id: `new-${table}`, ...value };
        seed[table] = [...(seed[table] ?? []), inserted];
        writes.push({ table, kind: mode, value });
        data = [inserted];
      }
      if (mode === "update") {
        seed[table] = (seed[table] ?? []).map((row) => filters.every((filter) => filter(row)) ? { ...row, ...value } : row);
        data = data.map((row) => ({ ...row, ...value }));
        writes.push({ table, kind: mode, value });
      }
      if (mode === "delete") writes.push({ table, kind: mode });
      if (take !== undefined) data = data.slice(0, take);
      return { data, error: null };
    };
    const query: Record<string, unknown> = {
      select: () => query,
      eq: (key: string, expected: unknown) => {
        filters.push((row) => key.includes("->")
          ? (key.includes("->>") ? (row.definition as Row | undefined)?.[key.split("->>")[1]] === expected : JSON.stringify((row.definition as Row | undefined)?.stage_floor) === expected)
          : key === "definition" ? JSON.stringify(row[key]) === expected : row[key] === expected);
        return query;
      },
      in: (key: string, expected: unknown[]) => { filters.push((row) => expected.includes(row[key])); return query; },
      order: () => query,
      limit: (next: number) => { take = next; return query; },
      contains: () => query,
      insert: (next: Row) => { mode = "insert"; value = next; return query; },
      update: (next: Row) => { mode = "update"; value = next; return query; },
      delete: () => { mode = "delete"; return query; },
      maybeSingle: async () => { const response = result(); return { data: response.data?.[0] ?? null, error: response.error }; },
      single: async () => { const response = result(); return { data: response.data?.[0] ?? null, error: response.error }; },
      then: (resolve: (value: unknown) => unknown) => resolve(result()),
    };
    return query;
  };
  return { from, writes };
}

function baseRows(): Record<string, Row[]> {
  const scope = { kind: "production", channelId, productionId };
  return {
    channels: [{ id: channelId, workspace_id: workspaceId }],
    productions: [{ id: productionId, channel_id: channelId, workspace_id: workspaceId }],
    workflows: [
      { id: workflowId, workspace_id: workspaceId, name: "Floor", description: "", definition: { stage_floor: scope }, updated_at: "2026-09-05T00:00:00Z" },
      { id: otherWorkflowId, workspace_id: workspaceId, name: "Other", description: "", definition: { stage_floor: { kind: "social", channelId, productionId: null } }, updated_at: "2026-09-05T00:00:00Z" },
    ],
    agents: [{ id: agentId, workspace_id: workspaceId, lane_id: laneId, name: "Safe agent", agent_type: "worker", capabilities: ["write"], protected_config: true, recommended_tier: "mid", model_tier_override: null, unselected_field: "must never be selected" }],
    lanes: [{ id: laneId, workspace_id: workspaceId, name: "Writer" }],
    handoff_rules: [{ id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", workspace_id: workspaceId, workflow_id: workflowId, position: 0, source_kind: "agent", source_agent_id: agentId, source_lane_id: null, target_kind: "lane", target_agent_id: null, target_lane_id: laneId, trigger_event: "completion" }],
    executions: [{ id: executionId, workspace_id: workspaceId, workflow_id: workflowId, status: "running", current_agent_id: agentId, current_lane_id: null, created_at: "2026-09-05T00:00:00Z" }],
    execution_steps: [{ id: stepId, workspace_id: workspaceId, execution_id: executionId, handoff_rule_id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", status: "running", target_agent_id: agentId, target_lane_id: null, error_message: null, created_at: "2026-09-05T00:00:00Z", output_payload: {} }],
  };
}

function form(values: Record<string, string>) {
  const result = new FormData();
  Object.entries(values).forEach(([key, value]) => result.set(key, value));
  return result;
}

beforeEach(() => {
  vi.clearAllMocks();
  state.createAdmin.mockReturnValue(state.admin);
  state.admin.rpc.mockResolvedValue({ data: { allowed: true, remaining: 59 }, error: null });
  state.engine.advanceExecution.mockResolvedValue({ ok: true });
  state.engine.startExecution.mockResolvedValue({ ok: true, executionId });
  state.engine.completeStep.mockResolvedValue({ ok: true });
  state.engine.failStep.mockResolvedValue({ ok: true });
  state.engine.cancelExecution.mockResolvedValue({ ok: true });
});

describe("Stage Floor loader", () => {
  it("handles empty floors, unstarted workflows and nullable roster summaries", async () => {
    state.workspace.supabase = createSupabase({ ...baseRows(), workflows: [] });
    expect(await loadStageFloor({ kind: "social", channelId: null, productionId: null })).toMatchObject({ workflows: [], steps: [], error: null });
    const rows = baseRows();
    rows.executions = [];
    rows.agents = [{ id: agentId, workspace_id: workspaceId, name: null, capabilities: null }];
    rows.handoff_rules = ["manual", "approval", "timeout"].map((trigger_event) => ({ ...rows.handoff_rules[0], position: null, source_kind: "lane", target_kind: "agent", trigger_event }));
    state.workspace.supabase = createSupabase(rows);
    const result = await loadStageFloor({ kind: "production", channelId, productionId });
    expect(result.agents[0]).toMatchObject({ name: "", capabilities: null, protected_config: false });
    expect(result.rules.map((rule) => rule.trigger_event)).toEqual(["manual", "approval", "timeout"]);
    expect(result.steps).toEqual([]);
  });

  it.each(["channels", "productions", "agents", "lanes", "handoff_rules", "executions", "execution_steps"])("fails closed for unavailable %s reads", async (table) => {
    state.workspace.supabase = createSupabase(baseRows(), table);
    expect(await loadStageFloor({ kind: "production", channelId, productionId })).toMatchObject({ error: "Unable to load stage floor", agents: [], workflows: [] });
  });

  it.each(["channels", "productions"])("rejects missing owned %s", async (table) => {
    state.workspace.supabase = createSupabase({ ...baseRows(), [table]: [] });
    await expect(loadStageFloor({ kind: "production", channelId, productionId })).rejects.toThrow("Stage floor scope is unavailable");
  });

  it("removes private workflow metadata and handles malformed output payloads", async () => {
    const rows = baseRows();
    rows.workflows = rows.workflows.map((row) => ({ ...row, definition: { ...(row.definition as Row), _operation_lock: "private-token" } }));
    rows.execution_steps = rows.execution_steps.map((row) => ({ ...row, output_payload: [] }));
    state.workspace.supabase = createSupabase(rows);
    const result = await loadStageFloor({ kind: "production", channelId, productionId });
    expect(result.workflows[0].definition).not.toHaveProperty("_operation_lock");
    expect(result.steps[0].output_payload).toEqual({});
  });
  it("returns only exact-floor records and safe hired-agent fields", async () => {
    state.workspace.supabase = createSupabase(baseRows());
    const result = await loadStageFloor({ kind: "production", channelId, productionId });

    expect(result.error).toBeNull();
    expect(result.workflows.map((workflow) => workflow.id)).toEqual([workflowId]);
    expect(result.rules.map((rule) => rule.workflow_id)).toEqual([workflowId]);
    expect(result.executions.map((execution) => execution.workflow_id)).toEqual([workflowId]);
    expect(result.agents[0]).not.toHaveProperty("secret");
  });

  it("rejects forged or inconsistent scope and turns failed reads into an explicit error", async () => {
    state.workspace.supabase = createSupabase(baseRows());
    await expect(loadStageFloor({ kind: "social", channelId, productionId })).rejects.toThrow("Invalid stage floor scope");

    state.workspace.supabase = createSupabase(baseRows(), "workflows");
    await expect(loadStageFloor({ kind: "production", channelId, productionId })).resolves.toMatchObject({ error: "Unable to load stage floor", workflows: [] });
  });
});

describe("Stage Floor actions", () => {
  it("persists a valid connection and rejects cross-floor workflow IDs", async () => {
    const rows = baseRows();
    rows.executions = [];
    rows.handoff_rules = [];
    const client = createSupabase(rows);
    state.workspace.supabase = client;
    const valid = await stageFloorAction({ ok: false, message: "" }, form({ action: "connect", kind: "production", channel_id: channelId, production_id: productionId, workflow_id: workflowId, source: `agent:${agentId}`, target: `lane:${laneId}`, trigger_event: "completion" }));
    expect(valid).toMatchObject({ ok: true, workflowId });
    expect(client.writes.some((write) => write.table === "handoff_rules" && write.kind === "insert")).toBe(true);
    expect(state.refresh).toHaveBeenCalledOnce();

    state.workspace.supabase = createSupabase(baseRows());
    const rejected = await stageFloorAction({ ok: false, message: "" }, form({ action: "rename", kind: "production", channel_id: channelId, production_id: productionId, workflow_id: otherWorkflowId, name: "Forged" }));
    expect(rejected).toEqual({ ok: false, message: "Workflow is unavailable on this floor." });
  });

  it("verifies execution and step membership before calling engine controls", async () => {
    state.workspace.supabase = createSupabase({ ...baseRows(), executions: [] });
    const start = await stageFloorAction({ ok: false, message: "" }, form({ action: "start", kind: "production", channel_id: channelId, production_id: productionId, workflow_id: workflowId, brief: "A brief" }));
    expect(start.ok).toBe(true);
    expect(state.engine.startExecution).toHaveBeenCalledWith(state.admin, workspaceId, workflowId, { brief: "A brief" }, state.workspace.user.id);

    state.workspace.supabase = createSupabase(baseRows());
    const complete = await stageFloorAction({ ok: false, message: "" }, form({ action: "complete", kind: "production", channel_id: channelId, production_id: productionId, workflow_id: workflowId, execution_id: executionId, step_id: stepId, output: "Done" }));
    expect(complete.ok).toBe(true);
    expect(state.engine.completeStep).toHaveBeenCalledWith(expect.anything(), stepId, { result: "Done" }, state.workspace.user.id);

    const cancelled = await stageFloorAction({ ok: false, message: "" }, form({ action: "cancel", kind: "production", channel_id: channelId, production_id: productionId, workflow_id: workflowId, execution_id: executionId }));
    expect(cancelled.ok).toBe(true);
    expect(state.engine.cancelExecution).toHaveBeenCalledWith(expect.anything(), executionId, state.workspace.user.id);

    state.engine.cancelExecution.mockClear();
    state.workspace.supabase = createSupabase({ ...baseRows(), execution_steps: [] });
    const denied = await stageFloorAction({ ok: false, message: "" }, form({ action: "cancel", kind: "production", channel_id: channelId, production_id: productionId, workflow_id: workflowId, execution_id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd" }));
    expect(denied).toEqual({ ok: false, message: "Execution is unavailable on this floor." });
    expect(state.engine.cancelExecution).not.toHaveBeenCalled();
  });
});

const request = (extra: Record<string, string>) => form({ kind: "production", channel_id: channelId, production_id: productionId, workflow_id: workflowId, ...extra });
const initial = { ok: false, message: "" };

describe("Stage Floor action boundaries", () => {
  it("validates scope, endpoint and text boundaries", () => {
    for (const value of [null, "production", {}, { kind: "production", channelId: null, productionId }, { kind: "social", channelId: "invalid", productionId: null }]) expect(isStageScope(value)).toBe(false);
    expect(stageScopeFromForm(form({ kind: "marketing", channel_id: "", production_id: "" }))).toEqual({ kind: "marketing", channelId: null, productionId: null });
    expect(stageScopeFromForm(form({ kind: "social" }))).toEqual({ kind: "social", channelId: null, productionId: null });
    expect(plainText(null, 120)).toBeNull();
    for (const value of [null, "other:invalid", "agent:invalid"]) expect(stageEndpoint(value)).toBeNull();
  });

  it("renames an idle workflow and records explicit step failure", async () => {
    const client = createSupabase({ ...baseRows(), executions: [] });
    state.workspace.supabase = client;
    expect(await stageFloorAction(initial, request({ action: "rename", name: "Updated" }))).toMatchObject({ ok: true, message: "Workflow renamed." });
    expect(client.writes).toContainEqual(expect.objectContaining({ table: "workflows", value: expect.objectContaining({ name: "Updated" }) }));
    state.workspace.supabase = createSupabase(baseRows());
    expect(await stageFloorAction(initial, request({ action: "fail", execution_id: executionId, step_id: stepId, error_message: "Needs revision" }))).toMatchObject({ ok: true });
    expect(state.engine.failStep).toHaveBeenCalledWith(state.admin, stepId, "Needs revision", state.workspace.user.id);
  });

  it.each(["start", "complete", "fail", "cancel", "advance"])("reports %s engine failures without claiming success", async (action) => {
    const rows = baseRows();
    if (action === "start") rows.executions = [];
    if (action === "advance") rows.execution_steps = [];
    state.workspace.supabase = createSupabase(rows);
    Object.values(state.engine).forEach((method) => method.mockResolvedValue({ ok: false, error: "internal database detail" }));
    const response = await stageFloorAction(initial, request({ action, brief: "Brief", output: "Done", error_message: "Failed", execution_id: executionId, step_id: stepId }));
    expect(response.ok).toBe(false);
    expect(response.message).not.toContain("internal");
    expect(state.refresh).not.toHaveBeenCalled();
  });
  it.each(["connect", "disconnect", "rename", "start"])("blocks %s while running and when execution reads fail", async (action) => {
    const values = { action, name: "New name", brief: "Brief", source: `agent:${agentId}`, target: `lane:${laneId}`, trigger_event: "manual", rule_id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc" };
    for (const failing of [undefined, "executions"]) {
      const client = createSupabase(baseRows(), failing);
      state.workspace.supabase = client;
      const response = await stageFloorAction(initial, request(values));
      expect(response.ok).toBe(false);
      expect(client.writes.filter((write) => write.table !== "workflows" || !write.value?.definition)).toHaveLength(0);
      expect(state.engine.startExecution).not.toHaveBeenCalled();
    }
  });
  it.each(["start", "complete"])("rejects missing, blank and oversized %s text", async (action) => {
    for (const value of ["", "   ", "x".repeat(10001)]) {
      state.workspace.supabase = createSupabase(action === "start" ? { ...baseRows(), executions: [] } : baseRows());
      const response = await stageFloorAction(initial, request({ action, brief: value, output: value, execution_id: executionId, step_id: stepId }));
      expect(response.ok).toBe(false);
    }
    expect(state.engine.startExecution).not.toHaveBeenCalled();
    expect(state.engine.completeStep).not.toHaveBeenCalled();
  });
  it("fails closed when rate-limit service fails or quota is exhausted", async () => {
    for (const value of [{ data: null, error: { message: "offline" } }, { data: { allowed: false }, error: null }]) {
      const client = createSupabase(baseRows());
      state.workspace.supabase = client;
      state.admin.rpc.mockResolvedValue(value);
      expect((await stageFloorAction(initial, request({ action: "create", name: "New" }))).ok).toBe(false);
      expect(client.writes.filter((write) => write.table !== "workflows" || !write.value?.definition)).toHaveLength(0);
    }
  });
  it("does not reach privileged services for a foreign workspace or floor", async () => {
    const rows = baseRows();
    rows.channels = [{ id: channelId, workspace_id: "another-workspace" }];
    state.workspace.supabase = createSupabase(rows);
    expect((await stageFloorAction(initial, request({ action: "start", brief: "Brief" }))).ok).toBe(false);
    expect(state.createAdmin).not.toHaveBeenCalled();
  });
  it("requires running execution and step before completion or failure", async () => {
    for (const stale of ["executions", "execution_steps"]) {
      const rows = baseRows();
      rows[stale] = rows[stale].map((row) => ({ ...row, status: "completed" }));
      state.workspace.supabase = createSupabase(rows);
      expect((await stageFloorAction(initial, request({ action: "complete", execution_id: executionId, step_id: stepId, output: "Done" }))).ok).toBe(false);
      expect(state.engine.completeStep).not.toHaveBeenCalled();
    }
  });
  it("continues manual handoffs only after the current step completes", async () => {
    state.workspace.supabase = createSupabase(baseRows());
    expect((await stageFloorAction(initial, request({ action: "advance", execution_id: executionId }))).ok).toBe(false);
    state.workspace.supabase = createSupabase({ ...baseRows(), execution_steps: [] });
    expect((await stageFloorAction(initial, request({ action: "advance", execution_id: executionId }))).ok).toBe(true);
    expect(state.engine.advanceExecution).toHaveBeenCalledWith(state.admin, executionId, "manual", state.workspace.user.id);
  });
  it("rejects malformed, self and duplicate handoffs before writes", async () => {
    const values = [
      { source: `agent:${agentId}:`, target: `lane:${laneId}` },
      { source: `agent:${agentId}`, target: `agent:${agentId}` },
      { source: `agent:${agentId}`, target: `lane:${laneId}` },
    ];
    for (const value of values) {
      const client = createSupabase({ ...baseRows(), executions: [] });
      state.workspace.supabase = client;
      expect((await stageFloorAction(initial, request({ action: "connect", trigger_event: "completion", ...value }))).ok).toBe(false);
      expect(client.writes.filter((write) => write.table !== "workflows" || !write.value?.definition)).toHaveLength(0);
    }
  });
  it("creates scoped workflows and reports database failures without exposing raw errors", async () => {
    const client = createSupabase(baseRows());
    state.workspace.supabase = client;
    expect((await stageFloorAction(initial, request({ action: "create", name: "Launch" }))).ok).toBe(true);
    expect(client.writes[0]).toMatchObject({ table: "workflows", value: { workspace_id: workspaceId, name: "Launch", definition: { stage_floor: { kind: "production", channelId, productionId } } } });
    state.workspace.supabase = createSupabase(baseRows(), "workflows");
    const failed = await stageFloorAction(initial, request({ action: "create", name: "Launch" }));
    expect(failed.ok).toBe(false);
    expect(failed.message).not.toContain("database unavailable");
  });
  it("rejects empty runs and disconnects only scoped rules", async () => {
    state.workspace.supabase = createSupabase({ ...baseRows(), executions: [], handoff_rules: [] });
    expect((await stageFloorAction(initial, request({ action: "start", brief: "Brief" }))).ok).toBe(false);
    const client = createSupabase({ ...baseRows(), executions: [] });
    state.workspace.supabase = client;
    expect((await stageFloorAction(initial, request({ action: "disconnect", rule_id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc" }))).ok).toBe(true);
    expect(client.writes).toContainEqual({ table: "handoff_rules", kind: "delete" });
  });
});
