# Doubt-Driven Review Record

**Artifact:** `site-workflow-spec.md`, `spec-contract-coverage.md`, `site-workflow-implementation-plan.md`, `site-workflow-tasks.md`  
**Contract:** Four-module sitemap; every route/domain has access, data, states, result, acceptance test; implementation follows document/spec/TDD gates; unresolved policy is deferred or owner-decided.

## Cycle 1

### CLAIM

The planning package is implementation-ready under the four-module contract and contains enough acceptance/test structure to begin implementation after owner approval.

### EXTRACT

The artifact defines public, auth, Front Office, Studio, Account, compatibility, and conditional routes; shared auth/data/security contracts; phased implementation; TDD task order; post-launch boundaries.

### DOUBT reviewer status

Fresh-context reviewer invocation failed with provider error:

`402 Payment Required: Usage limit reached, will reset on today at 5:11 PM (UTC+8)`

Nested reviewer also failed with the same provider limit. No reviewer findings were received. Cross-model review was not run because no external CLI was authorized or configured.

### Degraded self-review

1. **Actionable:** Public routes were added to the spec, but content schemas and ownership for Gallery/Docs/Pricing/Contact remain implementation decisions. **Classification:** valid trade-off; content remains version-controlled and owner-approved, schema only needed for dynamic/public records.
2. **Actionable:** Overview widget preference persistence may require a migration. **Classification:** explicit ask-first boundary; implementation task requires approval before schema change.
3. **Actionable:** Social publishing and contact delivery cross external boundaries. **Classification:** covered by explicit confirmation, server authorization, idempotency, rate limit, and post-launch/provider gates.
4. **Noise:** GenPlay appears in compatibility references and Assets contracts. **Classification:** intentional; spec explicitly prevents it becoming a primary page while preserving old links.

### STOP

Stopped after one bounded degraded cycle. Fresh-context doubt remains unverified because provider capacity blocked it. Do not claim doubt-review success until a fresh reviewer can run and findings are reconciled.

## Commercial architecture cycle 1

Fresh-context reviewer received only the revised commercial artifacts and additive-evolution contract. Findings and reconciliation:

| Finding | Classification | Change |
|---|---|---|
| “Unlimited owner” could bypass safety caps | Valid + actionable | Owner may bypass payment entitlement only; spend/storage/rate/concurrency safety caps always apply |
| External effects assumed exactly-once transport | Valid + actionable | Added atomic outbox/reservation, payload-bound idempotency, leases, reconciliation, compensation, ambiguous-provider state, atomic settlement |
| App signup flag could be bypassed through Supabase | Valid + actionable | Added direct IdP signup-denial configuration/test task |
| Workspace booleans cannot support channel roles | Valid + actionable | Replaced with resource-aware principal/action/target authorization |
| Capability precedence/freshness undefined | Valid + actionable | Added fail-closed precedence, action-time resolution, re-authorization, atomic quota reservation |
| Global/anonymous records lack workspace | Contract misread caused by incomplete contract | Added system/public/anonymous/account/workspace/financial-audit ownership scopes |
| Self-hosting lacks infrastructure boundary | Valid + actionable | Added narrow identity/data/storage/job/vault/email/payment/observability service boundaries and architecture tests |
| Workflow customization requires state-machine rewrite | Valid + actionable | Added versioned built-in workflow definition/transition seam and pinned instance snapshots |
| Operator controls had no task | Valid + actionable | Added separately authorized/MFA/audited operator control task |
| Day‑0 owner access could expose premium source | Valid + actionable | Premium source protection now exists day‑0; only commercial entitlement waits |
| Account deletion unsafe for future shared workspaces | Valid + actionable | Added departure/last-owner/transfer/retention semantics and tests |
| SLOs excluded customer-impacting provider time | Valid + actionable | Added end-to-end job/publication objectives, backlog age, precise denominators/windows |
| Durability only measured database | Valid + actionable | Added Storage/config/queue-payment-publication/audit RPOs |
| Signed URLs cannot revoke immediately | Valid trade-off | Five-minute max TTL; stop issuance immediately; authenticated proxy for immediate-revocation assets |
| Acceptance language/coverage unclear | Valid + actionable | Added exact 80% dimensions and concrete failure matrices |
| Every static task forced irrelevant architecture work | Valid + actionable | Added explicit reasoned `N/A`; no framework solely to avoid N/A |
| Header/pricing could imply unavailable signup/purchase | Valid + actionable | Require invite/request-access and non-transactional truthful states until activation |
| Account invites and team invites conflated | Valid + actionable | Defined separate account-access and workspace-membership invitation audiences/lifecycles |

Cycle 2 found remaining substantive gaps: non-queryable provider ambiguity, just-in-time suspension fencing, incomplete lifecycle states, numeric safety caps, shared-workspace closure, objective SLO denominators/targets, paid-asset RPO gate, signed URL enforcement, capability decision provenance, authoritative classification inventory, idempotency retention, invitation races, protected-source leak verification, and coverage scope. All were classified **valid + actionable** and incorporated into commercial architecture, service requirements, post-launch acceptance, and current tasks.

Stop condition: two cycles complete; cycle 2 findings were substantive and changed artifacts. Per doubt-driven rules, a third cycle is allowed but not required in this documentation turn. Run cycle 3 before implementing Commercial Architecture Foundations; if it returns substantive unresolved issues, escalate instead of starting code.

## Cycle 3 — Commercial foundations

### CLAIM

F01–F08 can establish server contracts without changing the four-module sitemap or creating page-local authorization.

### EXTRACT

Reviewed the updated commercial architecture, service-level requirements section 5, security standard, task list, and Terra/Luna handoff against the existing Supabase worker/storage foundations.

### Findings and reconciliation

| Finding | Classification | Resolution |
|---|---|---|
| Existing queue uses a narrower lifecycle and stale-worker fencing is incomplete. | Valid + actionable | F05 adds a normalized durable-effect state machine and lease-fenced transition contract; worker migration remains a later explicit integration, not a false compatibility claim. |
| Existing Storage trigger has an obsolete 10 GiB cap, below selected 100 GiB policy. | Valid + actionable | F08 central policy uses normative limits; changing deployed trigger needs a reviewed additive migration and is not silently performed in this foundation step. |
| Provider-level anonymous signup disablement cannot be proved with local unit credentials. | Valid + actionable, external configuration evidence required | F03 contract tests cover direct-provider boundary adapter; staging Supabase setting/hook evidence remains a release prerequisite. |
| Registry cannot infer every hosted bucket/event from local code alone. | Valid + actionable | F06 requires a checked-in authoritative manifest and rejects unclassified discovered fixtures; production inventory reconciliation remains required before public traffic. |

### STOP

Three cycles complete. No finding is unresolved at the contract level; external staging configuration and existing-schema integration are tracked release prerequisites. Foundation implementation may start.

## Planning updates after cycle 2

- Numeric owner-launch caps and recovery targets are now selected in `service-level-requirements.md` section 5 and traced into the product spec, security standard, contract coverage, release checklist, and F08 task.
- Every implementation task now has one owner tag: `@terra` for platform/security/data/operations/release work or `@luna` for four-module/product/content/rehearsal work. `agent-implementation-handoff.md` defines dependencies and review boundaries.
- Cycle 3 remains a hard gate before F01 implementation. It must review the updated numeric limits and Terra/Luna handoff as artifact plus contract, then record findings here.
