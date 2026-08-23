# Gem Studio Service-Level Requirements

**Purpose:** Define internal production targets before contractual customer SLAs.  
**Applies:** Day‑0 public hosting and every later commercial phase.  
**Review cadence:** Monthly and after material incidents or architecture changes.

## 1. Initial internal SLOs

These are engineering targets, not public contractual promises until owner/legal approve publication.

| Service indicator | Initial objective | Measurement |
|---|---:|---|
| Public/authenticated core availability | 99.9% rolling 30 days | Successful synthetic requests every minute from ≥2 regions; maintenance counts as unavailable against the same 43.8-minute budget |
| Public page p75 LCP | ≤2.5s | Real-user monitoring by route/device |
| Public page p75 CLS | ≤0.1 | Real-user monitoring |
| Public page p75 INP | ≤200ms | Real-user monitoring |
| Internal read API/server action p95 | ≤750ms | Server traces, excluding external-provider duration |
| Internal write API/server action p95 | ≤1.5s | Server traces, excluding queued work |
| Job claim delay p95 | ≤60s | All authorized queued jobs, requested-to-first-valid-claim, rolling 24h and 30d |
| Oldest eligible job/backlog age | ≤5 minutes normal operation | Max age of non-paused, retry-eligible pending job; alert at 5 minutes |
| Successful internal job completion | ≥99% | Settled-success / all authorized jobs older than the objective window; failed, dead, reconciling, expired, cancelled-after-claim, and overdue pending/running count against success; reported by kind/provider over 24h/30d |
| Text generation end-to-end p95 | ≤5 minutes for launch-supported profile | User submit-to-terminal state, including queue/provider; provider outage remains visible as failure/degraded availability |
| Media assembly end-to-end p95 | ≤15 minutes for supported size profile | User submit-to-terminal state, including queue/worker |
| Social publication terminal state p95 | ≤5 minutes after scheduled time for each enabled platform profile | Scheduled time-to-published/failed/reconciling; platform outage is a measured degraded state, never an unbounded exclusion |
| Auth email acceptance p95 | ≤2 minutes | Request-to-provider acceptance; always measurable |
| Auth email delivery p95 | ≤10 minutes where delivery telemetry exists | Missing telemetry is an explicit measurement gap/incident, not a pass |
| Security alert acknowledgement | ≤15 minutes critical, ≤1 hour high | Alert platform timestamps |
| Incident customer update | ≤60 minutes for confirmed customer-impacting Sev‑1 | Status/incident record |
| Database RPO | ≤15 minutes | Backup/PITR capability and restore measurement |
| Private asset Storage RPO | ≤15 minutes for assets accepted as durable at day‑0 | Backup/export inventory and restore measurement |
| Operational configuration/secrets RPO | ≤24 hours without exporting secret plaintext | Versioned config/vault recovery rehearsal |
| Queue/payment/publication reconciliation RPO | ≤15 minutes | Durable DB event/outbox state and recovery measurement |
| Audit evidence RPO | ≤15 minutes | Durable audit sink/replication and restore measurement |
| Service RTO | ≤4 hours | Restore/continuity rehearsal |

## 2. Error budget

- 99.9% monthly availability permits approximately 43.8 minutes unavailable per 30-day month.
- When 50% budget is consumed, freeze non-essential risky releases and investigate.
- When 100% is consumed, stop feature releases until reliability causes are corrected and verified.
- Security incidents, tenant leaks, data loss, and billing corruption are zero-tolerance events; availability budget does not excuse them.
- Provider-dependent workflow availability is reported both end-to-end and segmented by provider. Provider outages may explain a miss but do not disappear from customer-impact reporting.
- Paid Managed Cloud activation is blocked until the 15-minute private-asset RPO is measured in restore rehearsal and signed off.

## 3. Incident severities

### Sev‑1 Critical

Tenant data exposure, exposed production secrets, account takeover at scale, destructive data loss, charging corruption, or service-wide outage.

- Immediate page/escalation.
- Containment begins within 15 minutes.
- Customer/status update within 60 minutes after confirmation.
- Executive/product/security owner engaged.
- Postmortem required.

### Sev‑2 High

Major workflow unavailable, significant provider failure without fallback, stuck publishing/jobs, or security control degradation without confirmed exposure.

- Acknowledge within 1 hour.
- Updates at least every 4 hours while customer-impacting.
- Postmortem for repeated/systemic cases.

### Sev‑3 Normal

Limited defect with workaround, incorrect non-critical display, isolated failed job.

- Triage within one business day.
- Prioritize by user impact and recurrence.

## 4. Capacity requirements

Before each customer phase, define and load-test:

- Monthly active accounts/workspaces.
- Concurrent authenticated sessions.
- Channels and productions per workspace.
- Assets, average/max file size, and monthly upload bandwidth.
- Jobs per minute by type and provider.
- Social publications/metrics requests.
- Database size, connections, query p95, and index growth.
- Log/audit event volume and retention.
- Worst-case provider/AI spend per workspace/day/month.

Load profile must test steady state, peak burst, retry storm, provider slowdown, database connection pressure, large workspace, and queue backlog recovery.

## 5. Cost protection

### 5.1 Estimated day-zero launch limits

These are selected provisional engineering values for the one-owner launch. They are not public plan promises. Use UTC reset windows. Lower a value immediately when provider, hosting, or abuse evidence requires it. Raising a hard limit requires an audited operator change with reason, expiry, and a capacity/cost review; application deploys must not be required.

