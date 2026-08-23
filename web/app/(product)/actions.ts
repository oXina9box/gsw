"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptSecret, maskSecret } from "@/lib/studio/secrets";
import { isJobKind, normalizeProviderBaseUrl, normalizeRunMode, textField } from "@/lib/studio/domain";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { advanceExecution, cancelExecution, completeStep, failStep, startExecution, validateConditions } from "@/lib/orchestration/engine";
import { evaluateClipUploadAdmission } from "@/lib/studio/caps";

function text(formData: FormData, name: string) { return String(formData.get(name) ?? "").trim(); }
function valid(value: string) { return value.length > 0 && value.length <= 120; }
async function workspace() { const context = await getWorkspaceContext(); return { ...context, id: context.workspaceId }; }
function jsonObject(value: FormDataEntryValue | null) {
  if (!value || String(value).length > 100_000) return {};
  try { const parsed: unknown = JSON.parse(String(value)); return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {}; } catch { return {}; }
}

export async function createChannel(formData: FormData) {
  const name = text(formData, "name");
  if (!valid(name)) redirect("/app/channels?error=channel");
  const { supabase, id } = await workspace();
  const pillars = text(formData, "pillars").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 12);
  const { error } = await supabase.from("channels").insert({ workspace_id: id, name, audience: text(formData, "audience").slice(0, 500), voice: text(formData, "voice").slice(0, 500), cadence: text(formData, "cadence").slice(0, 120), pillars });
  if (error) redirect("/app/channels?error=channel");
  revalidatePath("/app/channels"); redirect("/app/channels");
}

export async function createProduction(formData: FormData) {
  const title = text(formData, "title");
  const channelId = text(formData, "channel_id");
  if (!valid(title) || !channelId || formData.get("rights_attested") !== "on") redirect(`/app/channels/${channelId}?error=production`);
  const parsedLimit = Number.parseInt(text(formData, "credit_limit"), 10);
  const rawSchedule = text(formData, "scheduled_at");
  const scheduledAt = rawSchedule && !Number.isNaN(Date.parse(rawSchedule)) ? new Date(rawSchedule).toISOString() : null;
  const { supabase, id } = await workspace();
  const production = { workspace_id: id, channel_id: channelId, title, brief: text(formData, "brief").slice(0, 10_000), audience: text(formData, "audience").slice(0, 500), run_mode: normalizeRunMode(formData.get("run_mode")), credit_limit: Number.isSafeInteger(parsedLimit) && parsedLimit >= 0 ? parsedLimit : null, scheduled_at: scheduledAt, rights_attested_at: new Date().toISOString() };
  const { error } = await supabase.from("productions").insert(production);
  if (error) redirect(`/app/channels/${channelId}?error=production`);
  revalidatePath(`/app/channels/${channelId}`); redirect(`/app/channels/${channelId}`);
}

export async function createLane(formData: FormData) {
  const name = text(formData, "name"); const departmentId = text(formData, "department_id");
  if (!valid(name) || !departmentId) redirect("/app/builder?error=lane");
  const { supabase, id } = await workspace();
  const { error } = await supabase.from("lanes").insert({ workspace_id: id, department_id: departmentId, name });
  if (error) redirect("/app/builder?error=lane");
  revalidatePath("/app/builder"); redirect("/app/builder");
}

export async function createAgent(formData: FormData) {
  const name = text(formData, "name"); const laneId = text(formData, "lane_id"); const agentType = text(formData, "agent_type") === "supervisor" ? "supervisor" : "worker";
  if (!valid(name) || !laneId) redirect("/app/builder?error=agent");
  const { supabase, id } = await workspace();
  const { error } = await supabase.rpc("create_custom_agent", { target_workspace: id, target_lane: laneId, agent_name: name, agent_kind: agentType });
  if (error) redirect("/app/builder?error=agent");
  revalidatePath("/app/builder"); redirect("/app/builder");
}

