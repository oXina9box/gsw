# Gem Studio — Project Map

Solo-creator AI film studio SaaS: channels → productions → pipeline → GenPlay shot contracts → generated media, with DNA continuity, BYOK providers, credits.

## Directory map

| Path | What lives there |
|---|---|
| `web/` | The app: Next.js App Router, React 19, strict TS. Read `web/AGENTS.md` before Next-specific work. |
| `web/app/(marketing)/` | Unknown User public pages (home, studio, system, gallery, docs, pricing, legal, contact). |
| `web/app/(auth)/`, `web/app/auth/` | Account lifecycle routes (signup/login/reset/MFA) and auth callbacks. |
| `web/app/(product)/` | Front Office (`/app/*`) and Account surfaces; server actions live here too. |
| `web/app/api/` | Checkout, Stripe webhook, jobs/run (worker endpoint), account export, auth, health, maintenance. |
| `web/components/` | Shared shell, marketing, auth, and product UI. |
| `web/lib/studio/` | Domain core: capability/policy resolution, worker + worker-auth, BYOK secrets (AES-256-GCM), caps, navigation contracts, GenPlay helpers, ffmpeg assembly, export, social, onboarding. |
| `web/lib/orchestration/` | DB-driven workflow engine (workflows, handoff rules, executions). |
| `web/lib/supabase/`, `web/lib/auth/`, `web/lib/stripe/` | Supabase SSR clients, session helpers, billing integration. |
| `web/tests/`, `web/coverage/` | Vitest unit tests and Playwright E2E smoke; coverage output. |
| `web/content/` | Public legal/editorial content. |
| `supabase/migrations/` | Schema, RLS, RPCs — additive only (expand/backfill/switch/contract). |
| `dna/` | DNA continuity schemas + Python validator tooling. |
| `genplay/` | GenPlay shot-contract schema/binder tooling (Python). |
| `planning/` | Governance set. Read `planning/README.md` for the required reading order. |
| `scripts/` | Migration checks, security gate, structure audit, staging seed. |
| `index.html`, `dashboard.html`, `assets/`, `_attic/` | Legacy demo — reference only, never production. |

## Key entry points

- App shell: `web/app/layout.tsx`; route groups per module above.
- Worker endpoint: `POST /api/jobs/run`, authenticated by Bearer secret via `web/lib/studio/worker-auth.ts`.
- Server actions: `web/app/(product)/actions.ts` (all mutations filter explicitly on `workspace_id`).
- Orchestration engine: `web/lib/orchestration/engine.ts`.

## Commands

From `web/`: `npm run dev` · `npm run typecheck` · `npm run lint` (max-warnings=0) · `npm test` · `npm run test:e2e` · `npm run build`.
From root: `bash scripts/test-migrations.sh` · `bash scripts/security-gate.sh` · `bash scripts/structure-audit.sh`.

## Branches

`production` = live, protected default. `staging` = pre-production. `dev` = integration. Task branches: `dev-<task>` cloned from `dev`. Never recreate `main`.
