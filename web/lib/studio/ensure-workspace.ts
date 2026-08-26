import { createAdminClient } from "@/lib/supabase/admin";

export async function ensureUserWorkspace(userId: string): Promise<string> {
  const admin = createAdminClient();

  // Check if workspace membership already exists
  const { data: existing } = await admin
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (existing?.workspace_id) {
    return existing.workspace_id;
  }

  // Ensure profile exists
  await admin.from("profiles").upsert({ id: userId });

  // Create default workspace
  const slug = `ws-${userId.replace(/-/g, "")}`;
  const { data: workspace, error: wsError } = await admin
    .from("workspaces")
    .insert({
      owner_id: userId,
      name: "My Studio",
      slug,
    })
    .select("id")
    .single();

  if (wsError || !workspace) {
    throw new Error(`Failed to create workspace: ${wsError?.message}`);
  }

  // Add user as owner in workspace_members
  const { error: memberError } = await admin.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: userId,
    role: "owner",
  });

  if (memberError) {
    throw new Error(`Failed to add workspace owner: ${memberError.message}`);
  }

  return workspace.id;
}
