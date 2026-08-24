"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptSecret, maskSecret } from "@/lib/studio/secrets";
import { isJobKind, normalizeProviderBaseUrl, normalizeRunMode, textField, validateAssemblyTrim } from "@/lib/studio/domain";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { advanceExecution, cancelExecution, completeStep, failStep, startExecution, validateConditions, validatePassOrder } from "@/lib/orchestration/engine";
import { evaluateClipUploadAdmission } from "@/lib/studio/caps";
import { canPublish, transitionRelease } from "@/lib/studio/social";
import { nextOnboardingStep } from "@/lib/studio/onboarding";

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
  const workflowId = text(formData, "workflow_id");
  if (workflowId) { const { data: workflow } = await supabase.from("workflows").select("id").eq("id", workflowId).eq("workspace_id", id).maybeSingle(); if (!workflow) redirect(`/app/channels/${channelId}?error=production`); }
  const production = { workspace_id: id, channel_id: channelId, title, brief: text(formData, "brief").slice(0, 10_000), audience: text(formData, "audience").slice(0, 500), run_mode: normalizeRunMode(formData.get("run_mode")), credit_limit: Number.isSafeInteger(parsedLimit) && parsedLimit >= 0 ? parsedLimit : null, scheduled_at: scheduledAt, rights_attested_at: new Date().toISOString(), workflow_id: workflowId || null };
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

export async function updateLaneCollaboration(formData: FormData) {
  const laneId = textField(formData, "lane_id");
  const mode = text(formData, "collaboration_mode") === "round_table" ? "round_table" : "forward";
  const order = text(formData, "pass_order").split(",").map(Number).filter(Number.isInteger);
  const cycles = Number.parseInt(text(formData, "pass_cycles"), 10) || 1;
  if (!laneId || validatePassOrder(mode, order, cycles).length) redirect("/app/builder?error=lane");
  const { supabase, id: workspaceId } = await workspace();
  const { error } = await supabase.from("lanes").update({ collaboration_mode: mode, pass_order: mode === "round_table" ? order : [], pass_cycles: cycles }).eq("id", laneId).eq("workspace_id", workspaceId);
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
  const { supabase, id: workspaceId } = await workspace();
  const { error } = await supabase.from("productions").update({ status, updated_at: new Date().toISOString() }).eq("id", productionId).eq("workspace_id", workspaceId);
  if (error) redirect(`/app/productions/${productionId}?error=production`);
  revalidatePath(`/app/productions/${productionId}`); redirect(`/app/productions/${productionId}`);
}

