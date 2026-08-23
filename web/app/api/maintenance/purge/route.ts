import { createAdminClient } from "@/lib/supabase/admin";
import { listStorageFiles, removeStorageFiles } from "@/lib/studio/storage";
import { verifyWorkerAuthorization } from "@/lib/studio/worker-auth";

export const dynamic = "force-dynamic";

async function purgeWorkspaceMedia(admin: ReturnType<typeof createAdminClient>, workspaceId: string) {
  const prefix = `workspace/${workspaceId}`;
  await removeStorageFiles(admin, "creative-assets", await listStorageFiles(admin, "creative-assets", prefix));
  if ((await listStorageFiles(admin, "creative-assets", prefix)).length) throw new Error("Private media purge was incomplete");
}

async function drainStoragePurgeQueue(admin: ReturnType<typeof createAdminClient>) {
  const { data: queued, error } = await admin.from("storage_purge_queue").select("workspace_id, attempts").limit(25);
  if (error) throw new Error("Could not load storage purge queue");
  for (const item of queued ?? []) {
    const { data: workspace, error: workspaceError } = await admin.from("workspaces").select("id").eq("id", item.workspace_id).maybeSingle();
    if (workspaceError) throw new Error("Could not check purge workspace");
    if (workspace) continue;
    try {
      await purgeWorkspaceMedia(admin, item.workspace_id);
      const { error: deleteError } = await admin.from("storage_purge_queue").delete().eq("workspace_id", item.workspace_id);
      if (deleteError) throw new Error("Could not complete storage purge");
    } catch {
      const attempts = item.attempts + 1;
      await admin.from("storage_purge_queue").update({ attempts, last_error: "Storage purge failed", updated_at: new Date().toISOString() }).eq("workspace_id", item.workspace_id);
    }
  }
}

export async function POST(request: Request) {
  if (!verifyWorkerAuthorization(request.headers.get("authorization"), process.env.PURGE_WORKER_SECRET)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  try { await drainStoragePurgeQueue(admin); } catch { return Response.json({ error: "Could not process storage purge queue" }, { status: 500 }); }
  const { data: requests, error } = await admin.rpc("claim_due_account_deletions", { batch_size: 10 });
  if (error) return Response.json({ error: "Could not load deletion queue" }, { status: 500 });
  let purged = 0;
  for (const deletion of requests ?? []) {
    try {
      const { data: ready, error: preparationError } = await admin.rpc("prepare_account_purge", { target_user: deletion.user_id });
      if (preparationError) throw new Error("Could not prepare account purge");
      if (!ready) continue;
      const { data: workspaces, error: workspaceError } = await admin.from("workspaces").select("id").eq("owner_id", deletion.user_id);
      if (workspaceError) throw new Error("Could not load account workspaces");
      const { error: deleteError } = await admin.auth.admin.deleteUser(deletion.user_id);
      if (deleteError) throw new Error("Could not delete account");
      for (const workspace of workspaces ?? []) {
        await purgeWorkspaceMedia(admin, workspace.id);
        await admin.from("storage_purge_queue").delete().eq("workspace_id", workspace.id);
      }
      purged += 1;
    } catch {
      await admin.from("account_deletion_requests").update({ processing_at: null }).eq("user_id", deletion.user_id);
    }
  }
  return Response.json({ considered: requests?.length ?? 0, purged });
}
