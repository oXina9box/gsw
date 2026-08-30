# Gates: Complete Flow Revamp

OWNS: planning/**, web/app/**, web/components/**, web/lib/**, web/tests/**, scripts/**

Scope: Complete end-to-end flow revamp across Site, Docs, Pricing, Auth, Studio Essentials, Departmental Setup, and 6-file Agent IP protection.

- [x] G1: Flow revamp specifications updated in planning docs
  CHECK: node scripts/verify-flow-revamp.mjs specs
  EXPECT: flow revamp specs verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=af45f3df743f407a4e9f95d47e81dbb1e8ee4d0989da32aa844db9283d208218; output-bytes=38

- [x] G2: Site discovery & docs updated with self-host, agent system, and BYOK guides
  CHECK: node scripts/verify-flow-revamp.mjs docs
  EXPECT: docs and discovery verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=23c74c2c7acf6226d9c7cd433877787288c7f38c59e37d16ad4ca9066a6fc4d6; output-bytes=39

- [x] G3: Pricing page updated with Pro, BYOK, Self-Host tiers, and Payroll Budget
  CHECK: node scripts/verify-flow-revamp.mjs pricing
  EXPECT: pricing tiers verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=ba2bbb9b135d60f0702c0d5bea27123b6d2503197cbe2db2f0af27c7c4c0c3f4; output-bytes=34

- [x] G4: Auth signup form updated with Full Name, Email, Password, and Confirm Email
  CHECK: node scripts/verify-flow-revamp.mjs auth
  EXPECT: auth signup flow verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=37f8cc8267ae1ad9a1dfcae137e4906d5e40fc55063c5978b0df4c3d4eb981d0; output-bytes=37

- [x] G5: Studio essentials onboarding updated with Name, Logo, Colors palette, Tag Line
  CHECK: node scripts/verify-flow-revamp.mjs onboarding
  EXPECT: studio essentials verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=99e2a06920cc0906fc25ee43c86b77d7ddd76ebc6169a96a9cbb5ef5e7831faa; output-bytes=38

- [x] G6: 4-Department setup updated with Pro preconfigured lanes and BYOK custom build-out
  CHECK: node scripts/verify-flow-revamp.mjs departments
  EXPECT: departmental setup verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=2af073cad1156824cea9c097672c237230a5f964b4151428c17c51f6d6b5dd8e; output-bytes=39

- [x] G7: 6-file custom agent editor and strict IP protection boundary enforced
  CHECK: node scripts/verify-flow-revamp.mjs agents
  EXPECT: agent 6-file and ip protection verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=3f080854cc1d0edae44cc57d6810b8723b3c1ec58d33ed369c9b3891f5c00ff3; output-bytes=51

- [x] G8: Tastemaker & Hallmark design tokens, CSS stamps, and anti-slop compliance
  CHECK: node scripts/verify-flow-revamp.mjs design
  EXPECT: design and anti-slop verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=322de6df9d0d13ffbe8b1a5ce7ff2e1a5ae25bb0fe9e0bcbd6de00737e47d25f; output-bytes=41

- [x] G9: Typecheck, lint, and full unit test suite pass
  CHECK: node scripts/verify-flow-revamp.mjs testsuite
  EXPECT: test suite verification passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=49c414504db67a7f7edc5c7d7a92cd12bbfa7a1ab0c5f9fa94fc8cb2a60f762a; output-bytes=2195

---

# Archived: Site-Wide Design Consistency Pass (all gates met, commit f07e8cb)

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