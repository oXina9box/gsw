# AGENTS.md — Gem Studio workspace guide

Gem Studio is a solo-creator AI film studio SaaS: channels → productions → 13-stage pipeline → GenPlay shot contracts → generated media, with a Universe of DNA continuity records, BYOK AI providers, credits, and protected agent configurations. Open core; commercial add-ons (see `LICENSE`).

## Branch policy

- **`production` is the only branch.** `main` was deleted (local + GitLab); GitLab default branch is `production`, protected (maintainer push/merge, no force push). Do not recreate `main`.

## Repository map

| Path | Purpose |
|---|---|
| `web/` | The app: Next.js **16** App Router, React 19, strict TS, server components + server actions |
| `web/lib/studio/` | Domain core: capability/policy resolution, worker, secrets (AES-256-GCM BYOK), caps, domain constants, navigation contracts |
| `web/lib/orchestration/` | DB-driven workflow engine (workflows, handoff rules, executions) |
| `web/app/api/` | Checkout, Stripe webhook, jobs/run (worker endpoint, Bearer secret), account export, maintenance |
| `supabase/migrations/` | Schema, RLS, RPCs — additive only (expand/backfill/switch/contract) |
| `planning/` | Governance set; read `planning/README.md` for the required order |
| `dna/`, `genplay/` | DNA schemas (CDNA/LDNA/PDNA + deferred groups) and GenPlay contract tooling |
| Root `index.html`, `dashboard.html`, `assets/`, `_attic/` | Legacy demo — reference only, never production |

## Commands

From `web/`: `npm run typecheck` · `npm run lint` (max-warnings=0) · `npm test` (Vitest; `--coverage` for thresholds) · `npm run test:e2e` (Playwright; protected tests need Supabase env) · `npm run build` · `npm run dev`. Node 22.22.2.
From root: `bash scripts/test-migrations.sh`, `bash scripts/security-gate.sh`, `bash scripts/structure-audit.sh`.

## Non-negotiable laws (from planning/)

- **Doc-driven:** `site-workflow-spec.md` is the product definition. Behavior changes update spec → `spec-contract-coverage.md` → implementation plan → tasks first. Do not invent product policy in code.
- **Four modules only:** Unknown User, Front Office, Studio, Account. New routes need owner approval; `/app/orchestration` is experimental diagnostics, never a fifth module.
- Server resolves capability/policy/workspace/quota/audit. UI presents decisions and stable errors. No capability logic in pages.
- RLS on everything; workspace is the tenant boundary. No cross-workspace queries, no browser secrets, no localStorage as product truth, no fake mutations.
- TDD mandatory: RED → smallest GREEN → full affected suite → refactor while green.
- **Ask first:** schema/migrations, new dependencies, public route changes, payment/provider policy, legal content, destructive data behavior, CI/deploy changes.
- `web/AGENTS.md` is Next-16-generated guidance — read it before touching Next-specific APIs (it's not the Next you know).
- Production keys/credentials never in Git or browser config; BYOK keys only through the encrypted `provider_configs` path.

## Current focus (owner direction)

Owner wants full-function beta on live data: lane-theory workflow (`planning/lane-theory-spec.md` — doc-chain lanes, round-table pass orders, casting gate, DNA tiers, onboarding wizard, in-site AI via BYOK). Delta between that spec and current code is tracked in `planning/beta-execution-plan.md`. No stubs — things ship working or as interfaces awaiting a backend.
