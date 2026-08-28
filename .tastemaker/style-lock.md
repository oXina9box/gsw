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
