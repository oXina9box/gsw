# Gates: footer rework, real logos, mandatory interactive onboarding

OWNS: web/public/assets/img/**, web/components/shell/**, web/components/product/onboarding-assistant.tsx, web/components/onboarding/**, web/app/layout.tsx, web/app/globals.css, web/app/(marketing)/layout.tsx, web/app/(auth)/layout.tsx, web/app/(product)/layout.tsx, web/app/(product)/actions.ts, web/app/(product)/app/page.tsx, web/app/(interactive)/**, web/components/auth/auth-form.tsx, web/lib/studio/onboarding.ts, web/lib/studio/onboarding.test.ts, web/tests/unit/**, scripts/verify-footer-onboarding.mjs, PLAN.md, GATES.md

Scope: reworked site footer with real logo in every logo slot, signup lands on a required interactive-group onboarding flow that opens with a process popup and covers the lane-theory spec §2 spine.

- [x] G0: this ledger states outcomes that can fail
  CHECK: node /home/ox/.claude/skills/unlazy/scripts/gate-lint.mjs GATES.md
  EXPECT: LINT OK
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=48630b7361dd44ee870917b12c3d19b9d7bdea738aaca16bb04d4cab83b772d2; output-bytes=8

- [x] G1: logo assets are transparent web-sized PNGs, no white boxes
  CHECK: node scripts/verify-footer-onboarding.mjs logos
  EXPECT: logos verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=28cf2e6bc316df6a280d1231f3a947e9216d38a4ad23d5cb44374cffb6216fe1; output-bytes=26

- [x] G2: real logo rendered in every logo slot
  CHECK: node scripts/verify-footer-onboarding.mjs slots
  EXPECT: logo slots verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=265e81385bd1a4e91746167410eeed443787ee302252532a0ed8487d7dec6a01; output-bytes=31

- [x] G3: footer carries the spec §2.1 link set and session actions
  CHECK: node scripts/verify-footer-onboarding.mjs footer
  EXPECT: footer verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=aa2f46cb793ababc38b7fddb2c9b89dfba6a20cfaaf30a48c4367ab4eaf8935b; output-bytes=27

- [x] G4: account creation lands on the onboarding page
  CHECK: node scripts/verify-footer-onboarding.mjs signup
  EXPECT: signup redirect verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=9affb10192283a04f9c836bcd247a8fb39f3c89b6e0947c7624443808ed5b821; output-bytes=36

- [x] G5: incomplete studios are redirected to onboarding from every product route
  CHECK: node scripts/verify-footer-onboarding.mjs gate
  EXPECT: onboarding gate verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=5f288702afefaa0330caf7eb27fb6d4a5ae70030cb51aeff9297060b32c00abf; output-bytes=36

- [x] G6: onboarding route lives in the interactive route group
  CHECK: node scripts/verify-footer-onboarding.mjs group
  EXPECT: interactive group verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=40f675f3ea95b22b31b179c7ceb493c7992d518e9768bfaad0703a0beb037d77; output-bytes=38

- [x] G7: onboarding opens with a popup explaining the process
  CHECK: node scripts/verify-footer-onboarding.mjs popup
  EXPECT: intro popup verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=6568c689206230410f369b9650327261f8b9277cf8ad754fc79d58a1c9d8adc4; output-bytes=32

- [x] G8: onboarding covers the lane-theory spec §2 spine
  CHECK: node scripts/verify-footer-onboarding.mjs lane
  EXPECT: lane coverage verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=aebaa5ad0fffdb499ed72111a5975f1a3c9f2be35ac328b5862c49885539dd1e; output-bytes=34

- [x] G9: strict TypeScript compiles
  CHECK: node scripts/verify-footer-onboarding.mjs typecheck
  EXPECT: typecheck verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=2fcc62c0bddbae982da8499d2e113e9d2558b0e162615a1b492c91bc4b6b2548; output-bytes=30

- [x] G10: ESLint passes at max-warnings=0
  CHECK: node scripts/verify-footer-onboarding.mjs lint
  EXPECT: lint verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=830afa71bd4d4f30b19500bfa337a7a98bda9784ab2e49956deca27ecbfb032a; output-bytes=25

- [x] G11: full unit suite passes
  CHECK: node scripts/verify-footer-onboarding.mjs tests
  EXPECT: tests verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=1985d31c20c581a0b11f35c351b982b36f814f12b5bca46a281e9e9e16cc9e71; output-bytes=26
