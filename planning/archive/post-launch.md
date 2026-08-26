# Gem Studio Post‑Launch Commercial Roadmap

**Boundary:** Work here activates or extends customer/commercial capabilities after secure owner launch.  
**Non-negotiable:** Day‑0 public-hosting security, observability, backups, restore, incident response, workspace isolation, capability resolution, operational kill switches, and service indicators are built before owner launch—not deferred here.  
**Architecture source:** `commercial-service-architecture.md`.

## 1. Foundation compatibility contract

Every day‑0 implementation must make these later phases additive:

- Workspace membership remains tenant boundary.
- One server capability resolver owns roles, plans, entitlements, flags, and quotas.
- One operational policy owns kill switches, suspension, maintenance, and degraded modes.
- External effects use durable, idempotent jobs/events.
- Provider SDKs stay behind normalized adapters.
- Billing/product/usage facts remain server-authoritative.
- Security/domain/operator changes emit redacted audit events.
- All new data is classified with retention/export/deletion policy.
- Database evolution uses expand/backfill/switch/contract.
- Pages consume stable view models/capabilities, not hard-coded owner/plan/provider state.

Each post-launch phase must prove existing page/domain contracts remain valid. A phase requiring widespread page rewrites fails architecture review.

## 2. Release stages

### Stage 0 — Secure owner operation

One owner uses the complete live service. Public pages are hosted. Public signup and commerce are disabled by server policy. All production security/operations and commercial architecture seams are active.

Exit evidence:

- Owner workflow succeeds end-to-end.
- Security Gates A–E pass.
- Initial SLIs are measured.
- Backup/restore and incident rehearsal pass.
- Capability resolver grants owner use without identity special-case.

### Stage 1 — Invited customer beta

Goal: Real external accounts without charging.

Before invitation activation, replace or explicitly reapprove the one-owner estimates in `service-level-requirements.md` section 5 using measured owner-launch traffic, provider cost, queue, Storage, bandwidth, abuse, backup, and restore evidence. Customer beta must not silently inherit owner-launch capacity assumptions.

Activate/build:

- Invite lifecycle, expiry, revocation, and resend.
- Account-access invite tokens are high-entropy hashed-at-rest, email-bound, audience-bound, single-use with atomic consumption, expiring, revocable, rate-limited, and tested against replay/race, resend invalidation, existing-account collision, and partial workspace creation.
- First-run onboarding: Studio identity, channel, goals, platforms, providers, privacy choices.
- Customer support intake, ticket/reference, severity routing, secure access policy.
- Per-workspace quotas, storage/job/provider limits, and cost alarms.
- Account suspension, session revocation, connection disablement, queue/publishing pause.
- Customer-facing known limitations and status communication.
- Beta feedback and product analytics with consent.
- Larger two-workspace/multi-workspace RLS and load tests.

Acceptance:

- Adding invited accounts changes capability/launch data, not page authorization code.
- One workspace cannot infer another.
- Support/operator actions are separately authorized and audited.
- Capacity/load test covers expected beta peak plus retry storm.
- Cost exposure per workspace is bounded.

This is an **account-access invitation**: it authorizes a named email to create a new solo workspace under beta policy. It is distinct from Stage 6 **workspace-membership invitations**, which target an existing workspace, assign an invited role/scope, and never create a second workspace implicitly. They may share hardened token primitives but use different schemas/audiences/lifecycles. Both are classified account/security data with explicit retention, deletion, export exclusion, audit, and legal-hold rules.

### Stage 2 — Paid Managed Cloud

Goal: Sell subscriptions/usage safely.

Activate/build behind existing billing seam:

- Versioned plans, entitlements, limits, effective dates.
- Workspace subscription lifecycle.
- Checkout and customer billing portal.
- Taxes, invoices/receipts, refunds, credits, failed payments, grace periods, cancellation.
- Payment webhook signature, replay, idempotency, reconciliation, dispute/chargeback handling.
- Usage aggregation and invoice explainability.
- Purchase/support/audit tooling.
- Pricing page driven from approved commercial catalog or synchronized content contract.

Acceptance:

- Purchase cannot create entitlement until verified server event.
- Duplicate/replayed/out-of-order events do not duplicate access or ledger entries.
- Refund/cancellation removes future rights according to policy without corrupting past artifacts.
- Payment outage produces pending/failed truthful state.
- Customer can understand charge from ledger/usage.
- Billing support can reconcile by external event ID without exposing secrets.

### Stage 3 — Premium agent marketplace

Goal: Sell/license protected agent configurations.

Activate/build:

- Transactional agent hiring and pack entitlements.
- Premium files remain server-side.
- Protected execution by catalog ID.
- License-aware assignment, version, upgrade, deprecation, and removal.
- Catalog author/reviewer workflow.
- Refund and entitlement revocation behavior.
- Output ownership and configuration-license terms.
- Abuse/exfiltration monitoring.

Acceptance:

- Existing agent assignment uses same capability resolver.
- Premium source never enters browser, user-selected provider payload, logs, trace, export, or backup available to customer.
- Entitlement checks occur server-side at assignment and execution.
- Catalog version migration does not silently change active production behavior.

Premium-file confidentiality is not introduced here; it exists from day‑0. This stage activates commercial entitlement, marketplace lifecycle, and customer licensing around the already-protected execution path.

### Stage 4 — Public signup

Goal: Allow unknown users to create accounts.

Activate/build:

- Signup policy change through server operational gate.
- Bot/fraud/abuse defenses tuned for public acquisition.
- Email reputation, bounce, complaint, suppression, unsubscribe, and deliverability monitoring.
- First-use quotas and progressive trust.
- Terms/Privacy consent version evidence.
- Automated onboarding/recovery/support scale.
- Fraud, spam, prohibited content, takedown, suspension, appeal, and evidence preservation.

