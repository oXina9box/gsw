# Gates: Gem Studio marketing motion enhancement

OWNS: web/app/globals.css, web/components/marketing/signal-board.tsx

Scope: Add restrained, accessible motion to public marketing surfaces.

- [x] G1: Motion styles and reduced-motion handling are present
  CHECK: node -e "const fs=require('fs'); const s=fs.readFileSync('web/app/globals.css','utf8'); if(!s.includes('@keyframes hero-reveal') || !s.includes('@media (prefers-reduced-motion:reduce)')) process.exit(1); console.log('motion markers present')"
  EXPECT: motion markers present
  EVIDENCE: 2026-08-26; exit 0; output `motion markers present`

- [x] G2: Signal board remains type-safe after transition enhancement
  CHECK: npm run typecheck
  EXPECT: TypeScript compilation successful
  CWD: web
  EVIDENCE: 2026-08-26; exit 0; `next typegen` and `tsc --noEmit` passed

- [x] G3: Marketing test suite passes
  CHECK: npm test -- --run
  EXPECT: Test Files
  CWD: web
  EVIDENCE: 2026-08-26; exit 0; 25 files, 113 tests passed
