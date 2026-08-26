# Gem Studio Master Implementation & Release Plan

**Status:** Authoritative single clean base — updated 2026-08-24.  
**Authority:** Synthesizes `site-workflow-spec.md`, `lane-theory-spec.md`, `commercial-service-architecture.md`, `service-level-requirements.md`, and `day-zero-public-hosting-security.md`; the Day-0 checklist, post-launch roadmap, and companion runbooks are consolidated here and archived in `planning/archive/`.  
**Archive:** All completed phase tasks, earlier handoffs, superseded roadmap/runbooks (`day-zero-release-checklist.md`, `post-launch.md`, `restore-rehearsal.md`, `supabase-auth-hook.md`), and temporary evidence files are consolidated in `planning/archive/`.

---

## 1. Verified Implementation Baseline (Complete)

The codebase is on an additive, strictly tested foundation under `web/` and `supabase/`:

- **Platform & Runtime:** Next.js 16 App Router, React 19 server components + server actions, Supabase Auth/Postgres/RLS/Storage, strict TypeScript.
- **Database & Migrations:** 28 additive migrations (`0001_initial.sql` through `0028_rate_limiting.sql`) tested with `scripts/test-migrations.sh` (tenant isolation, routine grants, storage quotas, rate limits).
- **Quality Gates:** 23 Vitest test files / 111 unit tests passing (`npm test`), 42 static/dynamic routes building cleanly (`npm run build`), zero ESLint warnings (`npm run lint`), 20 Playwright smoke tests passing (`npm run test:e2e`), and zero in-scope high/critical security findings (`scripts/security-gate.sh`).
- **Four-Module Routing Coverage:**
  - **Unknown User (Public):** `/`, `/studio`, `/system`, `/social-workshop`, `/gallery`, `/docs`, `/pricing`, `/core-values`, `/contact`, `/terms`, `/privacy`, `/signup`, `/login`, `/forgot-password`, `/reset-password`, `/verify-email`, `/mfa`.
  - **Front Office:** `/app`, `/app/channels`, `/app/channels/[channelId]`, `/app/marketing`, `/app/social`, `/app/staffing`, `/app/agents`.
  - **Studio:** `/app/builder`, `/app/studio`, `/app/front-office`, `/app/productions/[productionId]`, `/app/assets`, `/app/universe`, `/app/universe/[id]`, `/app/orchestration`, `/app/onboarding`, `/app/dna` (redirect), `/app/genplay` (redirect).
  - **Account:** `/account`, `/app/billing`, `/app/integrations`.
- **Domain Features Shipped:**
  - **Lane Theory Core:** Persisted workflow definitions and lane collaboration modes (forward vs. round-table pass orders and repeated cycles), document-chain merge semantics, flows-as-data under `/app/orchestration` with the 13-stage default template and production template picker.
  - **Casting & Universe Tiers:** A/B tiering, B→A promotion RPC with audit logging, casting search and attachment to productions, multi-group categorization (Universe, Studio, Channel, Season, Socials, FDNA).
  - **Onboarding Wizard:** `/app/onboarding` guided/fast profile persistence, studio identity → first channel → hiring fair steps, department initialization, and default workflow template provisioning.
  - **Production Completion:** Per-production lane plans, compiled master DNA sheets, assembly workbench with ordered shot sequences and trim/keep/audio decisions, model tier recommendations, and user-managed guideline tracking.
  - **Social Cycle:** Platform packaging (YouTube, X, TikTok, Instagram, Facebook), explicit approval/publish confirmation, report and interaction capture, and signal promotion into next briefs.
  - **Foundations & Security:** Workspace capability resolver, operational kill switches, numeric safety caps (`CAP_LIMITS`), envelope-encrypted BYOK secrets (AES-256-GCM), credit ledger, Stripe checkout session integration, account export, and purge lifecycle.

---

## 2. Master Task List (What Needs to Be Done)

### Phase A: Public Content & Legal Copy Sign-Offs (Pre-Launch Gaps)

- [ ] **A.1 Legal & Privacy Final Copy:** Replace draft content in `web/app/(marketing)/terms/page.tsx`, `web/app/(marketing)/privacy/page.tsx`, and `web/app/(marketing)/core-values/page.tsx` with owner- and counsel-approved text.
- [x] **A.2 Public Gallery Curated Showcase:** Curated public records, strict publication filters, safe fallback, and privacy verification added (2026-08-26).
- [x] **A.3 Public Docs & Pricing Finalization:** Added usage/policy documentation, qualified rights and invite-only pricing state, and placeholder verification (2026-08-26).
- [ ] **A.4 Transactional Email Delivery for Contact Form:** Connect `/contact` server action to production transactional email sender (Resend / SendGrid / SES) with rate limiting, SPF/DKIM verification, and fail-closed error handling.

