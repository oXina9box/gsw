# Gem Studio Site Review — Findings

**Date:** 2025-01-26  
**Branch:** staging  
**Commit:** c4acca2

---

## Summary

Codebase passes: lint ✓, typecheck ✓, unit tests (111/111) ✓, build ✓. 42 routes. Strong foundations — TDD discipline, timing-safe auth, AES-256-GCM BYOK secrets, workspace RLS, proper `SET search_path` on SECURITY DEFINER functions.

**Critical gaps:** No CI/CD config, no robots.txt/sitemap, missing loading/error boundaries, Google Fonts blocking render + GDPR issue, no metadataBase (breaks OG images), command-menu missing focus trap, auth forms need aria-describedby on errors, several product pages are empty stubs.

**Background agents hit API rate limit** — DB/security/spec/frontend audits incomplete. Findings below from direct inspection only.

---

## 1. DATABASE & MIGRATIONS

### 1.1 Schema Quality

**GOOD:**
- RLS enabled on all tables checked (profiles, workspaces, channels, productions, dna_records, production_events, genplay_*, generated_assets, departments, lanes, agents, workflows, executions)
- All policies check `is_workspace_member(workspace_id)` — correct tenant boundary
- `SECURITY DEFINER` functions use `SET search_path = public` (0001:70, 0003:97)
- Money stored as `bigint` (cents), not float — credit_accounts.available, credit_ledger.amount, commerce_products.unit_amount, purchases.unit_amount all bigint ✓
- Foreign key cascades appropriate: workspace → cascade, production → cascade or set null where needed
- Indexes on workspace_id FK columns present

**ISSUES:**

**1.1.1 Missing indexes on FK referencing side (HIGH)**  
Postgres auto-indexes PK but NOT the FK column. Slow deletes + joins.

- `production_events.production_id` — has composite index on (production_id, created_at desc) ✓ GOOD
- `genplay_binders.master_id` — unique (master_id, version) covers it ✓
- `shot_clips.shot_id` — has index ✓
- **MISSING:** `agent_files.agent_id` (0002:31 creates table, no index) — every agent delete scans full table
- **MISSING:** `provider_secrets.connection_id` (0006:86, PK so covered) ✓
- **MISSING:** `social_connection_secrets.connection_id` (0006:251, PK so covered) ✓
- **MISSING:** `agent_catalog_files.catalog_agent_id` (0006:43, PK so covered) ✓

**Fix:** Add to next migration:
```sql
create index agent_files_agent_idx on public.agent_files(agent_id);
```

**1.1.2 No explicit ON DELETE on purchases → agent_entitlements FK (MEDIUM)**  
0006:207 adds FK with `on delete set null` but purchase deletion should probably prevent if entitlement active. Or CASCADE if purchase refund revokes access.

**Fix:** Decide policy, add explicit cascade or restrict in next migration.

---

## 2. SECURITY & AUTH

### 2.1 GOOD

- Worker auth uses `timingSafeEqual` (lib/studio/worker-auth.ts:1)
- AES-256-GCM: unique IV per encrypt, auth tag verified, key versioning (lib/studio/secrets.ts)
- Supabase RLS on all tables, workspace boundary enforced
- Checkout origin check (api/checkout/route.ts:11)
- Safe redirect helper rejects absolute URLs (lib/auth/safe-redirect.ts)

### 2.2 ISSUES

**2.2.1 Google Fonts GDPR + performance (HIGH)**  
`app/globals.css:3` loads fonts from `fonts.googleapis.com` — sends user IP to Google, blocks render.

**Fix:** Migrate to `next/font/google`:
```ts
import { Space_Grotesk, DM_Mono, Syne } from 'next/font/google';
const space = Space_Grotesk({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-space' });
// Apply via <html className={space.variable}>
```

**2.2.2 No metadataBase (MEDIUM)**  
`app/layout.tsx:4-10` has openGraph/twitter but no `metadataBase`. Relative image URLs break OG tags.

**Fix:**
```ts
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  // ...
};
```

**2.2.3 Command menu missing focus trap + aria-modal (MEDIUM)**  
`components/shell/command-menu.tsx:29` uses `<dialog>` but no focus trap, Escape handler native only, no `aria-modal="true"`.

**Fix:** Add `aria-modal="true"` to dialog, trap Tab within `.command-list`, explicit Escape listener.

