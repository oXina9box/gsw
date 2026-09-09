# GATES.md — Gem Studio Audit Fixes: Phase 1 High-Priority Defects

## Summary
- Target: Fix S1 (UNI-53), RUNTIME-01 (UNI-58), RUNTIME-05 (UNI-59), WEB-03 (UNI-27), WEB-06 (UNI-60), PROC-007 (UNI-57)
- Branch: dev-audit-fixes

## Gates

- [x] G1: S1 (UNI-53) — Remove unauthenticated admin account mutation from signup fallback route and verify probe passes
  CHECK: npx vitest run --config .unlazy/repo-audit-2026-09-08/security/vitest.probe.config.ts .unlazy/repo-audit-2026-09-08/security/signup-route.probe.test.ts
  EXPECT: Tests  2 passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=dcf310b1f042ac60fbd13e6519c52e8aa36f5f3bbccf9f417975fbb864b58028; output-bytes=825

- [x] G2: RUNTIME-01 (UNI-58) & RUNTIME-05 (UNI-59) — Fix production assembly decisions persistence and casting DNA contract
  CHECK: npx vitest run --config .unlazy/repo-audit-2026-09-08/runtime/repro-vitest.config.ts .unlazy/repo-audit-2026-09-08/runtime/repro-actions.test.ts
  EXPECT: Tests  2 passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=da94320258c2cc7288dde91ab1a7b22ec3a2432fc32f440f5a4a0a0ba5bae8c4; output-bytes=779

- [x] G3: WEB-03 (UNI-27) — Fix /docs index to derive titles/links from docArticles and show all articles
  CHECK: node scripts/verify-docs-index.mjs
  EXPECT: DOCS_INDEX_VERIFIED: all articles indexed correctly
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=5b7a3a950bb7f5d78f455274dbca70f4199d93062a32ced430f4e98041487777; output-bytes=52

- [x] G4: WEB-06 (UNI-60) — Ensure contact form only returns success after durable database insert
  CHECK: node scripts/verify-contact-action.mjs
  EXPECT: CONTACT_ACTION_VERIFIED: durable persistence enforced
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=608753c7d91ca2b2cf1187764dd594d071ad7c1c05e6e14b998e2b0651896ea3; output-bytes=54

- [x] G5: PROC-007 (UNI-57) — Fix scripts/security-gate.sh to fail on scanner errors and reject stale reports
  CHECK: bash scripts/security-gate.sh
  EXPECT: gate: 0 findings
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=ae88c992f6057fa9a4b4aa5cb0fe0cb435bd4257edabaab4fb1a3d3867df2382; output-bytes=321
