# Gem Studio

Gem Studio is a solo, all-inclusive AI film studio: front-office briefs, 13 production departments, role-matched agents, private DNA continuity, GenPlay shot prompts, clip assembly, release planning, and audience signals in one workspace.

The basic platform is open core. Protected agent configurations and credit packs are commercial add-ons. See `LICENSE`.

## Repository map

| Path | Purpose |
|---|---|
| `web/` | Canonical Next.js production app |
| `supabase/` | Database migrations and server functions |
| `dna/` | CDNA, LDNA, and PDNA contracts/examples |
| `genplay/` | GenPlay contracts, validators, and examples |
| `index.html`, `dashboard.html`, `assets/` | Approved visual reference demo; retire only after owner sign-off |
| `planning/` | Reviewed implementation plans |
| `scripts/` | Repository and security checks |

## Local setup

```bash
cd web
cp .env.example .env.local
npm install
npm run typecheck
npm test
npm run dev
```

Use Node 22.22.2. Apply every migration in `supabase/migrations/` to a development Supabase project before exercising authenticated features.

## Verification

```bash
cd web
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
cd ..
bash scripts/structure-audit.sh
bash scripts/security-gate.sh
bash scripts/test-migrations.sh
```

Deployment still requires owner-controlled Supabase, Stripe, email, provider, social-platform, worker, domain, legal, and Core Values configuration. Never commit service-role keys, provider credentials, OAuth secrets, or Stripe secrets.
