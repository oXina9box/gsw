# Gates: Blocks Wireframe Rebuild (Kometa / Preline / Flowbite across every page)

OWNS: web/app/**, web/components/**, web/app/globals.css, web/tokens.css, design.md, docs/DESIGN.md

Scope: Rebuild presentation layer of all 34 rendered pages on vendored pack blocks with a Tailwind v4 theme bridge. Data queries, server actions, RLS, routing, redirects untouched. Legacy page CSS in globals.css gets deleted as the last page using it migrates.

- [x] G1: Block coverage. Every rendered page uses a vendored block or Tailwind utilities. Redirect stubs and LegalDocument pages exempt.
  CHECK: cd web && node ../scripts/verify-blocks-coverage.mjs
  EXPECT: BLOCK COVERAGE PASS
- [x] G2: Production build passes after migration.
  CHECK: cd web && npm run build 2>&1 | grep -q 'Compiled successfully' && echo BUILD_OK
  EXPECT: BUILD_OK
- [x] G3: Lint passes with zero warnings.
  CHECK: cd web && npm run lint && echo LINT_OK
  EXPECT: LINT_OK
- [x] G4: Strict typecheck passes.
  CHECK: cd web && npm run typecheck && echo TYPECHECK_OK
  EXPECT: TYPECHECK_OK
- [x] G5: Full vitest suite passes.
  CHECK: cd web && npx vitest run >/tmp/gsw-vitest.log 2>&1 && echo TESTS_OK || { tail -3 /tmp/gsw-vitest.log; exit 1; }
  EXPECT: TESTS_OK
- [x] G6: No raw hex colors in vendored blocks. OKLCH tokens only.
  CHECK: cd web && ! grep -rn '#[0-9a-fA-F]\{6\}' components/blocks && echo NO_HEX_OK
  EXPECT: NO_HEX_OK
- [x] G7: Reduced motion guard covers reveal animations.
  CHECK: grep -q 'prefers-reduced-motion' web/app/globals.css && echo MOTION_OK
  EXPECT: MOTION_OK
- [x] G8: Design docs carry pack mapping addendum.
  CHECK: grep -q 'Kometa' design.md && grep -q 'Preline' design.md && grep -q 'Flowbite' design.md && grep -q 'Kometa' docs/DESIGN.md && echo DOCS_OK
  EXPECT: DOCS_OK