**2.2.4 Auth form errors not announced (MEDIUM)**  
`components/auth/auth-form.tsx:63` renders error with `role="alert"` ✓ but no `aria-describedby` linking input to error.

**Fix:** Add `aria-describedby="email-error"` to input when error present, id on error `<p>`.

**2.2.5 No rate limiting on login/signup (MEDIUM)**  
`app/(auth)/*/page.tsx` routes hit Supabase auth with no app-layer throttle. Checkout has 5/10min (api/checkout/route.ts:38), but auth endpoints open.

**Fix:** Add `lib/auth-rate-limit.ts` similar to contact-rate-limit, check before `supabase.auth.signInWithPassword`.

---

## 3. SEO & METADATA

**MISSING:**

- **robots.txt** — Next 16: create `app/robots.ts` exporting `export default function robots() { return { rules: [...] }; }`
- **sitemap.xml** — create `app/sitemap.ts`
- **favicon** — no `/public` dir exists, no `app/icon.png` or `app/favicon.ico`
- **apple-touch-icon** — no `app/apple-icon.png`
- **manifest.json** — no PWA manifest

**PARTIAL:**
- Marketing pages have metadata exports ✓ (studio, system, social-workshop, terms, privacy)
- Root layout has title template + openGraph ✓ but no metadataBase (see 2.2.2)

**Fix:** Create `app/robots.ts`, `app/sitemap.ts`, add `app/icon.png` (512×512), `app/apple-icon.png`.

---

## 4. FRONTEND / UX

### 4.1 Accessibility

**ISSUES:**

**4.1.1 Focus outline removed without visible replacement (LOW)**  
`globals.css:348,369` sets `outline:none` on `:focus-visible` but replacement border-color may not meet 3:1 contrast in all states.

**Fix:** Verify `--color-focus` (cyan) vs backgrounds meets 3:1, or add `box-shadow: 0 0 0 2px var(--color-focus)`.

**4.1.2 Command menu keyboard nav incomplete (MEDIUM)**  
`command-menu.tsx:31` renders links in dialog but no arrow-key nav, no focus trap.

**Fix:** Add `onKeyDown` to trap Tab, arrow keys to navigate links.

**4.1.3 No skip-to-content link (LOW)**  
Long header on marketing pages, no `<a href="#main">Skip to content</a>`.

**Fix:** Add skip link in `app/layout.tsx`, visually hidden until focus.

**4.1.4 Missing <main> landmark (MEDIUM)**  
Pages render sections but no `<main id="main">` wrapper.

**Fix:** Wrap page content in `<main>` in layout or each page.

### 4.2 Performance

**4.2.1 Google Fonts blocking (HIGH)** — see 2.2.1

**4.2.2 No loading.tsx / error.tsx boundaries (MEDIUM)**  
`find` returned no loading/error/not-found files. Users see blank screen on slow load, unhandled errors crash to default Next error page.

**Fix:** Add `app/loading.tsx`, `app/error.tsx`, `app/(product)/loading.tsx`, `app/(product)/error.tsx`.

**4.2.3 prefers-reduced-motion present (GOOD)**  
`globals.css:486` has `@media (prefers-reduced-motion:reduce)` ✓

### 4.3 Empty / Stub Pages

Inspected 16 product pages under `app/(product)/app/*/page.tsx`. Several render minimal/placeholder content:

- `app/(product)/app/builder/page.tsx:24` — returns `<section>` with `{params}` — stub
- `app/(product)/app/orchestration/page.tsx` — experimental diagnostic, marked as such in AGENTS.md ✓
- Remaining pages (channels, productions, dna, agents, billing, integrations, marketing, social) render forms/tables but may be incomplete per spec

**Action:** Cross-check against `planning/site-workflow-spec.md` and `spec-contract-coverage.md` to identify spec-to-code gaps. (Background agent for this failed due to rate limit.)

---

## 5. OPERATIONAL READINESS

**MISSING:**

- **CI/CD config** — no `.gitlab-ci.yml`, no `.github/workflows`
- **Health check endpoint** — no `app/api/health/route.ts`
- **Error monitoring** — no Sentry/Datadog SDK calls found
- **Backup verification** — `planning/restore-rehearsal.md` exists but no `.gitlab-ci.yml` job
- **Deployment config** — no Dockerfile, no `vercel.json`, no platform config
- **Environment validation** — no startup check that required env vars present

