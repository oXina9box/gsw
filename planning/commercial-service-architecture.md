# Gem Studio Commercial Service Architecture

**Purpose:** Ensure code built for owner launch becomes customer-ready through additive work, not major refactoring.  
**Rule:** Day‑0 implementation must preserve every integration seam in this document, even when the corresponding commercial feature is disabled.  
**Related:** `site-workflow-spec.md`, `service-level-requirements.md`, `day-zero-public-hosting-security.md`, `post-launch.md`.

## 1. Architectural principles

1. **Ownership scope is explicit.** Private product data uses workspace tenancy; system, public-editorial, anonymous-intake, and pre-workspace identity/payment records use separate named scopes. Never fake a workspace owner or special-case the owner’s user ID.
2. **Server decides capability.** Pages display capability results; they do not derive plans, roles, limits, or entitlements.
3. **External work is asynchronous and idempotent.** Provider calls, publishing, payments, email, purges, and long media tasks use durable jobs/events.
4. **Provider details stay behind adapters.** Domain workflows request capabilities, not vendor-specific SDK calls.
5. **Data changes are additive.** Use expand/backfill/switch/contract migrations.
6. **Operational state is explicit.** Feature flags, kill switches, degraded modes, and maintenance state are server-controlled and audited.
7. **Every expensive action is metered before execution.** Reserve capacity/credits, execute once, settle actual use, release on failure.
8. **Every sensitive action is auditable.** Record actor, workspace, action, target, outcome, correlation ID, and safe metadata.
9. **Public content is separately published.** Private workspace data never becomes public because a UI flag was hidden.
10. **No speculative platform framework.** Build only these stable seams; add providers/features behind them when required.

## 2. Existing foundations to preserve

Current schema already contains useful commercial foundations:

- `workspaces`, `workspace_members`, workspace-scoped RLS.
- `agent_catalog`, `agent_entitlements`, protected catalog files.
- `provider_connections`, encrypted `provider_secrets`, model catalog.
- `credit_accounts`, `credit_ledger`, `commerce_products`, `purchases`, `payment_events`.
- Durable `job_queue`, reservations, worker claiming/finishing, dead status.
- `social_connections`, `publications`, `social_metrics`, `signals`.
- `workspace_storage_usage` and atomic storage accounting.
- Account deletion, purge queue, export, production approvals, asset lineage.

Do not replace these with client state or a parallel billing/workflow model. Harden and extend them.

## 3. Capability and entitlement seam

### Build now

Create one server-side resource-aware authorization/capability resolver. Callers ask whether a principal may perform an action against a target; they do not consume scattered global booleans. Inputs:

- Authenticated user ID.
- Workspace membership and role.
- Workspace operational status.
- Launch mode.
- Plan/subscription facts when present.
- Agent entitlements.
- Usage/quota facts.
- Feature flags.
- Requested action.
- Target resource type/ID and optional channel/production scope.

Output is immutable capability data, for example:

```ts
type WorkspaceCapabilities = Readonly<{
  allows: (action: string, target: Readonly<{ type: string; id?: string; channelId?: string }>) => boolean;
  channelLimit: number;
  storageLimitBytes: number;
  enabledPlatforms: readonly string[];
}>;
```

Owner launch resolver grants approved commercial capabilities without payment entitlement, but **never bypasses safety caps** for provider spend, storage, bandwidth, job concurrency, rate limits, or abuse controls. Customer launch adds plan/subscription facts. Product pages and actions keep the same contract.

Initial numeric values, alert thresholds, reset windows, and enforcement responses are normative in `service-level-requirements.md` section 5. Limits are configuration-backed policy facts with audited, expiring overrides; they are never duplicated as page constants.

Precedence is fail-closed:

1. Environment emergency stop/maintenance.
2. User/workspace suspension or security restriction.
3. Resource ownership and role permission.
4. Feature/platform/provider availability.
5. Entitlement/plan permission.
6. Quota, reservation, and safety cap.

