# Beta Phase 1 — Defects & Truthfulness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing production slice truthful and defect-free: working Universe record management, edit/delete for created entities, enforced cost caps, validated orchestration conditions, consolidated DNA/GenPlay routes, and a real run-mode advancement decision — so Phase 2 (lane theory core) builds on solid ground.

**Architecture:** All mutations stay in `web/app/(product)/actions.ts` as server actions scoped by `getWorkspaceContext()` + RLS. Pure decision logic goes in `web/lib/` with unit tests (Vitest); route/contract changes update the frozen contracts in `web/lib/studio/navigation.ts` plus `web/tests/unit/route-contract.test.ts`. The worker endpoint `/api/jobs/run` gains admission control and post-settle advancement using existing RPCs only — no new migrations.

**Tech Stack:** Next.js 16 App Router, React 19 server components, Supabase (Auth/Postgres/RLS/Storage), TypeScript strict, Vitest, Playwright.

**Spec:** `planning/beta-execution-plan.md` (Phase 1), `planning/site-workflow-spec.md` (page-state contract §2.3, four-module law §1), `planning/lane-theory-spec.md` (§9 defect list). Read all three before starting.

## Global Constraints

- Branch is `production` (sole branch, protected). Commit directly in small increments; never force-push.
- Run all commands from `web/` unless stated. Node 22.22.2, npm 12.x.
- Server resolves authorization; UI presents stable errors. No capability logic in pages, no localStorage, no fake success states, no secrets in browser/logs.
- Every data page needs loading/empty/error states per spec §2.3; failed writes must not claim success.
- RLS protects every table touched; server actions rely on workspace-scoped clients — never `createAdminClient` in user actions (admin client is worker/engine-only, existing pattern).
- TDD where testable: pure helpers get unit tests first (RED → GREEN). Server actions follow the existing action pattern and are covered by route-contract tests + e2e (protected e2e runs only with Supabase env configured — note this in completion records).
- `npm run lint` uses `--max-warnings=0`; `npm test` enforces 80% coverage thresholds on included lib code.
- No new npm dependencies in Phase 1. No new migrations (all work uses existing tables/RPCs).
- Commit message style: `fix:`/`feat:`/`test:` prefixes, imperative, one logical change per commit.

---

### Task 1: Universe record detail route + manage action

Fixes the dead "Manage" buttons on `/app/universe` that point to a nonexistent `/app/universe/[id]`.

**Files:**
- Create: `web/app/(product)/app/universe/[id]/page.tsx`
- Modify: `web/app/(product)/actions.ts` (append `updateDnaRecord`)
- Modify: `web/lib/studio/navigation.ts:37` (add route contract row after `/app/universe`)
- Modify: `web/tests/unit/route-contract.test.ts:37` (same row in the expected array)
- Test: `web/tests/unit/route-contract.test.ts`

**Interfaces:**
- Consumes: `getWorkspaceContext()` from `@/lib/studio/workspace`; `textField` helper already in actions.ts.
- Produces: `updateDnaRecord(formData: FormData): Promise<void>` (server action); route `/app/universe/[id]` rendering the record with an edit form. Locked records reject content edits (only the lock checkbox may change).

- [ ] **Step 1: Write the failing contract test**

In `web/tests/unit/route-contract.test.ts`, find the expected-routes array (mirrors `ROUTE_CONTRACTS`) and add this row immediately after the `["/app/universe", ...]` row:

```ts
      ["/app/universe/[id]", "Studio", "authenticated-workspace"],
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npm test -- tests/unit/route-contract.test.ts`
Expected: FAIL — contract list mismatch (route missing from `ROUTE_CONTRACTS`).

- [ ] **Step 3: Add the route contract row**

In `web/lib/studio/navigation.ts`, add immediately after the `["/app/universe", ...]` row:

```ts
  ["/app/universe/[id]", "Studio", "authenticated-workspace"],
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npm test -- tests/unit/route-contract.test.ts`
Expected: PASS.

- [ ] **Step 5: Add the server action**

Append to `web/app/(product)/actions.ts`:

```ts
export async function updateDnaRecord(formData: FormData) {
  const recordId = textField(formData, "record_id");
  if (!recordId) redirect("/app/universe?error=dna");
  const { supabase } = await workspace();
  const { data: record } = await supabase.from("dna_records").select("id, locked, record").eq("id", recordId).maybeSingle();
  if (!record) redirect("/app/universe?error=dna");
  const body = (record.record ?? {}) as Record<string, unknown>;
  const summary = textField(formData, "summary").slice(0, 500);
  const anchors = textField(formData, "anchors").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 20);
  const voice = textField(formData, "voice_behavior").slice(0, 500);
  const contentChanged = String(body.summary ?? "") !== summary
    || (Array.isArray(body.anchors) ? (body.anchors as string[]).join(", ") : "") !== anchors.join(", ")
    || String(body.voice_behavior ?? "") !== voice;
  if (record.locked && contentChanged) redirect(`/app/universe/${recordId}?error=locked`);
  const next = { ...body, summary, anchors, voice_behavior: voice };
  const { error } = await supabase.from("dna_records").update({ record: next, locked: formData.get("lock_version") === "on" }).eq("id", recordId);
  if (error) redirect(`/app/universe/${recordId}?error=dna`);
  revalidatePath(`/app/universe/${recordId}`); revalidatePath("/app/universe"); redirect(`/app/universe/${recordId}`);
}
```