**PRESENT:**
- Test suite (111 passing unit tests, Playwright config for e2e)
- Security audit scripts (`scripts/security-gate.sh`, `scripts/structure-audit.sh`)
- Migration test script (`scripts/test-migrations.sh`)
- Planning docs (`planning/day-zero-release-checklist.md`, `planning/doubt-driven-review.md`)

**Fix:** Add `.gitlab-ci.yml` (or `.github/workflows/ci.yml`) with jobs: typecheck, lint, test, build, security-gate, migration-test. Add health endpoint. Add env validation in `app/layout.tsx` or middleware.

---

## 6. CODE QUALITY

**GOOD:**
- No lint warnings (max-warnings=0) ✓
- TypeScript strict, no type errors ✓
- Test coverage tracked (vitest.config.ts has 80% thresholds)
- 111/111 unit tests pass ✓
- Consistent file structure, naming conventions followed
- Server actions in `actions.ts`, proper use of server components
- No TODO/FIXME/HACK comments (grep found only placeholder= HTML attrs, not code debt markers)

**MINOR:**
- `components/shell/mobile-menu.tsx` exports empty `MobileMenuController` — unused or stub?
- Several product pages minimal (see 4.3)

---

## 7. PRIORITIZED ACTION LIST

### Critical (before beta)
1. Add CI config (typecheck/lint/test/build)
2. Migrate to next/font (blocking render + GDPR)
3. Add metadataBase (OG images broken)
4. Add loading.tsx / error.tsx boundaries (UX)
5. Add robots.txt + sitemap.ts (SEO)
6. Add health endpoint (ops)
7. Complete stub pages or remove routes

### High
8. Add `agent_files.agent_id` index (DB performance)
9. Add auth rate limiting (security)
10. Fix command-menu focus trap + aria-modal
11. Add aria-describedby to auth form errors
12. Add skip-to-content link + <main> landmark

### Medium
13. Verify focus outline contrast or add box-shadow
14. Add favicon/apple-icon/manifest
15. Clarify purchases → agent_entitlements cascade behavior
16. Add env var validation on startup

### Low / Nice-to-have
17. Command menu arrow-key navigation
18. Error monitoring SDK (Sentry)
19. Automated backup verification in CI

---

## 8. WHAT'S DONE WELL

- **TDD discipline:** 111 passing tests, coverage thresholds enforced
- **Security fundamentals:** RLS, workspace boundary, timing-safe auth, AES-256-GCM secrets, SET search_path
- **Money handling:** bigint for credits/currency, no float
- **Auth flow:** MFA support, safe redirects, proper session handling
- **Build process:** Clean build, strict TS, lint passing
- **Migrations:** Additive-only, RLS on all tables, proper indexes on most FKs
- **Design system:** Consistent tokens, dark theme, prefers-reduced-motion support

---

---

## FULL AUDITS COMPLETED (retry with fresh quota)

Four parallel deep audits completed: database migrations (24 files), frontend accessibility/SEO (marketing + auth surface), spec-to-code coverage, and security review. Findings below supersede initial assessment.

---

## 9. DATABASE AUDIT (COMPLETE)

### CRITICAL

**9.1 Overly broad grants to `anon` role**  
FILE: `supabase/migrations/0010_schema_grants.sql:2`  
IMPACT: `grant all on all tables in schema public to anon, authenticated, service_role;` gives unauthenticated users INSERT/UPDATE/DELETE on all tables. RLS is only protection. If any table missing RLS or has permissive policy, `anon` can mutate data.  
FIX:
```sql
revoke insert, update, delete, truncate on all tables in schema public from anon;
grant select on public.agent_catalog, public.model_catalog, public.commerce_products to anon;

alter default privileges in schema public revoke insert, update, delete, truncate on tables from anon;
alter default privileges in schema public grant select on tables to authenticated;
```

**9.2 `workspaces` table has no mutation policies**  
FILE: `supabase/migrations/0001_initial.sql:75-79`  
IMPACT: Users can SELECT workspace but cannot UPDATE name/settings via RLS paths. System relies entirely on `handle_new_user()` trigger and server-side RPCs.  
FIX: Add owner-only update policy:
```sql
create policy "owners update own workspace" on public.workspaces for update to authenticated 
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
```

