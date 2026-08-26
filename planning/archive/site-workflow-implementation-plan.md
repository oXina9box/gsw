# Gem Studio Site Workflow Implementation Plan

**Source:** `planning/site-workflow-spec.md`  
**Execution state:** Plan only; implementation starts after owner review  
**Dry launch target:** One owner account, real Supabase data, no commerce

**Hosting target:** Fully configured, production-grade public web hosting from day‑0. Owner-only product access does not weaken internet-facing security requirements.

**Commercial evolution target:** Follow `commercial-service-architecture.md` and `service-level-requirements.md`. Owner-launch behavior must extend additively to customer beta and paid service; no owner-ID, plan, provider, or single-user assumptions may leak into pages/domain actions.

## 0. Required development method

Execute in this order:

1. **Document-driven development:** Keep `site-workflow-spec.md`, `spec-contract-coverage.md`, and `post-launch.md` current. Every route and domain behavior must have an owner, contract, and acceptance statement before code.
2. **Spec-driven development:** Implement only behavior covered by the approved spec and contract matrix. Add tests from acceptance criteria before or alongside implementation. Do not invent missing product policy in code.
3. **Doubt-driven development:** Run `doubt-driven-review.md` checks after each phase. Convert doubts into falsifying tests, owner decisions, mitigations, or explicit post-launch deferrals. Launch-blocking doubts stop the phase.

Workflow sources:

- `/home/ox/Projects/Source-Data/skills/agent-skills/skills/spec-driven-development/SKILL.md`
- `/home/ox/Projects/Source-Data/skills/agent-skills/skills/test-driven-development/SKILL.md`
- `/home/ox/Projects/Source-Data/skills/skill-storage/8_agentic_and_meta/doubt-driven-development/SKILL.md`

Execution handoff:

- `planning/agent-implementation-handoff.md` assigns every task to exactly one agent using `@terra` or `@luna`, defines dependency gates, file ownership, review rules, and integration order.
- `@terra` owns policy, data integrity, infrastructure, security, recovery, and release evidence. `@luna` owns four-module routes, product workflows, content, and user-facing rehearsal.
- Numeric launch values are estimates already filled in `service-level-requirements.md`; implementation must enforce them centrally and may not invent page-local limits.

## 1. Guardrails

- Preserve four modules: Unknown User, Front Office, Studio, Account.
- Keep current public learning pages: `/studio`, `/system`, `/social-workshop`.
- Add public Gallery, Docs, Pricing, and Contact inside Unknown User.
- Keep current authenticated route family unless the workflow spec explicitly requires a compatibility redirect.
- Do not create a second shell, stylesheet, data source, or route tree.
- Use existing components, actions, Supabase clients, migrations, and tests before adding new abstractions.
- No localStorage product state, fake success, seeded private records, or browser-visible secrets.

## 2. Phase 0 — Baseline and route inventory

Inspect and record current behavior before editing:

- `web/app/(marketing)/layout.tsx`
- `web/app/(auth)/layout.tsx`
- `web/app/(product)/layout.tsx`
- `web/components/shell/*`
- `web/components/product/studio-nav.tsx`
- `web/lib/studio/navigation.ts`
- `web/app/(product)/actions.ts`
- `web/lib/studio/*`
- `supabase/migrations/*.sql`
- Existing unit, E2E, security, and migration tests

Create a route matrix with access state, module owner, data source, expected shell, and test coverage. Capture existing dirty-worktree changes; do not overwrite unrelated work.

**Gate:** Every current route has an explicit keep, move, redirect, or remove decision.

## 3. Phase 1 — Shared shell and navigation ownership

### Work

- Extend `SiteHeaderClient` with Unknown User header destinations: Gallery, Docs, Pricing, signup, login.
- Add public footer destinations, module entry links, Contact, legal links, and session-aware protected links.
- Keep `/studio`, `/system`, and `/social-workshop` public learning routes.
- Refactor `NAV_GROUPS` to exactly four visible module concepts while retaining secondary route compatibility.
- Reassign `/app/builder` to Studio navigation.
- Keep Marketing-owned operational lanes inside `/app/marketing`.
- Keep `/app/staffing` and `/app/agents` together under Front Office Staffing.
- Keep Account navigation mapped to `/account`, `/app/billing`, and `/app/integrations`.
- Add active-state and mobile-menu tests.

### Acceptance

- Logged-out and logged-in headers show correct actions without layout flash.
- Footer has same structure on every public and product page.
- Protected links preserve `next` and reject unsafe redirects.
- Keyboard, focus, escape, and mobile behavior pass.

