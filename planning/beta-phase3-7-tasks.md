# Beta Phases 3–7 Tasks

Status: execution plan, 2026-08-23. Source: `beta-execution-plan.md`, `lane-theory-spec.md`, `site-workflow-spec.md`.

## Phase 3 — Casting and Universe tiers

- [x] Add A/B tier and group schema (`0015_phase3_universe_tiers.sql`).
- [x] Add audited B→A promotion RPC/action/UI with workspace checks.
- [x] Add casting workbench search/list and attach selected DNA to production.
- [x] Add integration tests for tier validation, promotion idempotence, audit event, and tenant isolation (`supabase/tests/studio_invariants.sql` and `web/lib/studio/domain.test.ts`).

## Phase 4 — Onboarding

- [x] Persist guided/fast onboarding profile (`0016_phase4_onboarding.sql`).
- [x] Build wizard steps identity → channel → hiring; save each step server-side.
- [x] Connect completion to default workflow template and first-channel/departments creation.
- [x] Add integration tests for step transitions, malformed input, retry, and workspace scope (`supabase/tests/studio_invariants.sql` and `web/lib/studio/onboarding.test.ts`).

## Phase 5 — Production completion

- [x] Add per-production lane plan persistence/UI.
- [x] Compile cast DNA into persisted master DNA sheet.
- [x] Add provider-ready JSON handoff import interface.
- [x] Add assembly decision persistence (`0017_phase5_production_assembly.sql`) and ordered trim/keep/audio workbench.
- [x] Add model tier recommendation/override fields and user-managed guideline tracking.

## Phase 6 — Social cycle

- [x] Add platform package persistence and explicit approval (`0018_phase6_social_cycle.sql`).
- [x] Add publication prep for YouTube/X/TikTok/Instagram/Facebook; no implicit publishing.
- [x] Promote selected signal into next brief with audit.
- [x] Capture performance, conversation, and interaction reports as structured records.
- [x] Add integration tests for status transitions, idempotency, and publish authorization (`supabase/tests/studio_invariants.sql` and `web/lib/studio/social.test.ts`).

## Phase 7 — Hardening and launch evidence

- [x] Add Playwright coverage for signed-out access to all Phase 2–6 surfaces.
- [x] Run typecheck, lint, unit, build, migration, and security gates locally.
- [ ] Complete `day-zero-release-checklist.md`, doubt review, and isolated restore rehearsal with evidence (requires production infrastructure).
- [ ] Resolve all high/critical findings; no placeholders or disabled beta paths remain.

Acceptance: every checkbox has a test or runtime artifact; docs updated with command evidence; no phase marked complete without gate output.