- [ ] **Step 6: Create the detail page**

`web/app/(product)/app/universe/[id]/page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateDnaRecord } from "@/app/(product)/actions";
import { getWorkspaceContext } from "@/lib/studio/workspace";

export const metadata = { title: "DNA record" };

export default async function DnaRecordPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { supabase } = await getWorkspaceContext();
  const { data: record } = await supabase.from("dna_records").select("id, dna_id, dna_type, status, schema_version, version, locked, record, updated_at").eq("id", id).maybeSingle();
  if (!record) notFound();
  const { error } = await searchParams;
  const body = record.record as { name?: string; summary?: string; anchors?: string[]; voice_behavior?: string } | null;
  return <section className="product-page shell">
    <Link className="text-link" href="/app/universe">← Universe</Link>
    <h1>{body?.name || record.dna_id}</h1>
    <p className="muted">{record.dna_type} · v{record.version} · schema {record.schema_version} · <span className={`status-mark ${record.status}`}>{record.status}</span>{record.locked ? " · locked" : ""}</p>
    {error === "locked" ? <p className="form-error" role="alert">This version is locked. Unlock it before changing continuity content.</p> : null}
    {error === "dna" ? <p className="form-error" role="alert">The DNA record could not be saved.</p> : null}
    <div className="workspace-split">
      <section className="panel"><h2>Continuity record</h2>
        <form action={updateDnaRecord} className="stack-form">
          <input type="hidden" name="record_id" value={record.id} />
          <label>Continuity summary<textarea name="summary" maxLength={500} rows={3} defaultValue={body?.summary ?? ""} required /></label>
          <label>Visual anchors<input name="anchors" maxLength={500} defaultValue={body?.anchors?.join(", ") ?? ""} required /></label>
          <label>Voice / behavior<textarea name="voice_behavior" maxLength={500} rows={3} defaultValue={body?.voice_behavior ?? ""} /></label>
          <label className="check-row"><input type="checkbox" name="lock_version" defaultChecked={record.locked} />Lock version {record.version}</label>
          <button className="button button-primary" type="submit">Save record</button>
        </form>
      </section>
      <section className="panel"><h2>Full record</h2><pre className="code-block">{JSON.stringify(record.record, null, 2)}</pre></section>
    </div>
  </section>;
}
```

- [ ] **Step 7: Typecheck, lint, full unit suite**

Run: `cd web && npm run typecheck && npm run lint && npm test`
Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add web/app/\(product\)/app/universe/\[id\]/page.tsx web/app/\(product\)/actions.ts web/lib/studio/navigation.ts web/tests/unit/route-contract.test.ts
git commit -m "feat(universe): add DNA record detail route with lock-aware editing"
```

---

### Task 2: Edit/delete for created entities (agents, lanes, workflows, channels)

Created entities currently have no edit/delete surface. Channels may only be edited (spec forbids channel deletion outside Account). Lane deletion removes its agents first (same workspace scope, RLS-guarded).

**Files:**
- Modify: `web/app/(product)/actions.ts` (append `deleteAgent`, `deleteLane`, `deleteWorkflow`, `updateChannel`)
- Modify: `web/app/(product)/app/builder/page.tsx` (delete buttons on agent rows and lane panels)
- Modify: `web/app/(product)/app/orchestration/page.tsx` (delete button per workflow — follow that page's existing per-rule delete pattern for markup)
- Modify: `web/app/(product)/app/channels/[channelId]/page.tsx` (channel edit form panel)

**Interfaces:**
- Produces (all server actions, `Promise<void>`, redirect back to their surface with `?error=` on failure):
  - `deleteAgent(formData)` — fields: `agent_id`, `lane_id`
  - `deleteLane(formData)` — field: `lane_id`
  - `deleteWorkflow(formData)` — field: `workflow_id`
  - `updateChannel(formData)` — fields: `channel_id`, `name`, `audience`, `voice`, `cadence`, `pillars` (comma-separated)

- [ ] **Step 1: Add the four server actions**

Append to `web/app/(product)/actions.ts`:

```ts
export async function deleteAgent(formData: FormData) {
  const agentId = textField(formData, "agent_id"); const laneId = textField(formData, "lane_id");
  if (!agentId || !laneId) redirect("/app/builder?error=builder");
  const { supabase } = await workspace(); const { error } = await supabase.from("agents").delete().eq("id", agentId);
  if (error) redirect("/app/builder?error=builder");
  revalidatePath("/app/builder"); redirect("/app/builder");
}