export async function updateProductionStatus(formData: FormData) {
  const productionId = text(formData, "production_id"); const status = text(formData, "status");
  if (!productionId || !new Set(["draft", "active", "paused", "shipped", "archived"]).has(status)) redirect(`/app/productions/${productionId}?error=production`);
  const { supabase } = await workspace();
  const { error } = await supabase.from("productions").update({ status, updated_at: new Date().toISOString() }).eq("id", productionId);
  if (error) redirect(`/app/productions/${productionId}?error=production`);
  revalidatePath(`/app/productions/${productionId}`); redirect(`/app/productions/${productionId}`);
}

export async function updateProductionMode(formData: FormData) {
  const productionId = text(formData, "production_id");
  if (!productionId) redirect("/app?error=production");
  const { supabase } = await workspace();
  const { error } = await supabase.from("productions").update({ run_mode: normalizeRunMode(formData.get("run_mode")), updated_at: new Date().toISOString() }).eq("id", productionId);
  if (error) redirect(`/app/productions/${productionId}?error=production`);
  revalidatePath(`/app/productions/${productionId}`); redirect(`/app/productions/${productionId}`);
}

export async function advanceProduction(formData: FormData) {
  const productionId = text(formData, "production_id"); const artifactId = text(formData, "artifact_id");
  if (!productionId || !artifactId) redirect("/app?error=production");
  const { supabase } = await workspace();
  const { error } = await supabase.rpc("advance_production", { target_production: productionId, target_artifact: artifactId });
  if (error) redirect(`/app/productions/${productionId}?error=production`);
  revalidatePath(`/app/productions/${productionId}`); redirect(`/app/productions/${productionId}`);
}

export async function updateAgentFiles(formData: FormData) {
  const agentId = text(formData, "agent_id");
  if (!agentId) redirect("/app/builder?error=agent");
  const { supabase, id } = await workspace();
  const { error } = await supabase.rpc("update_custom_agent_files", { target_workspace: id, target_agent: agentId, file_role: text(formData, "role"), file_soul: text(formData, "soul"), file_jobdescription: text(formData, "jobdescription"), file_skills: text(formData, "skills"), file_memory: text(formData, "memory"), file_user_content: text(formData, "user_content") });
  if (error) redirect("/app/builder?error=agent");
  revalidatePath("/app/builder"); redirect("/app/builder");
}

export async function enqueueProductionJob(formData: FormData) {
  const productionId = textField(formData, "production_id"); const kind = formData.get("kind");
  if (!productionId || !isJobKind(kind)) redirect(`/app/productions/${productionId ?? ""}?error=job`);
  const agentId = textField(formData, "agent_id"); const connectionId = textField(formData, "connection_id");
  const assignment = kind.startsWith("generate_") ? { agent_id: agentId, ...(connectionId ? { connection_id: connectionId } : {}) } : {};
  if (kind.startsWith("generate_") && !agentId) redirect(`/app/productions/${productionId}?error=job`);
  const { supabase, id } = await workspace();
  const { error } = await supabase.rpc("enqueue_studio_job", { target_workspace: id, target_production: productionId, job_kind: kind, job_payload: { requested_at: new Date().toISOString(), ...assignment }, key: `${productionId}:${kind}:${Math.floor(Date.now() / 60_000)}` });
  if (error) redirect(`/app/productions/${productionId}?error=job`);
  revalidatePath(`/app/productions/${productionId}`); redirect(`/app/productions/${productionId}`);
}

export async function saveProviderConnection(formData: FormData) {
  const provider = textField(formData, "provider"); const label = textField(formData, "label"); const model = textField(formData, "model"); const secret = String(formData.get("api_key") ?? "").trim(); const rawUrl = String(formData.get("base_url") ?? "").trim();
  if (!provider || !label || !model || secret.length < 8 || !rawUrl) redirect("/app/integrations?error=provider");
  let baseUrl: string;
  try { const allowed = (process.env.PROVIDER_HOST_ALLOWLIST ?? "").split(",").map((host) => host.trim().toLowerCase()).filter(Boolean); baseUrl = normalizeProviderBaseUrl(rawUrl, process.env.NODE_ENV !== "production", allowed); } catch { redirect("/app/integrations?error=provider"); }
  const key = process.env.PROVIDER_SECRET_ENCRYPTION_KEY;
  if (!key) redirect("/app/integrations?error=configuration");
  const envelope = encryptSecret(secret, key, process.env.PROVIDER_SECRET_KEY_VERSION ?? "v1");
  const capabilities = formData.getAll("capabilities").map(String).filter((value) => ["text", "image", "audio"].includes(value));
  const { id } = await workspace();
  const { error } = await createAdminClient().rpc("save_provider_connection_server", { target_workspace: id, provider_name: provider, connection_label: label, connection_base_url: baseUrl, connection_model: model, connection_capabilities: capabilities, secret_mask: maskSecret(secret), secret_ciphertext: envelope.ciphertext, secret_iv: envelope.iv, secret_tag: envelope.tag, secret_key_version: envelope.keyVersion });
  if (error) redirect("/app/integrations?error=provider");
  revalidatePath("/app/integrations"); redirect("/app/integrations");
}

