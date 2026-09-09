# Style Lock: Gem Studio Flow Revamp

Updated: 2026-08-28

## Surface
- End-to-end user lifecycle: Site (/) -> Docs (/docs) -> Pricing (/pricing) -> Account Details (/?auth=signup) -> Studio Essentials -> Departmental Setup (/app/builder).
- Cinematic warm technical studio builder; high density and clear hierarchy; restrained instrument-panel detail.

## Color Contract
- Locked OKLCH palette:
  - Background: `var(--color-bg)`
  - Surface 1: `var(--color-surface-1)`
  - Surface 2: `var(--color-surface-2)`
  - Primary / Accent: `var(--color-pink)` / `var(--color-cyan)`
  - Text: `var(--color-text)` / `var(--color-text-muted)`
  - Hairline borders: `var(--color-border)` / `var(--color-hairline)`
- Contrast verified: >= 4.5:1 text-safe, >= 3.0:1 UI-safe.

## Typography
- Display: `var(--font-display)` (Clash Display / Editorial)
- Body: `var(--font-body)` (Inter / Geist)
- Mono: `var(--font-mono)` (JetBrains Mono / Geist Mono)
- No italic headers; strictly roman display typography.

## Density & Spacing
- 4-pt grid system (`--space-1` to `--space-16`).
- Section rhythm: generous padding for hero and pivotal sections; dense, organized workbench panels for studio builder.

## Motion Discipline
- Fast microinteractions (`--dur-fast` 150ms, `--dur-normal` 250ms).
- Transform and opacity only; no layout-property animation; reduced-motion compliant.

## Agent System & IP Protection Invariant
- 6-File Contract for custom agents: `role.md`, `soul.md`, `jobdescription.md`, `skills.md`, `memory.md`, `user_content.md`.
- CRITICAL: AT NO POINT DO WE TIP THE IP AGENT DETAILS. Protected catalog agents are sealed server-side and never reveal system prompts to the client.

## Stage Floors — 2026-09-05
- Existing color and font tokens retained; shared canvas editor inside current app routes.
- Compact controls and inspector around a scrollable saved-handoff graph; vertical layout below desktop.
- Motion: short CSS state feedback, reduced-motion override; no animation dependency.
- Assets: functional SVG graph and existing UI primitives. Local unDraw library unavailable; no illustration generated.
- Verification: desktop 1440px and mobile 390px browser fixtures, keyboard/reduced-motion checks, anti-slop and motion scans. Live database acceptance remains separate.
- Memory: proposed composition recorded as pending-review in decisions.log; no personal profile promotion.

## Cinematic Landing — 2026-09-09
- Preserved OKLCH color tokens and font variables; full-bleed cinematic hero with flat overlays and oversized display typography.
- Three rights-cleared 1024×1024 WebP visual concept frames (orbit, ember, stage) explicitly disclosed as visual explorations.
- Interactive scene switcher with accessible keyboard controls (`role="group"`, `aria-pressed`, `aria-live="polite"`).
- User ambient motion pause toggle with automatic reduced-motion initialization (`prefers-reduced-motion: reduce`).
- 4-department creative floor grid responsive from 4 to 2 to 1 columns without horizontal overflow.
- Clean cutover removing obsolete landing-only prototypes while preserving shell integrity and AuthModal entry actions.
