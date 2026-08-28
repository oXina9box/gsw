# Gem Studio TODO

**Updated:** 2026-08-28 — derived from the codebase, not from older plans.
**Rule:** code is the source of truth. When an item is done, it's in the code with green gates before this box gets checked.

---

## 1. Now — pre-launch gaps

- [x] **Onboarding-to-first-Studio completion:** execute six-level chunk plan in [`onboarding-completion-plan.md`](onboarding-completion-plan.md): popup identity, Cloud/BYOK choice, secure OpenAI/Anthropic connection, first Marketing lane, real assets, and full verification. Resolved owner decisions and verified across 7 waves.

- [ ] **Legal copy sign-off:** counsel-approved Terms / Privacy / Core Values. All three are live-gated on `SITE_CONTENT_APPROVED=false` (`web/app/(marketing)/terms|privacy|core-values`, `site-footer.tsx`). Flip only after owner + counsel sign-off.
- [ ] **Gallery real showcase:** page ships hardened (published+approved query, strict item validation, empty state). Populate only with rights-cleared Gem Studio work.
- [ ] **Transactional email for `/contact`:** pick sender (Resend / SendGrid / SES), wire server action, SPF/DKIM, rate limit, fail-closed errors.
- [ ] **DNA group creation flows:** group reassignment shipped; dedicated create flows for Studio/Channel/Season/Socials/FDNA records under `/app/universe` remain.
- [ ] **Role-gate supervisor approvals:** approve/kickback triggers exist in the execution workbench but any workspace member can fire them. Add supervisor role/policy check.

## 2. Runtime

- [ ] **Persistent worker poller:** jobs currently process via `/api/jobs/run` (Bearer-secret endpoint). Add daemon or webhook listener to drain `job_queue` continuously against BYOK connections.
- [ ] **Direct social publishing adapters:** YouTube / X / TikTok / Instagram / Facebook behind the existing publication state machine (currently export/manual).
- [ ] **Meter assistant/provider calls:** `requestOnboardingGuidance` and similar are unmetered — wire into caps/reservations.
- [ ] **Assets subviews:** `/app/dna` and `/app/genplay` are still passive pages; fold them into Assets-filtered views per the route contract.

## 3. Infrastructure gates — before any public traffic

- [ ] Isolated staging + production Supabase projects (separate from dev).
- [ ] Production hosting deploy: custom domain, TLS/HSTS, canonical redirects, `NODE_ENV=production`, headers verified.
- [ ] Edge protections: enforce CSP (from report-only), exact CORS allowlist, WAF/rate limits at host level.
- [ ] Secrets/KMS: production encryption keys + service-role + Stripe keys in hosting secret manager; zero secrets in Git/bundles/CI logs.
- [ ] Observability: error tracking, structured redacted logs, Sev-1/Sev-2 alerting.
- [ ] PITR enabled (7-day) + isolated restore rehearsal; measure RTO ≤ 4h and RPO ≤ 15m.
- [ ] Branch protection: require the existing `.gitlab-ci.yml` pipeline green before promotion.

## 4. Release

- [ ] Two-workspace tenant-isolation test suite run in staging (rows, storage, signed URLs, export/deletion RPCs).
- [ ] Owner dry-launch walkthrough end-to-end: onboarding → channel → staffing → production → casting → assembly → social staging → export.
- [ ] Day-zero checklist Gates A–E executed with timestamped evidence + sign-offs (template: `planning/archive/day-zero-release-checklist.md`; runbooks archived alongside).

## 5. Post-launch sequence (one gate at a time)

Invited beta → paid managed cloud → agent marketplace → public signup → self-hosted → teams/RBAC → workflow marketplace → platform expansion.
Full roadmap text archived at `planning/archive/post-launch.md`; stage-gate discipline: phase packet approved before each stage starts.
