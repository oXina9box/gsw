# Site administration runbook

This console is for a named site operator only. It does not provision access,
impersonate customers, or write to a remote database by itself.

## Provisioning and deployment

1. Apply the additive site-administration migration (`0031_site_administration.sql`) through the approved deployment path. Verify the private `site-editorial` bucket, 10 MiB limit, and MIME allowlist (PNG, JPEG, WebP, PDF).
2. The database owner manually inserts the named operator into
   `public.site_operator_grants`, including a meaningful `grant_reason`. Never
   run this step from the UI and never commit the operator identity or secrets.
3. The operator signs in and completes MFA; access requires current `aal2` and
   an unrevoked grant on every read and mutation.
4. Configure approved social destinations through `NEXT_PUBLIC_SOCIAL_TIKTOK`,
   `NEXT_PUBLIC_SOCIAL_YOUTUBE`, `NEXT_PUBLIC_SOCIAL_INSTAGRAM`,
   `NEXT_PUBLIC_SOCIAL_X`, `NEXT_PUBLIC_SOCIAL_TELEGRAM`,
   `NEXT_PUBLIC_SOCIAL_DISCORD`, `NEXT_PUBLIC_SOCIAL_FACEBOOK`,
   `NEXT_PUBLIC_SOCIAL_GITHUB`, and `NEXT_PUBLIC_SOCIAL_GITLAB`. Do not guess URLs.
   Console: `/account?section=administration`.

## Editorial operations

All create/edit/publish/unpublish/restore actions require a reason and are
audited by the database RPCs. Saves and restores create a new revision and are
The current revision is preserved; a saved edit becomes a new draft revision.
Publishing is an explicit separate action. Uploads are MIME/size
validated server-side and use versioned paths in the private bucket.

If a preview needs a private media URL, generate a server-side signed URL with
an expiry of at most five minutes. Do not persist signed URLs or expose service
role credentials. Remove or allow the URL to expire after the review. Signed
URLs may remain usable for up to 300 seconds after unpublish or quarantine.

Placements: `studio-sidebar`/`member`, `homepage`/`public`, and `docs`/`public`.
Failed follow-up database writes leave uploads private for database-owner cleanup only.

## Rollback and moderation

To roll back editorial content, restore the desired revision, verify the safe
preview, then explicitly publish it if appropriate. To stop distribution,
unpublish the item; do not delete records as a rollback mechanism.

Review duplicate/content cases with the smallest applicable outcome. The worker
enforces owner suspension and production quarantine. Quarantine
or suspend only with documented reason. Use release/restored outcomes for
reversible recovery. Confirm the resulting case and enforcement rows after a
retry or concurrent operator action; never auto-merge accounts or auto-delete data.

Deploy in stages and perform manual smoke checks in each environment. This
runbook does not claim any environment has been deployed or verified.

## Recovery

To revoke access, the database owner sets `revoked_at`, `revoked_by`, and a
`revoke_reason` on the grant. Existing sessions fail the next guarded
operation. Investigate audit rows by operator, action, target, and timestamp.
