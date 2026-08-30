# AGENTS.md — Gem Studio

Gem Studio is a solo-creator AI film studio SaaS: channels → productions → 13-stage pipeline → GenPlay shot contracts → generated media, with a Universe of DNA continuity records, BYOK AI providers, credits, and protected agent configurations. Open core; commercial add-ons (see `LICENSE`).

## Branch policy

- `production` = live. `staging` = pre-production. `dev` = integration. Remote default: `production`, protected.
- Every task/change gets its own branch cloned from `dev`, named `dev-<task>`.
- Completion: merge `dev` into the finished `dev-<task>`; that result becomes the new `dev`. Push to GitLab immediately.
- Promotion dev → staging → production requires owner approval and passing gates.
- Merged/completed branches are deleted; idle state is exactly `production`, `staging`, `dev`.
- Never recreate `main`; it was deleted intentionally.

## Repository map

| Path | Purpose |
|---|---|
| `web/` | The app: Next.js App Router, React 19, strict TS, server components + server actions |
| `web/lib/studio/` | Domain core: capability/policy resolution, worker, secrets (AES-256-GCM BYOK), caps, domain constants, navigation contracts |
| `web/lib/orchestration/` | DB-driven workflow engine (workflows, handoff rules, executions) |
| `web/app/api/` | Checkout, payments webhook, jobs/run (worker endpoint, Bearer secret), account export, maintenance |
| `supabase/migrations/` | Schema, RLS, RPCs — additive only (expand/backfill/switch/contract) |
| `planning/` | Governance set; read `planning/README.md` for the required order |
| `dna/`, `genplay/` | DNA schemas and GenPlay contract tooling |
| Root `index.html`, `dashboard.html`, `assets/`, `_attic/` | Legacy demo — reference only, never production |

## Components and blocks

- Primary asset source: [Kitwind Kometa](https://kitwind.io/products/kometa)
- Secondary design systems: [Preline Blocks](https://preline.co/blocks), [Flowbite Blocks](https://flowbite.com/blocks/)

## Commands

From `web/`: `npm run typecheck` · `npm run lint` (max-warnings=0) · `npm test` (Vitest) · `npm run test:e2e` (Playwright) · `npm run build` · `npm run dev`.
From root: `bash scripts/test-migrations.sh`, `bash scripts/security-gate.sh`, `bash scripts/structure-audit.sh`.

## Laws

- **Doc-driven:** `planning/site-workflow-spec.md` is the product definition. Behavior changes update spec → coverage doc → implementation plan → tasks first. Do not invent product policy in code.
- **Four modules only:** Unknown User, Front Office, Studio, Account. New routes need owner approval.
- Server resolves capability/policy/workspace/quota/audit. UI presents decisions and stable errors. No capability logic in pages.
- RLS on everything; every mutation filters explicitly on `workspace_id` in addition to RLS. No cross-workspace queries, no browser secrets, no localStorage as product truth, no fake mutations.
- TDD mandatory: RED → smallest GREEN → full affected suite → refactor while green.
- **Ask first:** schema/migrations, new dependencies, public route changes, payment/provider policy, legal content, destructive data behavior, CI/deploy changes.
- Read `web/AGENTS.md` before touching Next-specific APIs.
- Production keys never in Git or browser config; provider keys only through the encrypted path.

## Audit discipline

- Scan source code only — never build output, generated chunks, or vendored dependencies.
- Reports include date + commit, deduplicate against existing findings before writing.
- Mark items done as they're committed; don't leave stale checklists.
