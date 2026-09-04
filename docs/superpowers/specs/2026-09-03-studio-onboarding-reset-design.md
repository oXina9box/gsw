# Studio onboarding reset

## Goal

Let authenticated users enter and inspect the Studio immediately. Onboarding becomes the only intentional first-run write flow; it is discoverable, resumable, and never blocks navigation. Existing data formats remain unchanged.

## Current problem

The product layout opens a mandatory modal whenever `onboarding_profiles.step !== 'complete'`. The modal requires seven ordered steps: identity, commercial choice, providers, channel, departments, lane approvals, and completion. This makes users configure policy and production structure before they can understand the product.

## New contract

- Product layout never opens onboarding automatically and never redirects because onboarding is incomplete.
- `/app` and every existing authenticated route render for an empty workspace.
- Onboarding is a normal page at `/app/onboarding`, reachable from the shell and dashboard.
- Onboarding is the only first-run write surface presented by default. Other write surfaces remain available through their existing routes; no new lock or capability policy is introduced.
- No channel is auto-created. Users may create channels from the existing channel page whenever they choose.
- Existing `onboarding_profiles` JSON columns and `step` enum remain valid. Save actions keep current field names and validation. Step order becomes resumable UI state, not an access gate.
- Commercial selection, provider connection, department setup, lane setup, and first marketing handoffs are optional sections. Each section can be skipped and revisited.
- Sensitive provider keys remain server-only and encrypted. No browser storage or response exposes them.

## Experience

### Entry

After login, user lands in `/app`. Dashboard shows actual counts and an empty-state card: “Set up your studio” linking to `/app/onboarding`. A compact shell link stays available until onboarding is complete, then changes to “Studio settings”.

### Onboarding page

One page with a short identity form first, followed by optional setup cards. Identity keeps current fields and formats: studio name/defer, logo SVG/PNG/WebP max 5 MB, 1–3 hex colors, tagline, content direction, and description. Save is independent and returns a truthful saved state.

Optional cards preserve current formats and actions:

1. Workspace identity — existing `identity` save.
2. Commercial mode — existing `commercial` save.
3. Provider connections — existing encrypted OpenAI/Anthropic save.
4. Channel starter — existing `channel` save, never auto-run.
5. Departments — existing `hiring` payload.
6. First lane approvals — existing `lane` payload and default workflow installation.

Each card shows `Not started`, `Saved`, or `Needs attention`, with one action and a return path. No card is required to view Studio pages.

### Page behavior

- Loading, validation error, server error, and saved states are explicit.
- Empty states explain the next useful action.
- Buttons use one vocabulary: “Save”, “Continue”, “Skip for now”, “Open”.
- No modal is used for mandatory onboarding. Intro/help may remain a dialog.
- Existing routes and query formats remain compatible (`/app?step=...`, `/app?error=...`) but resolve to the page instead of opening a gate.

## Implementation boundaries

- Modify product layout to remove automatic `OnboardingModal` opening. Keep component available for explicit legacy links only if harmless.
- Add `/app/onboarding/page.tsx` and a focused client component for section state.
- Reuse `saveOnboardingStep`, validators, constants, and existing server-side encryption.
- Add a shared read-only/empty-state notice only where current pages assume records exist; do not invent a global permission system.
- Remove or replace dashboard “Create channel” empty-state copy only if it implies onboarding is required; channel creation remains a valid action.
- Add unit tests for non-blocking layout decision and resumable section status. Add E2E coverage for login → app → onboarding → save identity → browse app.
- No migration, dependency, public route, payment policy, or schema change.

## Accessibility and polish

- One `h1` per page, logical heading order, keyboard-visible focus, native form controls, status announcements.
- Content remains readable at 320px, 200% zoom, and reduced motion.
- Group optional cards by spacing, not separator-heavy decoration. Keep primary action inset on mobile.
- Use existing tokens, type scale, icon set, and motion curves.

## Acceptance

1. Incomplete onboarding does not open a modal or redirect from any authenticated route.
2. `/app/onboarding` direct load works and displays all six resumable sections.
3. Identity save persists existing fields and marks only identity saved.
4. No channel insert occurs unless user submits channel section.
5. Provider secrets never appear in browser payloads, logs, or rendered HTML.
6. Existing onboarding and channel validation tests remain green.
7. `npm run typecheck`, `npm run lint`, focused Vitest, and relevant Playwright flow pass.
