import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { encryptSecret } from "./secrets";
import { executeStudioJob } from "./worker";

const ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");

type QueryResult = { data: unknown; error: Error | null };
type AssemblyClip = { path: string; bytes: Uint8Array };
type Fixture = { step?: number; protectedAgent?: boolean; assemblyClips?: AssemblyClip[]; fault?: string };
const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
const ffmpegAvailable = spawnSync(ffmpeg, ["-version"], { stdio: "ignore" }).status === 0;

function fakeAdmin({ step = 0, protectedAgent = false, assemblyClips = [], fault = "" }: Fixture = {}) {
  const envelope = encryptSecret("provider-secret", ENCRYPTION_KEY, "v1");
  const state = {
    queried: [] as string[],
    upserts: [] as { table: string; value: unknown }[],
    uploads: [] as { path: string; contentType?: string }[],
    rpc: [] as { name: string; args: Record<string, unknown> }[],
    statusFilters: [] as (readonly unknown[])[],
  };

  class Query implements PromiseLike<QueryResult> {
    private columns = "";
    private operation = "select";

    constructor(private readonly table: string) { state.queried.push(table); }
    select(columns = "*") { this.columns = columns; return this; }
    eq() { return this; }
    contains() { return this; }
    lt() { return this; }
    order() { return this; }
    in(_field: string, values: readonly unknown[]) { state.statusFilters.push(values); return this; }
    limit() { return this; }
    upsert(value: unknown) { this.operation = "upsert"; state.upserts.push({ table: this.table, value }); return this; }
    single() { return Promise.resolve(this.result()); }
    maybeSingle() { return Promise.resolve(this.result()); }
    then<TResult1 = QueryResult, TResult2 = never>(
      onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ): Promise<TResult1 | TResult2> { return Promise.resolve(this.result()).then(onfulfilled, onrejected); }

    private result(): QueryResult {
      if (this.table === "productions") {
        if (this.columns === "id" && fault === "ensure-inactive") return { data: null, error: null };
        if (fault === "production-error") return { data: null, error: new Error("query") };
        if (fault === "production-missing") return { data: null, error: null };
        return { data: { id: "production-1", title: "Film", brief: "A precise brief", audience: "Collectors", current_step: step, status: fault === "production-paused" ? "paused" : "active" }, error: null };
      }
      if (this.table === "departments") return { data: fault === "department-missing" ? null : { id: `department-${step}` }, error: null };
      if (this.table === "agents") return { data: fault === "agent-missing" ? null : { id: "agent-1", lane_id: "lane-1", name: "Role", catalog_agent_id: protectedAgent && fault !== "catalog-missing" ? "catalog-1" : null, catalog_version: "1.0.0", protected_config: protectedAgent, capabilities: fault === "capability-missing" ? [] : ["text", "image", "audio"] }, error: null };
      if (this.table === "lanes") return { data: { department_id: fault === "wrong-lane" ? "wrong" : `department-${step}` }, error: null };
      if (this.table === "agent_entitlements") return { data: fault === "entitlement-missing" ? null : { catalog_agent_id: "catalog-1" }, error: null };
      if (this.table === "agent_files") return { data: fault === "agent-files-missing" ? null : { role: "Director", soul: "Patient", jobdescription: "Make the handoff", skills: "Continuity", memory: "Approved only", user_content: "Owner note" }, error: fault === "agent-files-error" ? new Error("query") : null };
      if (this.table === "provider_connections") {
        if (fault === "provider-error") return { data: null, error: new Error("query") };
        if (fault === "provider-missing") return { data: null, error: null };
        const secret = { ciphertext: envelope.ciphertext, iv: envelope.iv, tag: envelope.tag, key_version: envelope.keyVersion };
        return { data: { id: "connection-1", base_url: "https://provider.example.test", default_model: fault === "provider-model-missing" ? null : "model-1", provider_secrets: fault === "provider-secret-missing" ? [] : fault === "provider-secret-array" ? [secret] : secret }, error: null };
      }
      if (this.table === "production_artifacts") {
        if (this.operation === "upsert") return { data: fault === "artifact-save-error" ? null : { id: "artifact-new" }, error: fault === "artifact-save-error" ? new Error("save") : null };
        if (this.columns === "version") return { data: fault === "existing-version" ? { version: 2 } : null, error: null };
        return { data: step ? [{ id: "artifact-prior", department_step: step - 1, kind: "handoff", version: 1, content: { approved: true }, checksum: "abc" }] : [], error: fault === "handoff-artifact-error" ? new Error("query") : null };
      }
      if (this.table === "production_dna") return { data: step ? [{ role: "character", dna_records: { dna_id: "CHAR-1", dna_type: "CDNA", version: 1, locked: true, record: { name: "Gem" } } }] : [], error: fault === "casting-error" ? new Error("query") : null };
      if (this.table === "genplay_shots") return { data: assemblyClips.map((clip, index) => ({ id: `shot-${index + 1}`, shot_number: index + 1, shot_clips: [{ storage_path: clip.path, selected: true, byte_size: clip.bytes.byteLength, mime_type: "video/mp4" }] })), error: null };
      if (this.table === "generated_assets") return { data: null, error: fault === "metadata-error" ? new Error("save") : null };
      return { data: null, error: null };
    }
  }

  const admin = {
    from: (table: string) => new Query(table),
    storage: { from: () => ({
      upload: async (path: string, _bytes: Uint8Array, options?: { contentType?: string }) => { state.uploads.push({ path, contentType: options?.contentType }); return { error: fault === "media-upload-error" ? new Error("upload") : null }; },
      remove: async () => ({ error: null }),
      createSignedUrls: async (paths: string[]) => ({ data: paths.map((_path, index) => ({ signedUrl: `https://storage.example.test/clip-${index}.mp4` })), error: null }),
    }) },
    rpc: async (name: string, args: Record<string, unknown>) => {
      state.rpc.push({ name, args });
      return { data: fault === "contract-error" ? null : { master_id: "master-1", artifact_id: "artifact-genplay", shot_count: 1 }, error: fault === "contract-error" ? new Error("save") : null };
    },
  } as unknown as SupabaseClient;
  return { admin, state };
}

