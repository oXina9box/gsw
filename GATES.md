# GATES.md — Gem Studio Audit Fixes: Wave 3

## Summary
- Target: PROC-001 (UNI-61), PROC-002 (UNI-55), PROC-004 (UNI-56), DEP-01 (UNI-54)
- Branch: dev-audit-wave3

## Gates

- [x] G1: Wave 3 verification passes covering CI E2E tests, CI coverage thresholds, CI dependency auditing, and Next.js upgrade to 16.3.3
  CHECK: node scripts/verify-wave3.mjs
  EXPECT: WAVE3_VERIFIED: all wave 3 checks passed
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=e2c64144ca2f2ec7201c970b1cf41e019d4cce09cfc6e991e20dfc509af84d3a; output-bytes=41

- [x] G2: Production dependency audit passes with zero high/critical vulnerabilities
  CHECK: cd web && npm audit --omit=dev --audit-level=high
  EXPECT: found 0 vulnerabilities
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=6d8c5c8f3d7684adb070417bd608d01ae90aa3dc26a65af03ffda4955f38d9a3; output-bytes=24

- [x] G3: Vitest coverage suite runs and satisfies configured library thresholds
  CHECK: cd web && npm run test:coverage
  EXPECT: % Coverage
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=e1bd44901bb651b268c181660c3ba826f84dba113bf38d28eb42b0f7a198d46d; output-bytes=6191
