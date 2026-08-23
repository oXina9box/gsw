# Gem Studio Supabase

Apply `migrations/*.sql` in filename order to a development project, then production after a backup and migration dry run.

Account deletion is intentionally not an Edge Function. The web app schedules a recoverable request, and the separately authenticated `/api/maintenance/purge` worker removes private Storage objects before deleting the Auth user after 30 days.

The invite-only beta also requires public signup to be disabled in Supabase Auth. Configure production site/callback URLs, SMTP, email confirmation, password recovery, and TOTP before launch. Never expose secret/service-role keys to browser code.
