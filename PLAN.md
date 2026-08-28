# PLAN: footer rework + real logos + mandatory interactive onboarding

Branch: `dev-onboarding-footer-logo` (from `dev`).

## Request inventory (each outcome gets a gate)

1. Footer reworked (spec §2.1 complete link set, logo, session actions incl. sign-out).
2. Actual logo in logo slots (header wordmark, footer mark, studio nav, favicon; transparent PNGs, no white boxes on dark theme).
3. Account creation → onboarding page (signup form redirect).
4. Intro popup on onboarding explaining the process.
5. Onboarding required: every `(product)` route redirects incomplete studios to `/app/onboarding`.
6. Onboarding page reworked, covers lane-theory-spec §2 spine (identity branding + guided/fast + lane education, first channel with presets/season/scope, hiring fair core+optional depts), plus provider-connection guidance.
7. Onboarding lives in new `(interactive)` route group.

## Depth tree (depth 3 requested; serialized — shared files)

Leaves touch the same files (`globals.css`, `actions.ts`, layouts, tests), so parallel
dispatch is unsafe; executed sequentially in one session. Tier per model-router: all
leaves are medium multi-file feature work → terra/high equivalent, no subagent fan-out.

- 1 Brand assets & logo slots
  - 1.1 Transparent PNGs in `web/public/assets/img/` (done: flood-fill white→alpha, trimmed, downscaled)
  - 1.2 `GemLogo`/`GemMark` components; header, footer, studio nav, favicon slots
- 2 Footer rework
  - 2.1 Spec-complete link columns + session actions + sign-out
  - 2.2 Footer CSS (4-col grid, responsive)
- 3 Mandatory onboarding routing
  - 3.1 `(interactive)` group + layout; move `/app/onboarding` into it
  - 3.2 `(product)/layout.tsx` gate via `shouldRedirectToOnboarding` (moved to lib)
  - 3.3 Signup success → `/app/onboarding`
- 4 Onboarding experience
  - 4.1 Intro popup (`<dialog>`, lane-theory process explanation)
  - 4.2 Reworked steps: identity branding fields, channel presets/season/scope, hiring fair checkboxes, lane education asides, provider guidance
  - 4.3 `saveOnboardingStep` payload extension (no schema change; jsonb)
- 5 Verification: unit tests updated/added, typecheck, lint, build, gate checks

## Contracts

- `shouldRedirectToOnboarding(step: unknown): boolean` in `web/lib/studio/onboarding.ts`.
- `ONBOARDING_STEP_META` drives wizard rail + popup copy.
- No migration: `onboarding_profiles` jsonb columns carry richer payloads; step enum unchanged.
- Route URL `/app/onboarding` unchanged → `ROUTE_CONTRACTS` untouched.