Any missing/stale/erroring source denies new writes/external effects; explicitly safe reads may enter documented degraded mode. Capabilities are resolved on the server at action execution. Long-running jobs authorize at enqueue and claim, then perform a just-in-time lease-fenced authorization immediately before every irreversible provider/payment/publication effect. Emergency global/provider/platform stops and security suspension always override prior approval snapshots. A rights snapshot preserves audit/provenance only; it never bypasses a current emergency stop. Quota reservation is atomic, not a cached affirmative boolean.

Authorization decisions return allow/deny plus stable reason code, policy/flag version, evaluated time, target scope, applicable limit/reservation, and source freshness metadata. UI may translate reason codes; audit and actions use the stable decision record.

### Never do

- `if (email === ownerEmail)` in pages/actions.
- Plan-name checks scattered through UI.
- Trust client-supplied entitlement or price.
- Treat a hidden button as enforcement.

## 4. Roles and memberships

### Build now

- All reads/writes continue through workspace membership, even with one owner.
- Permission checks use role/capability functions, not direct enum comparisons throughout code.
- Audit actor and workspace separately.
- Data exports and deletion follow workspace membership.

### Add later

Expand role enum and policies additively for viewer/editor/operator/owner, invitations, channel-scoped access, and approval delegation. Resource-aware authorization call sites remain unchanged. Existing owner rows remain valid.

## 5. Plans, subscriptions, usage, and billing

### Build now

- Keep product catalog, prices, purchases, credits, and ledger server-authoritative.
- Keep checkout disabled by capability/feature gate—not by deleting billing contracts.
- Meter generation, storage, publication, and job work through consistent usage facts.
- Require idempotency key for reservation, job, checkout, refund, and webhook events.
- Store provider/payment external IDs and event state without making them primary domain IDs.
- Billing page renders current commercial state, including owner-launch/no-transaction state.

### Add later

- `workspace_subscriptions` or equivalent subscription state.
- Versioned plan entitlements and effective dates.
- Usage aggregation/invoicing.
- Taxes, invoices, refunds, chargebacks, grace periods, cancellations.
- Self-host license/activation where legally required.

No page rewrite should be needed: capability and billing view models gain facts.

## 6. Provider adapter seam

### Build now

Workers request normalized capabilities:

- Text generation.
- Image generation.
- Audio generation.
- Media assembly.
- Social publication/metrics.
- Email notification.

Each adapter contract defines:

- Validated input.
- Normalized output.
- Timeout.
- Retry classification.
- Idempotency behavior.
- Cost/usage result.
- Safe error code.
- Provider request ID for support.
- Ambiguous-result strategy: provider idempotency, authoritative status lookup, or mandatory manual reconciliation with no automatic retry.

Provider SDK responses never flow directly into page components or domain tables without normalization.

### Add later

- More vendors.
- Fallback routing.
- Circuit breakers.
- Provider health scoring.
- Regional routing.

## 7. Durable external-effect seam

Use durable queue/event boundaries for:

- Generation and assembly.
- Social publishing and metrics collection.
- Email delivery.
- Checkout fulfillment and refunds.
- Data export and purge.
- Large imports/backfills.

Required lifecycle:

`requested → authorized → reserved → queued → claimed → completed/failed/dead → settled`

Every transition is server-authorized, idempotent, timestamped, and observable. Browser request timeout must not lose or duplicate work.

Delivery semantics are at-least-once with exactly-once **domain effects**, not assumed exactly-once transport:

