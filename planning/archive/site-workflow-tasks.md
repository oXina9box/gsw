# Gem Studio Site Workflow Tasks

**Gate:** Execute only after owner approves `site-workflow-spec.md`, `spec-contract-coverage.md`, and `site-workflow-implementation-plan.md`.  
**Method:** Every behavior task uses RED → verified failure → minimum GREEN → full verification → refactor.
**Assignment:** `@terra` or `@luna` is the sole implementation owner. The other agent reviews the contract/security effects. Dependencies and file ownership are defined in `agent-implementation-handoff.md`.

## Required completion record for every task

No task is complete with only passing UI tests. Record:

- Workspace/tenant owner of every read/write.
- Capability and role that authorize it.
- Plan/quota/meter behavior. Owner launch may bypass payment entitlement but never safety caps, rate limits, storage limits, job concurrency, or provider spend ceilings.
- Server feature flag/kill switch.
- External-effect idempotency and durable state, when applicable.
- Audit event, metric, correlation ID, and safe error class.
- Data class, retention, export, deletion, encryption, and processor impact.
- Pagination/index/capacity behavior.
- Additive path for future role, plan, provider, self-hosted adapter, or customer scale.
- RED evidence, GREEN evidence, full affected-suite result, doubt-review result.

Record `N/A — [reason]` for genuinely irrelevant concerns such as metering on static editorial copy. Never invent framework work solely to avoid `N/A`.

Reject task if implementation contains hard-coded owner identity, scattered plan/provider checks, vendor response shapes in page/domain contracts, unbounded lists/retries/cost, or schema changes without expand/backfill/switch/contract analysis.

## 1. Baseline and navigation

- [ ] **F01 `@terra`** — Add workspace capability resolver contract.
  - Acceptance: Resource-aware `principal + action + target` checks cover owner launch, suspension, channel scope, unavailable feature, atomic quota exhaustion, entitled/non-entitled agent, stale/config-error fail-closed behavior, and precedence; no page/action hard-codes owner identity or plan names.
  - Verify RED/GREEN: Focused pure policy tests fail first, then pass; architecture inventory covers every server action, API route, worker, webhook, operator effect, and signed-URL issuer; repository search rejects scattered owner/plan checks.
  - Files: capability helper, tests, workspace context, at most one action integration.

- [ ] **F02 `@terra`** — Add server operational gates and kill switches.
  - Acceptance: Signup, checkout, generation, publishing, uploads, maintenance/read-only mode, orchestration, and workspace suspension fail closed server-side with stable errors and audit reason.
  - Verify RED/GREEN: Action/API tests prove client bypass cannot defeat disabled state.
  - Files: operational-policy helper, tests, action/API entry integration, environment example.

- [ ] **F03 `@terra`** — Enforce signup gate at application and Supabase Auth boundaries.
  - Acceptance: Disabled/invite-only mode rejects UI signup, direct app API signup, and direct anonymous Supabase signup; callback allowlist remains exact; enabling invited beta requires approved configuration plus tests.
  - Verify RED/GREEN: Attempt direct provider signup with anonymous/publishable key in isolated staging; assert denial without invite and success only under approved mode.
  - Files: auth configuration/runbook, signup tests, app gate; no secret values.

- [ ] **F04 `@terra`** — Standardize correlation and audit event contract.
  - Acceptance: Sensitive/domain/external actions record actor, workspace, action, target, outcome, correlation ID, timestamp, and safe metadata without secrets/private payloads.
  - Verify RED/GREEN: Event-shape/redaction tests plus representative action/job integration.
  - Files: audit helper, tests, migration after approval, representative action/job.

- [ ] **F05 `@terra`** — Lock durable external-effect contract.
  - Acceptance: Provider, publication, email, payment, export, purge, and long media operations use atomic reserve+outbox/enqueue, canonical payload-bound idempotency, leases, reconciliation, cancellation/compensation, settlement, and stable result replay.
  - Verify RED/GREEN: Concurrent duplicate keys, mismatched payload, crash between stages, lease loss, suspension/kill switch after claim, reservation expiry, provider-accepted timeout for queryable and non-queryable providers, out-of-order webhook, cancellation, compensation, and reconciler tests cannot duplicate or strand charge/output/publication.
  - Files: domain helper, tests, current queue/worker functions, approved migration only if invariant missing.

