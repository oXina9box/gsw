# Gates: studio-ia-topbar

OWNS: web/lib/studio/navigation.ts, web/lib/studio/navigation.test.ts, web/components/product/studio-shell.tsx, web/components/shell/command-menu.tsx, web/tests/e2e/authenticated-staging.spec.ts, planning/site-workflow-spec.md, GATES.md

Scope: Correct IA to owner spec — single Studio module (Collective, channels, Integrations, Secrets); Front Office removed from nav; module box + studio logo relocated to topbar left of account dropdown; channel sub-pages remain milestone 2.

- [x] G1: typecheck, lint, unit tests pass
  CHECK: sh -c "cd web && npm run typecheck && npm run lint && npm test && echo G1-PASS"
  EXPECT: G1-PASS
  EVIDENCE: G1-PASS — typecheck + lint + vitest 156/156 (29 files)

- [x] G2: production build passes
  CHECK: sh -c "cd web && npm run build && echo G2-PASS"
  EXPECT: G2-PASS
  EVIDENCE: G2-PASS — exit=0 clean build (stale .next cache cleared after Turbopack EPERM)

- [x] G3: authenticated shell E2E passes; zero-skip guard
  CHECK: sh -c 'cd web && OUT=$(npx playwright test tests/e2e/authenticated-staging.spec.ts 2>&1); echo "$OUT"; echo "$OUT" | grep -q skipped && exit 1; echo "$OUT" | grep -q passed || exit 1; echo G3-PASS'
  EXPECT: G3-PASS
  EVIDENCE: G3-PASS — 5/5 passed 21.1s, zero skipped

- [x] G4: browser proof — topbar module box + studio logo placement, single-module sidenav
  EVIDENCE: real browser + Supabase login — topbar right cluster order: Search, Notifications, Modules chip (Studio), studio identity (logo + "Staging Verification Studio"), Account dropdown last; sidenav single module: Collective, Integrations, Secrets, Studio setup + 7 channels; no account links in sidenav. Screenshot: /tmp/omp-sshots-1572064289282a76.webp
