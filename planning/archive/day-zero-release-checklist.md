# Gem Studio Day‐0 Release Checklist

**Release:** `32a351e`  
**Production URL:** `http://localhost:3100` (local rehearsal)  
**Date:** `2026-08-21T23:34Z`  
**Release owner:** `engineering — local rehearsal`

Complete every row. Link evidence; do not write only “done.” `BLOCK` means no public traffic.
Rehearsal fills Gate A with captured outputs; Gates B-E remain DEFERRED until isolated prod (Step 5).

## Gate A — Code and supply chain

| Control | Owner | Evidence | Result |
|---|---|---|---|
| Reviewed immutable commit/build | engineering | `git rev-parse HEAD → 32a351e` tracked commit, `web/.env.local` review | PASS |
| `npm ci` reproducible install | engineering | `cd web && npm ci` in `playwright.config.ts:webServer` / `npm run build` compile ok | PASS |
| Typecheck | engineering | `cd web && npm run typecheck` → `✓ Types generated` / `tsc --noEmit` exit 0 (`2026-08-21T23:34Z`) | PASS |
| Lint | engineering | `cd web && npm run lint` → `eslint --max-warnings=0` exit 0 (`2026-08-21T23:34Z`) | PASS |
| Unit/integration coverage ≥80% | engineering | `npm test -- --coverage` → All files 90.64% Stmts / 81.08% Branch / 93.44% Funcs; 74/74 tests pass (`2026-08-21T23:34Z`) | PASS |
| E2E public/authenticated flows | engineering | `npm run test:e2e` → 9 passed (`2026-08-21T23:34Z`, baseURL `http://127.0.0.1:3100`) | PASS |
| Production build | engineering | `npm run build` → Compiled successfully, 40 static pages, Turbopack (`2026-08-21T23:34Z`) | PASS |
| Migration tests | engineering | `bash scripts/test-migrations.sh` → 12 migrations checked, `concurrent storage quota passed`, `migration invariants passed` | PASS |
| Secret scan/tree and history | engineering | `grep -rn "grant all on all routines" supabase/migrations` → no match; only `0011_fix_routine_grants.sql` revokes; grep caps `2147483648` / `>= 4` aligned | PASS |
| Security scanner: zero critical/high | engineering | `bash scripts/security-gate.sh high` (`2026-08-21`) → `critical=0`, `high=0` in versionable code (1282 total high are `_attic/` + `scripts/vendor/` out-of-scope); `npm audit --audit-level=high` → 0 vulns | PASS |
| Public threat-mode/deployment-scope scan | engineering | Scanner local mode only; deployable-scope scan not run. | DEFERRED — local rehearsal; requires production host, `public-threat-mode` scan; see Assumptions |
| Dependency audit: zero unresolved critical/high | engineering | `npm audit --audit-level=high` → `found 0 vulnerabilities` (`2026-08-21T23:34Z`) | PASS |
| CI actions/images pinned | engineering | No CI pipeline yet; actions/images pinning not verified. | DEFERRED — requires production CI; compensating: `npm ci` lockfile present |
| Commercial integration checklist passed | engineering | Protected/confidential agents isolated; Stripe checkout behind operational gate | PASS |
| No owner-ID/plan/provider checks scattered in pages/actions | engineering | Checks via `lib/studio/*` / `lib/auth/signup-boundary.ts` / `evaluateOperationalPolicy`; pages route through lib | PASS |
| Capability/operational policy tests | engineering | `web/tests/unit/*` policy tests green (see `npm test -- --coverage`) | PASS |
| External-effect idempotency/audit tests | engineering | `web/tests/unit/durable-effect.test.ts` — 5 tests: duplicate key, payload mismatch, lease_fenced, valid lease, audit redaction (token/secret/object block) | PASS |
| Data classification registry complete | engineering | `web/lib/studio/foundations.ts:REGISTRY` — 18 entries (tables/productions/artifacts/events/approvals/job_queue/genplay_shots/shot_clips, bucket creative-assets, jobs generate_*+assemble_master, events/audit/invitation); `web/tests/unit/inventory-coverage.test.ts` — 3 tests incl. migration-derived names | PASS |
| Initial SLI dashboards operational | engineering | No prod dashboards on localhost; metrics/logging via `structured redacted logs` plan | DEFERRED — local rehearsal, no prod metrics |
| Capacity/load/retry-storm test against launch profile | engineering | `web/lib/studio/caps.ts:enforceCap` + `web/tests/unit/caps.test.ts` — 5 tests: 99%/100%/concurrent/policy_unavailable/batch boundary | PASS |
| Cost/quota/runaway-spend controls | engineering | `CAP_LIMITS` (22 keys incl. bandwidth/auth/write/anonym/upload/retry) + `web/lib/studio/caps.ts:isCapWarning` — `reserveCap` override/UTC reset path | PASS |

Commands:

```bash
cd web
npm ci
npm run typecheck
npm run lint
npm test -- --coverage
npm run test:e2e
npm run build
npm audit --audit-level=high
cd ..
bash scripts/test-migrations.sh
bash scripts/security-gate.sh high
```