- [ ] **F06 `@terra`** — Add data-classification and lifecycle registry.
  - Acceptance: Every current/new table, Storage bucket, job kind, webhook/event kind, audit kind, and invitation audience has owner, class, retention, export, deletion, encryption, public eligibility, and processors documented; CI derives authoritative names from migrations/schema plus code constants/manifests and detects missing entries.
  - Verify RED/GREEN: Add an unclassified table/bucket/job/event fixture, confirm registry coverage fails, classify it, then pass.
  - Files: registry, coverage test, documentation, audit helper if needed.

- [ ] **F07 `@terra`** — Establish narrow infrastructure service boundaries.
  - Acceptance: Identity/membership, authorized data context, object storage, durable jobs, vault, email, payment events, and observability have server service boundaries; domain/view-model code contains no vendor response shapes or service-role access.
  - Verify RED/GREEN: Architecture/import tests plus alternate in-memory adapter tests for domain behaviors; do not abstract ordinary table queries without a concrete boundary need.
  - Files: server service contracts/adapters, architecture tests, representative action/domain integration.

- [ ] **F08 `@terra`** — Define and enforce numeric safety caps.
  - Acceptance: Provisional numeric defaults/hard maxima from `service-level-requirements.md` section 5 are enforced for spend, storage, bandwidth, concurrency, request/auth rates, upload size/count, and retries; UTC reset, alert, hard-stop, fail-closed behavior, and audited expiring override work.
  - Verify RED/GREEN: Limit boundary, concurrent reservation, reset-window, alert, and runaway-cost tests.
  - Files: policy/config schema, capability/quota helper, tests, runbook.

- [ ] **F09 `@terra`** — Inventory and guard every external-effect entry point.
  - Acceptance: Inventory covers server actions, APIs, workers, webhooks, signed-URL issuers, adapters, payment/publication, export/purge, and operator controls; each uses authorization, operational gate, quota, idempotency, and audit as applicable.
  - Verify RED/GREEN: Deliberately unguarded fixture fails architecture test; guarded fixture passes.
  - Files: inventory manifest/generator, architecture test, representative integrations.

- [ ] **F10 `@terra`** — Version built-in production workflow definition.
  - Acceptance: Fixed 13-stage definition has version; new production pins immutable definition snapshot/version; transition evaluator consumes definition/state; existing production behavior remains identical.
  - Verify RED/GREEN: Version pinning, transition, invalid definition, and old-version replay tests.
  - Files: workflow definition/domain helper, tests, approved migration, production action integration.

- [ ] **F11 `@terra`** — Implement emergency operator controls.
  - Acceptance: Separately authorized/MFA-protected operator can suspend account/workspace, revoke sessions, disable connection/provider/platform, pause queue/generation/publishing, enter read-only maintenance, inspect safe job/audit state, and retry/cancel eligible work; every action requires reason and audit.
  - Verify RED/GREEN: Unauthorized/member denial, assurance-level denial, action success, audit/redaction, kill-switch bypass, and break-glass rehearsal.
  - Files: server-only operator service/API or CLI, authorization helper, audit integration, tests, runbook. No public admin page required for owner launch.

- [ ] **F12 `@terra`** — Enforce additive migration workflow.
  - Acceptance: Migration checklist and test reject unsafe direct removal/rename patterns; backfills are bounded/restartable; old/new app versions remain compatible during switch.
  - Verify RED/GREEN: Migration safety fixtures and full migration test script.
  - Files: migration test/check script, fixtures, runbook.

- [ ] **F13 `@terra`** — Instrument initial service indicators.
  - Acceptance: Availability, route latency, Core Web Vitals, queue delay/completion, auth email delivery, errors, RPO/RTO evidence, and cost/usage can be measured before targets are enforced.
  - Verify RED/GREEN: Synthetic event/metric tests and dashboard evidence; alerts fire on staged threshold breach.
  - Files: observability helper/config, tests, runbook/dashboard references.

- [ ] **F14 `@luna`** — Freeze route/module inventory in a failing route-contract test.
  - Acceptance: Test lists every public, auth, Front Office, Studio, Account, compatibility, and conditional route with expected access/module.
  - Verify RED: `cd web && npm test -- tests/unit/route-contract.test.ts`
  - Verify GREEN: Same command, then `npm test`.
  - Files: route-contract test, `lib/studio/navigation.ts`, at most one route manifest helper.

- [ ] **F15 `@luna`** — Implement public/authenticated header contract.
  - Acceptance: Public header shows Gallery, Docs, Pricing, signup/login; authenticated header shows module entries and public-site access.
  - Verify RED/GREEN: Focused component/navigation test, then `npm test`.
  - Files: shell header/client, auth actions, focused test.

