# Gates: studio-channel-m2

OWNS: supabase/migrations/0030_brand_channel_notifications.sql, web/app/(product)/**, web/components/product/**, web/lib/studio/**, web/tests/**, GATES.md

Scope: Milestone 2 — seeded Studio Brand Channel (is_brand), channel-scoped sub-pages (Dashboard, Staffing, Marketing, Social, Assets, Production), expandable channel nav items, real notifications feed in topbar bell.

- [x] G0: migration harness passes
  CHECK: bash scripts/test-migrations.sh
  EXPECT: migration invariants passed
- [x] G1: typecheck, lint, unit tests pass
  CHECK: sh -c "cd web && npm run typecheck && npm run lint && npm test && echo G1-PASS"
  EXPECT: G1-PASS
  EVIDENCE: G1-PASS — typecheck + lint + vitest 156/156 across 29 test files

- [x] G2: production build passes
  CHECK: sh -c "cd web && npm run build && echo G2-PASS"
  EXPECT: G2-PASS
  EVIDENCE: G2-PASS — exit=0 production build with all subpages compiled

- [x] G3: authenticated staging E2E passes; zero-skip guard
  CHECK: sh -c 'cd web && OUT=$(npx playwright test tests/e2e/authenticated-staging.spec.ts 2>&1); echo "$OUT"; echo "$OUT" | grep -q skipped && exit 1; echo "$OUT" | grep -q passed || exit 1; echo G3-PASS'
  EXPECT: G3-PASS
  EVIDENCE: G3-PASS — 6/6 passed (22.1s), zero skipped, including channel subpage navigation and channel subnav tabs

- [x] G4: browser verification of brand channel, expandable channel subpages, notifications bell feed
  EVIDENCE: verified in real browser with staging login — active channel auto-expands 6 subpages (Dashboard, Staffing, Marketing, Social Media, Assets, Production) in sidenav; ChannelSubnav tabs work with active states; Notifications dropdown works from topbar bell. Screenshots: /tmp/omp-sshots-15722f103543ebcd.webp (Dashboard), 15722f1f5c83ebce (Staffing), 15722f282103ebcf (Production node canvas), 15722f2f0583ebd0 (Notifications dropdown)
