# Gem Studio web

Next.js 16 App Router application for Gem Studio. Supabase owns authentication, workspace data, row-level authorization, private storage, and the durable job queue.

## Run locally

```bash
cp .env.example .env.local
npm install
npm run typecheck
npm test
npm run dev
```

Apply `../supabase/migrations/*.sql` in filename order. The product routes require a configured Supabase project; public pages and public E2E smoke tests do not.

## Worker

Call `POST /api/jobs/run` with `Authorization: Bearer $WORKER_SECRET` from a scheduler. Each request claims one durable job. Video assembly additionally requires FFmpeg on the runtime path. Call `POST /api/maintenance/purge` with `Authorization: Bearer $PURGE_WORKER_SECRET` daily to enforce expired 30-day account-deletion requests.

Protected catalog agents never send their six private files to customer-selected providers. They run by catalog ID through the operator-controlled `PROTECTED_INFERENCE_BASE_URL`; that service must keep configurations server-side and return only the declared text/image/audio result schema.

## Launch configuration

- Insert a lowercase email into `beta_invites` before inviting each beta user. The database rejects every signup without a live invite; the UI also defaults closed unless `NEXT_PUBLIC_SIGNUPS_ENABLED=true`.
- Configure site URL, callback URLs, production SMTP, MFA, and email templates.
- Add Supabase server credentials only to the server runtime.
- Add Stripe and provider encryption secrets only to the server runtime.
- Seed `commerce_products` with owner-created Stripe Price IDs.
- Complete each social platform's app review and OAuth/publishing configuration before enabling direct release controls.

Public legal pages are sourced from `content/legal/`. Counsel approval and final Core Values copy remain launch gates.
Keep `SITE_CONTENT_APPROVED=false` until both are final; draft routes and links stay unavailable.
Generic workflow orchestration remains hidden behind `EXPERIMENTAL_ORCHESTRATION`; the production 13-stage pipeline is the supported runtime.