- [ ] **F16 `@luna`** — Implement universal footer contract.
  - Acceptance: Every page category exposes public/legal/contact/module entries and session-correct actions.
  - Verify RED/GREEN: Route-shell E2E assertion, then public/protected smoke suites.
  - Files: footer, layouts only where needed, E2E test.

## 2. Unknown User

- [ ] **U01 `@luna`** — Add Gallery public route with allowlisted public content.
  - Acceptance: Only approved media/metadata render; private workspace identifiers and URLs never appear.
  - Verify: Unit public-record filter test; E2E route/link test.
  - Files: Gallery page, content/data helper, tests.

- [ ] **U02 `@luna`** — Add Docs route.
  - Acceptance: All documented module concepts have addressable sections and contextual exits.
  - Verify: Heading/link inventory test and E2E direct load.
  - Files: Docs page/content, tests.

- [ ] **U03 `@luna`** — Add Pricing and License route.
  - Acceptance: Free/self-hosted and Managed Cloud comparison covers limits, platforms, agents, lanes, storage, support, rights, and add-ons without fake checkout success.
  - Verify: Content contract test and E2E CTA states.
  - Files: Pricing page/content, tests.

- [ ] **U04 `@luna`** — Add Contact route and server boundary.
  - Acceptance: Valid messages deliver/store; malformed, oversized, abusive, and repeated submissions fail safely.
  - Verify: RED validation/rate-limit tests; action integration tests; E2E success/error.
  - Files: Contact page, action/API, validator, tests.

- [ ] **U05 `@luna`** — Finalize public content gates.
  - Acceptance: Values, Terms, Privacy, Gallery, Docs, and Pricing have owner-approved content and no placeholder markers.
  - Verify: Content approval/placeholder scan plus public E2E.
  - Files: content/pages/test.

## 3. Front Office

- [ ] **FO01 `@luna`** — Define dashboard query/view-model contracts.
  - Acceptance: Preconfigured widgets cover channels, productions, approvals, blockers, credits, assets, signals, audience, agents, and releases; empty values remain truthful.
  - Verify: RED view-model tests for empty/populated/error input.
  - Files: dashboard helper, tests, page/component.

- [ ] **FO02 `@luna`** — Add predefined dashboard filters and preferences.
  - Acceptance: Date/brand/channel/platform filters work; widget visibility/order persists; custom actions absent.
  - Verify: RED filter/preference tests; E2E persistence.
  - Files: helper/action, page/components, tests, migration only after approval.

- [ ] **FO03 `@luna`** — Complete channel create/edit/view contract.
  - Acceptance: Full identity/strategy fields persist; view links preserve channel scope; no channel-page deletion exists.
  - Verify: RED validators/actions; RLS integration; channel E2E.
  - Files: channel pages/actions/helper/tests; migration only after approval.

- [ ] **FO04 `@luna`** — Complete Marketing and Research contract.
  - Acceptance: Studio/channel strategy, research evidence, schedules, budgets, standards, promotion targets, and Front Office lanes persist.
  - Verify: RED domain/action tests; cross-scope RLS; E2E promotion flow.
  - Files: Marketing page/actions/helper/tests; approved migration.

- [ ] **FO05 `@luna`** — Complete Socials staging and review contract.
  - Acceptance: Package validates platform, requires approval, publishes idempotently, records feedback, and creates signals.
  - Verify: RED state/idempotency tests; provider failure integration; E2E review.
  - Files: Social page/actions/helper/tests; approved migration.

- [ ] **FO06 `@luna`** — Split Staffing into Studio Team and Gem Sourced.
  - Acceptance: Roles, vacancies, assignments, catalog/config previews work; owner has entitlement-free execution access through capability policy, while premium/protected source remains server-only and excluded from browser/provider payload/log/export/customer-readable backup from day‑0. Commerce is absent.
  - Verify: RED assignment/catalog tests; RLS; E2E staffing; inspect browser payload/bundle, provider request fixture, logs/traces, account export, backup/customer restore scope and assert protected source absent.
  - Files: staffing/agent/builder surfaces, actions/helper/tests.

## 4. Studio

- [ ] **S01 `@luna`** — Restrict Build Production ownership.
  - Acceptance: Builder configures Creative/Production lanes only; Front Office lanes route to Marketing.
  - Verify: RED ownership/validation tests; builder E2E.
  - Files: builder page/actions/domain/tests.

- [ ] **S02 `@luna`** — Complete production opening flow.
  - Acceptance: Rights, channel, brief, run mode, cap, and schedule validate; persisted production redirects to detail.
  - Verify: RED action tests; RLS; E2E empty-channel and success flows.
  - Files: open-production page/action/helper/tests.

