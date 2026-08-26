# Gem Studio Terra / Luna Implementation Handoff

**Purpose:** Give two implementation agents a safe, mergeable, production-grade execution queue.  
**Source of truth:** `site-workflow-spec.md`, `spec-contract-coverage.md`, `site-workflow-implementation-plan.md`, `site-workflow-tasks.md`, `day-zero-public-hosting-security.md`, `commercial-service-architecture.md`, and `service-level-requirements.md`.  
**Sitemap rule:** Fixed four modules. No route/module redesign without explicit owner direction.

## 1. Shared non-negotiables

- Execute a task only after its listed dependencies pass. Never bypass an unmet foundation with UI-only authorization or client state.
- TDD is mandatory: capture RED command/result, write the smallest GREEN implementation, run focused plus affected suite, then refactor only while green.
- Server resolves capability, operational policy, workspace scope, quota, and external-effect authorization. UI only presents decisions and stable errors.
- No hard-coded owner ID/email/plan, browser secrets, fake mutations, unrestricted retry/cost, cross-workspace query, or vendor SDK response in page/domain contract.
- Preserve unrelated dirty-worktree changes. Use additive migrations only: expand, compatible code, bounded backfill, verify, switch, later contract.
- Each task records required completion fields from `site-workflow-tasks.md`; `N/A — reason` is valid only when truly inapplicable.
- A task touching shared contracts requires the other agent’s review before merge. Both agents run the relevant contract tests.

## 2. Launch configuration already selected

`service-level-requirements.md` section 5 contains provisional owner-launch numeric enforcement values:

- Provider spend: USD 25/workspace/day, USD 250/workspace/30 days; global USD 35/day, USD 300/30 days.
- Storage: 100 GiB/workspace, 125 GiB global. Bandwidth: 250 GiB/workspace/month, 300 GiB global.
- Jobs: 4/workspace, 6 global concurrent running/claimed.
- Authenticated reads/writes: 120/user and 300/workspace reads/minute; 30/user and 60/workspace writes/minute.
- Public/auth/contact limits, request body, upload size/count, and retry budget are exact in section 5.1.
- RTO: 4 hours. Database, queue/outbox, reconciliation, audit, and accepted private asset RPO: 15 minutes. Operational configuration RPO: 24 hours.

Terra enforces these centrally. Luna must call the approved server path; no local constants.

## 3. Work ownership

### `@terra` — platform, policy, security, data integrity, operations

Own tasks `F01–F13`, `A02`, `V01–V10`, `V12–V14`.

Primary surfaces:

- `web/lib/studio/` server policy/capability/jobs/storage/audit/service boundaries.
- `web/lib/auth/`, `web/lib/supabase/`, workers/webhooks/operator paths.
- `supabase/migrations/`, `supabase/tests/`, `scripts/`, security/hosting/runbooks and CI evidence.
- Contract tests for authorization, RLS, quotas, effects, workflow definition, lifecycle, recovery, observability.

Deliverables in order:

1. `F01–F08`: resource authorization, operational policy, signup boundary, audit, durable outbox/effects, classification, infrastructure boundary, numeric caps.
2. `F09–F13`: guarded entry inventory, versioned workflow engine, operator controls, migration safety, SLI instrumentation.
3. `A02`: shared-workspace departure/closure state machine.
4. `V01–V10`: deploy/auth/edge/RLS/Storage/trust/secrets/security-gate/operations/recovery proof.
5. `V12–V14`: phase doubt records, complete quality gate, release evidence coordination.

Do not build broad product page features. Expose small documented server contracts for Luna to call.

### `@luna` — four-module routes, product workflows, truthful UI

Own tasks `F14–F16`, `U01–U05`, `FO01–FO06`, `S01–S05`, `A01`, `A03–A05`, `V11`, `V15`.

Primary surfaces:

- `web/app/(marketing)/`, `web/app/(product)/`, `web/components/`, navigation/view-model code, public content, route/component/E2E tests.
- Page-specific server actions only after calling Terra’s capability/policy/audit/effect service contracts.

Deliverables in order:

