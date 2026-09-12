# UI/admin handoff — remaining work

Updated 2026-09-11. Branch: `dev-ui-admin-plan`, based on `742205b177b6`.
Implementation is **not fully complete**. Changes remain uncommitted; nothing
has been pushed, merged, deployed, or applied to a remote database.

## Implemented locally

- Nested sidebar views with URL/history state, exact dashboard selection and cyan current view.
- Compact shared authenticated-page spacing and rebuilt dashboard using saved productions/schedules.
- Removed fabricated channel analytics/records; explicit read-error handling across channel pages and nine additional operational pages.
- Short black-on-pink finale with cyan/yellow/lime story symbols; nine recognizable social marks. Seven destinations remain unconfigured.
- One persisted editorial rotation slot, pause/manual controls, hover/focus pause and reduced-motion support.
- MFA/operator-gated Account administration, revisioned editorial drafts/publication/restoration, private uploads/previews, account lookup and reversible review decisions.
- Additive migration with RLS, audit, optimistic revisions, suspension/quarantine checks covering storage, worker and release approval. Export retains the user's RLS context.

## Remaining tasks, in order

| Priority | Bucket | Task and acceptance |
|---|---|---|
| 1 | Terra | Final integration review of the latest non-channel loader fixes and admin screens. Run typecheck, lint, full coverage, webpack build, migration/security/structure gates and isolated browser suite together after fixes. Check actual successful/empty/error reads, not disconnected helper tests. |
| 2 | Luna | Complete the full authenticated route/view visual matrix from `2026-09-10-ui-admin-plan.md` §5. Existing browser evidence covers the channel shell/five subpages at 390/768/1440 and public finale/socials; it does **not** certify every authenticated route or a real admin login. |
| 3 | Owner, then Luna | Supply approved TikTok, YouTube, Instagram, X, Telegram, Discord and Facebook URLs. Configure the documented environment keys, then verify every destination. No guessed links. |
| 4 | Owner, then Luna | Attach the actual screenshot or name the cyan-button action (`Pasted image 20260909162623.png`). Its identity is unresolved; no unrelated button was changed to pretend completion. |
| 5 | Owner, then Terra | Choose the named operator and approve the target isolated database/deployment. Apply migration 0031, grant that operator, enroll/verify MFA and run real login/editorial/upload/review/revocation tests. Do not use production as a test fixture. Follow `site-administration-runbook.md`. |
| 6 | Terra | Review remaining admin polish: explicit pending states, usable pagination beyond the latest 50 content/review records and 200 revision rows, duplicate evidence workflow, and private orphan-upload housekeeping. Failed content saves currently retain unreferenced private uploads for operator cleanup; no destructive cleanup is implemented. |
| 7 | Terra | Verify signed-media expiration/refresh behavior during long-lived sessions. Existing signed URLs may remain usable for up to 300 seconds after unpublish/quarantine; document and accept this window before launch. |
| 8 | Parent | Reconcile acceptance gates, commit reviewed changes, integrate current `dev`, push under repository branch policy only when complete. Staging/production promotion still requires owner approval. |

No Sol task is currently justified. Escalate only a demonstrated security/concurrency defect that Terra cannot close.

## Verification already obtained

- Full configured coverage passed: 90.02% lines/statements, 83.75% branches, 94.84% functions. Later operational-loader edits require the final combined rerun above.
- Isolated browser suite: 5 passed; actual shell/channel components, URL history, overflow, persistent pause, reduced motion, pink text and nine social identities. Screenshots inspected at mobile/desktop sizes.
- Production webpack build passed. Default Turbopack build failed on this environment's port-binding restriction; no application workaround was committed.
- PostgreSQL migration, RLS/quarantine/revision tests and concurrent storage-quota checks passed locally.
- Lint/typecheck, structure audit and source-scoped security gate passed before the latest loader edits. Production dependency audit reported zero vulnerabilities.

## Boundaries retained

No live data was purged. Test fixtures remain test-only. Pricing/legal/Core Values
copy was excluded from this approved copy pass; owner/legal sign-off is separate.
The referenced screenshots were filenames, not image attachments. The local
unDraw library was unavailable; the implemented story uses existing typography
and symbols, not an invented illustration-sourcing claim.