- [ ] **S03 `@luna`** — Enforce Production Set state machine.
  - Acceptance: Only valid transitions advance; approvals/revisions persist; failed work cannot become completed; next owner/action is visible.
  - Verify: RED transition tests for every edge; action integration; owner E2E.
  - Files: domain/state helper, actions, production surfaces, tests.

- [ ] **S04 `@luna`** — Build unified Assets warehouse.
  - Acceptance: Search/filter/preview/version/lineage/rights work across DNA, documents, clips, outputs, masters, social variants, and GenPlay.
  - Verify: RED query/lineage tests; Storage/RLS matrix; E2E warehouse.
  - Files: Assets page/helpers/components/tests; approved migration.

- [ ] **S05 `@luna`** — Retire GenPlay primary page safely.
  - Acceptance: Old route enters authorized Assets/document view; no duplicate source remains.
  - Verify: Redirect/access tests and link inventory.
  - Files: GenPlay route, navigation, tests.

## 5. Account

- [ ] **A01 `@luna`** — Complete profile, MFA, session, export, and deletion flows.
  - Acceptance: Re-authenticated destructive actions, scheduled purge/cancel, authorized export, sole-owner workspace closure, shared-workspace membership departure, last-owner transfer protection, retained financial/audit/legal-hold records, and safe session handling work.
  - Verify: RED lifecycle tests; integration; E2E account controls.
  - Files: account page/actions/helpers/tests.

- [ ] **A02 `@terra`** — Define shared-workspace departure and closure state machine.
  - Acceptance: Member departure, ownership transfer, last-owner protection, closure request, new-work freeze, queue/reservation/publication handling, provider-secret custody, asset retention/export, invitations, audit/financial retention, cancellation, and final purge have explicit authorized transitions.
  - Verify RED/GREEN: In-flight job/publication/payment/export cases for member departure and sole-owner closure; no orphaned data/effect/secret.
  - Files: lifecycle domain helper, tests, approved migration, account/operator integration.

- [ ] **A03 `@luna`** — Add channel/archive and data-deletion controls under Account.
  - Acceptance: Impact is displayed; dependent records obey approved archive/delete policy; no equivalent delete exists elsewhere.
  - Verify: RED dependency/lifecycle tests; RLS; E2E confirmation.
  - Files: account data surface/action/helper/tests; approved migration.

- [ ] **A04 `@luna`** — Make dry-launch Billing truthful.
  - Acceptance: Usage, credits, reservations, ledger display; unavailable transaction path cannot claim success.
  - Verify: RED billing view/action tests; E2E dry state.
  - Files: Billing page/helper/tests.

- [ ] **A05 `@luna`** — Complete Connections and Secrets lifecycle.
  - Acceptance: Add, validate, mask, rotate, and disconnect AI/social providers without browser/log leakage.
  - Verify: RED encryption/masking tests; response/log assertions; E2E replace/disconnect.
  - Files: Integrations page/actions/secrets helper/tests.

## 6. Final verification

- [ ] **V01 `@terra`** — Configure dedicated production hosting and identity boundary.
  - Acceptance: Production/staging projects, secrets, deploy identities, callbacks, DNS, TLS, preview isolation, MFA, and least privilege are verified.
  - Verify RED/GREEN: Configuration assertions fail against incomplete staging, then pass against production candidate; record evidence.
  - Files: hosting config/runbook/tests only; no committed secrets.

- [ ] **V02 `@terra`** — Enforce browser and edge protections.
  - Acceptance: CSP, HSTS, exact CORS, security headers, WAF/bot rules, and request/upload limits meet day‑0 standard.
  - Verify RED/GREEN: Header/origin/oversize/CSP tests fail before config, pass after; browser console has no unexplained CSP violations.
  - Files: Next config, edge config, security tests, runbook evidence.

- [ ] **V03 `@terra`** — Complete auth/session abuse protection.
  - Acceptance: Auth redirect allowlist, cookies, expiry, MFA, re-authentication, enumeration resistance, and per-route limits work.
  - Verify RED/GREEN: Auth abuse/redirect/session E2E matrix.
  - Files: auth helpers/pages/proxy/tests; Supabase configuration evidence.

- [ ] **V04 `@terra`** — Prove tenant and Storage isolation.
  - Acceptance: Two-workspace matrix denies every cross-workspace row, join, mutation, Storage object, signed URL, export, and deletion attempt.
  - Verify RED/GREEN: Migration/RLS/Storage negative suite; any unauthorized access blocks launch.
  - Files: migrations/policies/tests/evidence.