- Reserve and enqueue/outbox record commit atomically.
- Unique idempotency key binds action, workspace, target, operation version, and canonical payload hash.
- Reusing a key with different payload is rejected.
- Claim uses lease owner/expiry and compare-and-set transition.
- Lease loss permits safe reclaim; stale worker cannot settle.
- Reservation has explicit expiry/reconciliation.
- Cancellation defines allowed states and compensation.
- Provider-accepted/response-timeout becomes `reconciling`, not blind retry, when provider supports status lookup.
- Every adapter must provide a safe ambiguity strategy: provider-enforced idempotency, authoritative status lookup, or a non-retry manual-reconciliation terminal state. Non-queryable/non-idempotent providers cannot auto-retry after ambiguous acceptance and cannot be enabled for charge/publication effects.
- Settlement is atomic with final domain artifact/ledger/publication state.
- Duplicate webhooks/jobs return stored result without repeating effect.
- Reconciler detects stranded reservation, outbox, pending payment/publication, and expired lease.

Canonical states: `requested → authorized → reserved → queued → claimed → running → completed | failed | reconciling | cancelled | dead`; terminal states enter `settling → settled` or `compensating → compensated`. `reconciling` cannot auto-retry without adapter proof; `cancelled` is allowed only before irreversible provider acceptance; `dead` requires operator/reconciler decision; reservations remain until settled or compensated.

## 8. Feature flags and operational controls

### Build now

One server-side operational policy supports:

- Signup enabled/disabled.
- Checkout enabled/disabled.
- Generation enabled/disabled by capability/provider.
- Publishing enabled/disabled by platform.
- Upload enabled/disabled.
- Read-only maintenance mode.
- Experimental orchestration enabled/disabled.
- Emergency per-workspace suspension.

Flags must have safe defaults, owner, reason, expiry/review date, environment scope, and audit event. Client flags control presentation only; server flags enforce behavior.

## 9. Observability and audit seam

### Build now

Every request/job/external event shares correlation IDs. Structured events include:

- Timestamp and environment.
- Request/job/event ID.
- Actor and workspace IDs when safe.
- Domain action and target type/ID.
- Result and stable error class.
- Duration and provider request ID.
- Usage/cost without secret/private payload.

Audit records are not ordinary debug logs. They have retention/access controls and cover security, billing, approvals, publishing, deletion, exports, provider changes, and operator actions.

## 10. Operator/admin seam

### Build now

Implement server-only operator functions before customer launch; owner launch at minimum needs emergency controls and runbooks:

- Suspend workspace/user.
- Revoke sessions.
- Disable connection/platform/provider.
- Pause queue/publishing/generation.
- Inspect safe job/audit status.
- Retry/cancel eligible jobs idempotently.
- Start maintenance/read-only mode.

Operator actions require separate authorization, strong MFA, audit, reason, and no unrestricted impersonation. Service-role credentials never enter a public page.

## 10A. Signup/invitation enforcement

Owner launch disables provider-level public signup in Supabase Auth, not only the app button. Invited beta uses a database/Auth hook or equivalent server-controlled pre-user/transactional bootstrap that atomically validates and consumes a hashed, email/audience-bound invite before workspace creation. Direct anonymous provider calls, replay, race, revoked/expired invite, and cross-audience tokens are denied. Self-hosted identity implementation must pass the same contract.

## 11. Data classification and lifecycle seam

Define classes:

- Public editorial.
- Account/contact.
- Workspace confidential.
- Creative assets.
- Credentials/secrets.
- Billing/financial.
- Security/audit.

Every new table/bucket/event documents class, owner, retention, deletion/export behavior, encryption, public eligibility, and processors. This prevents later privacy/schema rewrites.

Ownership scopes:

- `system`: catalogs, global operational policy, provider metadata.
- `public`: explicitly published editorial/Gallery content.
- `anonymous`: rate-limited Contact/signup intake before identity/workspace, with short retention.
- `account`: identity/security/consent records.
- `workspace`: private product and creative records.
- `financial/audit`: legally or operationally retained records with restricted access.

Idempotency keys, webhook/event records, outbox records, and provider reconciliation records retain at least the longest provider replay/reconciliation window plus the incident-investigation period; default minimum is 90 days unless an adapter documents a longer period. Purging requires a replay-safety check.

