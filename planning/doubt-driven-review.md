# Gem Studio Doubt-Driven Review

**Purpose:** Challenge the workflow spec before implementation.  
**Method:** For every important assumption, state doubt, failure evidence to seek, mitigation, and stop condition.

## 1. Product and sitemap doubts

| Doubt | Evidence to seek | Mitigation / stop condition |
|---|---|---|
| Four modules may hide important workflows | Walk owner through every current route and daily task | Keep route inside existing module; add only with explicit owner decision |
| Public Gallery could leak private work | Verify source query/content allowlist and Storage policy | Curated public records only; fail closed |
| Docs/Pricing copy may promise unavailable behavior | Compare page claims against dry-launch capabilities | Mark unavailable transaction behavior internally; public page describes intended offer without fake success |
| `/app` dashboard may become decorative | Test every card’s path to actionable source data | Every metric links to filtered work or states “no data” |

## 2. Auth and security doubts

| Doubt | Evidence to seek | Mitigation / stop condition |
|---|---|---|
| Server auth state and browser state diverge | Refresh, expire, sign out in multiple tabs | Server session is authority; refresh shell after auth changes |
| `next` redirect can become open redirect | Fuzz absolute URLs, protocol-relative URLs, encoded paths | Allow same-origin relative paths only |
| RLS filters are incomplete on joined records | Negative tests using another workspace IDs | Composite workspace FKs and policy tests block release |
| Secret appears in logs or response | Inspect network, server logs, error paths, serialized props | Encrypt/mask; secret scan and response assertions required |
| Private asset URL remains usable after permission change | Expire/revoke signed URLs and test direct access | Short-lived signed URLs, policy check at issuance |
| Delete/export race loses data | Run concurrent export, delete, cancel, purge | Transactional lifecycle, audit events, documented recovery |

## 3. Workflow doubts

| Doubt | Evidence to seek | Mitigation / stop condition |
|---|---|---|
| User cannot tell who/what is next | Follow a production from brief through release with no hidden knowledge | Every state shows owner, next action, blocker, and artifact |
| Agent result can advance without approval | Attempt direct action and replay requests | Server state machine rejects invalid transitions |
| Failed provider call claims success | Force timeout, malformed response, retry | Queue status remains failed/retryable; no false artifact |
| Duplicate publish or job costs twice | Replay request/idempotency key | Idempotency required for external effects and credit reservation |
| Channel scope gets lost between modules | Start in channel, traverse Marketing/Studio/Socials/Assets | Persist scope in route/query/context; tests assert filters |
| Deleting a channel leaves orphaned work | Attempt archive/delete with related records | Account flow explains cascade/archive and verifies referential integrity |

## 4. Data and content doubts

| Doubt | Evidence to seek | Mitigation / stop condition |
|---|---|---|
| Schema cannot represent brand and channel scope | Model strategy data for Studio and channel examples | Explicit scope column/relationship before UI work |
| Research is untraceable opinion | Require source, capture time, confidence, and promotion target | Unsourced research cannot become approved input |
| Asset lineage breaks after versioning | Upload, replace, approve, and reuse same asset | Immutable versions and parent/source links |
| GenPlay remains a misleading first-class page | Observe user task: find document, hand to production | Route to Assets/document view; no duplicate source |
| Final legal/value content is not ready | Owner/counsel review checklist | Launch blocked until approved final copy exists |

## 5. Dry-launch doubts

| Doubt | Evidence to seek | Mitigation / stop condition |
|---|---|---|
| Owner-only access hides public-user defects | Run public logged-out route and contact flows independently | Public smoke suite required before dry launch |
| No transactions means billing paths are misleading | Try checkout and purchase states | Read-only dry state; no fake purchase success |
| All agents available exposes content unintentionally | Inspect catalog, files, prompts, provider calls | Owner-only server policy now; protection design deferred explicitly |
| Demo data contaminates production | Clean workspace test and database search for known IDs | Purge before launch; fail gate on demo identifiers |
| Monitoring misses stuck jobs | Force queued/running/failed/dead states | Worker health, alerts, retry/dead-letter visibility required |

## 6. Doubt resolution protocol

1. Turn each doubt into a test or owner decision.
2. Run the smallest check that can falsify the assumption.
3. Record evidence in implementation issue/test output.
4. Fix root contract, not only visible symptom.
5. Mark resolved, deferred to `MASTER-TODO.md` Phase E, archived in `planning/archive/post-launch.md`, or launch-blocking.

Implementation may start only when no launch-blocking doubt lacks an owner decision, test, or mitigation.

## 7. Commercial evolution doubts

| Doubt | Evidence to seek | Mitigation / stop condition |
|---|---|---|
| Owner launch hard-codes owner identity | Search pages/actions/policies; add second workspace fixture | Central capability resolver only |
| Payment activation requires page rewrite | Simulate subscription/entitlement facts in view models | Pages consume capabilities/billing view models, not Stripe state |
| New roles require query rewrite | Add viewer fixture and negative tests | Membership permission functions and RLS role expansion |
| Provider swap leaks SDK shape | Replace adapter fixture | Domain/job outputs remain normalized |
| External retry duplicates cost/effect | Replay requests/events/jobs | Idempotency and settlement invariants block duplicates |
| Scale requires replacing list/workflow | Large-workspace/load profile | Pagination/index/job/metric requirements built now |
| Customer deletion conflicts with audit/billing retention | Data-class registry review | Explicit retention/export/delete policy per class |
| Self-hosting forks domain code | Run domain tests against alternate infrastructure adapter | Shared capability/domain contracts; infrastructure-specific edge only |
