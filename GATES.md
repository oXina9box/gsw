# GATES.md — Gem Studio Audit Fixes: Wave 2

## Summary
- Target: S4 (UNI-69), WEB-07 (UNI-70), WEB-08 (UNI-71), WEB-09 (UNI-72)
- Branch: dev-audit-wave2

## Gates

- [x] G1: Wave 2 verification script passes covering S4 fail-closed rate limiting, WEB-07 modal navigation, WEB-08 auth form failure recovery, and WEB-09 verified social/repo destinations
  CHECK: node scripts/verify-wave2.mjs
  EXPECT: WAVE2_VERIFIED: all wave 2 checks passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=bcf815aeb36b227c14b64a8a0f14aa3ff2f508900201fbd5a1bfc9cd9b841e7c; output-bytes=41

- [x] G2: Full test suite passes without regression
  CHECK: cd web && npm test
  EXPECT: Tests  216 passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=01d16eb0c4bf34cb32f2253416ca2f27a8ca07432527c1abd5a603435619bf56; output-bytes=4206

- [x] G3: TypeScript typecheck passes
  CHECK: cd web && npm run typecheck
  EXPECT: Types generated successfully
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=cfc29c8facae9b8f2663f8b1b6ebb7890c8f8da67ee4b351e813c91be00dc025; output-bytes=150