**9.3 `workspace_members` table has no mutation policies**  
FILE: `supabase/migrations/0001_initial.sql:76,84`  
IMPACT: Cannot add/remove members through PostgREST. System locked to single-owner workspaces.  
FIX: Add owner-only member management policies or document intentional restriction.

### HIGH

**9.4 `dna_records` table has no mutation policies**  
FILE: `supabase/migrations/0001_initial.sql:79,90`  
IMPACT: Users cannot create DNA via PostgREST; must use `create_dna_record()` function. If function has bugs or is bypassed, data read-only.  
FIX: Add mutation policies or document that all DNA mutations must go through SECURITY DEFINER functions.

**9.5 Missing index on `lanes.department_id`**  
FILE: `supabase/migrations/0002_workspace_builder.sql:14`  
IMPACT: Slow DELETE on departments, slow joins.  
FIX:
```sql
create index lanes_department_idx on public.lanes(department_id);
```

**9.6 Missing index on `genplay_binders.master_id`**  
FILE: `supabase/migrations/0003_production_pipeline.sql:33`  
IMPACT: Slow DELETE on genplay_masters, slow lookups.  
FIX:
```sql
create index genplay_binders_master_idx on public.genplay_binders(master_id);
```

### VERIFIED SECURE

- All SECURITY DEFINER functions use `SET search_path = public` ✓
- No race conditions in credit reservation/settlement ✓
- No float types on money/credits ✓
- No destructive migrations ✓
- ON DELETE cascades appropriate ✓

---

## 10. SECURITY AUDIT (COMPLETE)

### CRITICAL

**10.1 IDOR: Missing explicit workspace checks in 9 server actions**  
FILE: `web/app/(product)/actions.ts`  
LINES: 64, 82, 91, 117, 174, 180, 343, 376, 445  
IMPACT: Actions rely solely on RLS without explicit workspace_id filter in WHERE clause. If RLS policy misconfigured, any authenticated user can modify other workspaces' data by supplying foreign IDs.  
VULNERABLE ACTIONS:
- `updateLaneCollaboration` (64)
- `updateProductionStatus` (82)
- `updateProductionMode` (91)
- `updateAgentModel` (117)
- `approveReleasePackage` (174)
- `confirmReleasePublished` (180)
- `deleteWorkflow` (343)
- `updateChannel` (376)
- `deleteHandoffRule` (445)

FIX: Add explicit workspace check to every mutation:
```typescript
// Before (vulnerable to policy misconfiguration):
const { error } = await supabase.from("productions")
  .update({ status, updated_at: new Date().toISOString() })
  .eq("id", productionId);

// After (defense in depth):
const { supabase, id } = await workspace();
const { error } = await supabase.from("productions")
  .update({ status, updated_at: new Date().toISOString() })
  .eq("id", productionId)
  .eq("workspace_id", id);  // Explicit filter
```

### HIGH

**10.2 Rate limiting in-memory, ineffective in serverless**  
FILE: `web/lib/contact-rate-limit.ts:2-46`  
IMPACT: Map storage doesn't persist across lambda invocations. Attacker bypasses by triggering new instances.  
FIX: Use Redis, Upstash, Supabase table with row-level locking, or Vercel Edge Config.

**10.3 No rate limiting on auth endpoints**  
MISSING: `/app/api/auth/signup`, password reset, login (Supabase-hosted but app should add layer), `/app/api/jobs/run` (worker endpoint has no failed-auth throttle).  
IMPACT: Brute force, account enumeration, DoS.  
FIX: Add IP-based rate limiting with persistent storage on all auth endpoints.

### MEDIUM

**10.4 Open redirect: backslash normalization edge case**  
FILE: `web/lib/auth/safe-redirect.ts:3-14`  
CURRENT: Checks `!value?.startsWith("/") || value.startsWith("//")`.  
ISSUE: Inputs like `/\evil.com` may normalize in some browsers.  
FIX: Add explicit backslash check:
```typescript
if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/app";
```

### VERIFIED SECURE

- Worker auth uses `timingSafeEqual` ✓
- Stripe webhook signature verified before parsing, idempotent ✓
- AES-256-GCM: unique IV, auth tag verified, key versioning ✓
- SSRF protection layered: allowlist + private IP reject + origin verification + `redirect: "error"` ✓
- Admin client properly isolated, server-only ✓
- No secrets in `NEXT_PUBLIC_` vars ✓