export async function createSignal(formData: FormData) {
  const title = textField(formData, "title"); const body = textField(formData, "body", 2_000); const signalType = String(formData.get("signal_type") ?? "recommendation");
  if (!title || !body || !new Set(["native", "conversation", "performance", "recommendation"]).has(signalType)) redirect("/app/social?error=signal");
  const { supabase, id } = await workspace();
  const { error } = await supabase.from("signals").insert({ workspace_id: id, channel_id: textField(formData, "channel_id") || null, production_id: textField(formData, "production_id") || null, signal_type: signalType, title, body });
  if (error) redirect("/app/social?error=signal");
  revalidatePath("/app/social"); redirect("/app/social");
}

export async function hireCatalogAgent(formData: FormData) {
  const catalogAgentId = textField(formData, "catalog_agent_id"); const laneId = textField(formData, "lane_id");
  if (!catalogAgentId || !laneId) redirect("/app/agents?error=hire");
  const { supabase, id } = await workspace();
  const { error } = await supabase.rpc("hire_catalog_agent", { target_workspace: id, target_catalog_agent: catalogAgentId, target_lane: laneId });
  if (error) redirect(`/app/agents?error=${error.message.includes("entitlement") ? "entitlement" : "hire"}`);
  revalidatePath("/app/agents"); revalidatePath("/app/builder"); redirect("/app/agents");
}

export async function registerShotClip(formData: FormData) {
  const productionId = textField(formData, "production_id"); const shotId = textField(formData, "shot_id"); const path = textField(formData, "storage_path", 1_000); const mime = textField(formData, "mime_type"); const size = Number.parseInt(String(formData.get("byte_size") ?? "0"), 10);
  if (!productionId || !shotId || !path || !mime || !Number.isSafeInteger(size) || size <= 0) return { ok: false as const, error: "Invalid clip metadata." };
  const { supabase, id } = await workspace();
  const startOfDay = new Date(); startOfDay.setUTCHours(0, 0, 0, 0);
  const { data: todayClips, error: clipCountError } = await supabase.from("shot_clips").select("byte_size").eq("workspace_id", id).gte("created_at", startOfDay.toISOString());
  const admission = evaluateClipUploadAdmission({ byteSize: size, filesToday: todayClips?.length ?? 0, bytesToday: (todayClips ?? []).reduce((total, clip) => total + (clip.byte_size ?? 0), 0), policyAvailable: !clipCountError });
  if (!admission.admit) return { ok: false as const, error: admission.reason === "policy_unavailable" ? "Upload policy is temporarily unavailable. Try again." : "Upload cap reached. Try again after the UTC-day reset or reduce file size." };
  const { error } = await supabase.rpc("register_shot_clip", { target_workspace: id, target_production: productionId, target_shot: shotId, target_path: path, target_mime: mime, target_size: size });
  if (error) return { ok: false as const, error: "Clip could not be registered." };
  revalidatePath(`/app/productions/${productionId}`); return { ok: true as const };
}

export async function selectShotClip(formData: FormData) {
  const productionId = textField(formData, "production_id"); const shotId = textField(formData, "shot_id"); const clipId = textField(formData, "clip_id");
  if (!productionId || !shotId || !clipId) redirect(`/app/productions/${productionId ?? ""}?error=clip`);
  const { supabase, id } = await workspace(); const { error } = await supabase.rpc("select_shot_clip", { target_workspace: id, target_shot: shotId, target_clip: clipId });
  if (error) redirect(`/app/productions/${productionId}?error=clip`);
  revalidatePath(`/app/productions/${productionId}`); redirect(`/app/productions/${productionId}`);
}

