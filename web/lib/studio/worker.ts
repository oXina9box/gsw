import { createWriteStream } from "node:fs";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ASSEMBLY_CLIP_MIME, MAX_CLIP_BYTES, normalizeProviderBaseUrl } from "./domain";
import { assemblyArguments, MAX_MASTER_BYTES } from "./ffmpeg";
import { decryptSecret, resolveSecretKey } from "./secrets";
import { parseGenPlayShots } from "./genplay";
import { createStudioTrace, type StudioTraceContext } from "./langfuse";

type Job = {
  id: string;
  workspace_id: string;
  production_id: string | null;
  kind: string;
  payload: Record<string, unknown>;
  credit_reservation: number;
};

type Connection = {
  id: string;
  base_url: string;
  default_model: string | null;
  provider_secrets: { ciphertext: string; iv: string; tag: string; key_version: string } | { ciphertext: string; iv: string; tag: string; key_version: string }[];
};

type AgentContext = { id: string; name: string; version: string | null; prompt: string; protected: boolean; catalogAgentId: string | null };
type Provenance = { artifact_ids: string[]; dna_ids: string[]; agent_id?: string; provider_connection_id?: string };
const MAX_ASSEMBLY_BYTES = 1024 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 60_000;
const DOWNLOAD_CONCURRENCY = 8;
const FFMPEG_TIMEOUT_MS = 150_000;

async function request(baseUrl: string, route: string, key: string, body: Record<string, unknown>) {
  const endpoint = new URL(route, `${baseUrl}/`);
  if (endpoint.origin !== new URL(baseUrl).origin) throw new Error("Provider route escaped its approved origin");
  const response = await fetch(endpoint, { method: "POST", redirect: "error", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(`Provider returned ${response.status}`);
  return response;
}

async function readLimited(response: Response, maxBytes: number) {
  const declared = Number(response.headers.get("content-length") ?? "0");
  if (declared > maxBytes) throw new Error("Provider response is too large");
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw new Error("Provider response is too large"); }
    chunks.push(value);
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
  return result;
}

async function readJson<T>(response: Response, maxBytes: number) {
  return JSON.parse(new TextDecoder().decode(await readLimited(response, maxBytes))) as T;
}

function run(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"], env: { PATH: process.env.PATH ?? "/usr/bin:/bin", NODE_ENV: process.env.NODE_ENV ?? "production" } });
    let error = "";
    let settled = false;
    const finish = (callback: () => void) => { if (!settled) { settled = true; clearTimeout(timer); callback(); } };
    const timer = setTimeout(() => { child.kill("SIGKILL"); finish(() => reject(new Error("FFmpeg timed out"))); }, FFMPEG_TIMEOUT_MS);
    child.stderr.on("data", (chunk: Buffer) => { error = `${error}${String(chunk)}`.slice(-2_000); });
    child.on("error", (caught) => finish(() => reject(caught)));
    child.on("close", (code: number | null) => finish(() => code === 0 && !error.trim() ? resolve() : reject(new Error(error || `${command} exited ${code}`))));
  });
}

async function downloadClips(admin: SupabaseClient, job: Job, signed: { signedUrl?: string | null }[], directory: string) {
  const configuredStorage = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!configuredStorage) throw new Error("Storage origin is not configured");
  const storageOrigin = new URL(configuredStorage).origin;
  const signal = AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS);
  const localFiles = Array<string>(signed.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(DOWNLOAD_CONCURRENCY, signed.length) }, async () => {
    while (cursor < signed.length) {
      const index = cursor++;
      const item = signed[index];
      await ensureProductionActive(admin, job);
      if (!item.signedUrl) throw new Error("Could not sign selected clip");
      const endpoint = new URL(item.signedUrl);
      if (endpoint.origin !== storageOrigin) throw new Error("Storage URL has an untrusted origin");
      const response = await fetch(endpoint, { redirect: "error", signal });
      if (!response.ok || !response.body) throw new Error("Could not download selected clip");
      const local = path.join(directory, `${String(index).padStart(4, "0")}.mp4`);
      await pipeline(Readable.fromWeb(response.body as never), createWriteStream(local, { flags: "wx" }), { signal });
      localFiles[index] = local;
    }
  }));
  return localFiles;
}

