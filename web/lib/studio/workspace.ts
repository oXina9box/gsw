import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const getWorkspaceContext = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app");
  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance?.nextLevel === "aal2" && assurance.currentLevel !== "aal2") redirect("/mfa?next=/app");
  const { data: membership, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(id, name)")
    .eq("user_id", user.id)
    .order("created_at")
    .limit(1)
    .single();
  if (error || !membership) throw new Error("Studio workspace not found");
  const workspace = membership.workspaces as { name?: unknown } | null;
  const workspaceName = typeof workspace?.name === "string" ? workspace.name : "Gem Studio";
  return { supabase, user, workspaceId: membership.workspace_id, workspaceName, membership };
});