export async function decideProductionApproval(formData: FormData) {
  const productionId = textField(formData, "production_id"); const approvalId = textField(formData, "approval_id"); const decision = String(formData.get("decision") ?? "");
  if (!productionId || !approvalId || !["approved", "rejected"].includes(decision)) redirect(`/app/productions/${productionId ?? ""}?error=approval`);
  const { supabase, id } = await workspace(); const { error } = await supabase.rpc("decide_production_approval", { target_workspace: id, target_approval: approvalId, decision, decision_note: text(formData, "note").slice(0, 2_000) });
  if (error) redirect(`/app/productions/${productionId}?error=approval`);
  revalidatePath(`/app/productions/${productionId}`); redirect(`/app/productions/${productionId}`);
}

export async function createDnaRecord(formData: FormData) {
  const recordType = String(formData.get("dna_type") ?? ""); const name = textField(formData, "name"); const summary = textField(formData, "summary", 5_000);
  if (!name || !summary || !["CDNA", "LDNA", "PDNA"].includes(recordType)) redirect("/app/universe?error=record");
  const { supabase, id } = await workspace(); const { error } = await supabase.rpc("create_dna_record", { target_workspace: id, record_type: recordType, record_name: name, record_summary: summary });
  if (error) redirect("/app/universe?error=record");
  revalidatePath("/app/universe"); redirect("/app/universe");
}

export async function updateDnaRecord(formData: FormData) {
  const recordId = textField(formData, "record_id");
  if (!recordId) redirect("/app/universe?error=dna");
  const { supabase, id } = await workspace();
  const { data } = await supabase.from("dna_records").select("locked, record").eq("id", recordId).maybeSingle();
  const record = data as { locked: boolean; record: Record<string, unknown> | null } | null;
  if (!record) redirect("/app/universe?error=dna");
  const body = record.record ?? {};
  const summary = text(formData, "summary").slice(0, 500);
  const anchors = text(formData, "anchors").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 20);
  const voice = text(formData, "voice_behavior").slice(0, 500);
  const contentChanged = String(body.summary ?? "") !== summary || (Array.isArray(body.anchors) ? body.anchors.join(", ") : "") !== anchors.join(", ") || String(body.voice_behavior ?? "") !== voice;
  if (record.locked && contentChanged) redirect(`/app/universe/${recordId}?error=locked`);
  const { error } = await supabase.rpc("update_dna_record", { target_workspace: id, target_record: recordId, next_record: { ...body, summary, anchors, voice_behavior: voice }, lock_version: formData.get("lock_version") === "on" });
  if (error) redirect(`/app/universe/${recordId}?error=dna`);
  revalidatePath(`/app/universe/${recordId}`); revalidatePath("/app/universe"); redirect(`/app/universe/${recordId}`);
}

export async function attachProductionDna(formData: FormData) {
  const productionId = textField(formData, "production_id"); const recordId = textField(formData, "dna_record_id");
  if (!productionId || !recordId) redirect(`/app/productions/${productionId ?? ""}?error=casting`);
  const { supabase, id } = await workspace(); const { error } = await supabase.rpc("attach_production_dna", { target_workspace: id, target_production: productionId, target_record: recordId });
  if (error) redirect(`/app/productions/${productionId}?error=casting`);
  revalidatePath(`/app/productions/${productionId}`); redirect(`/app/productions/${productionId}`);
}

export async function deleteAgent(formData: FormData) {
  const agentId = textField(formData, "agent_id"); const laneId = textField(formData, "lane_id");
  if (!agentId || !laneId || formData.get("confirm_delete") !== "on") redirect("/app/builder?error=builder");
  const { supabase, id } = await workspace();
  const { error } = await supabase.rpc("delete_custom_agent", { target_workspace: id, target_agent: agentId, target_lane: laneId });
  if (error) redirect("/app/builder?error=builder");
  revalidatePath("/app/builder"); redirect("/app/builder");
}

