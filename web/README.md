# Gem Studio web app

Future-state Next.js application for the finished live Gem Studio product.

The root-level HTML/CSS/JS demo is reference material only. This app owns the future public pages, authentication-aware shell, and authenticated workspace UI.

## Setup

```bash
cp .env.example .env.local
# set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm install
npm run typecheck
npm run build
npm run dev
```

Apply all files in `../supabase/migrations/` to a development Supabase project before testing account creation. Deploy `../supabase/functions/delete-account/` and configure its server-only secret. Configure the Supabase site URL, email confirmation redirect, password reset redirect, Storage policies, and production SMTP before launch.

Never add a Supabase secret/service-role key to browser code or Git.

## Current implementation boundary

The current slice includes authenticated workspace channel/production creation, production stage events, a persisted departments/lanes/agents builder, DNA/GenPlay inventories, private asset metadata boundaries, and account deletion through an Edge Function. It intentionally does not import demo records or use localStorage. Source-data importers, uploads/generation providers, billing, and final legal approval remain deployment-specific work.