1. `F14–F16`: route inventory, shared header, universal footer.
2. `U01–U05`: public Gallery, Docs, Pricing, Contact, final content gates.
3. `FO01–FO06`: dashboard, channels, Marketing/Research, Socials, Staffing.
4. `S01–S05`: Builder, production opening/set, Assets, GenPlay compatibility.
5. `A01`, `A03–A05`: account UI, account data controls, dry billing, integrations/secrets UI.
6. `V11`, `V15`: truthful legal/commercial UI evidence and owner rehearsal.

Do not add product-specific auth, quota, provider, or authorization helpers. Ask Terra for missing contract capabilities, then update docs/tasks before code.

## 4. Dependency gates

| Gate | Must pass before | Why |
|---|---|---|
| `G0` baseline route inventory | all UI route edits | Locks current sitemap/compatibility behavior |
| `G1` F01–F08 | U04, FO02–FO06, S02–S04, A01–A05 | Every write/external effect needs capability, policy, audit, quota, durability, classification, and service boundary |
| `G2` F09–F13 | S03, FO05, A02, V01–V10 | Workflow, operator, external effects, migrations, and SLO proof need foundation contracts |
| `G3` F14–F16 | U01–U05 | All pages must use fixed shared shell/navigation |
| `G4` U01–U05 | V11 | Legal/public claims must match actual product behavior |
| `G5` FO01–FO06, S01–S05, A01–A05 | V15 | Full owner workflow must exist before rehearsal |
| `G6` V01–V13 plus V11/V15 | V14 / traffic | Launch evidence, recovery, security, truth, and quality gates are blocking |

`G1` is hard. Luna may build static route layout/tests after `G0/G3`, but cannot merge data mutation, upload, provider, publication, account deletion, export, or secret handling that bypasses `G1`.

## 5. Handoff contract between agents

### Terra supplies

For each shared server contract, provide:

- Type-safe input/output and stable deny/error reason codes.
- Server-only call location and one usage example.
- Focused RED/GREEN test names and migration/config prerequisites.
- Whether behavior is sync, queued, reconciling, or operator-only.
- Data classification and audit/metric expectation.

### Luna supplies

For each UI/domain use, provide:

- Exact route/action and resource target passed to Terra contract.
- Loading, empty, pending, success, validation, denied, and recoverable failure states.
- No unsupported success claim; durable effects show truthful queued/reconciling/failed state.
- Focused tests including unsafe navigation/authorization behavior where relevant.

### Required reviews

- Terra reviews Luna changes that add a mutation, upload, signed URL, connection, publication, export, deletion, credit/spend, or provider call.
- Luna reviews Terra changes that alter public/authenticated user-visible reason/result/state.
- Both review migrations changing shared workflow/account/channel/asset data.

## 6. Per-task identifiers

The sole canonical task list is `site-workflow-tasks.md`; it carries an explicit tag on every task:

- `F*`: foundation — Terra except `F14–F16` Luna.
- `U*`: Unknown User — Luna.
- `FO*`: Front Office — Luna.
- `S*`: Studio — Luna.
- `A*`: Account — Luna except `A02` Terra.
- `V*`: verification/release — Terra except `V11` and `V15` Luna.

An agent may not silently take a task owned by the other. Reassign by changing this document and task tag first, including dependencies and file ownership.

## 7. Integration sequence

1. Luna starts `F14` as baseline route inventory; once `G0` passes, Luna completes `F15–F16`. Terra completes `F01–F08` in parallel.
2. Terra publishes server contract notes/tests; Luna rebases its planned page actions onto them.
3. Luna ships public UI and then Front Office/Studio/Account in module batches. Terra reviews every trust-boundary use.
4. Terra implements each security/operations verification item as the corresponding product surface becomes real; no end-of-project security pileup.
5. Both run phase doubt review. Terra records findings and blocks release on unresolved critical/high items.
6. Luna runs owner workflow. Terra runs canary/recovery/security evidence. Release requires `V14` sign-off.

## 8. Definition of handoff-ready

Task handoff is ready only with: task ID, dependency gate, precise files/contract, RED command/result, expected data migration/config, acceptance cases, focused test command, full-suite command, reviewer, and rollback/disable path. “Build page” or “make secure” alone is not handoff-ready.
