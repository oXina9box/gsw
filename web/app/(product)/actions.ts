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


// Orchestration Engine Actions
import { startExecution, advanceExecution, completeStep, failStep, cancelExecution } from "@/lib/orchestration/engine";

export async function createWorkflow(formData: FormData) {
  const name = text(formData, "name");
  if (!valid(name)) redirect("/app/orchestration?error=workflow");
  const { supabase, id } = await workspaceId();
  const { error } = await supabase.from("workflows").insert({ workspace_id: id, name });
  if (error) redirect("/app/orchestration?error=workflow");
  revalidatePath("/app/orchestration");
  redirect("/app/orchestration");
}

export async function createHandoffRule(formData: FormData) {
  const workflowId = text(formData, "workflow_id");
  const sourceRef = text(formData, "source");
  const targetRef = text(formData, "target");
  const trigger = text(formData, "trigger_event") || "completion";
  const allowed = new Set(["completion", "approval", "manual", "timeout"]);
  if (!workflowId || !sourceRef || !targetRef || !allowed.has(trigger)) redirect("/app/orchestration?error=handoff");
  const { supabase, id } = await workspaceId();
  const { data: workflow } = await supabase.from("workflows").select("id").eq("id", workflowId).eq("workspace_id", id).maybeSingle();
  if (!workflow) redirect("/app/orchestration?error=handoff");
  const { data: max } = await supabase.from("handoff_rules").select("position").eq("workflow_id", workflowId).order("position", { ascending: false }).limit(1).maybeSingle();
  const position = (max?.position ?? 0) + 1;
  const sourceParts = sourceRef.split(":");
  const targetParts = targetRef.split(":");
  const record = {
    workspace_id: id,
    workflow_id: workflowId,
    position,
    source_kind: sourceParts[0],
    source_lane_id: sourceParts[0] === "lane" ? sourceParts[1] : null,
    source_agent_id: sourceParts[0] === "agent" ? sourceParts[1] : null,
    target_kind: targetParts[0],
    target_lane_id: targetParts[0] === "lane" ? targetParts[1] : null,
    target_agent_id: targetParts[0] === "agent" ? targetParts[1] : null,
    trigger_event: trigger,
  };
  const { error } = await supabase.from("handoff_rules").insert(record);
  if (error) redirect("/app/orchestration?error=handoff");
  revalidatePath("/app/orchestration");
  redirect("/app/orchestration");
}

export async function deleteHandoffRule(formData: FormData) {
  const ruleId = text(formData, "rule_id");
  if (!ruleId) redirect("/app/orchestration?error=handoff");
  const { supabase } = await workspaceId();
  const { error } = await supabase.from("handoff_rules").delete().eq("id", ruleId);
  if (error) redirect("/app/orchestration?error=handoff");
  revalidatePath("/app/orchestration");
  redirect("/app/orchestration");
}

export async function startWorkflowExecution(formData: FormData) {
  const workflowId = text(formData, "workflow_id");
  const brief = formData.get("brief");
  if (!workflowId) redirect("/app/orchestration?error=execution");
  const parsed: Record<string, unknown> = brief ? JSON.parse(String(brief)) : {};
  const { supabase, id } = await workspaceId();
  const { data: workflow } = await supabase.from("workflows").select("id").eq("id", workflowId).eq("workspace_id", id).maybeSingle();
  if (!workflow) redirect("/app/orchestration?error=execution");
  const { data: user } = await supabase.auth.getUser();
  const result = await startExecution(supabase, id, workflowId, parsed, user?.user?.id ?? null);
  if (!result.ok) redirect("/app/orchestration?error=execution");
  revalidatePath("/app/orchestration");
  redirect("/app/orchestration");
}

export async function advanceExecutionAction(formData: FormData) {
  const executionId = text(formData, "execution_id");
  const trigger = text(formData, "trigger_event") || "completion";
  if (!executionId) redirect("/app/orchestration?error=execution");
  const { supabase } = await workspaceId();
  const { data: user } = await supabase.auth.getUser();
  const result = await advanceExecution(supabase, executionId, trigger as "completion" | "approval" | "manual" | "timeout", user?.user?.id ?? null);
  if (!result.ok) redirect("/app/orchestration?error=execution");
  revalidatePath("/app/orchestration");
  redirect("/app/orchestration");
}

export async function completeExecutionStep(formData: FormData) {
  const stepId = text(formData, "step_id");
  const output = formData.get("output");
  if (!stepId) redirect("/app/orchestration?error=step");
  const { supabase } = await workspaceId();
  const { data: user } = await supabase.auth.getUser();
  const parsed: Record<string, unknown> | null = output ? JSON.parse(String(output)) : null;
  const result = await completeStep(supabase, stepId, parsed, user?.user?.id ?? null);
  if (!result.ok) redirect("/app/orchestration?error=step");
  revalidatePath("/app/orchestration");
  redirect("/app/orchestration");
}

export async function failExecutionStep(formData: FormData) {
  const stepId = text(formData, "step_id");
  const errorMessage = text(formData, "error_message");
  if (!stepId) redirect("/app/orchestration?error=step");
  const { supabase } = await workspaceId();
  const { data: user } = await supabase.auth.getUser();
  const result = await failStep(supabase, stepId, errorMessage, user?.user?.id ?? null);
  if (!result.ok) redirect("/app/orchestration?error=step");
  revalidatePath("/app/orchestration");
  redirect("/app/orchestration");
}

export async function cancelExecutionAction(formData: FormData) {
  const executionId = text(formData, "execution_id");
  if (!executionId) redirect("/app/orchestration?error=execution");
  const { supabase } = await workspaceId();
  const { data: user } = await supabase.auth.getUser();
  const result = await cancelExecution(supabase, executionId, user?.user?.id ?? null);
  if (!result.ok) redirect("/app/orchestration?error=execution");
  revalidatePath("/app/orchestration");
  redirect("/app/orchestration");
}
