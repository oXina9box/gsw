# Current State — Gem Studio

Snapshot: 2026-08-24.

## Branches

- Local: `dev` (checked out), `staging`, `production`. Remote mirrors all three on GitLab; remote default is protected `production`. Idle-state policy (exactly three branches) holds.
- Recent remediation work landed on `staging` (last recorded remediation commit: `c4acca2`).

## Done

- **Phases 1–6 core paths implemented and verified locally** (beta execution plan):
  - Phase 1 defects/truthfulness: workspace-scoped DNA editing, confirmed deletions, worker concurrency + clip caps, handoff condition validation, canonical redirects, semi-auto/auto advancement in `finish_studio_job`.
  - Phase 2 lane theory: persisted workflow/lane collaboration metadata, doc-chain merge semantics, orchestration in Studio navigation, template seams (default-template picker pending verification below).
  - Phase 3 Universe tiers (A/B DNA + promotion), Phase 4 onboarding, Phase 5 production completion + assembly, Phase 6 social cycle/reports.
  - Already-working baseline (not re-planned): auth + MFA, workspace bootstrap, channels/marketing CRUD, builder + six-file agent editor, agent catalog hiring with entitlement gating, production detail with approvals/job enqueue/GenPlay contracts/clip uploads, ffmpeg master assembly, orchestration engine, BYOK envelope encryption, credit ledger + Stripe checkout/webhook, account export/deletion, capability/policy/caps/audit core, day-0 security scripts.
- **Remediation batch (2026-08-23, CRITICAL-FIXES plan):** explicit `workspace_id` filters added to server actions (defense-in-depth), anon grants revoked (`0025`), workspace mutation policies (`0026`), performance indexes (`0027`), rate limiting (`0028`). Migrations now at 0028.
- **Verification state at last audit:** typecheck/lint clean, 23 Vitest files / 111 tests green, Next build (42 routes), 20 Playwright smoke tests, migration tenant matrix, security gate (0 in-scope high findings), npm audit 0 high.

## Pending

- **Infra provisioning (Phase 7 blocker):** isolated production Supabase/PITR/Storage authority, TLS/WAF/DNS/SMTP, authenticated two-workspace staging fixture for integration tests, restore rehearsal with measured RTO/RPO, canary/rollback, launch signatures. Phase 7 evidence cannot be produced without these.
- **Favicon assets:** app icon/favicon set still missing.
- **aria-describedby fix:** auth form error inputs need `aria-describedby` wiring (from site review accessibility findings).
- Open verification items from the completion audit: round-table runtime cycles, template picker, casting workbench, production workbench, social approval action E2E coverage.
- Owner decisions deferred per spec §8: final legal copy (Terms/Privacy/Core Values), pricing, public signup policy, payment/tax rules, legal-clearance desk (explicitly deferred until counsel input exists).

## Working agreements reminder

Task branches `dev-<task>` from `dev`; promotion requires owner approval and gates. Spec first, then coverage doc, plan, tasks. TDD mandatory.