Acceptance:

- Public signup activation is configuration/capability change plus tested onboarding—not auth rewrite.
- Abuse cannot create unbounded provider, storage, email, or support cost.
- Account enumeration remains prevented.
- Consent and policy versions are auditable.

The day‑0 public header may show `Sign up`, but while public signup is disabled the destination truthfully presents invite/request-access state and cannot create an uninvited account. Pricing may describe approved intended offers, but purchase CTAs remain request-access/notify/contact until commercial activation; no unavailable plan is represented as a completed transaction.

### Stage 5 — Self-hosted/free edition

Goal: Ship limited local deployment without weakening Managed Cloud.

Build:

- Supported package/container and reproducible installer.
- Local database/Storage/provider configuration.
- Install, upgrade, backup, restore, secret, and troubleshooting docs.
- Free-edition entitlement policy:
  - Limited channels.
  - Limited preconfigured agents/lanes.
  - YouTube, X, TikTok, Instagram/Facebook, and approved platforms.
  - Reduced hosted automation, storage, support, and managed operations.
- License/activation rules if required.
- Export/import path with explicit compatibility/security rules.
- Version support and vulnerability update policy.

Acceptance:

- Shared domain/capability contracts remain; infrastructure adapters differ.
- Identity, authorized data, Storage, jobs/outbox, vault, email, payment-event, and observability implementations pass the shared server service contracts established day‑0.
- Managed Cloud secrets/services are absent.
- Local operator understands security/backup responsibility.
- Upgrade and restore tests cover supported previous version.

### Stage 6 — Teams and role-based workspaces

Goal: Multiple people safely collaborate.

Build additively:

- Invitations and membership lifecycle.
- Viewer/editor/operator/owner roles.
- Channel-scoped permissions.
- Approval delegation and separation of duties.
- Comments, mentions, assignments, notifications.
- Team audit history.
- Ownership transfer and last-owner protections.

Acceptance:

- Role enum/policies expand; owner rows and page contracts remain valid.
- All permission combinations have positive/negative tests.
- Removing member revokes sessions and all authenticated access immediately, stops new signed-URL issuance immediately, and allows already-issued default links only until the enforced five-minute maximum. Data requiring immediate link revocation uses authenticated proxy delivery.
- No unrestricted impersonation.

### Stage 7 — Workflow customization

Goal: Customer-specific dashboards and production behavior.

Build:

- User-defined dashboard actions/widgets.
- Saved views and role-specific dashboards.
- Lane and production templates.
- Conditional handoffs and richer orchestration.
- Custom triggers, schedules, notification rules.
- Template versioning, validation, sandboxing, rollback.

Acceptance:

- Custom behavior runs through capability/quota/audit/job contracts.
- Invalid configuration cannot create infinite loops, unauthorized effects, or unbounded cost.
- Existing fixed 13-stage production remains supported.
- Built-in and custom workflow definitions use the same versioned definition/transition interface; existing production instances remain pinned.

### Stage 8 — Platform/provider expansion

Goal: More publishing, analytics, and generation services.

Build through adapter seam:

- Additional AI and social adapters.
- Provider health, circuit breakers, fallback, and regional routing.
- Direct publishing and analytics sync.
- Comment/interaction inbox.
- Captions, thumbnails, translations, derivatives.
- Platform experiment tracking.
- OAuth review, token rotation, revocation, and scope reduction.

Acceptance:

- Domain/pages consume normalized results.
- Provider failure cannot corrupt domain state or duplicate effects.
- Provider removal does not orphan historical records.

## 3. Commercial operating workstreams

These span all customer stages.

### Service reliability

- Measure and review `service-level-requirements.md`.
- Error-budget release policy.
- Load, stress, soak, chaos/failure, backlog-recovery tests.
- Capacity forecast for database, Storage, bandwidth, workers, providers, logs, and support.
- Degraded modes and customer status communication.

### Data governance and compliance

- Data inventory/classification and retention schedule.
- Subprocessor inventory and change notices.
- DPA and geographic processing policy.
- CCPA/GDPR/state-law applicability with counsel.
- Consent and data-subject request evidence.
- Children/age policy.
- Legal holds and secure deletion.
- Compliance program (for example SOC 2) only when business need and evidence support it.

### Trust and safety

- Prohibited content and acceptable use.
- Malware/upload scanning.
- Rights, likeness, trademark, and copyright handling.
- Abuse reporting and takedown.
- Quarantine, suspension, appeal, and repeat-offender policy.
- AI output review and publication responsibility.

### Support and customer success

- Support channel/hours and severity targets.
- Escalation tree and status page.
- Secure support tooling and access audit.
- User guide, onboarding, troubleshooting, integrations, billing, privacy, deletion, and recovery docs.
- Changelog, release notes, deprecation notices.

### Performance, accessibility, and discovery

- Core Web Vitals budgets and real-user monitoring.
- Load/capacity budgets.
- WCAG 2.2 AA automated and manual audits, keyboard and screen-reader coverage.
- Browser/device matrix.
- Robots, XML sitemap, canonical, Open Graph, structured data, broken links, and content freshness.

## 4. Required phase packet

Before starting any stage, create a packet containing:

- Approved objective and user group.
- Capacity and cost forecast.
- Data/privacy/subprocessor changes.
- Threat-model changes.
- Capability/role/plan changes.
- Schema migration/backfill plan.
- Provider/adapter changes.
- Support and incident readiness.
- TDD tasks and acceptance suite.
- Rollout, canary, kill switch, rollback.
- Documentation and customer communication.
- SLO/error-budget impact.

No stage begins because “the UI is ready.” It begins when this packet is approved.
