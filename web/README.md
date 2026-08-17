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

Apply `../supabase/migrations/0001_initial.sql` to a development Supabase project before testing account creation. Configure the Supabase site URL, email confirmation redirect, password reset redirect, and production SMTP before launch.

Never add a Supabase secret/service-role key to browser code or Git.

## Current implementation boundary

This is the first future-product slice. It intentionally does not import demo records or use localStorage. DNA/GenPlay importers and the remaining authenticated product CRUD are separate migration phases.