### Phase B: In-App UI & Runtime Feature Refinements (From Lane Theory Spec §9)

- [x] **B.1 Interactive BYOK Studio Assistant:** Guided onboarding can call an active workspace-scoped BYOK text provider for live setup suggestions (2026-08-26).
- [x] **B.2 Casting Fit Scoring & Spawn-from-Template:** Fit scoring against lore/persona plus B-tier spawn-and-cast flow are available in the production casting workbench (2026-08-26).
- [ ] **B.3 DNA Non-Universe Group Management UI:** Complete dedicated creation and edit UI controls for Studio, Channel, Season, Socials, and FDNA groups under `/app/universe` (group reassignment on record edit landed 2026-08-26; dedicated creation flows remain).
- [x] **B.4 Supervisor Desk Review & Kickback Workflow:** Execution workbench provides supervisor approve/kickback triggers for forward and round-table lanes (2026-08-26); role-gated review policy remains open.
- [x] **B.5 Off-Site Generation Import Polish:** Formatted copy exports for Midjourney, Runway, Pika, and ElevenLabs added to production shot cards (2026-08-26).
- [ ] **B.6 Persistent Worker Poller Service:** Implement a background worker daemon or webhook listener to poll and process queued jobs in `job_queue` using configured BYOK provider connections.
- [ ] **B.7 Direct Social Platform Publishing Adapters:** Build optional direct API publishing adapters for YouTube, X, TikTok, Instagram, and Facebook behind the existing social publication state machine.

### Phase C: External Staging & Production Infrastructure Gates (Day-0 Security Standard)

- [ ] **C.1 Dedicated Production Hosting & Environment Separation:**
  - Provision isolated production Supabase project (separate from dev/staging).
  - Configure production deployment on Vercel / Cloudflare / AWS with custom domain, strict TLS, HSTS, DNS, and canonical redirects.
  - Set `NODE_ENV=production`, disable debug output, and strip `X-Powered-By`.
- [ ] **C.2 Production Edge & Security Protections:**
  - Enforce production Content Security Policy (CSP), exact CORS allowlist, and security headers.
  - Configure WAF / DDoS / bot mitigation rules.
- [ ] **C.3 Production Secrets & KMS Management:**
  - Provision production encryption keys (`PROVIDER_SECRET_ENCRYPTION_KEY`, Supabase service role keys, Stripe production keys) in hosting secret manager.
  - Ensure zero runtime secrets in Git, browser bundles, or CI logs.
- [ ] **C.4 Supabase Auth Hook / Invite-Only Gate (`planning/archive/supabase-auth-hook.md`):**
  - Implement Postgres trigger or Supabase Auth Hook on `auth.users` to enforce `beta_invites` consumption when `signup = invite_only`.
  - Verify direct anonymous Supabase signup attempts fail with `403 invite_required`; a valid unconsumed `beta_invites.code` succeeds.
  - Fallback if Auth Hooks are unavailable: trigger/`CHECK` on `public.profiles` inserts joining `beta_invites` (deny when invite-only without unconsumed invite); Auth Hook remains the target.
- [ ] **C.5 Production Observability & Error Monitoring:**
  - Integrate error tracking service (e.g., Sentry) across Next.js client, server actions, and route handlers.
  - Configure structured JSON logging with automated redaction of auth tokens, secrets, and private payloads.
  - Set up alerting for Sev-1 / Sev-2 incidents and error budget threshold consumption.
- [ ] **C.6 Isolated Backup & Restore Rehearsal (`planning/archive/restore-rehearsal.md`):**
  - Enable Supabase Point-in-Time Recovery (PITR) with 7-day retention and Storage backups.
  - Execute restore rehearsal into isolated rehearsal project: verify RLS tenant isolation, asset availability, and audit round-trip.
  - Measure and record actual RTO (target ≤ 4h) and RPO (target ≤ 15m) with auditor sign-off.
  - Procedure and evidence template: `planning/archive/restore-rehearsal.md`.
- [ ] **C.7 CI/CD Pipeline & Automated Security Gates:**
  - Create `.gitlab-ci.yml` or `.github/workflows/ci.yml` running: `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e`, `npm run build`, `scripts/test-migrations.sh`, `scripts/security-gate.sh`.
  - Enforce required branch protections and passing pipeline gates before promotion to `staging` and `production`.

### Phase D: Multi-Tenant Integration & Dry-Launch Rehearsal (Day-0 Release Checklist)

- [ ] **D.1 Authenticated Multi-Tenant Integration Test Suite:**
  - Build two-workspace automated test suite in staging environment to verify strict cross-workspace data isolation on all tables, storage buckets, signed URLs, and export/deletion RPCs.