- [ ] **V05 `@terra`** — Prove signed URL TTL and revocation contract.
  - Acceptance: Signer hard-caps TTL at five minutes, binds bucket/path/audience, rejects issuance after suspension/removal, expires under clock-skew tests, and routes immediate-revocation assets through authenticated delivery.
  - Verify RED/GREEN: Pre/post suspension issuance, pre/post expiry access, path substitution, audience substitution, proxy revocation tests.
  - Files: Storage service/signer, tests, policy evidence.

- [ ] **V06 `@terra`** — Harden trust boundaries and external effects.
  - Acceptance: Schema limits, XSS/SQL/SSRF/upload defenses, quotas, webhook signatures/replay, provider timeout, queue retry, and idempotency work.
  - Verify RED/GREEN: Fuzz, malformed input, SSRF, duplicate, replay, timeout, and dead-letter tests.
  - Files: validators/actions/API/worker/security tests.

- [ ] **V07 `@terra`** — Prove secrets and supply-chain controls.
  - Acceptance: Runtime secret manager, environment separation, masking, rotation, scanning, reproducible install, dependency audit, and immutable deployment pass.
  - Verify: `bash scripts/security-gate.sh high`; `cd web && npm audit --audit-level=high`; bundle/log/history inspection; rotation rehearsal.
  - Files: CI/security config/runbook; never secret values.

- [ ] **V08 `@terra`** — Add deployable-scope public threat-mode security gate.
  - Acceptance: Scanner evaluates only material that can enter production while still covering untracked deployable source; generated reports and quarantined files cannot create noise or enter build context; critical/high findings fail CI.
  - Verify RED/GREEN: Seed a safe test fixture for each gated class, confirm gate fails, remove fixture, confirm clean run; compare scanner scope with deployment artifact manifest.
  - Files: security gate/scanner config, CI config, scope tests, evidence.

- [ ] **V09 `@terra`** — Configure and test observability/incident response.
  - Acceptance: Structured redacted logs, error tracking, audit events, metrics, alerts, escalation, status process, and incident runbook work.
  - Verify: Synthetic failures deliver actionable alerts without private data; incident tabletop completes.
  - Files: observability config/helpers/tests/runbook evidence.

- [ ] **V10 `@terra`** — Prove backup, restore, and rollback.
  - Acceptance: Encrypted DB/Storage recovery, queue recovery, RTO/RPO, migration handling, app rollback, and access control are documented and rehearsed.
  - Verify: Restore representative snapshot into isolated project; test RLS/assets/jobs; record measured RTO/RPO and rollback.
  - Files: runbooks/scripts/tests/evidence; no production data committed.

- [ ] **V11 `@luna`** — Complete privacy/legal/commercial readiness.
  - Acceptance: Actual data practices match final Terms/Privacy/Pricing; consent, DSR, takedown, age, payment, refund, and support obligations have owners and tests.
  - Verify: Legal/product checklist plus behavior tests; no placeholder or unsupported live claim.
  - Files: content/config/tests/evidence.

- [ ] **V12 `@terra`** — Run doubt-driven adversarial cycles on each completed phase.
  - Acceptance: Every non-trivial claim has artifact+contract review; findings classified; stop condition recorded.
  - Verify: Review record links each finding to fix, trade-off, contract update, or noise classification.
  - Files: `planning/doubt-driven-review.md` or phase review records.

- [ ] **V13 `@terra`** — Run complete quality gate.
  - Acceptance: Typecheck, lint, ≥80% branches/functions/lines/statements across testable application code, plus mandatory behavior/negative matrices for auth, actions, APIs, workers, operator controls, RLS, Storage, signed URLs, external effects, export/delete, backup/restore, E2E, build, security, accessibility, and responsive checks. Coverage percentage never substitutes for required contract tests.
  - Verify: Commands from spec run without unresolved failures.
  - Files: tests/config only when a failing contract requires change.

- [ ] **V14 `@terra`** — Coordinate day-zero public-hosting release checklist sign-off.
  - Acceptance: Gates A–E pass with timestamped evidence and product, technical, security, operations, and legal/privacy sign-off.
  - Verify: Production canary passes; no unresolved critical/high finding; medium exceptions are approved and expiring.
  - Files: release evidence/checklist only.

- [ ] **V15 `@luna`** — Run owner dry-launch rehearsal.
  - Acceptance: Empty workspace becomes configured channel, staffed lanes, production, approved assets, staged social release, exportable account with observable failures/recovery.
  - Verify: Recorded E2E/manual acceptance checklist and rollback check.
  - Files: no production-code changes unless a prior RED test exposes defect.
