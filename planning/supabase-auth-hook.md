# Supabase Auth Hook — Signup Enforcement

**Status:** `BLOCKED — owner infra task` (Step 5 runway)

## Purpose
Gate `F03` — Supabase Auth-level invite enforcement. Route-level `evaluateSignupPolicy` already ships in `web/app/api/auth/signup/route.ts` (invite reuse of `evaluateOperationalPolicy("signup", ...)`). This hook doc covers the DB-level supplement Supabase can enforce even if the HTTP route is bypassed.

## Option A — Supabase Auth Hook (preferred)
- Use `supabase auth hook` or Postgres trigger on `auth.users` insert to call `beta_invites` lookup.
- Mirror logic: if `signup = invite_only` and no unconsumed invite, raise `invite_required`.
- Evidence: enable hook in Supabase dashboard → capture `supabase auth hooks list` + failing `anon` key signup without invite → `403 invite_required`, with valid `beta_invites.code` → `200`.

## Option B — Row-level check (fallback)
- Add `CHECK`/`trigger` on `public.profiles` insert joining `beta_invites`; deny insert when policy is `invite_only` without invite.
- Not a full auth bypass proof — keep Option A as target.

## Acceptance
- Without invite: `POST /api/auth/signup` → `403 invite_required`
- With `beta_invites` row (`consumed=false`): → `200`
- Verified against isolated staging (not production) before Step 5 sign-off; cite in `planning/day-zero-release-checklist.md` Gate B.

## Blocker
Requires isolated Supabase project + `SUPABASE_SECRET_KEY` rotation per Gate B; until then rehearsal uses local route gate only.
