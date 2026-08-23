# Beta Execution Plan — Delta to Full-Function Live Product

**Status:** Re-cut 2026-08-23 against the real `production`-branch codebase (replaces the pre-slice plan written against placeholder pages).
**Depends on:** `lane-theory-spec.md` (workflow law, incl. §9 implementation state), `site-workflow-spec.md` (routes/contracts/security), `planning/README.md` (governance order), `post-launch.md` (additivity contract).
**Goal:** Owner runs real productions on live data with every function working. No stubs — features ship working or as interfaces awaiting a backend (e.g., provider generation) that doesn't exist yet.

## Clean-start protocol (for a fresh session)

1. Read in order: root `AGENTS.md` → `planning/README.md` → this file → `lane-theory-spec.md` → `site-workflow-spec.md`.
2. Gate 0 (below) is RESOLVED — do not re-ask the owner; rulings are recorded.
3. **Phase 1 is fully task-cut:** execute `planning/beta-phase1-tasks.md` task-by-task (TDD, checkbox-tracked).
4. Phases 2–7 are plan-of-record only: before implementing each, write its detailed task plan (same format as Phase 1's) from the phase description below plus spec/lane-theory, then execute. Phase ordering: 2 (lane theory core) → 3 (casting/Universe tiers) → 4 (onboarding) → 5 (production completion) → 6 (social) → 7 (hardening).
5. Verify repo state before acting: `git branch` must show `production`; if the owner says "scan repo", re-survey before editing.

**What already works and is NOT re-planned:** auth + MFA, workspace bootstrap, channels/marketing CRUD, builder + six-file agent editor, agent catalog hiring with entitlement gating, Universe versioned DNA records, production detail with approvals/job enqueue/GenPlay shot contracts/clip uploads, ffmpeg master assembly, orchestration engine, BYOK integrations with envelope encryption, credit ledger + Stripe checkout/webhook, account export/deletion, capability/policy/audit/caps core, test suites, day-0 security scripts.

## Gate 0 — Spec reconciliation (RESOLVED 2026-08-23)

Owner rulings, all now reflected in `site-workflow-spec.md` and `spec-contract-coverage.md`:

1. **Flow customization is core** (ruled during interviews): workflow definitions become user-owned, versioned workspace data; the 13-stage flow ships as the default template, not hard-coded law. Post-launch Stage 7's "template versioning/validation" hardening still applies later; the capability itself is beta scope.
2. **Video editor = assembly workbench** on production detail: ordered shots, trims, audio choices → edit decision list + assembly package for off-site editing; results return through the same artifact slots the worker uses. Full in-browser editor is a provider-era upgrade on the same interface.
3. **Legal/clearance desk: deferred** — no legal advisors engaged; do not build until counsel input exists. Recorded in spec §8 open questions.
4. **Orchestration promoted to the supported workflow builder** (Studio module surface) per the amended spec section.

## Phase 1 — Defects and truthfulness (small, immediate)

- Fix `/app/universe/[id]` dead Manage links (route or remove buttons).
- Edit/delete for created entities: channels, lanes, agents, workflows (spec allows channel deletion only via Account — honor that; others get their surfaces).
- Enforce CAP_LIMITS at the real enforcement points (worker, uploads) — currently a seam.
- Orchestration conditions: reject unsupported ops loudly instead of silently failing rules.
- Make `/app/dna` and `/app/genplay` the spec'd Assets subviews/redirects instead of passive "after migration" pages.
- Auto run-modes: define the advance loop for `semi_auto`/`auto` (worker poll cadence, approval gates honored) so auto doesn't stall.

## Phase 2 — Lane theory core (the workflow law)

- **Doc-chain semantics:** agent receives complete prior doc set, adds/creates, passes full set forward; supervisor/expert final desk reviews; kickback by agent or user per setting **manual / semi-auto / auto**.
- **Round-table mode:** per-lane pass orders (1-2-3, 2-1, repeated cycles) as first-class collaboration mode alongside forward lanes.
- **Flows-as-data in `/app/orchestration`** (now the supported workflow builder per Gate 0 ruling 4): promote from flag-gated diagnostics to Studio navigation; workflow/department/lane definitions become user-owned, versioned workspace data; owner's 13-stage flow ships as the default template; baseline template picker at production/channel creation.
- Extend orchestration condition ops to the set the UI already accepts (and validate input).

## Phase 3 — Casting gate + Universe tiers

- DNA tier field (A/B), B→A promotion flow with audit, casting additions.
- Casting workbench: search Universe for look/feel/persona/lore fit vs. spawn from minimum template; scouts (location/asset) same pattern; feeds worker context (seam already exists).
- DNA groups: add Studio/Channel/Season/Socials/FDNA types to the generic `dna_records` model (new schema files, no migration churn); Universe UI organizes by group.

## Phase 4 — Onboarding wizard

- Post-signup guided flow: studio assistant agent (guided/fast modes) → studio identity (name, logo, colors, tagline, content type) → first channel (format preset, season/episode scope, schedule, process depth) → hiring fair (department config from templates).
- Assistant educates on lanes while configuring; runs on in-site AI (BYOK).

## Phase 5 — Production completion

- Per-episode production lanes sized by GenPlay needs (DNA sheets, imaging, shots, review, b-roll, continuity, reshoot) — flows from Phase 2 data model.
- DNA data sheets: master look sheet compiled per entity, stored, carried forward.
- GenPlay compile server-side from shot contracts (port `genplay/` validation; keep lock/version semantics).
- Off-site generation handoff: emit provider-ready page prompts, accept pasted/uploaded results into the same artifact slots the worker uses — identical interface to future provider wiring.
- Assembly workbench per Gate 0 ruling 2: ordered shot sequence, trim/keep decisions, audio choices → edit decision list + assembly package for off-site editing.
- Model tier recommendations: free/mid/best per role template with user override; budget as user-managed guideline tracking (no enforcement).

## Phase 6 — Social cycle close

- Publication prep/lead-ins, platform packaging (YT/X/TikTok/IG/FB first), explicit publish confirmation, report/interact capture, signal records structured for later A/B comparison analysis.
- Signal → next-brief promotion path (marketing consumes signals — seam exists via manual signals).

## Phase 7 — Beta hardening

- E2E coverage for the real CRUD flows (currently policy-heavy, page-light).
- Day-0 checklist run with evidence; doubt review per `planning/README.md`; restore rehearsal.
- Launch per governance: no "mostly ready."

## Owner open items

- Final legal/Gallery/Core Values content (spec §8) — before public-user launch, not before beta. Legal desk design deferred until counsel exists (Gate 0 ruling 3).
- Exact BYOK provider list (OpenAI/Anthropic-based; adapters are generic already).