Account deletion removes identity and memberships according to policy. A shared workspace survives a departing member; last-owner deletion requires ownership transfer or explicit workspace closure. Financial, fraud, security, and audit evidence follows documented retention/legal-hold policy and is excluded or redacted from ordinary product exports as law/policy requires.

## 11A. Infrastructure service boundaries

Day‑0 code defines narrow server-side services for:

- Identity/session and membership context.
- Workspace-authorized data access.
- Private object storage and signed delivery.
- Durable jobs/outbox.
- Secret vault/encryption.
- Email delivery.
- Payment events.
- Observability/audit.

Next.js routes/actions may instantiate Supabase-backed implementations, but domain workflow and page view-model code must not spread direct vendor response shapes or service-role access. These are narrow integration boundaries, not speculative repository interfaces for every table. Self-hosting supplies compatible infrastructure implementations while keeping domain/capability/action contracts.

## 11B. Production workflow definition seam

The supported 13-stage production is a versioned built-in workflow definition. Production instances record definition/version and immutable step snapshot. Transition evaluation accepts a definition plus production state; pages consume normalized current/next/approval results.

Canonical v1 stage IDs are stable slugs: `research`, `marketing`, `creative`, `story`, `storyboard`, `script`, `screenplay`, `ai_conversion`, `video_production`, `launch`, `social_posting`, `social_management`, `reporting`. Labels may change; IDs/order/version do not. Approval/transition invariants are defined beside the versioned definition and tested from first to final stage.

Day‑0 does not expose arbitrary workflow authoring. Later templates/conditions/triggers add new validated definitions behind the same transition interface. Existing productions remain pinned to their original version unless an explicit migration succeeds.

## 12. Database evolution

All production migrations follow:

1. **Expand:** Add nullable/default-compatible schema and policies.
2. **Deploy compatible code:** Reads old/new; writes required bridge state.
3. **Backfill:** Bounded, restartable, observable batches.
4. **Verify:** Counts, invariants, RLS, performance.
5. **Switch:** Enable new path behind server flag.
6. **Contract:** Remove old field/path only in later release after evidence.

Never combine irreversible data deletion with the release that introduces replacement behavior.

## 13. Public API and event compatibility

Even without a public developer API:

- Server action inputs have explicit schemas.
- Webhook/event payloads have versions.
- Job kinds and payloads are versioned or backward-readable.
- Database event consumers tolerate additive fields.
- External IDs stay separate from internal UUIDs.
- Error codes remain stable; user copy may change.

## 14. Performance and capacity seam

### Build now

- Paginate all unbounded lists.
- Index ownership, status, schedule, and common filter columns.
- Avoid N+1 queries.
- Keep large media out of database rows.
- Stream/upload directly to private Storage using authorized paths.
- Run heavy/slow work in jobs.
- Record query/job/provider latency and resource use.
- Apply per-workspace quotas from one policy source.

Signed delivery defaults to a maximum five-minute TTL. Permission/suspension changes stop issuance immediately; existing URLs expire naturally. Assets needing immediate revocation use an authenticated streaming/proxy path or provider-supported revocation—not long-lived signed URLs.

The five-minute value is a hard signer upper bound. Tests cover clock skew, audience/path binding, issuance after suspension, use before/after expiry, and the distinction that “revoke active access” stops new issuance immediately while already-issued links remain valid only until hard TTL unless the proxy path is used.

### Add later

- Cache proven hot reads.
- Read replicas/regional routing.
- Queue partitioning and worker autoscaling.
- Higher plan quotas.

## 15. Integration acceptance rules

Every applicable implementation task must answer; explicitly record `N/A` with one sentence when a concern truly does not apply:

1. Which workspace owns this data?
2. Which capability authorizes it?
3. What quota/meter applies?
4. Is an external effect durable and idempotent?
5. Which feature/kill switch disables it?
6. What audit/metric proves its outcome?
7. How is it exported/deleted/retained?
8. How will a future role/plan/provider extend it additively?

If any answer is “hard-code owner launch for now,” task is not ready.
