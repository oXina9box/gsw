# AGENTS.md — Gem Studio workspace guide

Gem Studio is a solo, all-inclusive AI film studio product: briefs, 13 production departments, agent configurations, private DNA continuity, GenPlay shot prompts, clip assembly, release planning, and audience signals. Open core with commercial add-ons (see `LICENSE`).

## Repository map

| Path | Purpose |
|---|---|
| `web/` | Canonical Next.js 15 / React 19 / TypeScript production app (Supabase auth) |
| `supabase/` | Database migrations (currently `migrations/0001_initial.sql`) and server functions |
| `dna/` | CDNA/LDNA/PDNA contracts, schemas, validator (`validator.py`), examples |
| `genplay/` | GenPlay contracts, validators (`binder.py`), schemas, examples (Python) |
| `index.html`, `dashboard.html`, `assets/` | Approved visual reference demo only — retire only after owner sign-off |
| `planning/` | Planning/spec documents; `planning/complete/` holds finished plans |
| `scripts/` | Repo checks (`structure-audit.sh`) |
| `_attic/` | Retired demo code — do not build on it |

## Commands (web/)

```bash
cd web
cp .env.example .env.local   # set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE (anon) key
npm install
npm run dev
npm run typecheck            # tsc --noEmit
npm run build
```

Note: root `README.md` lists `npm run lint`, `npm test`, `test:e2e`, and `scripts/security-gate.sh` / `scripts/test-migrations.sh` — these do not exist yet (as of 2026-08-22). Available scripts are `dev`, `build`, `start`, `typecheck`. `scripts/structure-audit.sh` is the only repo script.

Use Node 22.22.2. Apply all `supabase/migrations/` to a dev Supabase project before exercising authenticated features.

## Architecture boundaries

- `web/` is the future live product; the root HTML demo is reference material only. Never treat demo behavior as the production architecture without explicit owner approval, and never import demo records or localStorage state into `web/`.
- `web/app/` uses route groups: `(marketing)`, `(product)`, `(auth)`; Supabase clients live in `web/lib/supabase/`; auth middleware in `web/middleware.ts`.
- DNA and GenPlay are contract-first: change `dna/schemas/` or `genplay/schemas/` together with their validators and examples.
- Never commit service-role keys, provider credentials, OAuth secrets, or Stripe secrets. No Supabase service-role key in browser code.

## Planning-first workflow

For requests involving product, UX, architecture, or implementation decisions:

1. Gather repo context and research before changing anything.
2. Interview the requester through multiple rounds of clarifying questions on non-obvious requirements, edge cases, preferences, and constraints.
3. Write a detailed planning/spec document under `planning/`.
4. No implementation changes while a request is in the planning phase.
5. When planning is confirmed complete, move (not copy) the documents into `planning/complete/` so there is one authoritative version.
6. Begin implementation only in a later, explicitly authorized request.

Plans must distinguish demo behavior from production requirements and include migration/purge requirements where applicable.