export async function deleteLane(formData: FormData) {
  const laneId = textField(formData, "lane_id");
  if (!laneId || formData.get("confirm_delete") !== "on") redirect("/app/builder?error=builder");
  const { supabase, id } = await workspace();
  const { error } = await supabase.rpc("delete_custom_lane", { target_workspace: id, target_lane: laneId });
  if (error) redirect("/app/builder?error=builder");
  revalidatePath("/app/builder"); redirect("/app/builder");
}

export async function deleteWorkflow(formData: FormData) {
  const workflowId = textField(formData, "workflow_id");
  if (!workflowId || formData.get("confirm_delete") !== "on") redirect("/app/orchestration?error=workflow");
  const { supabase } = await workspace();
  const { error } = await supabase.from("workflows").delete().eq("id", workflowId);
  if (error) redirect("/app/orchestration?error=workflow");
  revalidatePath("/app/orchestration"); redirect("/app/orchestration");
}

export async function createHandoffRule(formData: FormData) {
  const workflowId = text(formData, "workflow_id"); const source = text(formData, "source").split(":"); const target = text(formData, "target").split(":"); const trigger = text(formData, "trigger_event") || "completion";
  if (!workflowId || source.length !== 2 || target.length !== 2 || !["lane", "agent"].includes(source[0]) || !["lane", "agent"].includes(target[0]) || !["completion", "approval", "manual", "timeout"].includes(trigger)) redirect("/app/orchestration?error=handoff");
  let conditions: unknown = [];
  const rawConditions = text(formData, "conditions");
  if (rawConditions) { try { conditions = JSON.parse(rawConditions); } catch { redirect("/app/orchestration?error=handoff"); } }
  if (validateConditions(conditions).length) redirect("/app/orchestration?error=handoff");
  const { supabase, id } = await workspace();
  const [{ data: workflow }, { data: max }] = await Promise.all([supabase.from("workflows").select("id").eq("id", workflowId).eq("workspace_id", id).maybeSingle(), supabase.from("handoff_rules").select("position").eq("workflow_id", workflowId).order("position", { ascending: false }).limit(1).maybeSingle()]);
  if (!workflow) redirect("/app/orchestration?error=handoff");
  const position = (max?.position ?? -1) + 1;
  const handoff = { workspace_id: id, workflow_id: workflowId, position, source_kind: source[0], source_lane_id: source[0] === "lane" ? source[1] : null, source_agent_id: source[0] === "agent" ? source[1] : null, target_kind: target[0], target_lane_id: target[0] === "lane" ? target[1] : null, target_agent_id: target[0] === "agent" ? target[1] : null, trigger_event: trigger, conditions };
  const { error } = await supabase.from("handoff_rules").insert(handoff);
  if (error) redirect("/app/orchestration?error=handoff"); revalidatePath("/app/orchestration"); redirect("/app/orchestration");
}

export async function updateChannel(formData: FormData) {
  const channelId = textField(formData, "channel_id"); const name = text(formData, "name");
  if (!channelId || !valid(name)) redirect(`/app/channels/${channelId ?? ""}?error=channel`);
  const { supabase } = await workspace();
  const pillars = text(formData, "pillars").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 12);
  const { error } = await supabase.from("channels").update({ name, audience: text(formData, "audience").slice(0, 500), voice: text(formData, "voice").slice(0, 500), cadence: text(formData, "cadence").slice(0, 120), pillars }).eq("id", channelId);
  if (error) redirect(`/app/channels/${channelId}?error=channel`);
  revalidatePath(`/app/channels/${channelId}`); revalidatePath("/app/channels"); redirect(`/app/channels/${channelId}`);
}

export async function renameStudio(formData: FormData) {
  const name = textField(formData, "name"); if (!name) redirect("/account?error=studio");
  const { supabase, id } = await workspace(); const { error } = await supabase.rpc("rename_studio", { target_workspace: id, studio_name: name });
  if (error) redirect("/account?error=studio");
  revalidatePath("/account"); revalidatePath("/app", "layout"); redirect("/account?saved=1");
}