async function loadProduction(admin: SupabaseClient, job: Job) {
  if (!job.production_id) throw new Error("Production is required");
  const { data, error } = await admin.from("productions").select("id, title, brief, audience, current_step, status").eq("id", job.production_id).eq("workspace_id", job.workspace_id).single();
  if (error || !data || data.status !== "active") throw new Error("Production is not active");
  return data;
}

async function ensureProductionActive(admin: SupabaseClient, job: Job) {
  const { data } = await admin.from("productions").select("id").eq("id", job.production_id).eq("workspace_id", job.workspace_id).eq("status", "active").maybeSingle();
  if (!data) throw new Error("Production was paused or archived");
}

async function loadConnection(admin: SupabaseClient, workspaceId: string, capability: string, connectionId: string, encodedKey: string) {
  const { data, error } = await admin.from("provider_connections").select("id, base_url, default_model, provider_secrets(ciphertext, iv, tag, key_version)").eq("id", connectionId).eq("workspace_id", workspaceId).eq("status", "active").contains("capabilities", [capability]).maybeSingle();
  if (error || !data?.base_url) throw new Error(`No active ${capability} provider`);
  const connection = data as Connection;
  const secret = Array.isArray(connection.provider_secrets) ? connection.provider_secrets[0] : connection.provider_secrets;
  if (!secret) throw new Error("Provider secret not found");
  if (!connection.default_model) throw new Error("Provider model is not configured");
  const allowedHosts = (process.env.PROVIDER_HOST_ALLOWLIST ?? "").split(",").map((host) => host.trim().toLowerCase()).filter(Boolean);
  const decryptionKey = resolveSecretKey(secret.key_version, process.env.PROVIDER_SECRET_KEY_VERSION ?? "v1", encodedKey, process.env.PROVIDER_SECRET_KEYS_JSON);
  return { id: connection.id, baseUrl: normalizeProviderBaseUrl(connection.base_url, process.env.NODE_ENV !== "production", allowedHosts), model: connection.default_model, apiKey: decryptSecret({ ciphertext: secret.ciphertext, iv: secret.iv, tag: secret.tag, keyVersion: secret.key_version }, decryptionKey) };
}

async function requestProtectedAgent(agent: AgentContext, capability: string, task: string, context: string) {
  if (!agent.protected || !agent.catalogAgentId) throw new Error("Protected agent identity is unavailable");
  const rawBaseUrl = process.env.PROTECTED_INFERENCE_BASE_URL;
  const key = process.env.PROTECTED_INFERENCE_KEY;
  if (!rawBaseUrl || !key) throw new Error("Protected inference is not configured");
  const hosts = (process.env.PROTECTED_INFERENCE_HOST_ALLOWLIST ?? "").split(",").map((host) => host.trim().toLowerCase()).filter(Boolean);
  const baseUrl = normalizeProviderBaseUrl(rawBaseUrl, process.env.NODE_ENV !== "production", hosts);
  return request(baseUrl, "v1/run", key, { catalog_agent_id: agent.catalogAgentId, catalog_version: agent.version, capability, task, approved_context: context });
}