- [ ] **D.2 End-to-End Owner Dry-Launch Walkthrough:**
  - Execute full dry-run: onboarding → channel creation → lane staffing → production opening → casting → shot contract compilation → master assembly → social staging → account export.
- [ ] **D.3 Day-0 Release Checklist Sign-Off:**
  - Copy a fresh checklist from the archived template (`planning/archive/day-zero-release-checklist.md`; last snapshot: local rehearsal at commit `32a351e` — Gate A PASS, Gates B–E deferred pending isolated prod infra).
  - Complete all Gates A through E with timestamped evidence links against production.
  - Attach launch-profile evidence proving the active limits in `service-level-requirements.md` §5.1 (spend, storage, bandwidth, jobs, request/auth rates, upload caps, retry budget) at 99%/100%/concurrent-reservation/UTC-reset/missing-store/global-cap boundaries.
  - Obtain formal owner, engineering, security, and operations sign-offs.

### Phase E: Post-Launch Commercial Stages

Standing rules (consolidated from `planning/archive/post-launch.md`): no stage begins because "the UI is ready" — each starts only with an approved **phase packet** (objective/user group, capacity & cost forecast, privacy/subprocessor changes, threat-model changes, capability/schema/provider changes, support & incident readiness, TDD acceptance suite, rollout/canary/kill-switch/rollback plan, documentation, SLO impact). Every stage must prove the day-0 foundation contracts stay additive: workspace tenancy, single server capability resolver, one operational policy, durable idempotent external effects, normalized provider adapters, server-authoritative billing facts, audited security changes, data classification with retention/export/deletion, expand/backfill/switch/contract migrations, stable view models.

- [ ] **E.0 Stage Gate Discipline:** Approve the phase packet for a stage before its first task.
- [ ] **E.1 Stage 1 — Invited Customer Beta:**
  - Reapprove the owner-launch limits in `service-level-requirements.md` §5 against measured launch traffic/cost/queue/storage/abuse evidence before inviting anyone — beta must not silently inherit owner-launch capacity assumptions.
  - Token-based account-access invite lifecycle (high-entropy, hashed-at-rest, email/audience-bound, single-use, atomic consumption; replay/race/resend tested) — distinct from Stage 6 workspace-membership invites.
  - Customer support intake and ticket routing.
  - Per-workspace quotas, rate alarms, and session revocation.
- [ ] **E.2 Stage 2 — Paid Managed Cloud:**
  - Stripe subscription and credit top-up checkout activation.
  - Automated credit meter settlement and usage invoicing.
  - Paid-tier SLA enforcement and priority job queueing.
- [ ] **E.3 Stage 3 — Protected Agent Marketplace:**
  - Commercial licensing and revenue share for community agent creators.
  - Agent runtime sandboxing and protected prompt execution.
- [ ] **E.4 Stage 4 — Public Self-Service Signup:**
  - Open public registration with automated fraud scoring, CAPTCHA, and abuse defense.
- [ ] **E.5 Stage 5 — Self-Hosted Community & Enterprise Editions:**
  - Standalone Docker / Kubernetes distribution packaging.
  - Plug-and-play local storage and LLM provider adapters (Ollama, vLLM).
- [ ] **E.6 Stage 6 — Multi-User Teams & RBAC:**
  - Multi-seat workspaces with granular roles (Owner, Producer, Writer, Editor, Reviewer).
- [ ] **E.7 Stage 7 — Advanced Workflow Marketplace & Versioning:**
  - Visual drag-and-drop workflow graph designer.
  - Community workflow template sharing and import/export.
- [ ] **E.8 Stage 8 — Expanded Platform & Native Integrations:**
  - Direct video generation provider adapters (Runway, Sora, Luma, Kling, Pika).
  - Direct social platform API integrations (YouTube Data API, TikTok Creator API, Meta Graph API).

---

## 3. Governance and Document Order

The planning directory is organized into active normative specifications, operational runbooks, and archived historical plans:

```text
planning/
├── README.md                           # Planning index and governance order
├── MASTER-TODO.md                      # This file — single source of truth for remaining work
├── site-workflow-spec.md               # Product definition, four-module sitemap, routes, security
├── lane-theory-spec.md                 # Studio operating model, workflow law, onboarding, casting
├── spec-contract-coverage.md           # Observable contract matrix
├── commercial-service-architecture.md  # Architectural additivity seams
├── service-level-requirements.md       # SLOs, caps, quota definitions
├── day-zero-public-hosting-security.md # Mandatory Day-0 security standard
├── doubt-driven-review.md              # Standing doubts and verification protocol
└── archive/                            # Archived historical plans, handoffs, runbooks
                                       #   (release checklist, post-launch roadmap,
                                       #    restore rehearsal, supabase auth hook)
```