| Control | Workspace limit | Global launch limit | Alert | Enforcement |
|---|---:|---:|---:|---|
| Billable provider spend | USD 25/day and USD 250/30-day month | USD 35/day and USD 300/30-day month | 70% warning; 90% urgent | Reject new reservations at 100%; let already accepted work settle; generation kill switch remains available |
| Private Storage | 100 GiB stored | 125 GiB stored | 70% warning; 90% urgent | Reject new uploads/reservations at 100%; reads, export, and deletion remain available |
| Delivered/download bandwidth | 250 GiB/UTC month | 300 GiB/UTC month | 70% warning; 90% urgent | Stop new bulk/download delivery at 100%; preserve authenticated metadata access and operator recovery |
| Concurrent durable jobs | 4 running or claimed | 6 running or claimed | 75% warning | Queue within bounded backlog; reject new expensive work when queue age or reserved cost makes acceptance unsafe |
| Authenticated read requests | 120/user/minute and 300/workspace/minute | 600/minute | 70% warning | HTTP 429 with bounded `Retry-After`; no silent success |
| Authenticated writes/job submissions | 30/user/minute and 60/workspace/minute | 120/minute | 70% warning | HTTP 429; no reservation or external effect occurs |
| Anonymous public requests | 60/IP/minute | 600/minute | 70% warning | Edge/WAF 429; static asset/CDN policy may be separately cached but never bypass origin limits |
| Login/password attempts | 10/account/15 minutes and 20/IP/15 minutes | 100/15 minutes | 60% warning | Progressive delay, generic response, then temporary deny; never reveal account existence |
| Signup/request-access attempts | 5/IP/hour | 30/hour | 60% warning | Reject or challenge; public signup remains provider-disabled for owner launch |
| Password-reset email requests | 3/account/hour and 10/IP/hour | 40/hour | 60% warning | Return generic accepted response while suppressing excess delivery |
| MFA challenges | 10/account/15 minutes and 20/IP/15 minutes | 100/15 minutes | 60% warning | Temporary challenge deny plus security event; valid session is not silently elevated |
| Contact submissions | 5/IP/hour and 3/email/hour | 30/hour | 60% warning | Reject/challenge and audit safe abuse metadata |
| Non-upload request body | 1 MiB | Same | 80% warning | Reject before parsing with HTTP 413 |
| Single uploaded file | 2 GiB | Same | 80% warning | Reject before durable acceptance; validate declared and detected MIME/type |
| Upload batch | 10 files and 5 GiB | Same | 80% warning | Reject excess files/bytes atomically; no partial success unless UI names each accepted item |
| Uploaded volume/count | 20 GiB and 100 files/workspace/UTC day | 25 GiB and 125 files/UTC day | 70% warning; 90% urgent | Reject new upload reservations at 100%; existing assets remain readable/deletable |
| Automatic retry budget | 3 total attempts over at most 30 minutes | Same | Alert on second retry or retry-storm threshold | Exponential backoff with jitter; dead/manual-reconciliation state after budget; ambiguous non-idempotent effects get zero automatic retries |

Rate keys combine the strongest available server-known account, workspace, session, and normalized network signal. IP-only identity is insufficient for authenticated enforcement. All counters/reservations must be atomic and fail closed for new writes or external effects when authoritative limit state is unavailable.

### 5.2 Estimated recovery targets

These values are day-zero release gates, not future aspirations:

- Service RTO: **4 hours** from declared recovery to verified core public/authenticated service.
- Database, durable queue/outbox, payment/publication reconciliation, and audit RPO: **15 minutes**.
- Private asset Storage RPO: **15 minutes** for assets accepted as durable. Uploads not yet durably accepted must remain visibly pending/failed and must not claim protection.
- Operational configuration RPO: **24 hours**; runtime secret plaintext is never exported into backups.
- Restore rehearsal must measure each target. A configured backup without an isolated successful restore is not evidence.

- Per-workspace/day/month spend limits.
- Numeric owner-launch defaults and hard maximums for provider spend, storage, bandwidth, concurrent jobs, requests/auth attempts, upload size/count, and retries; each has owner, reset timezone, alert threshold, enforcement response, and emergency global cap. “Unlimited” is never a safety value.
- Credit reservation before provider call.
- Storage and bandwidth quotas.
- Queue concurrency limits.
- Provider-level budget alarms.
- Global emergency generation/publishing kill switches.
- No unbounded retry.
- Cost dashboard by workspace, job kind, provider, and environment.

## 6. Degraded modes

| Failure | Product behavior |
|---|---|
| AI provider unavailable | Preserve request, show queued/failed state, retry boundedly, allow provider switch where enabled |
| Social platform unavailable | Do not claim publication; preserve approved package; retry only under platform-safe policy |
| Email unavailable | Do not lose security request; show neutral status; alert operator; retry safely |
| Payment unavailable | Do not create entitlement; preserve verified pending event; reconcile later |
| Worker unavailable | Web app remains readable; queue grows within alarm threshold; no duplicate execution |
| Storage unavailable | Block upload/download safely; preserve metadata; no false completion |
| Database degraded | Prefer read-only/maintenance mode; stop writes/external effects before inconsistency |
| Monitoring degraded | Treat as operational incident; do not fly blind during risky release |

## 7. Support requirements

- One documented customer support channel.
- Security/privacy contact distinct where appropriate.
- Ticket/reference ID and received confirmation.
- Severity triage and escalation.
- Support access follows least privilege and is audited.
- No credential requests by support.
- Known incident links to status updates.
- Support documentation covers account, billing, integrations, production, assets, privacy, and recovery.

## 8. How to use SLOs

1. Instrument indicator before promising objective.
2. Validate measurement excludes only documented events.
3. Add dashboard and alert thresholds.
4. Load-test planned capacity before opening next customer phase.
5. Review error budget before release.
6. Record incident effect and corrective action.
7. Change target only through documented owner/technical decision—not to hide misses.
