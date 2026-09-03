# Gates: studio-sidenav-shell

OWNS: web/app/(product)/layout.tsx, web/components/product/**, web/components/shell/command-menu.tsx, web/app/globals.css, web/tests/e2e/authenticated-staging.spec.ts, GATES.md

Scope: Replace authenticated (product) chrome with Flowbite-style fixed topbar + sidenav shell using Gem Studio tokens, design-upgraded by a reviewer pass.

- [x] G0: design spec produced and protected contract intact
  EVIDENCE: local://studio-sidenav-design-spec.md — protected contract verified item by item (9/9 pass): nav landmark, hamburger attrs, aside/main ids, skip-link preserved, NAV_GROUPS + orchestration gating, Docs/Help only, 2 topbar actions, md breakpoint, h-14/pt-14 + w-64/md:pl-64 pairs

- [x] G1: typecheck, lint, unit tests pass
  CHECK: sh -c "cd web && npm run typecheck && npm run lint && npm test && echo G1-PASS"
  EXPECT: G1-PASS
  EVIDENCE: G1-PASS — typecheck + lint (max-warnings=0) + vitest 161/161 (29 files)

- [x] G2: production build passes
  CHECK: sh -c "cd web && npm run build && echo G2-PASS"
  EXPECT: G2-PASS
  EVIDENCE: G2-PASS — 49 routes built, no prerender errors

- [x] G3: authenticated shell E2E passes (sidebar nav + mobile drawer); creds guard prevents fake-green on skip
  CHECK: sh -c 'cd web && OUT=$(npx playwright test tests/e2e/authenticated-staging.spec.ts 2>&1); echo "$OUT"; echo "$OUT" | grep -q skipped && exit 1; echo "$OUT" | grep -q passed || exit 1; echo G3-PASS'
  EXPECT: G3-PASS
  EVIDENCE: G3-PASS — 5/5 passed 17.4s, zero skipped (zero-skip guard active); 2 stale pre-existing tests fixed against current modal/PrelineCard reality

- [x] G4: manual visual verification of desktop sidebar and mobile drawer in real browser against the design spec (screenshots recorded)
  EVIDENCE: verified in real browser (headless Chromium, real Supabase login) — desktop 1280px: sidenav 256px visible, 3 groups, active Channels aria-current + bg-pink/10 + font-medium 500 + pink rail; cue moves to Billing on nav; topbar 56px bg/92 blur; main pt-14/pl-64 + min-height 664px (studio-main override live); ⌘K dialog opens with 11 NAV_GROUPS links; AccountDropdown full menu. Mobile 390px: drawer x −256↔0 via hamburger, backdrop mounts/unmounts, backdrop click closes. Screenshots: /tmp/omp-sshots-1571b9329b64dba4.webp (desktop channels), 1571b9831964dba5 (billing active), 1571b9aa0aa4dba6 (⌘K), 1571b9aaefa4dba7 (account menu), 1571b9be1de4dba8 (mobile drawer)
