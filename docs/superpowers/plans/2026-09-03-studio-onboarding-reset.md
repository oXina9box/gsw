# Studio Onboarding Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let authenticated users inspect the full Studio and open setup on demand without changing existing onboarding data formats.

**Architecture:** Remove automatic modal activation from the product layout. Add a protected `/app/onboarding` page that reads `onboarding_profiles`, presents current progress, and reuses existing validated server actions. Keep current schema, encryption, routes, and channel creation behavior.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Supabase, Vitest, Playwright, existing CSS tokens.

**Spec:** `docs/superpowers/specs/2026-09-03-studio-onboarding-reset-design.md`

## Global Constraints

- No migration, dependency, public route, payment policy, or provider policy changes.
- Every write remains workspace-scoped and server-validated.
- Provider secrets remain encrypted server-side and absent from rendered output.
- Existing onboarding JSON field names and step enum remain compatible.

### Task 1: Remove automatic onboarding gate

**Files:**
- Modify: `web/app/(product)/layout.tsx`
- Modify: `web/lib/studio/onboarding.ts`
- Test: `web/tests/unit/app-onboarding-redirect.test.ts`

**Interfaces:**
- Consumes: `onboarding_profiles.step`
- Produces: authenticated layout that always renders Studio content; explicit query/event opening remains compatible

- [ ] Write/update test proving incomplete state does not cause layout auto-open.
- [ ] Run focused Vitest and confirm RED.
- [ ] Remove `shouldRedirectToOnboarding` from layout activation.
- [ ] Run focused Vitest and confirm GREEN.

### Task 2: Add direct setup page

**Files:**
- Create: `web/app/(product)/app/onboarding/page.tsx`
- Create or modify focused files under: `web/components/onboarding/`

**Interfaces:**
- Consumes: `getWorkspaceContext`, `onboarding_profiles`, existing onboarding constants and actions
- Produces: protected page containing identity, commercial, providers, channel, departments, and first-lane sections

- [ ] Add route test expecting authenticated-workspace ownership.
- [ ] Build page with one `h1`, truthful statuses, native controls, and explicit save actions.
- [ ] Keep sections usable at narrow widths with existing responsive tokens.
- [ ] Run route and onboarding tests.

### Task 3: Expose setup entry points

**Files:**
- Modify: `web/lib/studio/navigation.ts`
- Modify: `web/app/(product)/app/page.tsx`
- Test: `web/tests/unit/route-contract.test.ts`

**Interfaces:**
- Produces: persistent “Studio setup” navigation and dashboard callout

- [ ] Update route contract test and confirm RED.
- [ ] Add navigation item and dashboard setup callout.
- [ ] Run route contract test and confirm GREEN.

### Task 4: Integrate and verify

**Files:**
- Modify: `planning/site-workflow-spec.md`
- Modify: `planning/spec-contract-coverage.md`
- Modify: `planning/flow-revamp-spec.md`
- Modify: onboarding-related tests only

- [ ] Run focused Vitest tests.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run relevant Playwright onboarding test when environment is configured.
- [ ] Inspect 320px and desktop states; verify focus, overflow, statuses, and no automatic dialog.
