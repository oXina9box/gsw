"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function valid(value: string) {
  return value.length > 0 && value.length <= 120;
}

async function workspaceId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app");
  const { data } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", user.id).order("created_at").limit(1).single();
  if (!data) throw new Error("Workspace not found");
  return { supabase, id: data.workspace_id };
}

export async function createChannel(formData: FormData) {
  const name = text(formData, "name");
  if (!valid(name)) redirect("/app/channels?error=channel");
  const { supabase, id } = await workspaceId();
  const { error } = await supabase.from("channels").insert({ workspace_id: id, name });
  if (error) redirect("/app/channels?error=channel");
  revalidatePath("/app/channels");
  redirect("/app/channels");
}

export async function createProduction(formData: FormData) {
  const title = text(formData, "title");
  const channelId = text(formData, "channel_id");
  if (!valid(title) || !channelId) redirect(`/app/channels/${channelId}?error=production`);
  const { supabase, id } = await workspaceId();
  const { error } = await supabase.from("productions").insert({ workspace_id: id, channel_id: channelId, title });
  if (error) redirect(`/app/channels/${channelId}?error=production`);
  revalidatePath(`/app/channels/${channelId}`);
  redirect(`/app/channels/${channelId}`);
}

export async function createDepartment(formData: FormData) {
  const name = text(formData, "name");
  if (!valid(name)) redirect("/app/builder?error=department");
  const { supabase, id } = await workspaceId();
  const { error } = await supabase.from("departments").insert({ workspace_id: id, name });
  if (error) redirect("/app/builder?error=department");
  revalidatePath("/app/builder");
  redirect("/app/builder");
}

export async function createLane(formData: FormData) {
  const name = text(formData, "name");
  const departmentId = text(formData, "department_id");
  if (!valid(name) || !departmentId) redirect("/app/builder?error=lane");
  const { supabase, id } = await workspaceId();
  const { error } = await supabase.from("lanes").insert({ workspace_id: id, department_id: departmentId, name });
  if (error) redirect("/app/builder?error=lane");
  revalidatePath("/app/builder");
  redirect("/app/builder");
}

export async function createAgent(formData: FormData) {
  const name = text(formData, "name");
  const laneId = text(formData, "lane_id");
  const agentType = text(formData, "agent_type") === "supervisor" ? "supervisor" : "worker";
  if (!valid(name) || !laneId) redirect("/app/builder?error=agent");
  const { supabase, id } = await workspaceId();
  const { error } = await supabase.from("agents").insert({ workspace_id: id, lane_id: laneId, name, agent_type: agentType });
  if (error) redirect("/app/builder?error=agent");
  revalidatePath("/app/builder");
  redirect("/app/builder");
}

export async function updateProductionStatus(formData: FormData) {
  const productionId = text(formData, "production_id");
  const status = text(formData, "status");
  const allowed = new Set(["draft", "active", "paused", "shipped", "archived"]);
  if (!productionId || !allowed.has(status)) redirect(`/app/productions/${productionId}?error=production`);
  const { supabase } = await workspaceId();
  const { error } = await supabase.from("productions").update({ status, updated_at: new Date().toISOString() }).eq("id", productionId);
  if (error) redirect(`/app/productions/${productionId}?error=production`);
  revalidatePath(`/app/productions/${productionId}`);
  redirect(`/app/productions/${productionId}`);
}

export async function advanceProduction(formData: FormData) {
  const productionId = text(formData, "production_id");
  if (!productionId) redirect("/app?error=production");
  const { supabase } = await workspaceId();
  const { error } = await supabase.rpc("advance_production", { target_production: productionId });
  if (error) redirect(`/app/productions/${productionId}?error=production`);
  revalidatePath(`/app/productions/${productionId}`);
  redirect(`/app/productions/${productionId}`);
}

export async function updateAgentFiles(formData: FormData) {
  const agentId = text(formData, "agent_id");
  if (!agentId) redirect("/app/builder?error=agent");
  const { supabase, id } = await workspaceId();
  const { error } = await supabase.from("agent_files").upsert({
    agent_id: agentId,
    workspace_id: id,
    role: text(formData, "role"),
    soul: text(formData, "soul"),
    jobdescription: text(formData, "jobdescription"),
    skills: text(formData, "skills"),
    memory: text(formData, "memory"),
    user_content: text(formData, "user_content"),
    updated_at: new Date().toISOString(),
  });
  if (error) redirect("/app/builder?error=agent");
  revalidatePath("/app/builder");
  redirect("/app/builder");
}