async function loadAgentContext(admin: SupabaseClient, workspaceId: string, step: number, capability: string, agentId: string): Promise<AgentContext> {
  const { data: department } = await admin.from("departments").select("id").eq("workspace_id", workspaceId).eq("display_order", step).maybeSingle();
  if (!department) throw new Error("Production department is not configured");
  const { data: agent } = await admin.from("agents").select("id, lane_id, name, catalog_agent_id, catalog_version, protected_config, capabilities").eq("id", agentId).eq("workspace_id", workspaceId).maybeSingle();
  const { data: lane } = agent ? await admin.from("lanes").select("department_id").eq("id", agent.lane_id).eq("workspace_id", workspaceId).maybeSingle() : { data: null };
  if (!agent || lane?.department_id !== department.id || !Array.isArray(agent.capabilities) || !agent.capabilities.includes(capability)) throw new Error(`Selected ${capability} agent is not available for this department`);
  if (agent.protected_config) {
    if (!agent.catalog_agent_id) throw new Error("Protected agent catalog identity is unavailable");
    const { data: entitlement } = await admin.from("agent_entitlements").select("catalog_agent_id").eq("workspace_id", workspaceId).eq("catalog_agent_id", agent.catalog_agent_id).maybeSingle();
    if (!entitlement) throw new Error("Protected agent entitlement is unavailable");
    return { id: agent.id, name: agent.name, version: agent.catalog_version, prompt: "", protected: true, catalogAgentId: agent.catalog_agent_id };
  }
  const source = await admin.from("agent_files").select("role, soul, jobdescription, skills, memory, user_content").eq("agent_id", agent.id).maybeSingle();
  if (source.error || !source.data) throw new Error("Agent configuration is unavailable");
  const files = source.data as Record<string, string>;
  const prompt = ["ROLE", files.role, "SOUL", files.soul, "JOB DESCRIPTION", files.jobdescription, "SKILLS", files.skills, "MEMORY", files.memory, "OWNER CONTEXT", files.user_content].join("\n\n").slice(0, 80_000);
  return { id: agent.id, name: agent.name, version: agent.catalog_version, prompt, protected: false, catalogAgentId: agent.catalog_agent_id };
}

async function loadHandoffContext(admin: SupabaseClient, job: Job, step: number) {
  const [artifactResult, castingResult] = await Promise.all([
    admin.from("production_artifacts").select("id, department_step, kind, version, content, checksum").eq("production_id", job.production_id).eq("workspace_id", job.workspace_id).lt("department_step", step).in("status", ["approved", "locked"]).order("department_step", { ascending: false }).order("version", { ascending: false }).limit(24),
    admin.from("production_dna").select("role, dna_records(dna_id, dna_type, version, locked, record)").eq("production_id", job.production_id).eq("workspace_id", job.workspace_id).limit(100),
  ]);
  if (artifactResult.error || castingResult.error) throw new Error("Approved production context is unavailable");
  const artifacts = artifactResult.data;
  const casting = castingResult.data;
  const cast = (casting ?? []).map((item) => ({ role: item.role, record: item.dna_records }));
  const prompt = JSON.stringify({ approved_handoffs: artifacts ?? [], continuity_cast: cast }).slice(0, 40_000);
  const dnaIds = cast.flatMap((item) => {
    const record = item.record as { dna_id?: string } | { dna_id?: string }[] | null;
    return Array.isArray(record) ? record.map((value) => value.dna_id).filter((value): value is string => Boolean(value)) : record?.dna_id ? [record.dna_id] : [];
  });
  return { prompt, provenance: { artifact_ids: (artifacts ?? []).map((item) => item.id), dna_ids: dnaIds } satisfies Provenance };
}

async function nextArtifactVersion(admin: SupabaseClient, productionId: string, kind: string) {
  const { data } = await admin.from("production_artifacts").select("version").eq("production_id", productionId).eq("kind", kind).order("version", { ascending: false }).limit(1).maybeSingle();
  return (data?.version ?? 0) + 1;
}

async function saveArtifact(admin: SupabaseClient, job: Job, step: number, kind: string, content: Record<string, unknown>, storagePath?: string) {
  const version = await nextArtifactVersion(admin, job.production_id!, kind);
  const { data, error } = await admin.from("production_artifacts").upsert({ workspace_id: job.workspace_id, production_id: job.production_id, department_step: step, kind, version, status: "draft", content, storage_path: storagePath ?? null, job_id: job.id }, { onConflict: "job_id" }).select("id").single();
  if (error || !data) throw new Error("Could not save generated artifact");
  return data.id as string;
}