export async function deleteLane(formData: FormData) {
  const laneId = textField(formData, "lane_id"); if (!laneId) redirect("/app/builder?error=builder");
  const { supabase } = await workspace();
  const { error: agentError } = await supabase.from("agents").delete().eq("lane_id", laneId);
  if (agentError) redirect("/app/builder?error=builder");
  const { error } = await supabase.from("lanes").delete().eq("id", laneId);
  if (error) redirect("/app/builder?error=builder");
  revalidatePath("/app/builder"); redirect("/app/builder");
}

export async function deleteWorkflow(formData: FormData) {
  const workflowId = textField(formData, "workflow_id"); if (!workflowId) redirect("/app/orchestration?error=workflow");
  const { supabase } = await workspace(); const { error } = await supabase.from("workflows").delete().eq("id", workflowId);
  if (error) redirect("/app/orchestration?error=workflow");
  revalidatePath("/app/orchestration"); redirect("/app/orchestration");
}

export async function updateChannel(formData: FormData) {
  const channelId = textField(formData, "channel_id"); const name = textField(formData, "name");
  if (!channelId || !valid(name)) redirect(`/app/channels/${channelId}?error=channel`);
  const { supabase } = await workspace();
  const pillars = textField(formData, "pillars").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 12);
  const { error } = await supabase.from("channels").update({ name, audience: textField(formData, "audience").slice(0, 500), voice: textField(formData, "voice").slice(0, 500), cadence: textField(formData, "cadence").slice(0, 120), pillars }).eq("id", channelId);
  if (error) redirect(`/app/channels/${channelId}?error=channel`);
  revalidatePath(`/app/channels/${channelId}`); revalidatePath("/app/channels"); redirect(`/app/channels/${channelId}`);
}
```

- [ ] **Step 2: Wire delete buttons into the builder page**

In `web/app/(product)/app/builder/page.tsx`: add `deleteAgent, deleteLane` to the actions import. On each agent row (`<article className="agent-row">`), append a delete form after `<AgentEditor .../>`:

```tsx
<form action={deleteAgent}><input type="hidden" name="agent_id" value={agent.id} /><input type="hidden" name="lane_id" value={lane.id} /><button className="button button-outline" type="submit" aria-label={`Remove ${agent.name}`}>Remove</button></form>
```

On each lane panel's `.section-head` (after the add-agent form), append:

```tsx
<form action={deleteLane}><input type="hidden" name="lane_id" value={lane.id} /><button className="button button-outline" type="submit" aria-label={`Delete lane ${lane.name} and its agents`}>Delete lane</button></form>
```

- [ ] **Step 3: Wire delete button into the orchestration page**

In `web/app/(product)/app/orchestration/page.tsx`: import `deleteWorkflow`; wherever each workflow is rendered, add a form following the page's existing `deleteHandoffRule` button pattern:

```tsx
<form action={deleteWorkflow}><input type="hidden" name="workflow_id" value={workflow.id} /><button className="button button-outline" type="submit">Delete workflow</button></form>
```

Read the page first to place it consistently (the executor must check whether workflows render with an id variable named differently — adjust the variable name to the page's own).

- [ ] **Step 4: Add channel edit form to the channel detail page**

In `web/app/(product)/app/channels/[channelId]/page.tsx`: import `updateChannel`; add `error?: string` to the searchParams type; render `error` with `<p className="form-error" role="alert">The channel could not be saved.</p>`; add `searchParams` to the props signature and await it; insert this panel after the strategy panel:

```tsx
<section className="panel"><h2>Edit channel</h2>
  <form action={updateChannel} className="stack-form">
    <input type="hidden" name="channel_id" value={channel.id} />
    <label>Name<input name="name" maxLength={120} defaultValue={channel.name} required /></label>
    <label>Audience<input name="audience" maxLength={500} defaultValue={channel.audience ?? ""} /></label>
    <label>Voice<input name="voice" maxLength={500} defaultValue={channel.voice ?? ""} /></label>
    <label>Cadence<input name="cadence" maxLength={120} defaultValue={channel.cadence ?? ""} /></label>
    <label>Pillars (comma-separated)<input name="pillars" maxLength={500} defaultValue={channel.pillars?.join(", ") ?? ""} /></label>
    <button className="button button-primary" type="submit">Save channel</button>
  </form>
