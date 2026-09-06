import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

type Busy = { ok: false; error: string };

// ponytail: reuse workflow JSON for a distributed mutex. A crashed process leaves a fail-closed
// lock; operators must verify termination before clearing it. A transactional RPC is the upgrade.
export async function withWorkflowLock<T>(
  supabase: SupabaseClient,
  workspaceId: string,
  workflowId: string,
  operation: () => Promise<T>,
): Promise<T | Busy> {
  const { data: workflow, error } = await supabase.from("workflows").select("definition")
    .eq("id", workflowId).eq("workspace_id", workspaceId).maybeSingle();
  if (error || !workflow) return { ok: false, error: "workflow_unavailable" };
  const definition = workflow.definition as Record<string, unknown>;
  if (!definition || typeof definition !== "object" || Array.isArray(definition)) return { ok: false, error: "workflow_invalid" };
  if (definition._operation_lock) return { ok: false, error: "workflow_busy" };
  const token = randomUUID();
  const { data: claimed, error: claimError } = await supabase.from("workflows")
    .update({ definition: { ...definition, _operation_lock: token } })
    .eq("id", workflowId).eq("workspace_id", workspaceId).eq("definition", JSON.stringify(definition))
    .select("id").maybeSingle();
  if (claimError || !claimed) return { ok: false, error: "workflow_busy" };
  try {
    return await operation();
  } finally {
    const { error: releaseError } = await supabase.from("workflows").update({ definition })
      .eq("id", workflowId).eq("workspace_id", workspaceId).eq("definition->>_operation_lock", token);
    if (releaseError) console.error("[workflow-lock] release_failed");
  }
}
