# Critical Fixes — Execution Plan

**Generated:** 2026-08-23  
**Branch:** staging  
**Commit:** c4acca2

This document lists fixes blocking production launch, grouped by urgency and implementation order.

---

## PHASE 1: SECURITY (BLOCKER — 1-2 hours)

### Fix 1: Add explicit workspace filters to server actions

**File:** `web/app/(product)/actions.ts`  
**Lines:** 64, 82, 91, 117, 174, 180, 343, 376, 445

**Current vulnerability:** Actions rely solely on RLS without explicit workspace_id in WHERE clause. Defense-in-depth violation.

**Actions to fix:**
1. `updateLaneCollaboration` (line 64)
2. `updateProductionStatus` (line 82)
3. `updateProductionMode` (line 91)
4. `updateAgentModel` (line 117)
5. `approveReleasePackage` (line 174)
6. `confirmReleasePublished` (line 180)
7. `deleteWorkflow` (line 343)
8. `updateChannel` (line 376)
9. `deleteHandoffRule` (line 445)

**Pattern:**
```typescript
// Add to every mutation:
const { supabase, id: workspaceId } = await workspace();
const { error } = await supabase
  .from("TABLE")
  .update({...})
  .eq("id", targetId)
  .eq("workspace_id", workspaceId);  // ← Add this line

if (error) throw new Error(error.message);
```

**Test:** Run E2E test attempting cross-workspace mutation (should fail with 0 rows affected).

---

### Fix 2: Revoke anon grants

**File:** Create `supabase/migrations/0025_revoke_anon_grants.sql`

```sql
-- Revoke overly broad grants from 0010
revoke insert, update, delete, truncate on all tables in schema public from anon;

-- Grant SELECT only on public catalogs
grant select on public.agent_catalog to anon;
grant select on public.model_catalog to anon;
grant select on public.commerce_products to anon;

-- Fix default privileges
alter default privileges in schema public 
  revoke insert, update, delete, truncate on tables from anon;
alter default privileges in schema public 
  grant select on tables to authenticated;

comment on schema public is 'Anon role restricted to SELECT on public catalogs only';
```

**Test:** Attempt INSERT as anon via PostgREST (should return 403).

---

### Fix 3: Add workspace mutation policies

**File:** Create `supabase/migrations/0026_workspace_mutation_policies.sql`

```sql
-- Allow workspace owners to update their workspace
create policy "owners update own workspace" 
on public.workspaces for update to authenticated 
using (owner_id = auth.uid()) 
with check (owner_id = auth.uid());

-- Document restriction: multi-member workspaces deferred
comment on table public.workspace_members is 
  'Single-owner workspaces only in v1. Member management policies deferred until multi-user feature.';

-- Allow workspace members to create DNA records via RLS
create policy "members create dna records" 
on public.dna_records for insert to authenticated 
with check (public.is_workspace_member(workspace_id));

create policy "members update dna records" 
on public.dna_records for update to authenticated 
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "members delete dna records" 
on public.dna_records for delete to authenticated 
using (public.is_workspace_member(workspace_id));
```

**Test:** Update workspace name via PostgREST (should succeed for owner, fail for non-owner).

---

## PHASE 2: CRITICAL UX (BLOCKER — 2-3 hours)

### Fix 4: Migrate to next/font

**File:** `web/app/layout.tsx`

Add imports:
```typescript
import { DM_Mono, Space_Grotesk, Syne } from 'next/font/google';

const dmMono = DM_Mono({ 
  weight: ['400', '500'], 
  subsets: ['latin'], 
  variable: '--font-mono',
  display: 'swap'
});

const spaceGrotesk = Space_Grotesk({ 
  weight: ['400', '500', '600', '700'], 
  subsets: ['latin'], 
  variable: '--font-body',
  display: 'swap'
});

const syne = Syne({ 
  weight: ['600', '700', '800'], 
  subsets: ['latin'], 
  variable: '--font-display',
  display: 'swap'
});
```