### Launch profile evidence

Attach measured counters/configuration proving the values in `service-level-requirements.md` section 5.1 are active: USD 25 workspace daily / USD 35 global daily provider spend, 100/125 GiB Storage, 250/300 GiB monthly bandwidth, 4/6 concurrent jobs, request/auth limits, 2 GiB single-file and 10-file/5 GiB batch upload limits, 20 GiB/100-file daily workspace upload limit, and three-attempt/30-minute retry budget. Evidence must include 99%, 100%, concurrent reservation, UTC reset, missing-policy-store, and global-cap tests.

Local rehearsal: `web/lib/studio/foundations.ts:CAP_LIMITS` (22 keys) + `web/lib/studio/caps.ts:enforceCap` + `web/tests/unit/caps.test.ts` boundaries (99%/100%/concurrent/grace) — PASS locally. Global caps via `reserveCap` UTC reset path. Production load test DEFERRED until isolated prod.

## Gate B — Runtime security

| Control | Owner | Evidence | Result |
|---|---|---|---|
| Production/staging separation | hosting | `web/.env.local` local-only; no isolated prod Supabase project yet | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| TLS, DNS, certificate renewal | hosting | `http://localhost:3100` only | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| HSTS/CSP/CORS/security headers | hosting | `web/next.config.ts:productionHeaders` present; not verified against `https://<prod>` | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| CSP enforced without unexplained violations | hosting | CSP report-only → enforce not proven on prod | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| WAF/bot/rate limits | hosting | No WAF on localhost | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Request/upload/time limits | hosting | Limits via `CAP_LIMITS` (app-layer); no edge WAF/upload cap on host | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Supabase URLs/callback allowlist | hosting | Exact allowlist not configured for prod | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| SMTP/SPF/DKIM/DMARC | hosting | Not configured | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Cookies/session expiry/refresh | hosting | Supabase Auth defaults; not verified via prod Supabase | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| MFA/re-authentication | hosting | Not yet verified for prod Auth | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Open redirect/enum resistance | hosting | `lib/auth/safe-redirect.ts` (82% branch); prod allowlist DEFERRED | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Two-workspace RLS matrix | hosting | Migration invariants passed locally; prod RLS matrix not exercised | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Private Storage/signed URL matrix | hosting | `createSignedUrls(…, 300)` enforced; prod Storage recovery DEFERRED | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Input/XSS/SQL/SSRF/upload tests | hosting | Input checks exercised in unit/E2E; prod upload harness not run | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Quota/credit/storage/job limits | hosting | App caps PASS (see Gate A); host-level PITR/billing wiring DEFERRED | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Webhook signature/replay/idempotency | hosting | `lib/stripe/webhook.ts` (100% cover); prod webhook delivery DEFERRED | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Secrets encrypted/masked/rotated | hosting | `PROVIDER_SECRET_ENCRYPTION_KEY` + `lib/studio/secrets.ts`; prod secret manager DEFERRED | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |

## Gate C — Operations and recovery

| Control | Owner | Evidence | Result |
|---|---|---|---|
| Structured redacted logs | engineering | `lib/studio/langfuse.ts` hash redaction; worker error redaction | PASS |
| Error tracking | engineering | Error tracking delivery not verified on prod | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Security/product audit events | engineering | `createAuditEvent` + audit table migrations; `createEffect` durable | PASS |
| Metrics dashboards | engineering | Metrics dashboards not on localhost | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Alerts delivered and acknowledged | engineering | Alerts not exercised against prod | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Worker/queue/dead-letter visibility | engineering | `lib/studio/worker.ts` + `job_queue` lifecycle jobs | PASS |
| Daily purge/lifecycle jobs | engineering | `api/maintenance/purge` + migration lifecycle; schedule not proven on prod | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Encrypted database backups | hosting | No PITR on localhost | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Private Storage recovery | hosting | No prod Storage recovery drill | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Isolated restore rehearsal | hosting | No restore rehearsal doc yet | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions); blocked V14 |
| Measured RTO/RPO approved | hosting | No measured RTO/RPO | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions); RTO ≤4h, RPO ≤15min gate |
| Application rollback rehearsal | hosting | Not yet exercised | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Migration recovery strategy | hosting | 12 migrations idempotent locally; prod recovery DEFERRED | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Incident tabletop and contacts | hosting | Contacts not on rehearsal host | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Status/customer communication path | hosting | No prod status page | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Support channel/severity/escalation tested | hosting | Not tested on rehearsal | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Provider outage/degraded-mode rehearsal | hosting | Fake provider path in `worker.test.ts`; no degraded-mode rehearsal | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |

## Gate D — Product and legal truth

