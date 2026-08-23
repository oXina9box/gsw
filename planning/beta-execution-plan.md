# Beta Execution Plan — Full-Function Live Product

**Status:** Ready for owner review
**Depends on:** `planning/lane-theory-spec.md`, `planning/future-live-product-execution-blueprint.md`
**Goal:** Fully functional site the owner runs real productions on with live data. "Beta" = owner stress-testing all functions before public launch. No dummy mode, no closed-off shortcuts that force a rearchitect later.

## Non-negotiables

- Every function works: onboarding, channel setup, department/lane/agent building, development lanes, casting + Universe, GenPlay, production lanes, social cycle, account management.
- All non-production agents run real AI via BYOK (OpenAI/Anthropic-based) with a credit-system hook coded but launchable disabled.
- Production image/video gen is off-site handoff (paste-back) with a provider backend interface ready to swap in.
- Self-hosted vs. cloud is a deployment-mode flag from day one; cloud-only depth gates exist in schema/feature flags.
- Fresh start: no demo/seed records imported.
- No service secrets in browser code or Git.

## Phase 1 — Data model & migrations (supabase/)

New migrations (workspace-scoped, RLS everywhere):

- `studio_settings` — studio identity (name, logo storage ref, colors, tagline, content type), onboarding state.
- `flows` / `flow_templates` — user-customizable lane structures + baseline templates (owner's 13-dept flow is *a* template). Departments, lanes, collaboration mode (forward / round-table + pass order per lane).
- `agents` / `agent_files` — role, type (worker/supervisor), six `.md` files, recommended model tier, model override.
- `channels` — identity, strategy, format preset, season/episode scope, schedule, budget, process depth (extend existing).
- `productions` — channel ref, lane instance state, status derived from lane progress (replaces `step` counter).
- `lane_instances` / `lane_tasks` — per-production spawned lanes and agent tasks: input payload, work product (JSON/markdown), pass-order state for round tables, done/approved/kickback status.
- `dna_records` — per blueprint §6.3 (JSONB, versioned, `dna_id` law, tier A/B, promotion events).
- `dna_sheets` — master look sheets per episode, linked to production + DNA records.
- `genplay_masters` / `genplay_binders` — per blueprint §6.4; server-side compile from `genplay/` Python logic.
- `provider_configs` — BYOK keys encrypted at rest (pgcrypto or Edge-held), provider routing prefs.
- `social_posts` / `social_signals` — chop list, post records, review/report/interact log, signal feedback link to next production.
- `production_events` — audit trail for all of the above.

## Phase 2 — Agent runtime (web/lib/agents/)

- Provider-agnostic router: OpenAI + Anthropic adapters now; adapter interface so Google/OpenRouter are config-only additions.
- BYOK path (decrypt server-side, per-workspace) + credit path (metering stub behind flag).
- Role runner: agent `.md` files → system prompt; lane context → user payload; streamed response → work product artifact.
- Recommended-model profiles per role template with user override.
- Manual/off-site backend implementing the same interface for production image/video tasks (emit GenPlay page prompt, accept pasted/uploaded result).

## Phase 3 — Onboarding & studio setup

- Post-signup onboarding wizard: studio assistant agent (guided/fast modes) driving the identity fields; marketing studio-role handoffs; lane education woven in.
- First-channel creation flow with format presets, season/episode scope, scheduling, budget, process depth.
- Hiring fair: department config from core four + optional teams; template picker; baseline = owner's flow.

## Phase 4 — Builder & workspace UI

- Full CRUD: departments, lanes, agents, six-file editor (port demo UX), collaboration mode + per-lane pass order.
- Studio overview, channels, channel detail with identity/strategy editing.
- Empty states for fresh accounts (no seeds).

## Phase 5 — Production workflow

- Development pipeline runner: seed → storyboards → plot → continuity → script → screenplay → GenPlay draft as lane instances; forward and round-table execution with real AI runs; work products viewable/versioned.
- Casting gate UI: Universe search (look/feel/persona/lore), reuse vs. spawn, B-tier spawn from minimum template, B→A promotion flow, casting additions.
- GenPlay compile server-side; lock/version semantics preserved.
- Production lanes per episode spawned from GenPlay needs: DNA sheets, imaging (off-site handoff), shots, review, b-roll, continuity, reshoot.

## Phase 6 — Social cycle & account

- Chop-up tool, post prep, lead-in marketing, post records, review/report/interact log.
- Signal board feeding next-production briefs.
- Account page completion: profile, password, sessions, deletion via trusted function.

## Phase 7 — Hardening & verification

- Real scripts to match README: `lint`, `test`, `test:coverage`, `test:e2e`, `security-gate.sh`, `test-migrations.sh` (fix or remove README claims).
- RLS negative tests (cross-workspace isolation), route inventory/footer checks, secret scan.
- Deployment-mode flag wiring (self-hosted vs cloud feature gates).

## Open items

- `planning/post-launch.md` — owner to drop in; schema/hook review against it before Phase 1 migrations are finalized.
- Exact BYOK provider list (OpenAI/Anthropic-based, TBD).
- Credit system metering details (post-launch gated).