</section>
```

- [ ] **Step 5: Typecheck, lint, tests**

Run: `cd web && npm run typecheck && npm run lint && npm test`
Expected: all PASS (delete forms are server-rendered; RLS enforces scope — verify no test asserts the old channel page signature).

- [ ] **Step 6: Commit**

```bash
git add web/app/\(product\)/actions.ts web/app/\(product\)/app/builder/page.tsx web/app/\(product\)/app/orchestration/page.tsx web/app/\(product\)/app/channels/\[channelId\]/page.tsx
git commit -m "feat(studio): add delete for agents/lanes/workflows and channel editing"
```

---

### Task 3: Enforce job concurrency caps in the worker endpoint

`CAP_LIMITS.jobs_workspace` (4) and `jobs_global` (6) are defined and tested but never enforced. The caps doc says their reset is "lease expiry" — so the correct admission behavior is to *defer* (leave the lease to expire/requeue), never to fail the job.

**Files:**
- Modify: `web/lib/studio/caps.ts` (append `evaluateJobAdmission`)
- Modify: `web/app/api/jobs/run/route.ts` (post-claim admission gate)
- Test: `web/tests/unit/caps.test.ts` (extend)

**Interfaces:**
- Consumes: `enforceCap` from `./caps` (already exported), `CAP_LIMITS` keys `jobs_workspace`, `jobs_global`.
- Produces: `evaluateJobAdmission(input: Readonly<{ workspaceRunning: number; globalRunning: number; policyAvailable: boolean }>): Readonly<{ admit: boolean; reason: "allowed" | "cap_exceeded" | "policy_unavailable" }>` — pure, frozen result.

- [ ] **Step 1: Write the failing tests**

Append to `web/tests/unit/caps.test.ts`:

```ts
import { evaluateJobAdmission } from "../../lib/studio/caps";

