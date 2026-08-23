# Gem Studio Day‑0 Public Hosting Security and Operations Standard

**Applies to:** Managed Cloud public launch  
**Release rule:** Any unmet `MUST` blocks public traffic.  
**Owner:** Gem Studio operator  
**Evidence location:** `security-audit-report/`, CI artifacts, Supabase project settings, hosting settings, runbook logs, and signed release checklist.

This is a release standard, not advice. A build is not launch-ready because pages render, tests pass, or authentication appears to work. Day‑0 means an unknown person can reach the site and the service can protect data, limit abuse, recover from failure, explain incidents, and safely operate paid product behavior.

## 1. Required launch evidence

Release manager must attach evidence for every control:

- Control owner.
- Environment checked (`staging` or `production`).
- Command, dashboard path, or test run used.
- Timestamp.
- Result.
- Exception ID and expiry, if any.

No verbal “configured” status counts. Exceptions require written owner approval, risk, compensating control, and expiry date. No exception is allowed for exposed secrets, broken tenant isolation, missing backups, disabled TLS, or untested destructive operations.

## 2. Environment and hosting baseline

### MUST configure

- Production deployment uses a dedicated project/environment, not development credentials.
- HTTPS only. HTTP redirects to HTTPS. HSTS enabled only after HTTPS and subdomain coverage are verified.
- Custom domain, DNS, certificate renewal, canonical URL, callback URLs, email links, and webhook URLs all point to production.
- Production build runs with `NODE_ENV=production`, debug disabled, source maps/private diagnostics restricted, and `poweredByHeader` disabled.
- Hosting account uses MFA, least-privilege roles, separate deploy identity, protected production environment, and audited access.
- CI deploy requires reviewed commit, locked dependencies, passing quality/security gates, and protected approval.
- Preview deployments cannot access production secrets or production databases.
- Production and staging Supabase projects are separate.
- Runtime secrets are injected by the hosting secret manager. Never use build args, committed `.env` files, browser bundles, or issue comments for secrets.
- Domain, DNS, hosting, Supabase, payment, email, AI-provider, and social-provider ownership has two recovery-capable administrators.

### Verify

```bash
cd web
npm ci
npm run typecheck
npm run lint
npm test -- --coverage
npm run build
```

Then inspect deployed HTML/JS for private environment names, service-role keys, provider secrets, debug output, and demo identifiers.

## 3. Browser and edge protections

### MUST configure

- TLS certificate valid and auto-renewal tested.
- `Strict-Transport-Security` with an appropriate production max-age.
- `Content-Security-Policy` reviewed against actual scripts, styles, images, fonts, media, Supabase, analytics, and provider callbacks. Remove `unsafe-eval`; remove `unsafe-inline` where architecture allows; nonce/hash unavoidable inline code.
- `X-Content-Type-Options: nosniff`.
- `X-Frame-Options: DENY` plus CSP `frame-ancestors 'none'` unless an explicitly approved embed needs otherwise.
- Strict `Referrer-Policy`.
- Restrictive `Permissions-Policy`.
- Cross-origin policy reviewed for OAuth, uploads, media, and Supabase.
- No wildcard CORS. Allow only exact production origins.
- WAF/CDN rate limiting and bot protection for auth, contact, upload, job, checkout, and public search endpoints.
- Request body, URL, header, upload count, file size, MIME type, and timeout limits.

### Verify

- Inspect response headers on `/`, auth, API, upload, and error routes.
- Test invalid origin, oversized body, invalid content type, path traversal, malformed JSON, and slow request behavior.
- Test CSP in report-only staging first, then enforce production policy.

## 4. Authentication and session controls

### MUST configure

- Supabase Auth production site URL and exact redirect allowlist.
- Email confirmation, password recovery, SMTP, sender domain, SPF, DKIM, and DMARC.
- Secure, HttpOnly, SameSite cookies with appropriate production domain/path.
- Session refresh and expiry handling on server and browser.
- MFA/TOTP enrollment, challenge, recovery, reset, and assurance-level enforcement for sensitive actions.
- Password policy, breached-password protection where available, generic login/reset errors, and account enumeration resistance.
- Login, signup, reset, verify, MFA, and contact rate limits with lockout/slowdown that does not create an easy denial-of-service.
- Safe relative-path redirects only. Reject absolute, protocol-relative, encoded external, and malformed `next` values.
- Re-authentication for password changes, secret changes, export, account deletion, and other high-impact operations.
- Sign-out invalidates server session and sensitive cached data.
- Session-change audit events without recording tokens or credentials.