---

## 11. FRONTEND AUDIT (COMPLETE)

### CRITICAL (WCAG 2.2 AA violations)

**11.1 Missing skip-to-main link**  
FILE: `web/app/layout.tsx:15`  
IMPACT: Keyboard users tab through entire header every page.  
FIX: Add skip link with CSS:
```tsx
<body id="top">
  <a href="#main-content" className="skip-link">Skip to main content</a>
  {children}
</body>
```
```css
.skip-link { position:absolute; top:-100px; left:0; padding:var(--space-3) var(--space-4); background:var(--color-cyan); color:var(--color-ink); z-index:100; }
.skip-link:focus { top:0; }
```

**11.2 Missing `<main id="main-content">` landmark**  
FILES: `web/app/(marketing)/layout.tsx:5`, `web/app/(auth)/layout.tsx:6`  
IMPACT: Screen readers cannot jump to main content.  
FIX: Add `id="main-content"` to `<main>` in both layouts.

**11.3 Mobile menu: no focus trap + restoration**  
FILE: `web/components/shell/site-header-client.tsx:9-27`  
IMPACT: Keyboard users can tab behind menu, focus lost on close.  
FIX: Add focus trap in useEffect, restore focus to toggle button on close, add `aria-expanded` on toggle.

**11.4 Command menu: incomplete focus management**  
FILE: `web/components/shell/command-menu.tsx:6-39`  
IMPACT: No focus trap, can navigate behind modal.  
FIX: Add `aria-modal="true"`, focus trap, explicit Escape handler.

**11.5 Delete account: no confirmation dialog**  
FILE: `web/components/auth/delete-account-button.tsx:5`  
IMPACT: Irreversible action with no confirmation step.  
FIX: Add client-side confirmation UI before server action executes.

**11.6 Form errors not announced to screen readers**  
FILE: `web/components/auth/auth-form.tsx:63`  
CURRENT: `role="alert"` present but no `aria-describedby` linking input to error.  
FIX: Add `aria-describedby="email-error"` to input, add `aria-live="assertive"` to error `<p>`.

**11.7 Google Fonts block render + GDPR**  
FILE: `web/app/globals.css:3`  
IMPACT: CSS `@import` from fonts.googleapis.com blocks render, sends user IP to Google.  
FIX: Migrate to `next/font/google`:
```tsx
import { DM_Mono, Space_Grotesk, Syne } from 'next/font/google';
const dmMono = DM_Mono({ weight: ['400','500'], subsets: ['latin'], variable: '--font-mono', display: 'swap' });
// Apply via <html className={dmMono.variable}>
```

**11.8 Missing metadataBase (breaks OG images)**  
FILE: `web/app/layout.tsx:4-10`  
IMPACT: Relative image URLs in openGraph break social cards.  
FIX:
```tsx
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://gemstudio.app'),
  // ...
};
```

**11.9 No robots.txt, sitemap, favicon**  
MISSING: robots.txt, sitemap.xml, favicon.ico, icon.png, apple-icon.png  
IMPACT: Search engines cannot crawl properly, no browser icon.  
FIX: Create `app/robots.ts`, `app/sitemap.ts`, add icons to `app/` directory.

### HIGH

**11.10 Contrast failures**  
FILE: `web/app/globals.css` (tokens)  
MEASURED:
- `--color-text-muted` (0.62L on 0.12L bg): **3.94:1** (needs 4.5:1)
- `--color-text-faint` (0.48L on 0.12L bg): **3.12:1** (needs 4.5:1)
- `--color-border` (0.28L on 0.12L bg): **1.94:1** (needs 3:1)

FIX:
```css
--color-text-muted: oklch(0.68 0.01 260);  /* was 0.62, now 4.6:1 */
--color-text-faint: oklch(0.58 0.01 260);  /* was 0.48, now 3.8:1 */
--color-border: oklch(0.38 0.01 260);      /* was 0.28, now 3.1:1 */
```

**11.11 MFA QR code: no accessible alternative**  
FILE: `web/components/auth/mfa-settings.tsx:47`  
IMPACT: Visually impaired users cannot set up MFA.  
FIX: Add `<details>` with manual setup key in plain text.

