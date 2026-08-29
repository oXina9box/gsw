# Gates: Site-Wide Design Consistency Pass

OWNS: web/app/**, web/components/**, web/tokens.css, design.md

Scope: Consistency across marketing, auth, product page sets. Root-cause link fix, inline-style debt removal, archetype coverage, reveal-on-scroll extension, design-token reconciliation.

- [x] G1: No broken /signup links; all signup CTAs use /?auth=signup modal pattern
  CHECK: cd web && ! grep -rn 'href="/signup"' app components && echo PASS
  EXPECT: PASS
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=c26de83abdc9496cd1301470918ec39ecca1cf389ef0ae1c6504da1800d1c431; output-bytes=5

- [x] G2: data-archetype present on all rendered marketing and product page roots (redirect stubs and LegalDocument-rendered pages exempt — archetype applied by the component)
  CHECK: cd web && for f in app/\(marketing\)/*/page.tsx app/\(product\)/app/*/page.tsx; do grep -q 'redirect(\|LegalDocument' "$f" && continue; grep -L 'data-archetype' "$f"; done | wc -l | grep -q '^0$' && echo PASS
  EXPECT: PASS
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=c26de83abdc9496cd1301470918ec39ecca1cf389ef0ae1c6504da1800d1c431; output-bytes=5

- [x] G3: No hardcoded inline styles remaining in pricing, contact, productions detail
  CHECK: cd web && ! grep -rn 'style={{' app/\(marketing\)/pricing/page.tsx app/\(marketing\)/contact/page.tsx app/\(product\)/app/productions/\[productionId\]/page.tsx && echo PASS
  EXPECT: PASS
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=c26de83abdc9496cd1301470918ec39ecca1cf389ef0ae1c6504da1800d1c431; output-bytes=5

- [x] G4: reveal-on-scroll applied to detail-band, pricing-section, docs-layout sections
  CHECK: cd web && grep -q 'reveal-on-scroll' app/\(marketing\)/pricing/page.tsx && grep -q 'reveal-on-scroll' app/\(marketing\)/docs/page.tsx && echo PASS
  EXPECT: PASS
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=c26de83abdc9496cd1301470918ec39ecca1cf389ef0ae1c6504da1800d1c431; output-bytes=5

- [x] G5: design.md token table matches tokens.css values for border, muted, faint
  CHECK: grep -q 'oklch(0.38 0.01 260)' design.md && grep -q 'oklch(0.68 0.01 260)' design.md && grep -q 'oklch(0.58 0.01 260)' design.md && echo PASS
  EXPECT: PASS
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=c26de83abdc9496cd1301470918ec39ecca1cf389ef0ae1c6504da1800d1c431; output-bytes=5

- [x] G6: Full build passes after all edits
  CHECK: cd web && npm run build 2>&1 | grep -q 'Compiled successfully' && echo PASS
  EXPECT: PASS
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=c26de83abdc9496cd1301470918ec39ecca1cf389ef0ae1c6504da1800d1c431; output-bytes=5

- [x] G7: Full vitest suite passes after all edits
  CHECK: cd web && npx vitest run 2>&1 | tail -4 | grep -q 'Tests  .* passed' && echo PASS
  EXPECT: PASS
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=c26de83abdc9496cd1301470918ec39ecca1cf389ef0ae1c6504da1800d1c431; output-bytes=5

- [x] G8: ESLint passes with zero warnings on changed files
  CHECK: cd web && npx eslint app components --max-warnings=0 2>&1 | tail -3 | grep -v 'error\|warning' && echo PASS
  EXPECT: PASS
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=b141901b65dad35383497713f45710c316dde63aa526c09ec732d34d73767b78; output-bytes=45