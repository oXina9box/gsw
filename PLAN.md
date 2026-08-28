# PLAN: Modal Popup Onboarding & Modal Auth/Signup

Branch: `dev-popup-onboarding` (from `dev`).

## Request inventory

1. Entire onboarding flow (Identity, Channel, Hiring/Departments, Complete) operates within a `<dialog>` modal popup.
2. Remove standalone `(auth)/signup` page since signup is handled directly in the auth modal popup.
3. Replace `/app/onboarding` standalone page with in-app modal onboarding inside `ProductLayout`.
4. Public navigation ("Create Studio", "Sign in") triggers the AuthModal popup.
5. All route contracts, tests, typechecking, and linting pass with zero warnings.

## Depth Tree (Depth 3)

- 1.0 Modal Auth & Signup
  - 1.1 `AuthModal` component (`web/components/auth/auth-modal.tsx`) with login/signup/forgot tabbed states
  - 1.2 Wire `AuthModal` trigger into `AuthActions`, `SiteHeaderClient`, `EntryActions`, `SiteFooter`, `CommandMenu`
  - 1.3 Remove `web/app/(auth)/signup/page.tsx` and wire redirect in `next.config.ts` / route handler
- 2.0 In-App Modal Onboarding
  - 2.1 `OnboardingModal` component (`web/components/onboarding/onboarding-modal.tsx`) with full 4-step wizard:
    - 2.1.1 Step 1: Studio identity (Name, Tagline, Brand Color, Content format, Guided/Fast mode)
    - 2.1.2 Step 2: First channel setup (Name, Audience, Season/Scope, Presets)
    - 2.1.3 Step 3: Departments & hiring fair (Core 4 + Optional teams)
    - 2.1.4 Step 4: Completion state + "Open Front Office ↗" action
  - 2.2 Wire `OnboardingModal` into `web/app/(product)/layout.tsx` when studio setup is incomplete
  - 2.3 Remove `web/app/(interactive)` route group and standalone `/app/onboarding/page.tsx`
- 3.0 Verification & Contracts
  - 3.1 Update `ROUTE_CONTRACTS` in `web/lib/studio/navigation.ts` and `route-contract.test.ts`
  - 3.2 Update gate oracles in `scripts/verify-footer-onboarding.mjs` and `GATES.md`
  - 3.3 Verify full suite (`npm test`, `npm run typecheck`, `npm run lint`)

## Contracts

- `OnboardingModal`: accepts `initialStep`, `initialProfile`, `isOpen`. Employs `saveOnboardingStep` action.
- `AuthModal`: URL search param `?auth=signup` or client-side open event triggers modal.
- `shouldRedirectToOnboarding(step)` determines `initialOpen` on `ProductLayout`.