### Verify

Test: signup, duplicate signup, invalid credentials, expired verification, expired reset, MFA required, MFA failed, session expiry, multi-tab sign-out, refresh, unsafe redirect, password change, and re-authentication timeout.

## 5. Authorization, tenant isolation, and data lifecycle

### MUST configure

- Every private row has `workspace_id` or an equivalent ownership path.
- RLS enabled on every private table, including new tables added after this document.
- Separate select/insert/update/delete policies with both `using` and `with check` where applicable.
- Composite foreign keys prevent cross-workspace relationships.
- Server actions validate ownership and business state; hidden UI is never authorization.
- Public Gallery/content uses an explicit allowlist or public-content table, never “query then hide.”
- No user can read, alter, publish, delete, or infer another workspace’s data by changing IDs, filters, joins, Storage paths, or pagination.
- Storage buckets private by default. Signed URLs short-lived and issued only after authorization.
- Retention, archive, deletion, purge, export, and legal-hold behavior documented and tested.
- Account deletion is recoverable during the grace period, then permanently purges Auth, rows, private Storage, queues, provider connections, and indexes according to policy.

### Verify

Run positive and negative matrix using two accounts/workspaces:

- Direct row ID substitution.
- Joined relation substitution.
- Insert/update workspace spoofing.
- Storage path substitution.
- Signed URL reuse/expiry.
- Deleted-account access.
- Archived-channel access.
- Export scope.

Release blocks on one unauthorized read/write.

## 6. Input, output, and abuse controls

Numeric enforcement uses the provisional day-zero values in `service-level-requirements.md` section 5. Those values are launch configuration, not documentation-only estimates. Production evidence must show boundary behavior at 99%, 100%, concurrent reservation, counter reset, missing counter store, and global-cap exhaustion.

### MUST configure

- Schema validation at every trust boundary: forms, search params, JSON, webhooks, uploads, provider responses, and worker payloads.
- Length, numeric range, enum, URL, MIME, encoding, and nesting limits.
- Safe rendering: escape user text; sanitize approved rich text; never inject unsanitized HTML.
- SQL access through parameterized Supabase queries; no string-built SQL.
- SSRF protection for user-supplied URLs and OpenAI-compatible provider base URLs: allowed schemes, private-network blocking, DNS rebinding defense, timeout, redirect policy, and egress restrictions.
- Upload antivirus/content checks where risk warrants; reject executable content and disguised MIME types.
- Prompt/content safety policy, abuse reporting, takedown, suspension, and review path.
- Per-account/workspace/provider credit, storage, job, and generation quotas.
- Atomic enforcement of provider spend, Storage, bandwidth, job concurrency, request/auth, upload, and retry limits from one server policy source. Owner payment bypass never bypasses these limits.
- Idempotency keys for checkout, publish, queue, credit reservation, and destructive operations.
- Webhook signature, timestamp, replay, event-state, and idempotency verification.
- Worker payload validation and bounded retries with dead-letter visibility.

### Verify

Fuzz validators and endpoints with malformed JSON, XSS payloads, SQL metacharacters, SSRF targets, oversized inputs, duplicate requests, replayed webhooks, and provider timeouts.

## 7. Secrets, cryptography, and supply chain

### MUST configure

- Secret manager for Supabase service role, database credentials, encryption keys, worker secrets, purge secrets, Stripe secrets, provider keys, OAuth secrets, and SMTP credentials.
- Separate secret values per environment.
- Rotation procedure and owner for every secret.
- Encryption at rest for provider credentials and sensitive stored data; key access limited to required server runtime.
- No secrets in repository, history, logs, traces, screenshots, client bundles, build artifacts, database fixtures, or error messages.
- Lockfile committed and reproducible `npm ci` install.
- Dependency audit, license review, update policy, and vulnerability exception process.
- CI actions and external build images pinned to reviewed immutable versions.
- Secret scanning and push protection in repository host and CI.

### Verify

```bash
bash scripts/security-gate.sh high
cd web
npm audit --audit-level=high
```