## 3A. Commercial architecture foundations

Complete before feature-heavy page work:

- Add one tested server capability resolver for workspace role, launch mode, entitlements, quotas, and feature flags.
- Add server-enforced operational policy for signup, checkout, generation, publishing, uploads, maintenance, orchestration, and workspace suspension.
- Standardize correlation/audit metadata for server actions, jobs, external events, billing, security, and operator behavior.
- Keep provider/vendor output behind normalized job/adapter results; no provider SDK shapes in pages/domain rows.
- Require idempotency and durable lifecycle for external effects.
- Define data class/retention/export/deletion metadata for every new table, bucket, and event.
- Enforce expand/backfill/switch/contract migration pattern.
- Instrument initial SLIs before customer traffic.

**Gate:** Owner-launch permissions come from capability facts, not hard-coded identity; future roles/plans/providers can be added without changing page contracts.

## 4. Phase 2 — Unknown User pages

### Routes and content

Add:

- `web/app/(marketing)/gallery/page.tsx`
- `web/app/(marketing)/docs/page.tsx`
- `web/app/(marketing)/pricing/page.tsx`
- `web/app/(marketing)/contact/page.tsx`

Update existing Home, Studio, System, Social Workshop, Core Values, Terms, and Privacy pages to use final navigation and approved content.

### Behavior

- Gallery reads only approved public records or version-controlled curated content.
- Docs uses structured topics and in-page links.
- Pricing compares intended Free/Self-hosted and Managed Cloud offers; checkout remains gated during dry launch.
- Contact validates, rate-limits, stores or forwards messages safely, and shows delivery status.
- Core Values, Terms, Privacy cannot ship with placeholders.

### Tests

- Direct route and refresh tests for every public page.
- Link inventory test for header/footer completeness.
- Public data isolation test for Gallery.
- Contact validation, rate limit, success, and failure tests.
- Metadata, canonical, sitemap, and social-preview checks.

**Gate:** Unknown User can understand, evaluate, contact, and enter the product without authentication; no private data leaks.

## 5. Phase 3 — Front Office

### Overview

Update `/app/page.tsx` and supporting product components:

- Build studio-level summary queries.
- Add predefined cards/charts for channels, productions, approvals, blockers, credits, assets, signals, performance, and agents.
- Add brand/channel/date filters.
- Persist widget visibility/order only if current schema supports it; otherwise use a small workspace preference record.
- Keep custom actions out of dry launch.

### Channels

- Extend channel create/edit forms and validation for logo, theme, tokens, audience, rating, arcs, topics, budget, destinations, and rights.
- Add channel detail cross-links and related data panels.
- Remove delete controls from channel pages.
- Put archive/permanent deletion in Account data controls.

### Marketing and Research

- Split Studio versus channel scope in `/app/marketing`.
- Add strategy panels, schedules, budgets, production standards, research records, evidence links, and promotion into work.
- Attach non-creative/non-production lanes to this page.

### Socials

- Add staging, review, platform checks, scheduling, publishing state, interaction records, reports, and signal capture.
- Require explicit confirmation for external side effects.
- Keep adapters and credentials server-authorized.

### Staffing

- Show Studio Team roles and assignments.
- Show Gem Sourced catalog and configuration previews.
- Enable owner assignment/configuration without checkout or protected entitlements.
- Move transactional hiring and premium protection to `post-launch.md`.

### Data and tests

- Add only migrations required by missing workflow data.
- Add RLS policies and negative tests for every new table.
- Test empty workspace, populated workspace, invalid writes, cross-channel access, and failed provider/report states.

**Gate:** Owner can operate studio overview, channels, research, social planning, and team assignment with persisted data.

## 6. Phase 4 — Studio

### Build Production

Refactor `/app/builder/page.tsx`:

- Place Creative and Production lane configuration here.
- Support lane inputs/outputs, assigned agent, handoff, approval gate, and readiness.
- Preserve fixed department model.
- Keep Marketing-owned lanes out of this page.

### Production Set

Use `/app/studio/page.tsx` as active production floor. Keep `/app/front-office/page.tsx` as production-opening flow.

- Add production board, current lane, agent result, approval/revision controls, schedule, budget, events, and release readiness.
- Keep `/app/productions/[productionId]` as detailed source of truth.
- Prevent unauthorized status advancement.
- Show truthful blocked, waiting, failed, and empty states.

### Assets

