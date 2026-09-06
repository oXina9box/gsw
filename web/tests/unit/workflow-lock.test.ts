import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { withWorkflowLock } from "../../lib/orchestration/workflow-lock";
import { startExecution, completeStep, cancelExecution } from "../../lib/orchestration/engine";

type Row = Record<string, unknown>;
function database(extra: Record<string, Row[]> = {}) {
  const rows: Record<string, Row[]> = {
    workflows: [{ id: "workflow", workspace_id: "workspace", definition: { stage_floor: { kind: "marketing" } } }],
    executions: [], execution_steps: [], handoff_rules: [], orchestration_events: [], ...extra,
  };
  let nextRowId = 0;
  const from = (table: string) => {
    const filters: Array<(row: Row) => boolean> = [];
    let update: Row | undefined;
    let insertRecord: Row | undefined;
    let limit = Infinity;
    const run = () => {
      if (insertRecord) {
        const row = { id: `row-${nextRowId += 1}`, ...insertRecord };
        rows[table] = [...(rows[table] ?? []), row];
        return [row];
      }
      const selected = (rows[table] ?? []).filter((row) => filters.every((test) => test(row))).slice(0, limit);
      if (update) rows[table] = (rows[table] ?? []).map((row) => selected.includes(row) ? { ...row, ...update } : row);
      return selected.map((row) => ({ ...row, ...(update ?? {}) }));
    };
    const builder: Record<string, unknown> = {
      select: () => builder,
      eq: (key: string, value: unknown) => {
        filters.push((row) => key === "definition" ? JSON.stringify(row.definition) === value
          : key === "definition->>_operation_lock" ? (row.definition as Row)?._operation_lock === value : row[key] === value);
        return builder;
      },
      in: (key: string, values: unknown[]) => { filters.push((row) => values.includes(row[key])); return builder; },
      limit: (value: number) => { limit = value; return builder; },
      order: () => builder,
      update: (value: Row) => { update = value; return builder; },
      insert: (value: Row) => { insertRecord = value; return builder; },
      single: async () => ({ data: run()[0] ?? null, error: null }),
      maybeSingle: async () => ({ data: run()[0] ?? null, error: null }),
      then: (resolve: (response: unknown) => unknown) => resolve({ data: run(), error: null }),
    };
    return builder;
  };
  return { client: { from } as unknown as SupabaseClient, rows };
}

describe("workflow operation lock", () => {
  it("admits one concurrent operation and preserves the original definition", async () => {
    const { client, rows } = database();
    let calls = 0;
    const results = await Promise.all([1, 2].map(() => withWorkflowLock(client, "workspace", "workflow", async () => { calls++; return { ok: true }; })));
    expect(calls).toBe(1);
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(rows.workflows[0].definition).toEqual({ stage_floor: { kind: "marketing" } });
  });
  it("releases on operation failure; rejects foreign workspace and orphan locks", async () => {
    const { client, rows } = database();
    await expect(withWorkflowLock(client, "workspace", "workflow", async () => { throw new Error("failure"); })).rejects.toThrow("failure");
    expect((rows.workflows[0].definition as Row)._operation_lock).toBeUndefined();
    expect(await withWorkflowLock(client, "foreign", "workflow", async () => true)).toMatchObject({ ok: false });
    rows.workflows[0] = { ...rows.workflows[0], definition: { _operation_lock: "orphan" } };
    expect(await withWorkflowLock(client, "workspace", "workflow", async () => true)).toMatchObject({ ok: false, error: "workflow_busy" });
  });
  it("one start call wins simultaneous requests through the real engine", async () => {
    const { client, rows } = database();
    const results = await Promise.all([1, 2].map(() => startExecution(client, "workspace", "workflow", { brief: "test" }, "user")));
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(rows.executions).toHaveLength(1);
  });
  it("does not admit an already-running execution", async () => {
    const { client, rows } = database({ executions: [{ id: "run", workflow_id: "workflow", workspace_id: "workspace", status: "running" }] });
    expect((await startExecution(client, "workspace", "workflow", {}, "user")).ok).toBe(false);
    expect(rows.executions).toHaveLength(1);
  });
  it("completes a running step once despite simultaneous requests", async () => {
    const { client, rows } = database({
      executions: [{ id: "run", workflow_id: "workflow", workspace_id: "workspace", status: "running", context: {}, current_agent_id: "agent" }],
      execution_steps: [{ id: "step", execution_id: "run", workspace_id: "workspace", status: "running" }],
    });
    const results = await Promise.all([1, 2].map(() => completeStep(client, "step", { result: "done" }, "user")));
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(rows.execution_steps[0].status).toBe("completed");
    expect(rows.orchestration_events.filter((event) => event.event_type === "step_completed")).toHaveLength(1);
    expect(rows.executions[0].status).toBe("completed");
  });
  it("serializes cancellation against step completion", async () => {
    const { client, rows } = database({
      executions: [{ id: "run", workflow_id: "workflow", workspace_id: "workspace", status: "running", context: {}, current_agent_id: "agent" }],
      execution_steps: [{ id: "step", execution_id: "run", workspace_id: "workspace", status: "running" }],
    });
    await Promise.all([cancelExecution(client, "run", "user"), completeStep(client, "step", { result: "done" }, "user")]);
    expect(["cancelled", "completed"]).toContain(rows.executions[0].status);
    expect(rows.orchestration_events.filter((event) => ["execution_cancelled", "execution_completed"].includes(String(event.event_type)))).toHaveLength(1);
  });
});
