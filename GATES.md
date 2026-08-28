# GATES: Modal Onboarding & Modal Signup

OWNS: web/components/auth/**, web/components/onboarding/**, web/components/shell/**, web/components/marketing/**, web/app/**, web/lib/studio/**, web/tests/unit/**, scripts/verify-footer-onboarding.mjs

- [ ] G1: AuthModal component exists and provides popup signup & login
  CHECK: node scripts/verify-footer-onboarding.mjs authmodal
  EXPECT: auth modal verification passed

- [ ] G2: Standalone signup page removed and handled via modal
  CHECK: node scripts/verify-footer-onboarding.mjs nosignuppage
  EXPECT: signup page removal verified

- [ ] G3: OnboardingModal component exists with 4-step wizard in dialog popup
  CHECK: node scripts/verify-footer-onboarding.mjs onboardingmodal
  EXPECT: onboarding modal verification passed

- [ ] G4: ProductLayout mounts OnboardingModal for incomplete studios
  CHECK: node scripts/verify-footer-onboarding.mjs productmodal
  EXPECT: product layout modal verification passed

- [ ] G5: Standalone interactive onboarding page removed
  CHECK: node scripts/verify-footer-onboarding.mjs nointeractivepage
  EXPECT: interactive page removal verified

- [ ] G6: Navigation route contracts match updated routes
  CHECK: node scripts/verify-footer-onboarding.mjs contracts
  EXPECT: route contracts verification passed

- [ ] G7: Strict TypeScript compiles
  CHECK: node scripts/verify-footer-onboarding.mjs typecheck
  EXPECT: typecheck verification passed

- [ ] G8: ESLint passes at max-warnings=0
  CHECK: node scripts/verify-footer-onboarding.mjs lint
  EXPECT: lint verification passed

- [ ] G9: Full unit test suite passes
  CHECK: node scripts/verify-footer-onboarding.mjs tests
  EXPECT: tests verification passed