async function storeMedia(admin: SupabaseClient, job: Job, kind: string, mime: string, bytes: Uint8Array) {
  const extension = mime === "audio/mpeg" ? "mp3" : mime === "audio/wav" ? "wav" : "png";
  const storagePath = `workspace/${job.workspace_id}/production/${job.production_id}/generated/${job.id}.${extension}`;
  const { error } = await admin.storage.from("creative-assets").upload(storagePath, bytes, { contentType: mime, upsert: true });
  if (error) throw new Error("Could not store generated media");
  try { await ensureProductionActive(admin, job); } catch (caught) { await admin.storage.from("creative-assets").remove([storagePath]); throw caught; }
  const { error: metadataError } = await admin.from("generated_assets").upsert({ workspace_id: job.workspace_id, production_id: job.production_id, kind, status: "ready", storage_path: storagePath, job_id: job.id, metadata: { mime_type: mime, byte_size: bytes.byteLength } }, { onConflict: "job_id" });
  if (metadataError) { await admin.storage.from("creative-assets").remove([storagePath]); throw new Error("Could not register generated media"); }
  return storagePath;
}
async function generate(admin: SupabaseClient, job: Job, encodedKey: string) {
  const production = await loadProduction(admin, job);
  const capability = job.kind.replace("generate_", "");
  const agentId = typeof job.payload.agent_id === "string" ? job.payload.agent_id : "";
  const connectionId = typeof job.payload.connection_id === "string" ? job.payload.connection_id : "";
  if (!agentId) throw new Error("Job role assignment is missing");
  const agent = await loadAgentContext(admin, job.workspace_id, production.current_step, capability, agentId);
  const connection = agent.protected ? null : await loadConnection(admin, job.workspace_id, capability, connectionId, encodedKey);
  const handoff = await loadHandoffContext(admin, job, production.current_step);
  const provenance = { ...handoff.provenance, agent_id: agent.id, provider_connection_id: connection?.id ?? "protected-runtime" };
  const suppliedPrompt = typeof job.payload.prompt === "string" ? job.payload.prompt.slice(0, 20_000) : "";
  const prompt = suppliedPrompt || `Production: ${production.title}\nAudience: ${production.audience}\nBrief: ${production.brief}\nCreate the next concrete ${capability} deliverable for department stage ${production.current_step + 1}.`;
  const agentPrompt = agent.prompt.slice(0, 40_000);
  const taskPrompt = prompt.slice(0, 20_000);
  const rolePrompt = `${agentPrompt}\n\nAPPROVED HANDOFFS AND CONTINUITY DNA\n${handoff.prompt}\n\nTASK\n${taskPrompt}`;
  const tracerContext: StudioTraceContext = {
    jobId: job.id,
    jobKind: job.kind,
    workspaceId: job.workspace_id,
    productionId: production.id,
    productionTitle: production.title,
    step: production.current_step,
    agent: { id: agent.id, name: agent.name, version: agent.version },
    model: connection?.model ?? "protected-runtime",
    providerConnectionId: connection?.id ?? "protected-runtime",
    taskPrompt,
  };
  const tracer = createStudioTrace(tracerContext);
  if (job.kind === "generate_text") {
    const genplay = production.current_step === 7;
    const system = genplay
      ? "Convert the approved screenplay into detailed video-generation shots. Return only JSON: {\"shots\":[{\"prompt\":\"camera, subject, action, setting, light, continuity, audio intent\",\"duration_ms\":4000}]}. Every prompt must stand alone and preserve character, location, prop, wardrobe, screen-direction, and lighting continuity."
      : "You are a Gem Studio production agent. Preserve continuity, rights constraints, and uncertainty. Return only the useful deliverable.";
    const systemWithAgent = `${system}\n\nYour hired role files follow:\n${agentPrompt}\n\nApproved prior handoffs and continuity DNA:\n${handoff.prompt}`;
    const response = agent.protected
      ? await requestProtectedAgent(agent, capability, taskPrompt, handoff.prompt)
      : await request(connection!.baseUrl, "chat/completions", connection!.apiKey, { model: connection!.model, messages: [{ role: "system", content: systemWithAgent }, { role: "user", content: taskPrompt }] });
    const data = await readJson<{ text?: string; choices?: { message?: { content?: string } }[] }>(response, 5 * 1024 * 1024);
    const content = agent.protected ? data.text : data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Provider returned no text");
    await ensureProductionActive(admin, job);
    const systemPromptHash = createHash("sha256").update(systemWithAgent).digest("hex").slice(0, 16);
    const taskPromptHash = createHash("sha256").update(taskPrompt).digest("hex").slice(0, 16);
    const contentHash = createHash("sha256").update(content).digest("hex").slice(0, 16);
    tracer.recordGeneration({
      name: "studio.generate_text",
      model: connection?.model ?? "protected-runtime",
      input: { system_prompt_hash: systemPromptHash, task_prompt_hash: taskPromptHash },
      output: { content_hash: contentHash },
    });
    try {
    if (genplay) {
      const shots = parseGenPlayShots(content);
      const checksum = createHash("sha256").update(JSON.stringify(shots)).digest("hex");
      const { data: contract, error: contractError } = await admin.rpc("save_genplay_contract", { target_workspace: job.workspace_id, target_production: production.id, target_job: job.id, shot_contract: shots, contract_checksum: checksum, context_provenance: provenance });
      if (contractError || !contract) throw new Error("Could not save GenPlay contract");
      await tracer.end({ output: { shots } });
      return contract as Record<string, unknown>;
    }
    const artifactId = await saveArtifact(admin, job, production.current_step, "text_handoff", { text: content, provider_model: connection?.model ?? "protected-runtime", agent_id: agent.id, agent_name: agent.name, agent_version: agent.version, provenance });
    await tracer.end({ output: { artifact_id: artifactId } });
    return { artifact_id: artifactId, agent_id: agent.id };
    } catch (error: unknown) {
      tracer.recordError(error);
      throw error;
    }
  }
  if (job.kind === "generate_image") {
    const response = agent.protected
      ? await requestProtectedAgent(agent, capability, taskPrompt, handoff.prompt)
      : await request(connection!.baseUrl, "images/generations", connection!.apiKey, { model: connection!.model, prompt: rolePrompt, response_format: "b64_json", size: "1024x1024" });
    const data = await readJson<{ data_base64?: string; revised_prompt?: string; data?: { b64_json?: string; revised_prompt?: string }[] }>(response, 30 * 1024 * 1024);
    const encoded = agent.protected ? data.data_base64 : data.data?.[0]?.b64_json;
    if (!encoded) throw new Error("Provider returned no image");
    const bytes = Buffer.from(encoded, "base64");
    await ensureProductionActive(admin, job);
    const storagePath = await storeMedia(admin, job, "image", "image/png", bytes);
    const artifactId = await saveArtifact(admin, job, production.current_step, "image", { revised_prompt: data.revised_prompt ?? data.data?.[0]?.revised_prompt ?? null, agent_id: agent.id, agent_name: agent.name, agent_version: agent.version, provenance }, storagePath);
    const rolePromptHash = createHash("sha256").update(rolePrompt).digest("hex").slice(0, 16);
    tracer.recordGeneration({
      name: "studio.generate_image",
      model: connection?.model ?? "protected-runtime",
      input: { prompt_hash: rolePromptHash },
      output: { storage_path: storagePath },
    });
    await tracer.end({ output: { artifact_id: artifactId, storage_path: storagePath } });
    return { artifact_id: artifactId, storage_path: storagePath, agent_id: agent.id };
  }
  const response = agent.protected
    ? await requestProtectedAgent(agent, capability, taskPrompt, handoff.prompt)
    : await request(connection!.baseUrl, "audio/speech", connection!.apiKey, { model: connection!.model, input: rolePrompt, voice: typeof job.payload.voice === "string" ? job.payload.voice : "alloy", response_format: "mp3" });
  const protectedAudio = agent.protected ? await readJson<{ data_base64?: string; mime_type?: string }>(response, 70 * 1024 * 1024) : null;
  const bytes = protectedAudio ? Buffer.from(protectedAudio.data_base64 ?? "", "base64") : await readLimited(response, 50 * 1024 * 1024);
  if (!bytes.byteLength) throw new Error("Provider returned no audio");
  await ensureProductionActive(admin, job);
  const responseMime = protectedAudio?.mime_type ?? response.headers.get("content-type")?.split(";")[0];
  const audioMime = responseMime === "audio/wav" ? "audio/wav" : "audio/mpeg";
  const storagePath = await storeMedia(admin, job, "audio", audioMime, bytes);
  const artifactId = await saveArtifact(admin, job, production.current_step, "audio", { agent_id: agent.id, agent_name: agent.name, agent_version: agent.version, provenance }, storagePath);
    const audioPromptHash = createHash("sha256").update(rolePrompt).digest("hex").slice(0, 16);
    tracer.recordGeneration({
      name: "studio.generate_audio",
      model: connection?.model ?? "protected-runtime",
      input: { prompt_hash: audioPromptHash },
      output: { storage_path: storagePath },
    });
  await tracer.end({ output: { artifact_id: artifactId, storage_path: storagePath } });
  return { artifact_id: artifactId, storage_path: storagePath, agent_id: agent.id };
}
async function assemble(admin: SupabaseClient, job: Job) {
  const production = await loadProduction(admin, job);
  const { data: shots, error } = await admin.from("genplay_shots").select("id, shot_number, shot_clips(storage_path, selected, byte_size, mime_type)").eq("production_id", production.id).eq("workspace_id", job.workspace_id).order("shot_number");
  if (error || !shots?.length) throw new Error("No GenPlay shots found");
  const selected = shots.map((shot) => { const clips = shot.shot_clips as { storage_path: string; selected: boolean; byte_size: number; mime_type: string }[]; return clips?.find((clip) => clip.selected); });
  if (selected.reduce((total, clip) => total + (clip?.byte_size ?? 0), 0) > MAX_ASSEMBLY_BYTES) throw new Error("Selected clips exceed the 1 GB assembly limit");
  if (selected.some((clip) => !clip || clip.mime_type !== ASSEMBLY_CLIP_MIME || clip.byte_size <= 0 || clip.byte_size > MAX_CLIP_BYTES)) throw new Error("Every selected clip must be an MP4 up to 100 MB");
  const paths = selected.map((clip) => clip?.storage_path);
  if (paths.some((item) => !item)) throw new Error("Every shot needs one selected clip");
  const { data: signed, error: signError } = await admin.storage.from("creative-assets").createSignedUrls(paths as string[], 300);
  if (signError || !signed?.length) throw new Error("Could not access selected clips");
  const directory = await mkdtemp(path.join(tmpdir(), "gem-studio-"));
  try {
    const localFiles = await downloadClips(admin, job, signed, directory);
    const manifest = path.join(directory, "concat.txt");
    await writeFile(manifest, localFiles.map((item) => `file '${item.replaceAll("'", "'\\''")}'`).join("\n"));
    const output = path.join(directory, "master.mp4");
    await ensureProductionActive(admin, job);
    await run(process.env.FFMPEG_PATH || "ffmpeg", assemblyArguments(manifest, output));
    if ((await stat(output)).size >= MAX_MASTER_BYTES * 0.99) throw new Error("Assembled master reached the 100 MB limit");
    const bytes = await readFile(output);
    await ensureProductionActive(admin, job);
    const storagePath = `workspace/${job.workspace_id}/production/${production.id}/masters/${job.id}.mp4`;
    const { error: uploadError } = await admin.storage.from("creative-assets").upload(storagePath, bytes, { contentType: "video/mp4", upsert: true });
    if (uploadError) throw new Error("Could not store assembled master");
    try { await ensureProductionActive(admin, job); } catch (caught) { await admin.storage.from("creative-assets").remove([storagePath]); throw caught; }
    const { error: assetError } = await admin.from("generated_assets").upsert({ workspace_id: job.workspace_id, production_id: production.id, kind: "video_master", status: "ready", storage_path: storagePath, job_id: job.id, metadata: { shot_count: shots.length } }, { onConflict: "job_id" });
    if (assetError) { await admin.storage.from("creative-assets").remove([storagePath]); throw new Error("Could not register assembled master"); }
    const artifactId = await saveArtifact(admin, job, 8, "video_master", { shot_count: shots.length, provenance: { shot_ids: shots.map((shot) => shot.id), clip_paths: paths } }, storagePath);
    return { artifact_id: artifactId, storage_path: storagePath };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

export async function executeStudioJob(admin: SupabaseClient, job: Job, encodedKey: string) {
  if (["generate_text", "generate_image", "generate_audio"].includes(job.kind)) return generate(admin, job, encodedKey);
  if (job.kind === "assemble_master") return assemble(admin, job);
  throw new Error(`${job.kind} adapter is not configured`);
}
