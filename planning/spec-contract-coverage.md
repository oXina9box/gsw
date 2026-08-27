# Gem Studio Specification and Contract Coverage

**Purpose:** Turn `site-workflow-spec.md` into implementation-ready contracts.  
**Authority:** `planning/site-workflow-spec.md` is product intent; this document defines observable contracts and traceability.  
**Review state:** Owner review required before implementation.

## 1. Contract hierarchy

1. **Product contract:** Four-module sitemap, page purpose, flow, result, and launch boundary.
2. **Navigation contract:** Every route has one owning module, access state, shell, and destination behavior.
3. **Data contract:** User/workspace records have an owner boundary, lifecycle, validation, and authorized reads/writes.
4. **Interaction contract:** Every action has a precondition, pending state, success result, failure result, and retry/exit path.
5. **Security contract:** Auth, RLS, Storage policy, secret handling, and destructive-action confirmation are enforced server-side.
6. **Quality contract:** Accessibility, responsive behavior, observability, tests, and launch gates are measurable.
7. **Public-hosting contract:** `day-zero-public-hosting-security.md` controls are mandatory and evidence-backed before traffic.
8. **Commercial evolution contract:** `commercial-service-architecture.md` seams prevent owner launch from becoming a single-user dead end.

No implementation may silently invent behavior where one of these contracts is missing. Record an owner decision or defer the feature to `TODO.md` (roadmap archived at `planning/archive/post-launch.md`).

## 2. Route and module coverage

| Route family | Module | Access | Primary contract | Required verification |
|---|---|---|---|---|
| `/`, `/studio`, `/system`, `/social-workshop`, `/gallery`, `/docs`, `/pricing`, `/core-values`, `/contact`, `/terms`, `/privacy` | Unknown User | Public | Explain, prove, educate, convert, contact, or legally inform | Direct load, refresh, links, metadata, no private data |
| `/signup`, `/login`, `/forgot-password`, `/reset-password`, `/verify-email`, `/mfa` | Unknown User | Public/auth transition | Establish or recover a secure session | Validation, expired links, safe redirect, session refresh |
| `/app`, `/app/channels`, `/app/channels/[channelId]`, `/app/marketing`, `/app/social`, `/app/staffing`, `/app/agents` | Front Office | Authenticated workspace | Observe and operate studio-wide brand/channel/social/team work | Empty workspace, RLS, CRUD, scoped navigation |
| `/app/builder`, `/app/studio`, `/app/front-office`, `/app/productions/[productionId]`, `/app/assets`, `/app/universe`, `/app/dna` | Studio | Authenticated workspace | Configure lanes, run productions, manage warehouse | State transitions, lineage, Storage policy |
| `/account`, `/app/billing`, `/app/integrations` | Account | Authenticated account/workspace | Secure identity, data, providers, and usage | MFA, export/delete, secret masking, read-only dry billing |
| `/app/genplay` | Studio compatibility | Authenticated workspace | Redirect legacy GenPlay entry into Assets/document view | Redirect and authorization |
| `/app/orchestration` | Studio | Authenticated workspace | Workflow builder: configure/run/inspect customizable production workflows; 13-stage default template (owner ruling 2026-08-23) | Definition CRUD, execution states, RLS, default template integrity |
| `/dashboard`, not-found, error | Compatibility/system | Context-dependent | Preserve safe migration and recovery | Redirect, generic 404, retry, no leakage |

## 3. Shared interface contracts

### 3.1 Navigation

- Public header: Home, Gallery/Work, Docs, Pricing, Sign up, Log in.
- Authenticated header: public-site access plus Front Office, Studio, Account.
- Footer on every page: all public information/legal/contact links plus all four module entries and session-appropriate account actions.
- Active route is visible and keyboard-readable.
- Protected destination uses a safe `next` value; successful auth returns there.
- Unknown/private route behavior never reveals record existence.

### 3.2 Auth/session

- Server resolves session before rendering protected data.
- Browser never stores passwords, service-role keys, provider secrets, or private agent files.
- Sign-up, sign-in, verification, reset, MFA, refresh, expiry, and sign-out have explicit UI states.
- All auth errors are user-safe; detailed causes are server logs only.

### 3.3 Workspace/data

- Every product record has `workspace_id` or an equivalent ownership path.
- Supabase RLS protects select/insert/update/delete independently.
- Related records enforce same-workspace foreign-key integrity.
- Empty workspace is valid and useful; no demo seed is required for navigation or rendering.
- Writes validate type, length, enum, ownership, rights, and state transition before persistence.

### 3.4 Action lifecycle

Each mutation follows:

`precondition → submit/pending → server authorization → persist/queue → success refresh`

Failure returns a stable message, preserves user input where safe, and provides retry or recovery. External side effects (publish, delete, provider call) require explicit confirmation and idempotency.

### 3.5 Assets/secrets

- Storage paths are workspace-scoped and policy-checked.
- Signed URLs are short-lived and issued only after authorization.
- Asset lineage records source, version, owner, production/channel relationship, rights, and approval.
- Secrets are encrypted server-side, masked after save, rotatable, and absent from logs/browser responses.

### 3.6 Capacity and recovery

- Numeric day-zero caps are authoritative in `service-level-requirements.md` section 5; pages never embed limit constants.
- Limit enforcement is atomic, workspace-aware, globally bounded, UTC-reset, alerting, audited, and fail-closed for new writes/external effects when policy state is unavailable.
- Owner payment bypass does not bypass spend, Storage, bandwidth, concurrency, request/auth, upload, retry, suspension, or maintenance controls.
- Durable accepted private assets, queue/outbox/reconciliation state, and audit state target 15-minute RPO; core service target is four-hour RTO. Pending uploads must not claim durable protection.

