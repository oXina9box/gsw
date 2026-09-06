import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ from: vi.fn(), writes: vi.fn(), definition: {} as Record<string, unknown> }));
vi.mock("@/lib/studio/workspace", () => ({ getWorkspaceContext: async () => ({ workspaceId: "workspace", supabase: { from: state.from } }) }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(path); } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { createHandoffRule, deleteHandoffRule, deleteWorkflow, updateWorkflow } from "../../app/(product)/actions";

beforeEach(() => {
  vi.clearAllMocks();
  state.definition = { stage_floor: { kind: "marketing", channelId: null, productionId: null } };
  state.from.mockImplementation((table: string) => {
    const query: Record<string, unknown> = {};
    for (const name of ["select", "eq", "order", "limit"]) query[name] = () => query;
    query.maybeSingle = async () => ({ data: table === "workflows" ? { id: "workflow", definition: state.definition } : { id: "rule", workflow_id: "workflow", position: 0 }, error: null });
    query.update = query.delete = query.insert = () => { state.writes(); return query; };
    query.then = (resolve: (value: unknown) => unknown) => resolve({ data: null, error: null });
    return query;
  });
});

it.each([createHandoffRule, deleteHandoffRule, deleteWorkflow, updateWorkflow])("legacy %s rejects Stage Floor graphs before mutation", async (action) => {
  const form = new FormData();
  Object.entries({ workflow_id: "workflow", rule_id: "rule", name: "Rename", confirm_delete: "on", source: "agent:one", target: "agent:two", trigger_event: "completion" }).forEach(([key, value]) => form.set(key, value));
  await expect(action(form)).rejects.toThrow(/error=(workflow|handoff)/);
  expect(state.writes).not.toHaveBeenCalled();
});

it("legacy rename still handles untagged workflows", async () => {
  state.definition = {};
  const form = new FormData(); form.set("workflow_id", "workflow"); form.set("name", "Rename");
  await expect(updateWorkflow(form)).rejects.toThrow("/app/orchestration");
  expect(state.writes).toHaveBeenCalledOnce();
});