Apply to `<html>`:
```tsx
<html lang="en" className={`${dmMono.variable} ${spaceGrotesk.variable} ${syne.variable}`}>
```

**File:** `web/app/globals.css`  
Remove line 3:
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap');
```

**Test:** Build, verify fonts load, check Lighthouse (should improve performance score).

---

### Fix 5: Add metadataBase

**File:** `web/app/layout.tsx`

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://gemstudio.app'),
  title: { default: "Gem Studio — AI film studio", template: "%s · Gem Studio" },
  // ... rest unchanged
};
```

**Test:** Share URL on Slack/Discord, verify OG image renders.

---

### Fix 6: Add skip link + main landmark

**File:** `web/app/layout.tsx`

```tsx
<body id="top">
  <a href="#main-content" className="skip-link">Skip to main content</a>
  {children}
</body>
```

**File:** `web/app/globals.css` (add at end)

```css
.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  padding: var(--space-3) var(--space-4);
  background: var(--color-cyan);
  color: var(--color-ink);
  font-weight: 500;
  text-decoration: none;
  z-index: 100;
  border-radius: 0 0 var(--radius-sm) 0;
}

.skip-link:focus {
  top: 0;
}
```

**File:** `web/app/(marketing)/layout.tsx`

```tsx
return <>
  <SiteHeader />
  <main id="main-content">{children}</main>
  <SiteFooter />
</>;
```

**File:** `web/app/(auth)/layout.tsx`

```tsx
return <>
  <SiteHeader />
  <main id="main-content">{children}</main>
  <SiteFooter />
</>;
```

**Test:** Tab from URL bar, verify skip link appears and jumps to main.

---

### Fix 7: Focus traps for mobile menu + command menu

**File:** `web/components/shell/site-header-client.tsx`

Replace entire component with version from frontend audit report (section 11.3) — adds focus trap, restoration, aria-expanded.

**File:** `web/components/shell/command-menu.tsx`

Replace useEffect with version from frontend audit report (section 11.4) — adds aria-modal, focus trap.

**Test:** Open mobile menu with keyboard, verify Tab cycles within menu, Escape closes and restores focus.

---

### Fix 8: Delete account confirmation

**File:** `web/components/auth/delete-account-button.tsx`

Replace with version from frontend audit report (section 11.7) — adds client-side confirmation step with danger panel.

**Test:** Click delete button, verify confirmation UI appears, cancel/confirm work correctly.

---

### Fix 9: robots.txt + sitemap + favicon

**File:** Create `web/app/robots.ts`

```typescript
export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://gemstudio.app';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app/', '/account/', '/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
```

**File:** Create `web/app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://gemstudio.app';
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/studio`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/system`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/social-workshop`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/docs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ];
}
```

**Assets:** Add to `web/app/`:
- `icon.png` (512×512 PNG)
- `apple-icon.png` (180×180 PNG)
- `favicon.ico` (32×32 ICO)

**Test:** Visit `/robots.txt`, `/sitemap.xml`, verify browser shows favicon.

---

### Fix 10: Contrast adjustments

**File:** `web/tokens.css`

```css
--color-text-muted: oklch(0.68 0.01 260);  /* was 0.62 */
--color-text-faint: oklch(0.58 0.01 260);  /* was 0.48 */
--color-border: oklch(0.38 0.01 260);      /* was 0.28 */
```

**Test:** Visual regression, verify UI still looks balanced, run axe DevTools.

---

## PHASE 3: INFRASTRUCTURE (BLOCKER — owner task)

### Fix 11: Deploy worker polling cron

**Option A: Vercel Cron (if deploying to Vercel)**

Create `web/vercel.json`:
```json
{
  "crons": [{
    "path": "/api/jobs/run",
    "schedule": "*/2 * * * *"
  }]
}
```

Add header check to `/api/jobs/run/route.ts`:
```typescript
// Allow both Bearer token AND Vercel cron header
const authHeader = request.headers.get("authorization");
const cronHeader = request.headers.get("x-vercel-cron-secret");