## 4. Domain contracts

### Channel

Required identity/strategy: name, logo, theme, color tokens, audience, voice, rating, season/topics, cadence, pillars, budget, destinations, rights status. View links preserve channel scope. No delete action outside Account data controls.

### Marketing/research

Supports Studio or channel scope. Research item needs source/evidence, captured time, summary, topic, confidence, and promotion target. Non-creative/non-production lanes belong here.

### Social release

Package needs production/channel, platform, media, caption/metadata, target schedule, validation state, approval, publication state, and feedback. Publish must be explicit, authorized, idempotent, and auditable.

### Agent/lane

Lane needs module ownership, department, inputs, outputs, approval gate, assigned agent, status, and version. Dry launch allows owner assignment/configuration. Paid hiring/protected files are deferred.

### Production

Needs channel, brief, rights attestation, run mode, credit cap, schedule, current step, status, events, approvals, artifacts, and immutable lineage. Valid transitions only; failed work cannot appear completed.

### Asset

Needs kind, storage/reference, version, source, workspace, optional channel/production, rights, approval, status, and timestamps. GenPlay is an Asset/document contract, not a primary module page.

### Account

Profile, Studio identity, sessions/MFA, export, deletion lifecycle, billing/usage, provider connections, and secrets. Destructive operations require re-authentication or equivalent assurance.

## 5. Traceability matrix

| Spec area | Contract evidence | Test artifact |
|---|---|---|
| Four modules and sitemap | Route/module table; navigation contract | Route inventory test |
| Public pages | Public content/result requirements | Playwright public smoke + link/metadata test |
| Auth | Auth/session contract | Auth integration + E2E flows |
| Overview | Studio-wide dashboard contract | Query/empty/filter component tests |
| Channels | Channel contract | CRUD/RLS/channel-scope tests |
| Marketing/research | Research contract | Validation/promotion tests |
| Socials | Release contract | Approval/publish/idempotency tests |
| Staffing | Agent/lane contract | Assignment/catalog/RLS tests |
| Build Production | Lane contract | Builder action/state tests |
| Production Set | Production contract | State-machine/approval tests |
| Assets | Asset/secrets contract | Storage/RLS/lineage tests |
| Account | Account contract | MFA/export/delete/secret tests |
| Dry launch | Launch requirements | Full owner E2E + security gate |
| Deferred work | `TODO.md` | Scope review; no launch dependency |

## 6. Definition of contract-complete

Before implementation begins, each route/domain row must have:

- Named owner module.
- Access rule.
- Read/write data identified.
- Happy path and empty path.
- Validation and authorization rule.
- Failure/retry path.
- Observable acceptance test.
- Post-launch boundary if incomplete.

Any unresolved row blocks implementation of that row only; it must not be guessed or hidden inside UI code.

## 7. Public-hosting security traceability

| Control family | Contract evidence | Required proof |
|---|---|---|
| Hosting/TLS/DNS | Dedicated production environment, HTTPS-only, protected deploy | Certificate/DNS checks, deployment settings, canary result |
| Browser/edge | CSP, HSTS, CORS, headers, WAF, body limits | Header scan, CSP enforcement report, origin/limit tests |
| Auth/session | Redirect allowlist, cookies, MFA, re-auth, rate limits | Auth E2E matrix and Supabase settings capture |
| Tenant isolation | RLS, composite FKs, Storage policy | Two-workspace positive/negative matrix |
| Input/abuse | Validation, XSS/SQL/SSRF/upload controls, quotas | Fuzz/integration results and WAF/rate-limit evidence |
| External effects | Webhook signatures, replay defense, idempotency | Duplicate/replay/timeout tests |
| Secrets/supply chain | Secret manager, rotation, scanning, lockfile, audits | Clean scans, rotation test, immutable build record |
| Observability | Logs, errors, metrics, audit events, alerts | Synthetic failure and alert-delivery record |
| Recovery | Backups, PITR, Storage recovery, RTO/RPO, rollback | Isolated restore rehearsal and rollback evidence |
| Privacy/commercial | Final legal, consent, DSR, payment truth | Owner/legal sign-off and behavior tests |

Public-hosting contract is complete only when every row has an assigned owner and current production evidence. Passing local tests alone is insufficient.

## 8. Commercial integration traceability

| Future requirement | Build-now seam | Refactor-prevention proof |
|---|---|---|
| External customers | Workspace membership + capability resolver | Add test customer through policy data, not page/action fork |
| Plans/limits | Capability/quota view model | Change plan facts without page contract change |
| Paid billing | Catalog/ledger/purchase/event contracts | Activate checkout/webhooks without replacing domain IDs |
| Premium agents | Entitlement + protected execution seam | Assignment API unchanged; server authorization gains entitlement |
| Public signup | Server signup gate + onboarding | Enable by operational policy; auth/session contracts unchanged |
| Teams/roles | Membership permission functions | Add role/policies without rewriting queries/pages |
| Providers | Normalized adapters + durable jobs | Add/remove provider without domain/page response change |
| Scale | Pagination, indexing, quotas, job workers, metrics | Load test passes by scaling adapters/workers, not rewriting workflow |
| Operations | Kill switches, audit, metrics, operator functions | Suspend/disable/retry through audited server control |
| Compliance | Classification/retention/export/delete registry | New processor/policy updates registry and handlers consistently |
| Self-hosting | Infrastructure adapter boundary | Domain/capability contracts run with local infrastructure |

Every implementation PR/task must answer the eight integration questions in `commercial-service-architecture.md`. Missing answers block review.