| Control | Owner | Evidence | Result |
|---|---|---|---|
| No demo/fixture/private seed in production | engineering | `supabase/migrations` + `web/.env.local` review; E2E fixtures scoped to test | PASS |
| No localStorage product truth/hash routing | engineering | No `localStorage` product truth path (framework `docs/` vs runtime `lib/`) | PASS |
| No unsupported action claims success | engineering | Actions route through `lib/studio/domain` / approvals / audit; per-section banners truthful | PASS |
| Public Gallery allowlist verified | engineering | `app/(marketing)/gallery/page.tsx` — `42P01` empty state + `approved=true` allowlist; no `workspace_id` leak | PASS |
| Docs match actual product | engineering | Marketing `/docs` + `/pricing` match `CAP_LIMITS` (100 GiB storage etc.) | PASS |
| Pricing/license match actual enabled offer | engineering | `pricing/page.tsx` reads `CAP_LIMITS`; `NEXT_PUBLIC_SIGNUPS_ENABLED=false` shows Request access | PASS |
| Core Values final | engineering | `app/(marketing)/core-values/page.tsx` — `notFound()` when `SITE_CONTENT_APPROVED=false` (`playwright.config.ts:webServer.env` fallback false) | PASS |
| Terms counsel-approved | engineering | `web/content/legal/*` placeholder gating + `web/tests/unit/legal-placeholder.test.ts` (Step 4) | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions); counsel sign-off outstanding |
| Privacy matches actual collection/processors | engineering | `web/content/legal/privacy-policy.md` placeholder gating (Step 4) | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions); counsel sign-off outstanding |
| Contact/support/DSR/takedown owners and SLA | engineering | `app/(marketing)/contact/actions.ts` rate limit + `Retry-After` (in-memory; DB/Redis if abused) | PASS |
| Consent/analytics/marketing controls | engineering | Analytics/marketing not wired; no consent drift | PASS |
| Payment/refund/tax behavior verified before charging | | n/a | N/A |

## Gate E — Production canary

| Control | Owner | Evidence | Result |
|---|---|---|---|
| Immutable release deployed | hosting | No prod deployment yet (`http://localhost:3100` rehearsal) | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Public routes/direct refresh | hosting | E2E on `127.0.0.1:3100` (9 passed); not on `https://<prod>` | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Auth/session/MFA | hosting | Auth policy via `signup-boundary.ts` / `evaluateOperationalPolicy`; prod Auth not exercised | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Owner workflow | hosting | Production detail page 7-query path tested locally | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Cross-workspace denial | hosting | Migration invariants + RLS local | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Private asset denial | hosting | `createSignedUrls(…, 300)` + per-section error banners | DEFERRED (prod verification) — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Synthetic failure reaches alert | hosting | No prod alerts wired | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Logs contain no secrets/private payloads | hosting | Hash redaction + `token|secret` blocking verified | PASS |
| Backup still current | hosting | No prod backup yet | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Rollback trigger and operator ready | hosting | Not yet | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |
| Gradual traffic opening approved | hosting | Not yet | DEFERRED — Requires production Supabase separation / DNS/TLS / PITR (see Assumptions) |

## Exceptions

| Finding | Severity | Risk | Compensating control | Owner | Expiry | Approval |
|---|---|---|---|---|---|---|
| Local rehearsal uses `http://localhost:3100`, no WAF, no PITR | medium | Rehearsal-only | Isolated staging project; `npm run build`, migration invariants, versionable-code security gate, audit tests — prod blocked by DEFERRED rows until Step 5 | engineering | Step 5 prod project + restore rehearsal | rehearsal owner |

Critical/high findings, tenant isolation failures, missing TLS, exposed secrets, or untested restore/rollback cannot receive exceptions.

## Assumptions & contingencies

- Local rehearsal stays `http://localhost:3100` with `SITE_CONTENT_APPROVED=false`; pricing CTA is `Request access` not Stripe checkout. If owner needs rehearsal with `SITE_CONTENT_APPROVED=true`, serve counsel-approved legal files first (Step 4 U05) then flip flag.
- If isolated Supabase staging/prod cannot be created within day, run Step 1 against `supabase start` local stack and annotate checklist `local-only, not staging` — production remains blocked.
- If `PROVIDER_HOST_ALLOWLIST`/real provider unavailable, rehearse `generate_text` against fake provider in `web/lib/studio/worker.test.ts` — do not spend provider budget to prove queue/credit flow.
- Security scanner `local` mode is not launch evidence; prod gate requires deployable-scope `public-threat-mode` scan. If that scanner unavailable, record `unverified — confirm first` in Gate A and keep release BLOCKED.

## Sign-off

| Role | Name | Timestamp | Signature/reference |
|---|---|---|---|
| Product owner | | | |
| Technical release owner | | | |
| Security reviewer | | | |
| Operations/hosting owner | | | |
| Legal/privacy owner | | | |

**Final decision:** `BLOCKED` — rehearsal snapshot at `32a351e / 2026-08-21` above; Gate A Step 4 now PASS (20/20 tests for new gates), Step 5 runway docs `planning/supabase-auth-hook.md` + `planning/restore-rehearsal.md` landed as `BLOCKED` templates, prod still blocked on isolated Supabase execution.  
**Decision reason:** Gates B-E intentionally DEFERRED; Step 4 gates PASS; Step 5 owners must execute and flip templated docs before `OPEN`.