export async function createWorkflow(formData: FormData) {
  const name = text(formData, "name"); if (!valid(name)) redirect("/app/orchestration?error=workflow");
  const { supabase, id } = await workspace(); const { error } = await supabase.from("workflows").insert({ workspace_id: id, name });
  if (error) redirect("/app/orchestration?error=workflow"); revalidatePath("/app/orchestration"); redirect("/app/orchestration");
}


export async function deleteHandoffRule(formData: FormData) {
  const ruleId = text(formData, "rule_id"); if (!ruleId) redirect("/app/orchestration?error=handoff");
  const { supabase } = await workspace(); const { error } = await supabase.from("handoff_rules").delete().eq("id", ruleId);
  if (error) redirect("/app/orchestration?error=handoff"); revalidatePath("/app/orchestration"); redirect("/app/orchestration");
}

export async function startWorkflowExecution(formData: FormData) {
  const workflowId = text(formData, "workflow_id"); if (!workflowId) redirect("/app/orchestration?error=execution");
  const { supabase, id, user } = await workspace(); const { data: workflow } = await supabase.from("workflows").select("id").eq("id", workflowId).eq("workspace_id", id).maybeSingle();
  if (!workflow || !(await startExecution(createAdminClient(), id, workflowId, jsonObject(formData.get("brief")), user.id)).ok) redirect("/app/orchestration?error=execution");
  revalidatePath("/app/orchestration"); redirect("/app/orchestration");
}

async function ownedExecution(supabase: Awaited<ReturnType<typeof getWorkspaceContext>>["supabase"], id: string, workspaceId: string) { const { data } = await supabase.from("executions").select("id").eq("id", id).eq("workspace_id", workspaceId).maybeSingle(); return Boolean(data); }
async function ownedStep(supabase: Awaited<ReturnType<typeof getWorkspaceContext>>["supabase"], id: string, workspaceId: string) { const { data } = await supabase.from("execution_steps").select("id").eq("id", id).eq("workspace_id", workspaceId).maybeSingle(); return Boolean(data); }

export async function advanceExecutionAction(formData: FormData) {
  const executionId = text(formData, "execution_id"); const trigger = text(formData, "trigger_event") || "completion"; const allowed = ["completion", "approval", "manual", "timeout"] as const;
  const { supabase, id, user } = await workspace(); if (!executionId || !allowed.includes(trigger as typeof allowed[number]) || !(await ownedExecution(supabase, executionId, id))) redirect("/app/orchestration?error=execution");
  if (!(await advanceExecution(createAdminClient(), executionId, trigger as typeof allowed[number], user.id)).ok) redirect("/app/orchestration?error=execution"); revalidatePath("/app/orchestration"); redirect("/app/orchestration");
}

export async function completeExecutionStep(formData: FormData) {
  const stepId = text(formData, "step_id"); const { supabase, id, user } = await workspace(); if (!stepId || !(await ownedStep(supabase, stepId, id))) redirect("/app/orchestration?error=step");
  if (!(await completeStep(createAdminClient(), stepId, jsonObject(formData.get("output")), user.id)).ok) redirect("/app/orchestration?error=step"); revalidatePath("/app/orchestration"); redirect("/app/orchestration");
}

export async function failExecutionStep(formData: FormData) {
  const stepId = text(formData, "step_id"); const { supabase, id, user } = await workspace(); if (!stepId || !(await ownedStep(supabase, stepId, id))) redirect("/app/orchestration?error=step");
  if (!(await failStep(createAdminClient(), stepId, text(formData, "error_message").slice(0, 2_000), user.id)).ok) redirect("/app/orchestration?error=step"); revalidatePath("/app/orchestration"); redirect("/app/orchestration");
}

export async function cancelExecutionAction(formData: FormData) {
  const executionId = text(formData, "execution_id"); const { supabase, id, user } = await workspace(); if (!executionId || !(await ownedExecution(supabase, executionId, id))) redirect("/app/orchestration?error=execution");
  if (!(await cancelExecution(createAdminClient(), executionId, user.id)).ok) redirect("/app/orchestration?error=execution"); revalidatePath("/app/orchestration"); redirect("/app/orchestration");
}