The current scanner report was generated in `local` mode and contains findings from quarantined/generated material. It is not public-launch evidence. Before release, add/run a production/public threat-mode gate over deployable/versionable code, review false positives individually, and produce a clean scoped report. Do not dismiss findings by aggregate count or directory exclusion without confirming excluded files cannot enter the build or deployment context.

Inspect git history, build output, server logs, browser network payloads, source maps, and generated artifacts. Rotate any value found, even if believed inactive.

## 8. Observability and incident response

### MUST configure

- Structured server logs with request ID, actor/workspace ID where safe, route, result, latency, and error class; never credentials or raw private content.
- Centralized error tracking with source access restricted.
- Metrics and alerts for auth failures, rate-limit hits, 4xx/5xx, latency, queue age, failed jobs, credit anomalies, Storage failures, webhook failures, email failures, and database health.
- Audit events for sign-in/security changes, provider changes, exports, deletion, approvals, publication, credit changes, and admin actions.
- Alert routing with owner, escalation timeout, and after-hours contact.
- Public status/incident communication process.
- Incident runbook: contain, preserve evidence, revoke/rotate, assess scope, notify, recover, and postmortem.

### Verify

Trigger synthetic auth failure, worker failure, webhook replay, provider timeout, Storage denial, and database connection failure. Confirm alert arrives, includes actionable context, and does not expose secrets.

## 9. Backup, restore, and continuity

### MUST configure

- Automated encrypted database backups with documented retention.
- Point-in-time recovery where supported.
- Supabase Storage backup/export strategy for private assets.
- Separate backup credentials and access controls.
- Restore rehearsal into an isolated project before launch.
- Queue/job recovery and idempotent replay behavior.
- Recovery time objective (RTO), recovery point objective (RPO), and owner-approved values.
- Rollback plan for application and database migrations; forward-fix preferred where destructive rollback is unsafe.

### Verify

Restore a representative production snapshot, verify auth/workspace relationships, RLS, private assets, queues, and audit history, then record measured RTO/RPO.

## 10. Privacy, legal, and commercial readiness

Before public traffic:

- Terms and Privacy are counsel-reviewed and match actual collection, providers, retention, deletion, cookies, analytics, AI processing, and model-training behavior.
- Pricing/license page matches enabled capabilities and clearly distinguishes intended offer from dry-launch gates internally.
- Consent and opt-out behavior works for optional analytics/marketing.
- Data-subject request, export, correction, deletion, and contact process has an owner and SLA.
- Age restriction, prohibited content, rights attestation, takedown, and suspension policy are implemented.
- Payment, tax, refund, invoice, and cancellation behavior is implemented before charging anyone.
- No paid promise is published as operationally available unless the corresponding backend, support, and recovery path works.

## 11. Release gates

### Gate A — Code and dependency

Typecheck, lint, unit/integration coverage, E2E, build, lockfile install, dependency audit, secret scan, and security scanner pass.

### Gate B — Runtime security

Headers, TLS, CSP, CORS, auth, MFA, rate limits, input validation, RLS, Storage, webhooks, SSRF, quotas, and secret rotation pass staging tests.

### Gate C — Operations

Monitoring, alerts, audit logs, backups, restore, worker health, purge, rollback, incident contacts, support escalation, provider degraded modes, capacity/load tests, cost controls, and status communication pass rehearsal. Initial objectives and evidence follow `service-level-requirements.md`.

### Gate D — Product truth

No fake success, demo records, localStorage truth, unsupported published action, placeholder legal content, or unresolved high/critical finding.

### Gate E — Production canary

Deploy immutable release, run synthetic public/authenticated checks, verify logs/alerts, test owner workflow, then open public traffic gradually. Roll back on any gate failure.

## 12. How to use this standard

1. Copy controls into release checklist.
2. Assign owner and evidence path for each control.
3. Implement one control group at a time.
4. Write failing tests before behavior changes.
5. Run staging verification and record exact output.
6. Run adversarial doubt review on each non-trivial control group.
7. Resolve findings or document an approved exception; unresolved launch blockers stop release.
8. Re-run all gates after final build and after production configuration changes.
9. Keep evidence with release artifact and repeat after every material dependency, schema, hosting, auth, or provider change.

## 13. Day‑0 sign-off

Required signatures:

- Product owner.
- Technical release owner.
- Security reviewer.
- Operations/hosting owner.
- Legal/privacy owner for public claims and data practices.

No signature means no public launch.