export async function updateProductionMode(formData: FormData) {
  const productionId = text(formData, "production_id");
  if (!productionId) redirect("/app?error=production");
  const { supabase, id: workspaceId } = await workspace();
  const { error } = await supabase.from("productions").update({ run_mode: normalizeRunMode(formData.get("run_mode")), updated_at: new Date().toISOString() }).eq("id", productionId).eq("workspace_id", workspaceId);
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

export async function updateAgentModel(formData: FormData) {
  const agentId = textField(formData, "agent_id"); const recommendation = text(formData, "recommended_tier"); const override = text(formData, "model_tier_override");
  if (!agentId || !["free", "mid", "quality"].includes(recommendation) || (override && !["free", "mid", "quality"].includes(override))) redirect("/app/builder?error=agent");
  const { supabase, id: workspaceId } = await workspace(); const { error } = await supabase.from("agents").update({ recommended_tier: recommendation, model_tier_override: override || null, updated_at: new Date().toISOString() }).eq("id", agentId).eq("workspace_id", workspaceId);
  if (error) redirect("/app/builder?error=agent"); revalidatePath("/app/builder"); redirect("/app/builder");
}

export async function saveProductionBudgetGuideline(formData: FormData) {
  const productionId = textField(formData, "production_id"); const credits = Number.parseInt(text(formData, "guideline_credits") || "0", 10); const notes = textField(formData, "notes", 2_000) ?? "";
  if (!productionId || !Number.isSafeInteger(credits) || credits < 0) redirect(`/app/productions/${productionId ?? ""}?error=budget`);
  const { supabase, id } = await workspace(); const { error } = await supabase.from("production_budget_guidelines").upsert({ production_id: productionId, workspace_id: id, guideline_credits: credits, notes, updated_at: new Date().toISOString() });
  if (error) redirect(`/app/productions/${productionId}?error=budget`); revalidatePath(`/app/productions/${productionId}`); redirect(`/app/productions/${productionId}`);
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

export async function createReleasePackage(formData: FormData) {
  const productionId = textField(formData, "production_id"); const platform = text(formData, "platform"); const caption = textField(formData, "caption", 5_000);
  if (!productionId || !caption || !["youtube", "x", "tiktok", "instagram", "facebook"].includes(platform)) redirect("/app/social?error=package");
  const { supabase, id } = await workspace();
  const { error } = await supabase.from("release_packages").insert({ workspace_id: id, production_id: productionId, platform, caption, status: "ready", metadata: { title: textField(formData, "title", 240) ?? "" } });
  if (error) redirect("/app/social?error=package"); revalidatePath("/app/social"); redirect("/app/social");
}

export async function approveReleasePackage(formData: FormData) {
  const packageId = textField(formData, "package_id"); if (!packageId || formData.get("confirm") !== "on") redirect("/app/social?error=approval");
  const { supabase, id: workspaceId } = await workspace(); const { data: current } = await supabase.from("release_packages").select("status").eq("id", packageId).eq("workspace_id", workspaceId).maybeSingle(); if (!current || transitionRelease(current.status, "approved") !== "approved") redirect("/app/social?error=approval"); const { error } = await supabase.from("release_packages").update({ status: "approved", approved_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", packageId).eq("status", "ready").eq("workspace_id", workspaceId);
  if (error) redirect("/app/social?error=approval"); revalidatePath("/app/social"); redirect("/app/social");
}

export async function confirmReleasePublished(formData: FormData) {
  const packageId = textField(formData, "package_id"); if (!packageId || formData.get("confirm") !== "on") redirect("/app/social?error=publish");
  const { supabase, id: workspaceId } = await workspace(); const { data: current } = await supabase.from("release_packages").select("status").eq("id", packageId).eq("workspace_id", workspaceId).maybeSingle(); if (!current || !canPublish(current.status, true) || transitionRelease(current.status, "published") !== "published") redirect("/app/social?error=publish"); const { error } = await supabase.from("release_packages").update({ status: "published", published_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", packageId).eq("status", "approved").eq("workspace_id", workspaceId);
  if (error) redirect("/app/social?error=publish"); revalidatePath("/app/social"); redirect("/app/social");
}

export async function promoteSignalToBrief(formData: FormData) {
  const signalId = textField(formData, "signal_id"); const productionId = textField(formData, "production_id"); if (!signalId) redirect("/app/social?error=promotion");
  const { supabase, id } = await workspace(); const { error } = await supabase.from("signal_promotion_events").insert({ workspace_id: id, signal_id: signalId, production_id: productionId || null });
  if (error) redirect("/app/social?error=promotion"); const { error: updateError } = await supabase.from("signals").update({ promoted_to_brief_at: new Date().toISOString() }).eq("id", signalId).eq("workspace_id", id);
  if (updateError) redirect("/app/social?error=promotion"); revalidatePath("/app/social"); redirect("/app/social");
}

export async function captureSocialReport(formData: FormData) {
  const packageId = textField(formData, "package_id"); const reportType = text(formData, "report_type"); const notes = textField(formData, "notes", 2_000) ?? ""; const metrics = jsonObject(formData.get("metrics"));
  if (!packageId || !["performance", "conversation", "interaction"].includes(reportType)) redirect("/app/social?error=report");
  const { supabase, id } = await workspace(); const { error } = await supabase.from("social_reports").insert({ workspace_id: id, release_package_id: packageId, report_type: reportType, notes, metrics });
  if (error) redirect("/app/social?error=report"); revalidatePath("/app/social"); redirect("/app/social");
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

export async function saveAssemblyDecision(formData: FormData) {
  const productionId = textField(formData, "production_id"); const shotId = textField(formData, "shot_id");
  const position = Number.parseInt(text(formData, "position"), 10); const start = Number.parseInt(text(formData, "trim_start_ms") || "0", 10); const endRaw = text(formData, "trim_end_ms"); const end = endRaw ? Number.parseInt(endRaw, 10) : null;
  if (!productionId || !shotId || !Number.isSafeInteger(position) || position < 0) redirect(`/app/productions/${productionId ?? ""}?error=assembly`);
  try { validateAssemblyTrim(start, end); } catch { redirect(`/app/productions/${productionId ?? ""}?error=assembly`); }
  const { supabase, id } = await workspace();
  const { error } = await supabase.from("assembly_decisions").upsert({ workspace_id: id, production_id: productionId, shot_id: shotId, position, keep: formData.get("keep") === "on", trim_start_ms: start, trim_end_ms: end, audio_choice: text(formData, "audio_choice") || null, notes: textField(formData, "notes", 2_000) ?? "" });
  if (error) redirect(`/app/productions/${productionId}?error=assembly`);
  revalidatePath(`/app/productions/${productionId}`); redirect(`/app/productions/${productionId}`);
}

export async function createProductionLanePlan(formData: FormData) {
  const productionId = textField(formData, "production_id"); const laneName = textField(formData, "lane_name"); const laneKind = textField(formData, "lane_kind"); const count = Number.parseInt(text(formData, "required_count"), 10);
  if (!productionId || !laneName || !laneKind || !Number.isSafeInteger(count) || count < 1) redirect(`/app/productions/${productionId ?? ""}?error=plan`);
  const { supabase, id } = await workspace(); const { error } = await supabase.from("production_lane_plans").insert({ workspace_id: id, production_id: productionId, lane_name: laneName, lane_kind: laneKind, required_count: count, source: { user: true } });
  if (error) redirect(`/app/productions/${productionId}?error=plan`); revalidatePath(`/app/productions/${productionId}`); redirect(`/app/productions/${productionId}`);
}

export async function saveProviderHandoffArtifact(formData: FormData) {
  const productionId = textField(formData, "production_id"); const kind = text(formData, "kind"); const provider = textField(formData, "provider"); const raw = textField(formData, "payload", 100_000);
  if (!productionId || !["prompt", "result", "image", "video", "audio"].includes(kind) || !raw) redirect(`/app/productions/${productionId ?? ""}?error=handoff`);
  let payload: unknown; try { payload = JSON.parse(raw); } catch { redirect(`/app/productions/${productionId}?error=handoff`); }
  const { supabase, id } = await workspace(); const { error } = await supabase.from("provider_handoff_artifacts").insert({ workspace_id: id, production_id: productionId, kind, provider: provider || null, payload });
  if (error) redirect(`/app/productions/${productionId}?error=handoff`); revalidatePath(`/app/productions/${productionId}`); redirect(`/app/productions/${productionId}`);
}

export async function compileProductionDnaSheet(formData: FormData) {
  const productionId = textField(formData, "production_id"); if (!productionId) redirect("/app?error=dna-sheet");
  const { supabase, id } = await workspace();
  const { data: cast, error: castError } = await supabase.from("production_dna").select("role, dna_records(dna_id, dna_type, version, locked, record)").eq("production_id", productionId).eq("workspace_id", id);
  if (castError) redirect(`/app/productions/${productionId}?error=dna-sheet`);
  const sheet = { compiled_at: new Date().toISOString(), entities: cast ?? [] };
  const { error } = await supabase.from("production_dna_sheets").upsert({ workspace_id: id, production_id: productionId, entity_key: "master", version: 1, sheet }, { onConflict: "production_id,entity_key,version" });
  if (error) redirect(`/app/productions/${productionId}?error=dna-sheet`); revalidatePath(`/app/productions/${productionId}`); redirect(`/app/productions/${productionId}`);
}

export async function decideProductionApproval(formData: FormData) {
  const productionId = textField(formData, "production_id"); const approvalId = textField(formData, "approval_id"); const decision = String(formData.get("decision") ?? "");
  if (!productionId || !approvalId || !["approved", "rejected"].includes(decision)) redirect(`/app/productions/${productionId ?? ""}?error=approval`);
  const { supabase, id } = await workspace(); const { error } = await supabase.rpc("decide_production_approval", { target_workspace: id, target_approval: approvalId, decision, decision_note: text(formData, "note").slice(0, 2_000) });
  if (error) redirect(`/app/productions/${productionId}?error=approval`);
  revalidatePath(`/app/productions/${productionId}`); redirect(`/app/productions/${productionId}`);
}

export async function createDnaRecord(formData: FormData) {
  const recordType = String(formData.get("dna_type") ?? ""); const name = textField(formData, "name"); const summary = textField(formData, "summary", 5_000); const group = text(formData, "group_type");
  if (!name || !summary || !["CDNA", "LDNA", "PDNA"].includes(recordType)) redirect("/app/universe?error=record");
  const { supabase, id } = await workspace(); const { error } = await supabase.rpc("create_dna_record", { target_workspace: id, record_type: recordType, record_name: name, record_summary: summary });
  if (error) redirect("/app/universe?error=record");
  const { data: created } = await supabase.from("dna_records").select("id, record").eq("workspace_id", id).eq("record->>name", name).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (created) {
    const body = (created.record as Record<string, unknown> | null) ?? {};
    await supabase.from("dna_records").update({ group_type: ["Universe", "Studio", "Channel", "Season", "Socials", "FDNA"].includes(group) ? group : "Universe", record: { ...body, anchors: text(formData, "anchors").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 20), voice_behavior: text(formData, "voice_behavior").slice(0, 500) } }).eq("id", created.id).eq("workspace_id", id);
  }
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

export async function promoteDnaRecord(formData: FormData) {
  const recordId = textField(formData, "record_id");
  const reason = textField(formData, "reason", 1_000);
  if (!recordId || !reason) redirect("/app/universe?error=promotion");
  const { supabase, id } = await workspace();
  const { error } = await supabase.rpc("promote_dna_record", { target_workspace: id, target_record: recordId, promotion_reason: reason });
  if (error) redirect(`/app/universe/${recordId}?error=promotion`);
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
  const { supabase, id: workspaceId } = await workspace();
  const { error } = await supabase.from("workflows").delete().eq("id", workflowId).eq("workspace_id", workspaceId);
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
  const payloadMapping = jsonObject(formData.get("payload_mapping"));
  const { supabase, id } = await workspace();
  const [{ data: workflow }, { data: max }] = await Promise.all([supabase.from("workflows").select("id").eq("id", workflowId).eq("workspace_id", id).maybeSingle(), supabase.from("handoff_rules").select("position").eq("workflow_id", workflowId).order("position", { ascending: false }).limit(1).maybeSingle()]);
  if (!workflow) redirect("/app/orchestration?error=handoff");
  const nodeTable = (kind: string) => kind === "lane" ? "lanes" : "agents";
  const [{ data: sourceNode }, { data: targetNode }] = await Promise.all([
    supabase.from(nodeTable(source[0])).select("id").eq("id", source[1]).eq("workspace_id", id).maybeSingle(),
    supabase.from(nodeTable(target[0])).select("id").eq("id", target[1]).eq("workspace_id", id).maybeSingle(),
  ]);
  if (!sourceNode || !targetNode) redirect("/app/orchestration?error=handoff");
  const position = (max?.position ?? -1) + 1;
  const handoff = { workspace_id: id, workflow_id: workflowId, position, source_kind: source[0], source_lane_id: source[0] === "lane" ? source[1] : null, source_agent_id: source[0] === "agent" ? source[1] : null, target_kind: target[0], target_lane_id: target[0] === "lane" ? target[1] : null, target_agent_id: target[0] === "agent" ? target[1] : null, trigger_event: trigger, conditions, payload_mapping: payloadMapping };
  const { error } = await supabase.from("handoff_rules").insert(handoff);
  if (error) redirect("/app/orchestration?error=handoff"); revalidatePath("/app/orchestration"); redirect("/app/orchestration");
}

export async function updateChannel(formData: FormData) {
  const channelId = textField(formData, "channel_id"); const name = text(formData, "name");
  if (!channelId || !valid(name)) redirect(`/app/channels/${channelId ?? ""}?error=channel`);
  const { supabase, id: workspaceId } = await workspace();
  const pillars = text(formData, "pillars").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 12);
  const { error } = await supabase.from("channels").update({ name, audience: text(formData, "audience").slice(0, 500), voice: text(formData, "voice").slice(0, 500), cadence: text(formData, "cadence").slice(0, 120), pillars }).eq("id", channelId).eq("workspace_id", workspaceId);
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

export async function createDefaultWorkflow() {
  const { supabase, id } = await workspace();
  const { data: template } = await supabase.from("workflow_templates").select("version, name, definition").eq("key", "gem-studio-default").maybeSingle();
  const { data: existing } = await supabase.from("workflows").select("id").eq("workspace_id", id).eq("template_key", "gem-studio-default").maybeSingle();
  if (!existing) {
    const { error } = await supabase.from("workflows").insert({ workspace_id: id, name: template?.name ?? "Gem Studio default", description: "Owner baseline 13-stage workflow template.", template_key: "gem-studio-default", template_version: template?.version ?? "1.0.0", definition: template?.definition ?? {} });
    if (error) redirect("/app/orchestration?error=workflow");
  }
  revalidatePath("/app/orchestration"); redirect("/app/orchestration");
}

export async function saveOnboardingStep(formData: FormData) {
  const step = text(formData, "step");
  if (!["identity", "channel", "hiring", "complete"].includes(step)) redirect("/app/onboarding?error=step");
  const mode = text(formData, "mode") === "fast" ? "fast" : "guided";
  const payload = Object.fromEntries([...formData.entries()].filter(([key]) => !["step", "mode", "payload"].includes(key)).map(([key, value]) => [key, String(value).slice(0, 2_000)]));
  const { supabase, id } = await workspace();
  const { data: current } = await supabase.from("onboarding_profiles").select("step").eq("workspace_id", id).maybeSingle();
  if (!nextOnboardingStep((current?.step as "identity" | "channel" | "hiring" | "complete" | null) ?? null, step as "identity" | "channel" | "hiring" | "complete")) redirect("/app/onboarding?error=order");
  if (step === "identity") {
    const studioName = String(payload.studio_name ?? "").trim();
    if (!studioName) redirect("/app/onboarding?error=identity");
    const { error } = await supabase.rpc("rename_studio", { target_workspace: id, studio_name: studioName });
    if (error) redirect("/app/onboarding?error=save");
  }
  if (step === "channel") {
    const channelName = String(payload.channel_name ?? "").trim();
    if (!channelName) redirect("/app/onboarding?error=channel");
    const { error } = await supabase.from("channels").insert({ workspace_id: id, name: channelName, audience: String(payload.season_scope ?? ""), voice: String(payload.format ?? "") });
    if (error && !error.message.includes("duplicate")) redirect("/app/onboarding?error=channel");
  }
  if (step === "hiring") {
    const names = String(payload.departments ?? "Marketing, Creative, Production, Social").split(",").map((name) => name.trim()).filter(Boolean).slice(0, 12);
    const { error } = await supabase.from("departments").upsert(names.map((name, index) => ({ workspace_id: id, name, display_order: index })), { onConflict: "workspace_id,name" });
    if (error) redirect("/app/onboarding?error=hiring");
  }
  if (step === "complete") {
    const { data: existingWorkflow } = await supabase.from("workflows").select("id").eq("workspace_id", id).eq("template_key", "gem-studio-default").maybeSingle();
    if (!existingWorkflow) {
      const { data: template } = await supabase.from("workflow_templates").select("version, name, definition").eq("key", "gem-studio-default").maybeSingle();
      await supabase.from("workflows").insert({ workspace_id: id, name: template?.name ?? "Gem Studio default", description: "Owner baseline workflow template.", template_key: "gem-studio-default", template_version: template?.version ?? "1.0.0", definition: template?.definition ?? {} });
    }
  }
  const { error } = await supabase.from("onboarding_profiles").upsert({ workspace_id: id, mode, step, ...(step === "identity" ? { studio_identity: payload } : {}), ...(step === "channel" ? { channel_setup: payload } : {}), ...(step === "hiring" ? { department_setup: payload } : {}), ...(step === "complete" ? { completed_at: new Date().toISOString() } : {}), updated_at: new Date().toISOString() });
  if (error) redirect("/app/onboarding?error=save");
  revalidatePath("/app/onboarding"); redirect(step === "complete" ? "/app" : `/app/onboarding?step=${step === "identity" ? "channel" : step === "channel" ? "hiring" : "complete"}`);
}


export async function deleteHandoffRule(formData: FormData) {
  const ruleId = text(formData, "rule_id"); if (!ruleId) redirect("/app/orchestration?error=handoff");
  const { supabase, id: workspaceId } = await workspace(); const { error } = await supabase.from("handoff_rules").delete().eq("id", ruleId).eq("workspace_id", workspaceId);
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
