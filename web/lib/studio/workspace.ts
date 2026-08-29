import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { ensureUserWorkspace } from "@/lib/studio/ensure-workspace";

export interface WorkspaceMembership {
  workspace_id: string;
  role: string;
  workspaces: unknown;
}

export interface WorkspaceContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
  workspaceId: string;
  workspaceName: string;
  membership: WorkspaceMembership;
}

export const getWorkspaceContext = cache(async (): Promise<WorkspaceContext> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app");
  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance?.nextLevel === "aal2" && assurance.currentLevel !== "aal2") redirect("/mfa?next=/app");
  let { data: membership, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(id, name)")
    .eq("user_id", user.id)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (!membership) {
    await ensureUserWorkspace(user.id);
    const res = await supabase
      .from("workspace_members")
      .select("workspace_id, role, workspaces(id, name)")
      .eq("user_id", user.id)
      .order("created_at")
      .limit(1)
      .single();
    membership = res.data;
    error = res.error;
  }

  if (error || !membership) throw new Error("Studio workspace not found");
  const rawWorkspace = Array.isArray(membership.workspaces) ? membership.workspaces[0] : membership.workspaces;
  const workspace = rawWorkspace as { name?: unknown } | null;
  const workspaceName = typeof workspace?.name === "string" ? workspace.name : "Gem Studio";
  return { supabase, user, workspaceId: membership.workspace_id, workspaceName, membership: membership as WorkspaceMembership };
});