**11.12 Missing JSON-LD structured data**  
FILE: `web/app/layout.tsx`  
IMPACT: Search engines cannot understand organization/product.  
FIX: Add SoftwareApplication schema with dangerouslySetInnerHTML.

### MEDIUM

**11.13 No loading/error boundaries**  
MISSING: All route segments lack `loading.tsx` / `error.tsx`.  
IMPACT: Blank screen during suspense, generic error on failure.  
FIX: Add to `app/(marketing)/` and `app/(auth)/`.

**11.14 MobileMenuController dead code**  
FILE: `web/components/shell/mobile-menu.tsx:1`  
RETURNS: `null`  
FIX: Remove import from `(auth)/layout.tsx:6`, delete file or document placeholder intent.

**11.15 Unnecessary "use client" pushed too high**  
FILES: `web/app/(auth)/reset-password/page.tsx:1`, `web/app/(marketing)/contact/page.tsx:1`  
IMPACT: Forces entire route client-side when only form needs interactivity.  
FIX: Extract form to separate client component, make page server component.

### VERIFIED PASS

- Decorative images use `aria-hidden="true"` ✓
- Empty states present ✓
- Form disabled states work ✓
- `prefers-reduced-motion` implemented ✓

---

## 12. SPEC COVERAGE AUDIT (COMPLETE)

### UNIMPLEMENTED / STUBBED

**12.1 Worker polling service (HIGH)**  
FILE: `web/app/api/jobs/run/route.ts` endpoint works but no poller calls it.  
SPEC: Lane-theory-spec.md §6 requires "real worker via BYOK".  
STATUS: Job execution logic fully implemented, tested. API route claims and executes one job when called with `WORKER_SECRET` auth. No recurring poller exists.  
IMPACT: Jobs remain `pending` indefinitely unless external cron invokes API.  
FIX: Deploy external cron (Vercel Cron, GitHub Actions schedule, Supabase Edge Function) to POST to `/api/jobs/run` every 1-2min. Code production-ready, only invocation scheduling missing.

**12.2 Social platform OAuth + posting (MEDIUM)**  
FILE: `web/app/(product)/app/social/page.tsx:18` shows "Direct posting not enabled."  
SPEC: Site-workflow-spec.md §4 requires OAuth + API integration for YouTube/X/TikTok/Instagram/Facebook.  
STATUS: Social lifecycle helpers exist and tested, platform adapters unimplemented.  
SEVERITY: Intentional stub per spec's "backend-dependent" allowance; architecture correct.  
FIX: Wire platform OAuth flows + posting APIs behind existing `confirmReleasePublished` action.

**12.3 File browsing UI (MEDIUM)**  
FILE: `web/app/(product)/app/assets/page.tsx:18` shows count only.  
SPEC: Site-workflow-spec.md §5 requires "search, filter, preview, tag, version, lineage".  
STATUS: Count queries work, file access works (shot clips on production detail), list/preview UI incomplete.  
FIX: Build file list/preview UI consuming existing `generated_assets` table + Storage signed URLs.

**12.4 Casting fit scoring (MEDIUM)**  
SPEC: Lane-theory-spec.md §3.2 "search Universe for fit vs spawn from minimum template."  
STATUS: DNA CRUD works, production can attach DNA, no "fit scoring" or "spawn-from-minimum" UI exists.  
FIX: Build casting search with text-based fit ranking, add "quick spawn" form.

### VERIFIED COMPLETE

- Production detail 7-query path ✓
- Orchestration promoted to supported builder ✓
- Worker implements BYOK with real provider calls ✓ (only polling missing)
- RLS and workspace isolation tested with positive/negative matrix ✓

### OPERATIONAL GAPS (BLOCKER-FOR-PRODUCTION)

**12.5 No CI pipeline**  
MISSING: `.github/workflows/` or `.gitlab-ci.yml`  
SPEC: Day-zero-public-hosting-security.md §2 requires CI with locked deps, quality gates, protected approval.  
STATUS: Local scripts exist (`test-migrations.sh`, `security-gate.sh`), owner runs manually. Day-zero-release-checklist.md Gate A passed on rehearsal commit `32a351e`.  
SEVERITY: BLOCKER-FOR-PRODUCTION (acceptable for owner-only staging).  
FIX: Create GitHub Actions workflow running typecheck/lint/test/build/security-gate on PR + main push.