Refactor `/app/assets/page.tsx` into warehouse entry point:

- DNA, Universe, documents, clips, generated assets, masters, social variants, and GenPlay documents.
- Add search/filter/preview/version/lineage/rights/channel/production relationships.
- Keep `/app/universe` and `/app/dna` as Assets subviews.
- Replace `/app/genplay` with redirect or filtered Assets/document view; preserve old links during migration.
- Enforce private Storage access and workspace RLS.

### Tests

- Lane configuration and assignment tests.
- Production state-machine tests.
- Approval and revision tests.
- Artifact lineage and version tests.
- Upload/download authorization tests.
- GenPlay compatibility redirect test.

**Gate:** Owner can configure the floor, run a production, approve artifacts, and find every output in Assets.

## 7. Phase 5 — Account

### Profile, security, data

Extend `/account` with:

- Profile and Studio name.
- Password/MFA/session controls.
- Export.
- Channel archive/deletion.
- Account deletion with confirmation, grace period, purge, and cancellation rules.

### Billing

Keep `/app/billing` truthful for dry launch:

- Show owner plan/usage/credits/reservations/ledger.
- Hide or disable checkout without claiming a completed purchase.
- Keep commerce integration points documented for post-launch.

### Connections and secrets

Extend `/app/integrations`:

- AI/model and social connections.
- Validation and capability status.
- Masked credentials.
- Replace/rotate/disconnect.
- Server-only secret handling.

### Tests

- MFA and session tests.
- Export authorization and payload tests.
- Deletion scheduling/purge/cancel tests.
- Secret masking and rotation tests.
- Billing read-only dry-launch tests.

**Gate:** Owner can secure, export, and remove account data without support-only operations.

## 8. Phase 6 — Security, accessibility, and verification

Run:

- Typecheck, lint, build.
- Unit and integration tests.
- Playwright public and protected route tests.
- Supabase migration tests.
- RLS positive/negative matrix.
- Storage access matrix.
- Secret scan and dependency audit.
- Keyboard and reduced-motion checks.
- Mobile viewport checks.
- Route/link inventory.
- Error and expired-session checks.

Verify no production dependency on root demo HTML, hash routing, localStorage, fake IDs, seeded private records, or unsupported successful actions.

### Day‑0 security implementation

Implement `planning/day-zero-public-hosting-security.md` as a blocking workstream:

- Production environment separation, DNS, TLS, exact callbacks, protected deployment, secret manager, least-privilege access.
- Enforced CSP/security headers, exact CORS, WAF/bot controls, endpoint/request/upload limits.
- Auth/session/MFA/re-authentication hardening and enumeration-resistant rate limits.
- Complete RLS/Storage two-workspace negative matrix and composite ownership integrity.
- Schema validation, XSS/SQL/SSRF/upload defenses, quotas, webhook verification, replay protection, and idempotency.
- Secret scanning/rotation, dependency audit, immutable CI/build provenance, pinned automation.
- A deployable-scope public threat-mode security gate; the existing local scanner report alone is insufficient.
- Structured logs, error tracking, audit events, metrics, alerts, on-call/escalation, incident response.
- Encrypted backups, Storage recovery, isolated restore rehearsal, RTO/RPO, application/database rollback.
- Final privacy/legal/commercial behavior validation.
- Initial SLO instrumentation, launch-capacity/load/retry-storm tests, cost ceilings, provider degraded modes, support escalation, Core Web Vitals, and accessibility audit.

No severity waiver may hide critical/high findings. Medium exceptions require explicit owner acceptance, compensating control, and expiry.

## 9. Phase 7 — Dry launch

- Configure one owner account and one workspace.
- Seed only approved public catalog/reference data.
- Run complete owner workflow from empty workspace to finished production and social review.
- Capture defects in implementation issue list, not in production data.
- Enable monitoring, backups, worker health, purge job, and rollback procedure.
- Keep public signup and commerce gated.
- Complete all five security release gates and attach evidence.
- Run production canary before opening traffic; verify synthetic public/authenticated workflows, logs, alerts, TLS, headers, and rollback.

**Dry-launch definition of done:** Owner can operate every required first-launch workflow with real data, truthful state, protected secrets, tested RLS, recoverable failures, monitored production hosting, rehearsed recovery, and signed day‑0 security evidence.

## 10. Deferred gates

Do not begin post-launch work until owner approves dry-launch behavior. Track later work in `planning/post-launch.md`: public users, commerce, premium protection, self-hosted edition, teams, custom actions, and expanded adapters.