if (cronHeader === process.env.CRON_SECRET) {
  // Verified cron invocation
} else if (authHeader) {
  // Existing Bearer token check
  if (!verifyWorkerAuthorization(authHeader, process.env.WORKER_SECRET)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
} else {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}
```

**Option B: GitHub Actions**

Create `.github/workflows/worker-poll.yml`:
```yaml
name: Worker Polling
on:
  schedule:
    - cron: '*/2 * * * *'
jobs:
  poll:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST "${{ secrets.APP_URL }}/api/jobs/run" \
            -H "Authorization: Bearer ${{ secrets.WORKER_SECRET }}"
```

**Option C: Supabase Edge Function**

Create `supabase/functions/worker-poll/index.ts`:
```typescript
Deno.serve(async () => {
  const response = await fetch(`${Deno.env.get("APP_URL")}/api/jobs/run`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${Deno.env.get("WORKER_SECRET")}` }
  });
  return new Response(await response.text());
});
```

Deploy: `supabase functions deploy worker-poll`  
Schedule via Supabase Dashboard: Add cron trigger every 2 minutes.

**Test:** Enqueue job, wait 2min, verify job status changes to `running` then `completed`.

---

### Fix 12: Create CI pipeline

**File:** Create `.github/workflows/ci.yml`

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main, staging, production]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: web/package-lock.json
      
      - name: Install dependencies
        working-directory: web
        run: npm ci
      
      - name: Typecheck
        working-directory: web
        run: npm run typecheck
      
      - name: Lint
        working-directory: web
        run: npm run lint
      
      - name: Test
        working-directory: web
        run: npm test
      
      - name: Build
        working-directory: web
        run: npm run build
      
      - name: Security gate
        run: bash scripts/security-gate.sh
      
      - name: Migration tests
        run: bash scripts/test-migrations.sh
```

Enable branch protection on `production` branch: require CI pass before merge.

**Test:** Open PR, verify CI runs and gates work.

---

### Fix 13-16: Production infrastructure (external owner task)

**Checklist:**
1. Provision production Supabase project (separate from staging)
2. Configure custom domain + TLS certificate
3. Enable PITR (Point-In-Time Recovery) with 7-day retention
4. Run `planning/restore-rehearsal.md`, measure RTO/RPO, record timestamps
5. Configure production SMTP (Resend/SendGrid) with DKIM
6. Set up error monitoring (Sentry project)
7. Configure WAF rules (Cloudflare/Vercel)
8. Set production env vars (WORKER_SECRET rotation, OPENAI_API_KEY placeholder)
9. Engage counsel for Terms/Privacy review, obtain signature
10. Update `day-zero-release-checklist.md` Gates B/C/D with evidence

**Estimated time:** 1-2 days (provisioning + rehearsal + legal review)

---

## PHASE 4: HIGH PRIORITY (1-2 hours)

### Fix 17: Add missing indexes

**File:** Create `supabase/migrations/0027_performance_indexes.sql`

```sql
create index lanes_department_idx on public.lanes(department_id);
create index genplay_binders_master_idx on public.genplay_binders(master_id);
create index agent_files_agent_idx on public.agent_files(agent_id);

comment on index lanes_department_idx is 'Performance: department deletion + joins';
comment on index genplay_binders_master_idx is 'Performance: master deletion + binder lookups';
comment on index agent_files_agent_idx is 'Performance: agent deletion + file queries';
```

**Test:** Run `EXPLAIN ANALYZE` on dept/master/agent deletes, verify index scans.

---

### Fix 18: Replace in-memory rate limiter

**File:** Create `web/lib/db-rate-limit.ts`

```typescript
import { createClient } from "@/lib/supabase/server";

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = createClient();
  const windowStart = new Date(Date.now() - windowMs);
  
  const { data, error } = await supabase.rpc("check_rate_limit", {
    rate_key: key,
    rate_limit: limit,
    window_start: windowStart.toISOString()
  });
  
  if (error) throw error;
  return data;
}
```

**File:** Create `supabase/migrations/0028_rate_limiting.sql`

```sql
create table if not exists public.rate_limit_log (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  created_at timestamptz not null default now()
);

create index rate_limit_log_key_time_idx on public.rate_limit_log(key, created_at desc);

create or replace function public.check_rate_limit(
  rate_key text,
  rate_limit integer,
  window_start timestamptz
)
returns jsonb
language plpgsql
as $$
declare
  request_count integer;
begin
  -- Count requests in window
  select count(*) into request_count
  from public.rate_limit_log
  where key = rate_key and created_at >= window_start;
  
  if request_count >= rate_limit then
    return jsonb_build_object('allowed', false, 'remaining', 0);
  end if;
  
  -- Log this request
  insert into public.rate_limit_log (key) values (rate_key);
  
  return jsonb_build_object('allowed', true, 'remaining', rate_limit - request_count - 1);
end;
$$;

-- Cleanup old logs daily
create or replace function public.cleanup_rate_limit_logs()
returns void
language sql
as $$
  delete from public.rate_limit_log where created_at < now() - interval '1 hour';
$$;
```

Replace `contact-rate-limit.ts` calls with `checkRateLimit`.

**Test:** Send 6 contact form requests in 10min, verify 6th is blocked.

---

### Fix 19: Add loading/error boundaries

**File:** Create `web/app/(marketing)/loading.tsx`

```tsx
export default function Loading() {
  return <div className="shell" style={{ padding: "var(--space-16)", textAlign: "center" }}>
    <p style={{ color: "var(--color-text-muted)" }}>Loading…</p>
  </div>;
}
```

**File:** Create `web/app/(marketing)/error.tsx`

```tsx
"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <div className="shell reading-page">
    <h1>Something went wrong</h1>
    <p className="lede">{error.message}</p>
    <button className="button button-primary" onClick={reset}>Try again</button>
  </div>;
}
```

Copy both to `web/app/(auth)/`.

**Test:** Trigger error in page (throw in component), verify custom error UI.

---

## VERIFICATION CHECKLIST

Before merging to `production` branch:

- [ ] All 9 server actions have explicit workspace filters
- [ ] Anon grants revoked, SELECT-only on public catalogs
- [ ] Workspace mutation policies added
- [ ] next/font migration complete, no Google CDN
- [ ] metadataBase set, OG images render
- [ ] Skip link + main landmark on all pages
- [ ] Focus traps work on mobile menu + command menu
- [ ] Delete account shows confirmation dialog
- [ ] robots.txt + sitemap + favicon present
- [ ] Contrast passes WCAG AA (4.5:1 body text, 3:1 UI)
- [ ] Worker polling deployed and jobs complete autonomously
- [ ] CI pipeline runs on PR, gates production branch
- [ ] Production Supabase provisioned with PITR
- [ ] Restore rehearsal complete with RTO/RPO evidence
- [ ] Error monitoring (Sentry) wired and tested
- [ ] Legal content counsel-approved
- [ ] Missing indexes added (lanes, genplay_binders, agent_files)
- [ ] DB-backed rate limiter replaces in-memory version
- [ ] Loading/error boundaries on all route segments

---

**Estimated total time:**
- Phase 1 (Security): 1-2 hours
- Phase 2 (UX): 2-3 hours
- Phase 3 (Infra): 1-2 days (owner provisioning)
- Phase 4 (High priority): 1-2 hours

**Total developer time:** 4-7 hours  
**Total calendar time:** 2-3 days (includes owner infra tasks)