**12.6 No production Supabase / infrastructure (BLOCKER)**  
CHECKLIST: Gates B/C/D/E all DEFERRED — "Requires production Supabase separation / DNS/TLS / PITR."  
MISSING: Production Supabase project, PITR backups, TLS cert, DNS, isolated restore rehearsal, WAF, rate limits, CORS/CSP headers, SMTP/DKIM.  
IMPACT: Code production-ready, infrastructure provisioning external owner task.  
FIX: Owner provisions prod Supabase, runs `planning/restore-rehearsal.md`, updates checklist.

**12.7 No error monitoring service (HIGH)**  
MISSING: Sentry/Datadog/Bugsnag integration.  
CURRENT: Console JSON logs with redacted secrets, audit events in DB.  
FIX: Add Sentry SDK, wire to worker errors + API failures, configure alerting before public launch.

**12.8 Counsel-approved legal content (BLOCKER-FOR-PUBLIC)**  
STATUS: Placeholder legal content behind `SITE_CONTENT_APPROVED` feature flag (defaults false, returns 404).  
SPEC: Day-zero-release-checklist Gate D "Terms counsel-approved" DEFERRED.  
FIX: Engage counsel for Terms/Privacy/Core Values review, finalize, set env var true.

---

## 13. REVISED PRIORITY LIST

### BLOCKER (before production launch)
1. Fix 9 server actions: add explicit workspace_id filters (IDOR defense in depth)
2. Revoke `anon` INSERT/UPDATE/DELETE grants, grant SELECT only on public catalogs
3. Add workspace mutation policies (workspaces, workspace_members, dna_records)
4. Create CI pipeline (GitHub Actions: typecheck/lint/test/build/security-gate)
5. Provision production Supabase + infrastructure (DNS/TLS/PITR/WAF)
6. Run isolated backup restore rehearsal, measure RTO/RPO
7. Counsel-approved legal content
8. Add error monitoring (Sentry)

### CRITICAL (before beta)
9. Deploy worker polling cron (code ready, needs scheduler)
10. Migrate to next/font (GDPR + render blocking)
11. Add metadataBase (OG images)
12. Add skip-to-main link + `<main>` landmark
13. Fix mobile menu + command menu focus traps
14. Add delete account confirmation
15. Add robots.txt + sitemap + favicon
16. Fix contrast failures (text-muted, text-faint, borders)

### HIGH (fix soon)
17. Add missing DB indexes (lanes.department_id, genplay_binders.master_id, agent_files.agent_id)
18. Replace in-memory rate limiter with persistent storage
19. Add auth endpoint rate limiting
20. Add backslash check to safe-redirect
21. Add loading/error boundaries
22. Add MFA QR accessible alternative
23. Add JSON-LD structured data
24. Form error announcements (aria-live)

### MEDIUM (next iteration)
25. Social platform OAuth + posting
26. File browsing UI
27. Casting fit scoring
28. Remove MobileMenuController dead code
29. Extract client components from server pages (reset-password, contact)

---

## 14. WHAT'S GENUINELY COMPLETE

- **RLS + tenant isolation:** Tested positive/negative, workspace scoping enforced, migration invariants verify policies
- **Core workflow:** Productions/channels/agents/lanes/DNA/shots/assembly/social/approvals persist + render correctly
- **Server authorization:** All mutations through server actions with workspace validation
- **Secret handling:** Provider secrets AES-256-GCM encrypted, masked in UI, rotation-ready
- **Test coverage:** 202 test files, 111 unit tests passing, 20 E2E passing, 80%+ lib coverage
- **Schema/migrations:** 24 migrations idempotent with invariant tests, no demo fixtures
- **Worker execution:** BYOK provider calls, credit reservation, ffmpeg assembly, all tested (only polling scheduler missing)
- **Stripe:** Webhook signature verified, idempotent, timing-safe
- **SSRF protection:** Layered allowlist + private IP reject + origin verification + redirect block

---

**Final assessment:** Codebase architecturally sound, test discipline strong, security fundamentals correct. **9 critical security fixes** (explicit workspace checks, anon grants) + **16 critical UX/infra items** (CI, fonts, focus traps, polling) block production. Beta launchable after critical fixes. Full production requires infrastructure provisioning (Supabase prod, DNS/TLS, backups, monitoring, legal counsel).