describe("evaluateJobAdmission", () => {
  it("admits when both concurrency caps have room", () => {
    expect(evaluateJobAdmission({ workspaceRunning: 2, globalRunning: 4, policyAvailable: true }))
      .toEqual({ admit: true, reason: "allowed" });
  });

  it("defers when the workspace cap is reached (4)", () => {
    expect(evaluateJobAdmission({ workspaceRunning: 4, globalRunning: 4, policyAvailable: true }).admit).toBe(false);
  });

  it("defers when the global cap is reached (6)", () => {
    expect(evaluateJobAdmission({ workspaceRunning: 1, globalRunning: 6, policyAvailable: true }).admit).toBe(false);
  });

  it("defers when policy is unavailable", () => {
    expect(evaluateJobAdmission({ workspaceRunning: 0, globalRunning: 0, policyAvailable: false }))
      .toEqual({ admit: false, reason: "policy_unavailable" });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd web && npm test -- tests/unit/caps.test.ts`
Expected: FAIL — `evaluateJobAdmission` is not exported.

- [ ] **Step 3: Implement the helper**

Append to `web/lib/studio/caps.ts`:

```ts
export function evaluateJobAdmission(input: Readonly<{ workspaceRunning: number; globalRunning: number; policyAvailable: boolean }>) {
  const workspace = enforceCap("jobs_workspace", input.workspaceRunning, 1, input.policyAvailable);
  if (!workspace.allowed) return Object.freeze({ admit: false, reason: workspace.reason });
  const global = enforceCap("jobs_global", input.globalRunning, 1, input.policyAvailable);
  return Object.freeze({ admit: global.allowed, reason: global.reason });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd web && npm test -- tests/unit/caps.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire admission into the worker route**

In `web/app/api/jobs/run/route.ts`, immediately after `const job = jobs?.[0];` and the existing `if (!job)` guard, add:

```ts
  const [{ count: workspaceRunning }, { count: globalRunning }] = await Promise.all([
    admin.from("job_queue").select("id", { count: "exact", head: true }).eq("status", "running").eq("workspace_id", job.workspace_id).neq("id", job.id),
    admin.from("job_queue").select("id", { count: "exact", head: true }).eq("status", "running").neq("id", job.id),
  ]);
  const admission = evaluateJobAdmission({ workspaceRunning: workspaceRunning ?? 0, globalRunning: globalRunning ?? 0, policyAvailable: true });
  if (!admission.admit) {
    console.log(JSON.stringify(createAuditEvent({ actorId: "worker", workspaceId: job.workspace_id, action: "job_admission_deferred", target: job.id, outcome: "denied", metadata: { reason: admission.reason } })));
    return NextResponse.json({ processed: false, deferred: true, reason: admission.reason }, { status: 200 });
  }
```

Also add `evaluateJobAdmission` to the route's imports from `@/lib/studio/caps`. The claimed job's lease expires per the existing `claim_studio_job` fencing — the job requeues; it is not failed.

- [ ] **Step 6: Typecheck, lint, full suite**

Run: `cd web && npm run typecheck && npm run lint && npm test`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add web/lib/studio/caps.ts web/app/api/jobs/run/route.ts web/tests/unit/caps.test.ts
git commit -m "feat(worker): enforce job concurrency caps via admission deferral"
```

---

### Task 3b: Enforce upload caps in clip registration

The upload path registers metadata server-side in `registerShotClip` — that is the enforcement point available without new migrations. Enforce per-file size and daily workspace upload caps there using the existing cap helpers.

**Files:**
- Modify: `web/lib/studio/caps.ts` (append `evaluateClipUploadAdmission`)
- Modify: `web/app/(product)/actions.ts` (`registerShotClip` — admission check before RPC)
- Test: `web/tests/unit/caps.test.ts` (extend)

**Interfaces:**
- Consumes: `enforceCap` keys `upload_file_bytes` (limit 2 GiB), `upload_workspace_day_files` (100), `upload_workspace_day_bytes` (20 GiB).
- Produces: `evaluateClipUploadAdmission(input: Readonly<{ byteSize: number; filesToday: number; bytesToday: number; policyAvailable: boolean }>): Readonly<{ admit: boolean; reason: string }>` — pure.

- [ ] **Step 1: Write the failing tests**

Append to `web/tests/unit/caps.test.ts`:

```ts
import { evaluateClipUploadAdmission } from "../../lib/studio/caps";

describe("evaluateClipUploadAdmission", () => {
  const ok = { byteSize: 1024, filesToday: 3, bytesToday: 4096, policyAvailable: true };
  it("admits a normal clip", () => {
    expect(evaluateClipUploadAdmission(ok)).toEqual({ admit: true, reason: "allowed" });
  });
  it("rejects a file over 2 GiB", () => {
    expect(evaluateClipUploadAdmission({ ...ok, byteSize: 2 * 1024 ** 3 + 1 }).admit).toBe(false);
  });
  it("rejects the 101st file of the day", () => {
    expect(evaluateClipUploadAdmission({ ...ok, filesToday: 100 }).admit).toBe(false);
  });
  it("rejects past the 20 GiB daily budget", () => {
    expect(evaluateClipUploadAdmission({ ...ok, bytesToday: 20 * 1024 ** 3 }).admit).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd web && npm test -- tests/unit/caps.test.ts`
Expected: FAIL — `evaluateClipUploadAdmission` is not exported.

- [ ] **Step 3: Implement the helper**

Append to `web/lib/studio/caps.ts`:

```ts
export function evaluateClipUploadAdmission(input: Readonly<{ byteSize: number; filesToday: number; bytesToday: number; policyAvailable: boolean }>) {
  const file = enforceCap("upload_file_bytes", 0, input.byteSize, input.policyAvailable);
  if (!file.allowed) return Object.freeze({ admit: false, reason: file.reason });
  const count = enforceCap("upload_workspace_day_files", input.filesToday, 1, input.policyAvailable);
  if (!count.allowed) return Object.freeze({ admit: false, reason: count.reason });
  const daily = enforceCap("upload_workspace_day_bytes", input.bytesToday, input.byteSize, input.policyAvailable);
  return Object.freeze({ admit: daily.allowed, reason: daily.reason });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd web && npm test -- tests/unit/caps.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire into registerShotClip**

In `web/app/(product)/actions.ts`, `registerShotClip`: after the field validation and before the RPC call, add:

```ts
  const { supabase, id } = await workspace();
  const startOfDay = new Date(); startOfDay.setUTCHours(0, 0, 0, 0);
  const { data: todayClips } = await supabase.from("shot_clips").select("byte_size").eq("workspace_id", id).gte("created_at", startOfDay.toISOString());
  const filesToday = todayClips?.length ?? 0;
  const bytesToday = (todayClips ?? []).reduce((total, clip) => total + (clip.byte_size ?? 0), 0);
  const admission = evaluateClipUploadAdmission({ byteSize: size, filesToday, bytesToday, policyAvailable: true });
  if (!admission.admit) return { ok: false as const, error: "Upload cap reached. Try again after the UTC-day reset or reduce file size." };
```

(Keep the existing `workspace()` call — merge these lines with it rather than calling twice.) Add `evaluateClipUploadAdmission` to the imports from `@/lib/studio/caps`.

- [ ] **Step 6: Typecheck, lint, full suite**

Run: `cd web && npm run typecheck && npm run lint && npm test`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add web/lib/studio/caps.ts web/app/\(product\)/actions.ts web/tests/unit/caps.test.ts
git commit -m "feat(uploads): enforce per-file and daily workspace upload caps at clip registration"
```

---

### Task 4: Validate orchestration conditions at authoring time

The orchestration UI accepts arbitrary JSON conditions but the engine only supports `eq`/`neq`/`exists` — unsupported ops silently fail every rule. Validate loudly at rule creation.

The orchestration UI accepts arbitrary JSON conditions but the engine only supports `eq`/`neq`/`exists` — unsupported ops silently fail every rule. Validate loudly at rule creation.

**Files:**
- Modify: `web/lib/orchestration/helpers.ts` (append `validateConditions`, export it)
- Modify: `web/lib/orchestration/engine.ts:4` (re-export `validateConditions` next to the existing re-exports)
- Modify: `web/app/(product)/actions.ts` (`createHandoffRule` — validate before insert)
- Test: `web/tests/unit/orchestration-helpers.test.ts` (extend)

**Interfaces:**
- Produces: `validateConditions(conditions: unknown): readonly string[]` — empty array means valid; otherwise human-readable error strings (one per problem).
- `createHandoffRule` behavior change: invalid conditions JSON or unsupported operators redirect to `/app/orchestration?error=handoff` **without inserting**.

- [ ] **Step 1: Write the failing tests**

Append to `web/tests/unit/orchestration-helpers.test.ts`:

```ts
import { validateConditions } from "../../lib/orchestration/engine";

describe("validateConditions", () => {
  it("accepts null/undefined as unrestricted", () => {
    expect(validateConditions(null)).toEqual([]);
    expect(validateConditions(undefined)).toEqual([]);
  });

  it("accepts the supported operators", () => {
    expect(validateConditions([
      { field: "status", value: "approved" },
      { field: "score", op: "neq", value: 7 },
      { field: "owner", op: "exists" },
    ])).toEqual([]);
  });

  it("rejects non-array input", () => {
    expect(validateConditions({ field: "status" })).toEqual(["Conditions must be a JSON array."]);
  });

  it("reports unknown operators and missing fields with position numbers", () => {
    expect(validateConditions([{ field: "status", op: "equals", value: "approved" }]))
      .toEqual(["Condition 1 operator must be one of: eq, neq, exists."]);
    expect(validateConditions([{ field: "status" }, { op: "eq" }]))
      .toEqual(["Condition 2 needs a field."]);
  });

  it("rejects non-object entries", () => {
    expect(validateConditions(["status"])).toEqual(["Condition 1 must be an object."]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd web && npm test -- tests/unit/orchestration-helpers.test.ts`
Expected: FAIL — `validateConditions` is not exported.

- [ ] **Step 3: Implement the validator**

Append to `web/lib/orchestration/helpers.ts`:

```ts
const CONDITION_OPS = new Set(["eq", "neq", "exists"]);

export function validateConditions(conditions: unknown): readonly string[] {
  if (conditions === null || conditions === undefined) return [];
  if (!Array.isArray(conditions)) return ["Conditions must be a JSON array."];
  const errors: string[] = [];
  conditions.forEach((entry, index) => {
    const label = `Condition ${index + 1}`;
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) { errors.push(`${label} must be an object.`); return; }
    const condition = entry as Condition;
    if (typeof condition.field !== "string" || condition.field.length === 0) errors.push(`${label} needs a field.`);
    if (condition.op !== undefined && !CONDITION_OPS.has(condition.op)) errors.push(`${label} operator must be one of: eq, neq, exists.`);
  });
  return errors;
}
```

In `web/lib/orchestration/engine.ts` line 4, extend the re-export:

```ts
export { evaluateConditions, mapPayload, validateConditions } from "./helpers";
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd web && npm test -- tests/unit/orchestration-helpers.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire validation into rule creation**

In `web/app/(product)/actions.ts`, `createHandoffRule`: after the existing source/target/trigger validation line and before the `Promise.all`, add:

```ts
  let parsedConditions: unknown = null;
  const rawConditions = text(formData, "conditions");
  if (rawConditions) {
    try { parsedConditions = JSON.parse(rawConditions); } catch { redirect("/app/orchestration?error=handoff"); }
    if (validateConditions(parsedConditions).length > 0) redirect("/app/orchestration?error=handoff");
  }
```

Then include `conditions: parsedConditions as Record<string, unknown> | null` in the inserted `handoff` object only if the `handoff_rules` table has a `conditions` column — check with `grep -n "conditions" supabase/migrations/*.sql` from the repo root. If the column does not exist, keep the validation (it still guards the UI contract) and store nothing new; note the finding in the commit message.

- [ ] **Step 6: Typecheck, lint, full suite**

Run: `cd web && npm run typecheck && npm run lint && npm test`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add web/lib/orchestration/helpers.ts web/lib/orchestration/engine.ts web/app/\(product\)/actions.ts web/tests/unit/orchestration-helpers.test.ts
git commit -m "feat(orchestration): validate handoff conditions loudly at authoring time"
```

---

### Task 5: Consolidate `/app/dna` and `/app/genplay` into redirects

Both pages are passive "after migration or import" views contradicting the fresh-start product; the spec says DNA lives in Universe and GenPlay documents live with productions. Make both routes truthful redirects and update the frozen contracts. (Full Assets-warehouse subviews come in a later phase — this removes the lie now.)

**Files:**
- Modify: `web/app/(product)/app/dna/page.tsx` (replace body with a redirect)
- Modify: `web/app/(product)/app/genplay/page.tsx` (replace body with a redirect)
- Modify: `web/lib/studio/navigation.ts:38-39` (contract rows)
- Modify: `web/tests/unit/route-contract.test.ts:38-39` (expected rows)

**Interfaces:**
- Produces: `/app/dna` → 307 redirect to `/app/universe`; `/app/genplay` → 307 redirect to `/app/studio`. Contract rows become compatibility redirects (same pattern as `["/dashboard", "Compatibility", "redirect-to-/app"]`).

- [ ] **Step 1: Update the contract test rows**

In `web/tests/unit/route-contract.test.ts`, replace the two rows:

```ts
      ["/app/dna", "Studio", "authenticated-workspace"],
      ["/app/genplay", "Studio", "authenticated-workspace-compatibility"],
```

with:

```ts
      ["/app/dna", "Studio", "redirect-to-/app/universe"],
      ["/app/genplay", "Studio", "redirect-to-/app/studio"],
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npm test -- tests/unit/route-contract.test.ts`
Expected: FAIL — contracts still describe the old page routes.

- [ ] **Step 3: Update contracts and pages**

In `web/lib/studio/navigation.ts`, replace the same two rows with the same new values.

Replace the entire body of `web/app/(product)/app/dna/page.tsx` with:

```tsx
import { redirect } from "next/navigation";
export const metadata = { title: "DNA records" };
export default function DnaPage() { redirect("/app/universe"); }
```

Replace the entire body of `web/app/(product)/app/genplay/page.tsx` with:

```tsx
import { redirect } from "next/navigation";
export const metadata = { title: "GenPlay" };
export default function GenPlayPage() { redirect("/app/studio"); }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npm test -- tests/unit/route-contract.test.ts`
Expected: PASS.

- [ ] **Step 5: Typecheck, lint, full suite, build**

Run: `cd web && npm run typecheck && npm run lint && npm test && npm run build`
Expected: all PASS; build compiles both redirect pages.

- [ ] **Step 6: Commit**

```bash
git add web/app/\(product\)/app/dna/page.tsx web/app/\(product\)/app/genplay/page.tsx web/lib/studio/navigation.ts web/tests/unit/route-contract.test.ts
git commit -m "fix(routes): redirect legacy dna/genplay pages to universe and studio"
```

---

### Task 6: Run-mode advancement decision (no more stalled auto)

Productions set to `semi_auto`/`auto` never advance on their own — every step is form-driven. This task adds the pure decision function and wires it post-settle in the worker: `manual` never auto-advances; `semi_auto`/`auto` advance when the job succeeded, the production isn't complete, and no approvals are pending; `auto` additionally enqueues the next stage's job. Honest boundaries: if the completed job produced no artifact id in its result, no advance happens (no fake progress).

**Files:**
- Modify: `web/lib/studio/domain.ts` (append `decideAdvancement`)
- Modify: `web/app/api/jobs/run/route.ts` (post-settle advancement)
- Test: `web/tests/unit/run-mode-advancement.test.ts` (create)

**Interfaces:**
- Consumes: `RunMode` type from `./domain`; `advance_production` RPC (exists — used by `advanceProduction` action); `enqueue` path: reuse the same insert the `enqueueProductionJob` action performs, via `createAdminClient` (worker context).
- Produces: `decideAdvancement(input: Readonly<{ runMode: RunMode; currentStep: number; totalSteps: number; pendingApprovals: number; lastJobSucceeded: boolean }>): Readonly<{ advanceStep: boolean; enqueueNext: boolean; reason: "job_failed" | "complete" | "manual" | "awaiting_approval" | "advanced" }>`

- [ ] **Step 1: Write the failing tests**

Create `web/tests/unit/run-mode-advancement.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { decideAdvancement } from "../../lib/studio/domain";

const base = { currentStep: 4, totalSteps: 13, pendingApprovals: 0, lastJobSucceeded: true };

describe("decideAdvancement", () => {
  it("never advances in manual mode", () => {
    expect(decideAdvancement({ ...base, runMode: "manual" })).toEqual({ advanceStep: false, enqueueNext: false, reason: "manual" });
  });

  it("never advances a failed job", () => {
    expect(decideAdvancement({ ...base, runMode: "auto", lastJobSucceeded: false }).reason).toBe("job_failed");
  });

  it("stops at the final step", () => {
    expect(decideAdvancement({ ...base, runMode: "auto", currentStep: 13 }).reason).toBe("complete");
  });

  it("waits when approvals are pending, even in auto", () => {
    expect(decideAdvancement({ ...base, runMode: "auto", pendingApprovals: 2 })).toEqual({ advanceStep: false, enqueueNext: false, reason: "awaiting_approval" });
  });

  it("semi_auto advances the step but does not enqueue the next job", () => {
    expect(decideAdvancement({ ...base, runMode: "semi_auto" })).toEqual({ advanceStep: true, enqueueNext: false, reason: "advanced" });
  });

  it("auto advances the step and enqueues the next job", () => {
    expect(decideAdvancement({ ...base, runMode: "auto" })).toEqual({ advanceStep: true, enqueueNext: true, reason: "advanced" });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd web && npm test -- tests/unit/run-mode-advancement.test.ts`
Expected: FAIL — `decideAdvancement` is not exported.

- [ ] **Step 3: Implement the decision function**

Append to `web/lib/studio/domain.ts`:

```ts
export type AdvancementReason = "job_failed" | "complete" | "manual" | "awaiting_approval" | "advanced";
export type AdvancementDecision = Readonly<{ advanceStep: boolean; enqueueNext: boolean; reason: AdvancementReason }>;

export function decideAdvancement(input: Readonly<{ runMode: RunMode; currentStep: number; totalSteps: number; pendingApprovals: number; lastJobSucceeded: boolean }>): AdvancementDecision {
  if (!input.lastJobSucceeded) return Object.freeze({ advanceStep: false, enqueueNext: false, reason: "job_failed" });
  if (input.currentStep >= input.totalSteps) return Object.freeze({ advanceStep: false, enqueueNext: false, reason: "complete" });
  if (input.runMode === "manual") return Object.freeze({ advanceStep: false, enqueueNext: false, reason: "manual" });
  if (input.pendingApprovals > 0) return Object.freeze({ advanceStep: false, enqueueNext: false, reason: "awaiting_approval" });
  return Object.freeze({ advanceStep: true, enqueueNext: input.runMode === "auto", reason: "advanced" });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd web && npm test -- tests/unit/run-mode-advancement.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire post-settle advancement into the worker route**

First verify the artifact id shape the worker returns: `grep -n "artifact" web/lib/studio/worker.ts | head -20` — find the key in the returned result object (expected `artifact_id`; use whatever key is actually returned). Also verify the pending-approvals count source: `production_approvals` rows with `status = 'pending'` and `department_step = production.current_step`.

In `web/app/api/jobs/run/route.ts`, inside the `try` block immediately after the successful `finish_studio_job` call and before the `return`, add:

```ts
    if (job.production_id) {
      const { data: production } = await admin.from("productions").select("id, run_mode, current_step, status").eq("id", job.production_id).maybeSingle();
      const { count: pendingApprovals } = await admin.from("production_approvals").select("id", { count: "exact", head: true }).eq("production_id", job.production_id).eq("department_step", production?.current_step ?? 0).eq("status", "pending");
      const decision = decideAdvancement({ runMode: production?.run_mode === "semi_auto" || production?.run_mode === "auto" ? production.run_mode : "manual", currentStep: production?.current_step ?? 0, totalSteps: 13, pendingApprovals: pendingApprovals ?? 0, lastJobSucceeded: true });
      const artifactId = typeof (result as Record<string, unknown>).artifact_id === "string" ? (result as Record<string, unknown>).artifact_id as string : null;
      if (decision.advanceStep && artifactId && production?.status === "active") {
        await admin.rpc("advance_production", { target_production: job.production_id, target_artifact: artifactId });
      }
    }
```

Add `decideAdvancement` to the imports from `@/lib/studio/domain`. If the worker's result uses a different artifact key, use that key exactly. If `advance_production` rejects (RPC guards), catch and continue — the job is already settled truthfully; wrap the rpc call in its own try/catch and log via `createAuditEvent` with action `"auto_advance_failed"`. Replace the hardcoded `13` with the `DEPARTMENTS.length` import from the same module.

- [ ] **Step 6: Typecheck, lint, full suite**

Run: `cd web && npm run typecheck && npm run lint && npm test`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add web/lib/studio/domain.ts web/app/api/jobs/run/route.ts web/tests/unit/run-mode-advancement.test.ts
git commit -m "feat(productions): real run-mode advancement after job settlement"
```

---

## Post-plan gate (before Phase 2)

1. `cd web && npm run typecheck && npm run lint && npm test && npm run build` — all green.
2. `bash scripts/security-gate.sh` and `bash scripts/test-migrations.sh` from the repo root (where configured).
3. Manual smoke with `npm run dev`: universe Manage → detail → edit/lock; builder delete agent/lane; orchestration delete workflow; channel edit; dna/genplay redirects land on universe/studio.
4. Update `planning/beta-execution-plan.md` Phase 1 bullets to record completion (and the clean-start protocol's step 3 pointer to this file), plus any discovered contract changes in the spec per `planning/README.md`.

Phase 2 (doc-chain lanes, round-table modes, flows-as-data) gets its own detailed plan via the same process before implementation starts.
