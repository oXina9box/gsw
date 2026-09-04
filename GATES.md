# Gates: studio-ia-shell

OWNS: web/lib/studio/navigation.ts, web/lib/studio/navigation.test.ts, web/components/product/studio-shell.tsx, web/app/(product)/layout.tsx, web/app/(product)/app/collective/page.tsx, web/app/(product)/app/secrets/page.tsx, web/tests/e2e/authenticated-staging.spec.ts, planning/site-workflow-spec.md, GATES.md

Scope: Restructure authenticated shell IA — module switcher (Studio / Front Office), DB channels in Studio module, Collective + Secrets routes, notification bell placeholder, Account access only via top-right dropdown. Milestone 1 of owner IA request; channel sub-pages + brand channel seeding = Milestone 2.

- [x] G0: spec §2.1 updated for new authenticated chrome contract
  EVIDENCE: planning/site-workflow-spec.md:123 — dashboard shell contract: topbar (brand/search/bell/account), sidenav module switcher (Studio/Front Office), fixed Docs/Help/Contact bottom, account access dropdown-only, implicit Studio Brand Channel first

- [x] G1: typecheck, lint, unit tests pass
  CHECK: sh -c "cd web && npm run typecheck && npm run lint && npm test && echo G1-PASS"
  EXPECT: G1-PASS
  EVIDENCE: G1-PASS — typecheck + lint (max-warnings=0) + vitest 159/159 (29 files)

- [x] G2: production build passes
  CHECK: sh -c "cd web && npm run build && echo G2-PASS"
  EXPECT: G2-PASS
  EVIDENCE: G2-PASS — all routes build incl. /app/collective and /app/secrets

- [x] G3: authenticated shell E2E passes (module switcher + drawer); zero-skip guard
  CHECK: sh -c 'cd web && OUT=$(npx playwright test tests/e2e/authenticated-staging.spec.ts 2>&1); echo "$OUT"; echo "$OUT" | grep -q skipped && exit 1; echo "$OUT" | grep -q passed || exit 1; echo G3-PASS'
  EXPECT: G3-PASS
  EVIDENCE: G3-PASS — 5/5 passed 17.1s, zero skipped. Fixed: stale /app/onboarding redirect in next.config.ts removed (page now real), module switcher sync fires on navigation only, onboarding landing opens identity section for completed studios

- [x] G4: manual visual verification of module switcher, channels list, bell, account-only-via-dropdown in real browser (screenshots recorded)
  EVIDENCE: real browser, real Supabase login — Front Office default at /app (Overview/Studio setup/Channels/Marketing/Socials/Staffing, switcher pressed=Front Office); Studio switch shows Collective/Studio Floor/Assets/Orchestration/Integrations/Secrets + 7 DB channels with status badges; Collective page active cue; bottom Docs/Help/Contact fixed; topbar Search/Notifications/Account; zero account links in sidenav. Screenshots: /tmp/omp-sshots-1571df7ea5661abe.webp (Front Office), 1571dfa72e661abf (Studio module), 1571dfa927661ac0 (Collective)
