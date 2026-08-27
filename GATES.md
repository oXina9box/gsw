# Gates: Gem Studio landing page polish

OWNS: web/app/(marketing)/page.tsx, web/app/(marketing)/layout.tsx, web/components/marketing/marketing-effects.tsx, web/app/globals.css

Scope: Apply restrained scroll motion, Apple style material chrome, and clear landing page conversion cues to public Gem Studio surfaces.

- [x] G1: Scroll reveal runtime and accessible fallback exist
  CHECK: node -e "const fs=require('fs'); const s=fs.readFileSync('web/components/marketing/marketing-effects.tsx','utf8'); const c=fs.readFileSync('web/app/globals.css','utf8'); if(!s.includes('IntersectionObserver') || !c.includes('.reveal-on-scroll') || !c.includes('prefers-reduced-motion')) process.exit(1); console.log('landing motion markers present')"
  EXPECT: landing motion markers present
  EVIDENCE: 2026-08-26; exit 0; output `landing motion markers present`

- [x] G2: Landing page includes conversion sections and reveal hooks
  CHECK: node -e "const fs=require('fs'); const s=fs.readFileSync('web/app/(marketing)/page.tsx','utf8'); if(!s.includes('reveal-on-scroll') || !s.includes('Create your Studio')) process.exit(1); console.log('landing structure markers present')"
  EXPECT: landing structure markers present
  EVIDENCE: 2026-08-26; exit 0; output `landing structure markers present`

- [x] G3: Gem Studio remains type safe and tests pass
  CHECK: npm run typecheck && npm test -- --run
  EXPECT: Test Files
  CWD: web
  EVIDENCE: 2026-08-26; exit 0; `next typegen`, `tsc --noEmit`; 25 files, 113 tests passed
