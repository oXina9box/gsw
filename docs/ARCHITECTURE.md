# Gem Studio — Architecture

Gem Studio is a solo-creator AI film studio SaaS: brand channels feed productions, productions run through a pipeline of configured lanes and agents, agent output is bound into GenPlay shot contracts, and the worker assembles generated media into assets. Continuity is tracked as versioned DNA records in a Universe; AI providers are connected via encrypted BYOK secrets; usage is metered through a credit ledger. Open core; commercial add-ons per `LICENSE`.

## Stack

Next.js App Router (React 19, strict TypeScript, server components + server actions), Supabase for Auth/Postgres/RLS/Storage, Vitest + Playwright, PostgreSQL migrations under `supabase/migrations/` (additive only).

## Modules (sitemap contract — four only)

1. **Unknown User** — public discovery: home, studio/system/social-workshop explainers, gallery (curated public records only), docs, pricing, legal, contact, auth entry.
2. **Front Office** — studio-level operations: `/app` overview, channels, marketing/research, socials, staffing.
3. **Studio** — creative/production work: builder (lane configuration), Production Set, production detail with assembly workbench, assets warehouse (Universe/DNA are subviews), orchestration workflow builder.
4. **Account** — profile/security/data controls, billing & usage, integrations (connections + BYOK secrets).

New routes require owner approval. Server resolves capability/policy/workspace/quota/audit; pages only present decisions.

## Data flow

```
Channel (identity, audience, voice, budget)
   └─ brief → Production (rights attestation, run mode, credit cap)
        └─ Pipeline: departments → lanes → agents
             │    handoff rules + approval gates (manual / semi-auto / auto)
             │    round-table collaboration mode per lane
             └─ GenPlay shot contracts (versioned binders of shots/clips)
                  └─ Worker: provider generation → ffmpeg master assembly
                       └─ Assets warehouse (lineage, versions, rights, approvals)
                            └─ Socials: platform packages → explicit publish → reports/signals
```

Workflow definitions are user-owned, versioned workspace data managed in `/app/orchestration`; the 13-stage Gem Studio flow ships as the default template, not hard-coded law. Built-in and custom definitions execute through the same engine (`web/lib/orchestration/engine.ts`).

## Supabase schema overview

Migrations `0001`–`0028`, additive expand/backfill/switch/contract:

- **Tenancy:** `profiles`, `workspaces` — one solo workspace per account; all product tables carry `workspace_id`.
- **Front Office:** `channels`, marketing/research records.
- **Studio:** `departments`, `lanes`, `agents` (+ `agent_files` protected configs), `productions`, `production_events`, DNA records (Universe, tiered A/B).
- **Pipeline:** GenPlay tables (binders, shots, clips), `generated_assets`, assembly/release artifacts.
- **Orchestration:** workflows, handoff rules, executions/steps.
- **Commerce/accounting:** `credit_accounts`/`credit_ledger` (money as bigint cents), `commerce_products`, `purchases`, `provider_secrets`.
- **Platform:** catalogs (`agent_catalog`, `model_catalog`) readable by anon; rate-limit and quota tables; storage quotas enforced atomically.

## Worker / orchestration model

- Productions enqueue jobs at approval boundaries; the worker runs as an external process calling `POST /api/jobs/run`, authenticated by a timing-safe Bearer secret (`web/lib/studio/worker-auth.ts`).
- The orchestration engine resolves the next step from DB-persisted workflow definitions and handoff rules; advancement mode (`manual`/`semi_auto`/`auto`) is decided in `finish_studio_job`.
- Generation is provider-mediated behind normalized adapters; where a backend does not exist yet, seams exist but no fake success is produced.
- Assembly uses ffmpeg to produce masters; results return through the same artifact slots the production UI reads.
- Concurrency limits plus clip file/daily caps enforce at worker and registration boundaries; operational policy (spend, storage, bandwidth, job concurrency, rates) is enforced centrally server-side.

## BYOK secrets path

Provider keys are entered only through `/app/integrations`, encrypted with AES-256-GCM envelope encryption (`web/lib/studio/secrets.ts`) before persistence, stored in `provider_secrets`, and surfaced masked. Keys never reach the browser, logs, props, or agents lacking permission; rotation and replacement re-encrypt through the same path. Production keys never live in Git or browser config.

## RLS tenancy model

- Supabase session is the only auth source; every table has RLS enabled with policies checking `is_workspace_member(workspace_id)`.
- Defense-in-depth: every mutation additionally filters explicitly on `workspace_id` in application code — RLS alone is never the sole guard.
- No cross-workspace queries; missing/unauthorized records do not reveal existence across tenants.
- `SECURITY DEFINER` functions pin `SET search_path = public`; broad anon grants are revoked (SELECT only on public catalogs).
- Storage authorization mirrors RLS; exports and deletions are workspace-scoped with explicit confirmation flows.

## Governance

Doc-driven development: `planning/site-workflow-spec.md` is the product definition; behavior changes update spec → coverage doc → implementation plan → tasks first. Branches: `production` (live, protected default) ← `staging` ← `dev` ← `dev-<task>` task branches. Promotion requires owner approval and passing gates. TDD mandatory; ask first on schema, dependencies, public routes, payments/providers, legal content, destructive data behavior, CI/deploy.