function job(kind: string, payload: Record<string, unknown> = { agent_id: "agent-1", connection_id: "connection-1" }) {
  return { id: `job-${kind}`, workspace_id: "workspace-1", production_id: "production-1", kind, payload, credit_reservation: 2 };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("studio worker contracts", () => {
  it("routes an open text role through its assigned provider and persists provenance", async () => {
    const { admin, state } = fakeAdmin();
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => { void input; void init; return Response.json({ choices: [{ message: { content: "Approved handoff" } }] }); });
    vi.stubGlobal("fetch", fetchMock);

    await expect(executeStudioJob(admin, job("generate_text"), ENCRYPTION_KEY)).resolves.toEqual({ artifact_id: "artifact-new", agent_id: "agent-1" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://provider.example.test/chat/completions");
    expect(init?.headers).toMatchObject({ authorization: "Bearer provider-secret" });
    expect(String(init?.body)).toContain("Owner note");
    expect(state.statusFilters).toContainEqual(["approved", "locked"]);
    expect(state.upserts.find((entry) => entry.table === "production_artifacts")?.value).toMatchObject({ job_id: "job-generate_text", status: "draft" });
  });

  it("keeps protected files out of customer providers and uses the operator boundary", async () => {
    vi.stubEnv("PROTECTED_INFERENCE_BASE_URL", "https://protected.example.test");
    vi.stubEnv("PROTECTED_INFERENCE_KEY", "operator-secret");
    const { admin, state } = fakeAdmin({ protectedAgent: true });
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => { void input; void init; return Response.json({ text: "Protected output" }); });
    vi.stubGlobal("fetch", fetchMock);

    await executeStudioJob(admin, job("generate_text", { agent_id: "agent-1" }), ENCRYPTION_KEY);
    const [url, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(String(url)).toBe("https://protected.example.test/v1/run");
    expect(init?.headers).toMatchObject({ authorization: "Bearer operator-secret" });
    expect(body).toMatchObject({ catalog_agent_id: "catalog-1", catalog_version: "1.0.0", capability: "text" });
    expect(JSON.stringify(body)).not.toContain("Director");
    expect(state.queried).not.toContain("provider_connections");
    expect(state.queried).not.toContain("agent_files");
  });

  it.each([
    ["generate_image", () => Response.json({ data: [{ b64_json: Buffer.from("image").toString("base64"), revised_prompt: "revised" }] }), ".png", "image/png"],
    ["generate_audio", () => new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "audio/mpeg" } }), ".mp3", "audio/mpeg"],
  ])("stores %s output and binds it to an artifact", async (kind, response, extension, mime) => {
    const { admin, state } = fakeAdmin({ step: 2 });
    vi.stubGlobal("fetch", vi.fn(async () => response()));

    const result = await executeStudioJob(admin, job(kind), ENCRYPTION_KEY);
    expect(result).toMatchObject({ artifact_id: "artifact-new", agent_id: "agent-1" });
    expect(state.uploads[0]).toMatchObject({ contentType: mime });
    expect(state.uploads[0].path).toMatch(new RegExp(`${extension.replace(".", "\\.")}$`));
    expect(state.upserts.map((entry) => entry.table)).toEqual(expect.arrayContaining(["generated_assets", "production_artifacts"]));
  });

  it("persists a validated GenPlay contract with approved-context provenance", async () => {
    const { admin, state } = fakeAdmin({ step: 7 });
    const content = JSON.stringify({ shots: [{ prompt: "Wide orbital establishing shot", duration_ms: 2500 }] });
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ choices: [{ message: { content } }] })));

    await expect(executeStudioJob(admin, job("generate_text"), ENCRYPTION_KEY)).resolves.toMatchObject({ artifact_id: "artifact-genplay", shot_count: 1 });
    expect(state.rpc[0]).toMatchObject({ name: "save_genplay_contract", args: { target_job: "job-generate_text" } });
    expect(state.rpc[0].args.context_provenance).toMatchObject({ artifact_ids: ["artifact-prior"], dna_ids: ["CHAR-1"], agent_id: "agent-1", provider_connection_id: "connection-1" });
  });

  it.runIf(ffmpegAvailable)("downloads selected clips and assembles a private MP4 master", async () => {
    const directory = mkdtempSync(path.join(tmpdir(), "gem-worker-test-"));
    try {
      const clipPath = path.join(directory, "clip.mp4");
      const created = spawnSync(ffmpeg, ["-nostdin", "-v", "error", "-f", "lavfi", "-i", "color=c=cyan:s=64x64:d=0.25", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-y", clipPath]);
      expect(created.status).toBe(0);
      const bytes = new Uint8Array(readFileSync(clipPath));
      const clips = [{ path: "workspace/workspace-1/clip.mp4", bytes }];
      const { admin, state } = fakeAdmin({ step: 8, assemblyClips: clips });
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://storage.example.test");
      vi.stubGlobal("fetch", vi.fn(async () => new Response(bytes, { headers: { "content-type": "video/mp4" } })));

      await expect(executeStudioJob(admin, job("assemble_master", {}), ENCRYPTION_KEY)).resolves.toMatchObject({ artifact_id: "artifact-new" });
      expect(state.uploads).toContainEqual(expect.objectContaining({ contentType: "video/mp4" }));
      expect(state.upserts.map((entry) => entry.table)).toEqual(expect.arrayContaining(["generated_assets", "production_artifacts"]));
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("rejects unsupported adapters before doing work", async () => {
    const { admin } = fakeAdmin();
    await expect(executeStudioJob(admin, job("publish_social"), ENCRYPTION_KEY)).rejects.toThrow("adapter is not configured");
  });

  it.each([
    ["production-error", {}, "generate_text", () => Response.json({ choices: [{ message: { content: "ok" } }] }), "Production is not active"],
    ["production-missing", {}, "generate_text", () => Response.json({ choices: [{ message: { content: "ok" } }] }), "Production is not active"],
    ["production-paused", {}, "generate_text", () => Response.json({ choices: [{ message: { content: "ok" } }] }), "Production is not active"],
    ["department-missing", {}, "generate_text", () => Response.json({ choices: [{ message: { content: "ok" } }] }), "department is not configured"],
    ["agent-missing", {}, "generate_text", () => Response.json({ choices: [{ message: { content: "ok" } }] }), "agent is not available"],
    ["wrong-lane", {}, "generate_text", () => Response.json({ choices: [{ message: { content: "ok" } }] }), "agent is not available"],
    ["capability-missing", {}, "generate_text", () => Response.json({ choices: [{ message: { content: "ok" } }] }), "agent is not available"],
    ["provider-error", {}, "generate_text", () => Response.json({ choices: [{ message: { content: "ok" } }] }), "No active text provider"],
    ["provider-missing", {}, "generate_text", () => Response.json({ choices: [{ message: { content: "ok" } }] }), "No active text provider"],
    ["provider-secret-missing", {}, "generate_text", () => Response.json({ choices: [{ message: { content: "ok" } }] }), "Provider secret not found"],
    ["provider-model-missing", {}, "generate_text", () => Response.json({ choices: [{ message: { content: "ok" } }] }), "Provider model is not configured"],
    ["agent-files-missing", {}, "generate_text", () => Response.json({ choices: [{ message: { content: "ok" } }] }), "Agent configuration is unavailable"],
    ["agent-files-error", {}, "generate_text", () => Response.json({ choices: [{ message: { content: "ok" } }] }), "Agent configuration is unavailable"],
    ["handoff-artifact-error", { step: 2 }, "generate_text", () => Response.json({ choices: [{ message: { content: "ok" } }] }), "Approved production context is unavailable"],
    ["casting-error", { step: 2 }, "generate_text", () => Response.json({ choices: [{ message: { content: "ok" } }] }), "Approved production context is unavailable"],
    ["ensure-inactive", {}, "generate_text", () => Response.json({ choices: [{ message: { content: "ok" } }] }), "paused or archived"],
    ["artifact-save-error", {}, "generate_text", () => Response.json({ choices: [{ message: { content: "ok" } }] }), "Could not save generated artifact"],
    ["media-upload-error", { step: 2 }, "generate_image", () => Response.json({ data: [{ b64_json: Buffer.from("image").toString("base64") }] }), "Could not store generated media"],
    ["metadata-error", { step: 2 }, "generate_image", () => Response.json({ data: [{ b64_json: Buffer.from("image").toString("base64") }] }), "Could not register generated media"],
    ["contract-error", { step: 7 }, "generate_text", () => Response.json({ choices: [{ message: { content: JSON.stringify({ shots: [{ prompt: "Wide orbital establishing shot", duration_ms: 2500 }] }) } }] }), "Could not save GenPlay contract"],
  ])("rejects the %s failure without a false success", async (fault, fixture, kind, response, message) => {
    const { admin } = fakeAdmin({ ...fixture, fault });
    vi.stubGlobal("fetch", vi.fn(async () => response()));
    await expect(executeStudioJob(admin, job(kind), ENCRYPTION_KEY)).rejects.toThrow(message);
  });

  it("rejects missing assignments and malformed provider responses", async () => {
    const { admin } = fakeAdmin();
    await expect(executeStudioJob(admin, job("generate_text", {}), ENCRYPTION_KEY)).rejects.toThrow("role assignment is missing");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 503 })));
    await expect(executeStudioJob(admin, job("generate_text"), ENCRYPTION_KEY)).rejects.toThrow("Provider returned 503");
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ choices: [] })));
    await expect(executeStudioJob(admin, job("generate_text"), ENCRYPTION_KEY)).rejects.toThrow("Provider returned no text");
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ data: [] })));
    await expect(executeStudioJob(admin, job("generate_image"), ENCRYPTION_KEY)).rejects.toThrow("Provider returned no image");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(new Uint8Array())));
    await expect(executeStudioJob(admin, job("generate_audio"), ENCRYPTION_KEY)).rejects.toThrow("Provider returned no audio");
  });

  it("requires protected identity, entitlement, and operator configuration", async () => {
    for (const [fault, message] of [["catalog-missing", "catalog identity"], ["entitlement-missing", "entitlement"]] as const) {
      const { admin } = fakeAdmin({ protectedAgent: true, fault });
      await expect(executeStudioJob(admin, job("generate_text", { agent_id: "agent-1" }), ENCRYPTION_KEY)).rejects.toThrow(message);
    }
    const { admin } = fakeAdmin({ protectedAgent: true });
    await expect(executeStudioJob(admin, job("generate_text", { agent_id: "agent-1" }), ENCRYPTION_KEY)).rejects.toThrow("Protected inference is not configured");
  });
});
