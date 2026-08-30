# Gem Studio — Website & UI/UX Design System Specification

**Status:** Living Design Specification  
**Architecture:** Next.js App Router (React 19, Strict TypeScript), Tailwind CSS / Vanilla CSS Variables, OKLCH Color Engine  
**Theme:** Studio Dark (Workbench Macrostructure, Anchor Hue: 350 Pink, Focus: Cyan)  
**Accessibility:** WCAG 2.2 AA Compliant  

---

## 1. Design Philosophy & Macrostructure

Gem Studio is a solo-creator AI film studio SaaS. The user interface reflects an authentic, high-density **Creative Workbench & Control Room** rather than generic enterprise SaaS.

### Core Visual Principles
1. **Density with Legibility:** Maximized information density for film production workflows (timeline, lanes, shot binders, logs) without visual clutter.
2. **True Studio Dark Palette:** Built with OKLCH color space for perceptually uniform lightness, deep neutral blacks, subtle slate surfaces, and targeted chromatic signals.
3. **Intentional Accent Signals:**
   - **Hot Pink (`oklch(0.62 0.28 350)`):** Primary brand anchor, primary action triggers, hero focal points.
   - **Cyan (`oklch(0.85 0.16 205)`):** Active focus outlines, telemetry, system states, interactive hover states.
   - **Lime (`oklch(0.88 0.22 145)`):** Success states, completed jobs, active online workers, verified rights.
   - **Amber (`oklch(0.78 0.16 75)`):** Warning thresholds, approval gates, pending human review, quota notices.
   - **Red (`oklch(0.62 0.22 25)`):** Errors, destructive operations, quota depletion, failed generation steps.
4. **Zero Decorative Noise:** Every border, line, badge, and glow represents an operational state, production status, or interactive boundary.

---

## 2. Design Token System

All tokens are defined in `web/tokens.css` and imported globally in `web/app/globals.css`.

### 2.1 Color Palette (OKLCH Engine)

```css
:root {
  /* Surface Layers */
  --color-bg: oklch(0.12 0.01 270);         /* #0d0e15 - Deep Canvas Base */
  --color-surface: oklch(0.18 0.015 260);    /* #1a1b24 - Card & Container Surface */
  --color-surface-2: oklch(0.22 0.015 255);  /* #232530 - Elevated Panels & Rail */
  --color-surface-3: oklch(0.27 0.015 250);  /* #2f3240 - Interactive Items / Hover */

  /* Text Contrast Hierarchy */
  --color-text: oklch(0.93 0.005 260);      /* #e8e9ed - Primary High-Contrast Text */
  --color-text-muted: oklch(0.68 0.01 260);  /* #9ca0b0 - Body & Label Text */
  --color-text-faint: oklch(0.58 0.01 260);  /* #777b8c - Placeholder & Metadata */

  /* Structural Borders & Hairlines */
  --color-border: oklch(0.38 0.01 260);      /* #4e5264 - Standard Element Separation */
  --color-border-2: oklch(0.36 0.015 255);   /* #474c5d - Subtle Inner Border */
  --color-hairline: oklch(1 0 0 / 0.05);     /* Ghost dividers and grid lines */

  /* Brand & Status Accents */
  --color-pink: oklch(0.62 0.28 350);        /* Primary Brand Accent */
  --color-pink-hover: oklch(0.66 0.26 350);  /* Button & Link Hover */
  --color-pink-active: oklch(0.55 0.28 350); /* Button Active Press */
  --color-cyan: oklch(0.85 0.16 205);        /* Focus & Secondary Highlights */
  --color-lime: oklch(0.88 0.22 145);        /* Success / Completed */
  --color-amber: oklch(0.78 0.16 75);        /* Attention / Approval Gates */
  --color-red: oklch(0.62 0.22 25);          /* Danger / Error / Reject */
  --color-white: oklch(0.98 0 0);            /* Crisp White Callouts */
}
```

### 2.2 Typography System

The typography uses three complementary font families loaded via Next.js Google Font optimization:

| Token | Font Family | Usage |
|---|---|---|
| `--font-display` | `'Syne', 'Space Grotesk', sans-serif` | Editorial headlines, landing hero, module banners, major section titles |
| `--font-body` | `'Space Grotesk', system-ui, sans-serif` | Core interface text, form controls, card titles, navigation items |
| `--font-mono` | `'DM Mono', ui-monospace, monospace` | Data tables, timecodes, JSON contracts, shot IDs, token counts, log streams |

#### Type Scale
- `--text-xs`: `0.6875rem` (11px) — Timestamps, badges, metadata, system pill tags
- `--text-sm`: `0.8125rem` (13px) — Secondary descriptions, table body, input hints
- `--text-md`: `1.0000rem` (16px) — Standard UI copy, form input text, default labels
- `--text-lg`: `1.2500rem` (20px) — Panel headers, subsection titles, modal headers
- Display 1: `2.2500rem` – `3.5000rem` — Marketing Hero, Main Dashboard title

### 2.3 Spatial Scale & Radii

A strict 4px / 8px linear spatial scale guarantees structural alignment across complex IDE grids:

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.50rem;  /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1.00rem;  /* 16px */
--space-6: 1.50rem;  /* 24px */
--space-8: 2.00rem;  /* 32px */
--space-12: 3.00rem; /* 48px */
--space-16: 4.00rem; /* 64px */

--radius-sm: 0.50rem;  /* 8px - Buttons, Inputs, Badges */
--radius-md: 1.00rem;  /* 16px - Cards, Panels, Modals */
--radius-pill: 999px;  /* Pill Badges, Status Dots */
```

### 2.4 Shadows & Atmospheric Depth

```css
--shadow-pink: 0 0 2rem oklch(0.62 0.28 350 / 0.22);
--shadow-cyan: 0 0 2rem oklch(0.85 0.16 205 / 0.20);
--shadow-lime: 0 0 2rem oklch(0.88 0.22 145 / 0.16);
--shadow-panel: 0 1.5rem 4rem oklch(0 0 0 / 0.34);
```

---

## 3. Information Architecture & Four-Module Map

Gem Studio strictly enforces a four-module sitemap.

```mermaid
graph TD
    Root["Gem Studio System"]
    
    subgraph M1["1. Unknown User (Public)"]
        Home["/ (Home & Hero)"]
        Explainers["/studio, /system, /social-workshop"]
        Gallery["/gallery (Public Productions)"]
        Docs["/docs & /pricing"]
        Legal["/terms, /privacy, /core-values, /contact"]
        Auth["/login, /signup, /mfa, /forgot-password"]
    end

    subgraph M2["2. Front Office (Studio Ops)"]
        Dashboard["/app (Overview)"]
        Channels["/app/channels & /app/channels/[id]"]
        Marketing["/app/marketing (Research/Trends)"]
        Social["/app/social (Publishing/Signals)"]
        Staffing["/app/staffing (Agents/Roster)"]
    end

    subgraph M3["3. Studio (Production & Assembly)"]
        Builder["/app/builder (13-Stage Pipeline Config)"]
        ProdDetail["/app/productions/[id] (Workbench & Set)"]
        Assets["/app/assets (Warehouse & Lineage)"]
        Universe["/app/universe & /app/universe/[id] (DNA)"]
        GenPlay["/app/genplay (Shot Binder Contracts)"]
        AgentsView["/app/agents (Agent Editor & Directives)"]
        Orchestration["/app/orchestration (Visual Engine DAG)"]
    end

    subgraph M4["4. Account & Platform"]
        AccountView["/account (Profile & Security)"]
        Billing["/app/billing (Credits & Ledger)"]
        Integrations["/app/integrations (BYOK Encrypted Keys)"]
    end

    Root --> M1
    Root --> M2
    Root --> M3
    Root --> M4
```

### Module 1: Unknown User (Public Discovery & Auth)
- **Public Hero & Signal Board:** High-impact Syne typography with dark canvas, dynamic audio/video signal filters, and direct CTA to studio signup.
- **Explainers (`/studio`, `/system`, `/social-workshop`):** Deep-dive visual walkthroughs of the 13-stage automated film pipeline.
- **Public Proof Gallery (`/gallery`):** Curated public master records showing generated AI films, shot lineage, and prompt/model attributions.
- **Pricing & Credit Model (`/pricing`):** Clear distinction between Solo Creator tier and Studio tier allowances, with BYOK transparency.
- **Authentication Routes (`/login`, `/signup`, `/mfa`, `/verify-email`):** Centered card layout with single-focus inputs, WebAuthn/TOTP challenge support, and zero clutter.

### Module 2: Front Office (Operations & Strategy)
- **Studio Mission Control (`/app`):** Active productions carousel, real-time credit burn rate, agent availability matrix, and quick-launch actions.
- **Channels Desk (`/app/channels`):** Brand voice bibles, target demographics, production frequency rules, and visual style guides.
- **Market & Research Desk (`/app/marketing`):** Trend analysis, viral hook databases, audience response telemetry.
- **Social Distribution (`/app/social`):** Platform-specific aspect ratio packages (16:9, 9:16, 1:1), scheduling ledger, and engagement feedback loops.
- **Staffing Desk (`/app/staffing`):** Assignment of specialized AI agents to channel departments.

### Module 3: Studio (Core Creative Engine)
- **13-Stage Production Pipeline (`/app/builder`):** Visual lane configurator for the 13 film departments:
  1. *Ideation* → 2. *Scripting* → 3. *Storyboarding* → 4. *Worldbuilding/Universe* → 5. *Character Casting (cDNA)* → 6. *Location Scouting (lDNA)* → 7. *Prop/Object Design (pDNA)* → 8. *Audio/Voice Design* → 9. *Shot Generation* → 10. *VFX & Upscaling* → 11. *FFmpeg Master Assembly* → 12. *Quality & Rights Review* → 13. *Release Packaging*.
- **Production Set & Assembly Workbench (`/app/productions/[id]`):** Dual-pane workspace with shot list binder on left, live video/timeline preview in center, and inspector/prompt parameters on right.
- **Universe & DNA Continuity (`/app/universe`):** Living continuity bible tracking Characters (cDNA), Locations (lDNA), and Props (pDNA) to prevent visual drift across shots.
- **Asset Warehouse (`/app/assets`):** Version-controlled media vault with automated SHA-256 lineage tracking, model provenance, and license attestations.
- **Workflow Orchestration Engine (`/app/orchestration`):** Visual DAG editor for custom handoff rules (Manual review gates, Semi-Auto approval thresholds, Fully Automated continuous generation).

### Module 4: Account & Infrastructure
- **Security & Identity (`/account`):** Passkey management, TOTP 2FA configuration, session revocation, single-click workspace data export, and account deletion.
- **Credit Accounting (`/app/billing`):** Real-time ledger of generation credits, token breakdown per provider, and transaction receipts.
- **BYOK Key Management (`/app/integrations`):** AES-256-GCM encrypted key storage for OpenAI, Anthropic, Midjourney/FLUX, ElevenLabs, Runway, and custom inference endpoints.

---

## 4. Shell Architecture & Core System (Invariants)

Every page in Gem Studio is governed by a strict two-tier shell contract with zero custom third headers or footers.

```
                      ┌─────────────────────────────────────────┐
                      │            UNIVERSAL FOOTER             │
                      │       (<SiteFooter /> on all pages)     │
                      └────────────────────┬────────────────────┘
                                           │
                 ┌─────────────────────────┴─────────────────────────┐
                 ▼                                                   ▼
      ┌────────────────────┐                              ┌────────────────────┐
      │      CORE A        │                              │      CORE B        │
      │   (Logged Out)     │                              │   (Logged In)      │
      │   .site-header     │                              │   .studio-header   │
      └──────────┬─────────┘                              └──────────┬─────────┘
                 │                                                   │
        ┌────────┴────────┐               ┌──────────────────────────┼──────────────────────────┐
        ▼                 ▼               ▼                          ▼                          ▼
┌───────────────┐ ┌───────────────┐ ┌───────────┐              ┌───────────┐              ┌───────────┐
│ A1: Flagship  │ │ A2: Reading / │ │    B1     │              │    B2     │              │    B3     │
│     Marketing │ │     Docs/Auth │ │  FRONT    │              │  STUDIO   │              │  ACCOUNT  │
└───────────────┘ └───────────────┘ │  OFFICE   │              │ WORKBENCH │              │ (Security)│
                                    └─────┬─────┘              └─────┬─────┘              └─────┬─────┘
                                          │                          │                          │
                                    ┌─────┴─────┐              ┌─────┼─────┐              ┌─────┴─────┐
                                    ▼           ▼              ▼     ▼     ▼              ▼           ▼
                                   B1-A        B1-B           B2-A  B2-B  B2-C           B3-A        B3-B
                                   (Hub)     (Index)        (Board)(Split)(Warehouse)  (Config)    (Ledger)
```

### 4.1 Shell Invariants
1. **Universal Container**: All page content is wrapped in `<main id="main-content">` inside `<div className="shell">` (`width: min(100% - 3rem, 88rem); margin-inline: auto;`).
2. **Universal Footer**: `<SiteFooter />` (`.site-footer`) renders identically on every public, authenticated, and account route. Never customized or hidden.
3. **Header A (Logged Out / Public)**: `<SiteHeader />` (`.site-header`) with brand mark, public nav (Gallery, Docs, Pricing), and Auth action buttons.
4. **Header B (Logged In / Product)**: `<StudioNav />` (`.studio-header`) with studio dot, workspace title, `.studio-nav` module tabs (Front Office, Studio, Account), and `.studio-subnav` page tabs.

### 4.2 Responsive Breakpoints
- **Mobile (< 640px):** Single-column stacked view (`width: min(100% - 1.5rem, 88rem)`). Navigation collapses into `.main-nav` dropdown or mobile menu drawer. Heavy workbench split switches to single-column stack.
- **Tablet (640px – 1024px):** Connected grids collapse to 2 columns (`.desk-grid`, `.grid`).
- **Desktop (1024px – 1440px):** Full 3-pane workbench / 2-column workspace split (`.workspace-split`).
- **Ultrawide (> 1440px):** Max container width capped at `88rem` via `.shell` to maintain reading measure.

---

## 5. Template Book & Archetype Taxonomy

All routes must strictly select and implement one of the following canonical archetypes. No custom ad-hoc page geometry is permitted.

### 5.1 CORE A: Logged Out / Public Pages (`.site-header`)

#### Archetype A1: Marketing Flagship & Feature Showcase
* **Routes**: `/`, `/studio`, `/system`, `/social-workshop`
* **Slot Contract**:
  * `Slot 1 (Hero)`: `.hero.shell` or `.detail-hero` (`.eyebrow` with `.pulse-dot` + `Syne` H1 with `.hero-emphasis` + `Space Grotesk` `.hero-lede` max `32-44rem` + `.hero-actions`).
  * `Slot 2 (Visual Stage / Rail)`: `.hero-stage` (layered canvas with `.orbit` rings, `.stage-frame`, `.signal-card` overlays) or `.department-rail` (13-stage milestone bar).
  * `Slot 3 (Connected Matrix)`: `.desk-grid` (2×2 connected `.desk-card` blocks with `.desk-number` 01-04, status dot, and `.card-arrow`) or `.detail-grid`.
  * `Slot 4 (Closing Banner)`: `.closing-layout` or `.detail-cta` (Large `Syne` sign-off on left, `.button-primary` on right).

#### Archetype A2: Reading, Docs & Auth Gateways
* **Variant A2-A (Docs Layout — `/docs`)**:
  * `Slot 1`: Two-column `.docs-layout.shell` (`14rem` sidebar + `1fr` content).
  * `Slot 2`: Sticky `.docs-nav` sidebar with mono category headers and cyan hover links.
  * `Slot 3`: Stacked `.docs-section` stream with hairline dividers, `Syne` H2/H3, and DM Mono code blocks.
* **Variant A2-B (Editorial & Legal — `/terms`, `/privacy`, `/core-values`)**:
  * `Slot 1`: Centered `.reading-page.shell` (`max-width: 58rem; margin-inline: auto`).
  * `Slot 2`: `Syne` H1 + `.kicker` (effective date) + `.lede` (max `36rem`).
  * `Slot 3`: Content stream with `.notice` callouts (`border-left: 2px solid var(--color-amber)`).
* **Variant A2-C (Centered Form Gateway — `/login`, `/signup`, `/contact`, `/mfa`, `/forgot-password`)**:
  * `Slot 1`: Centered canvas `.form-page` (`min-height: calc(100vh - 12rem); place-items: center`).
  * `Slot 2`: Inset `.form-card` (`max-width: 28rem` to `36rem`, `.color-surface-70`).
  * `Slot 3`: `Syne` H1 + `.stack-form` (DM Mono uppercase labels + dark inputs) + `.button-primary` + `.form-error`.

---

### 5.2 CORE B: Logged In / Product Pages (`.studio-header`)

#### Core B1: Front Office (Control & Operations)
* **Routes**: `/app`, `/app/channels`, `/app/marketing`, `/app/social`, `/app/staffing`, `/app/front-office`
* **Variant B1-A (Executive Hub — `/app`, `/app/front-office`)**:
  * `Slot 1 (Header)`: `.workspace-hero` (Left: `Syne` H1 + lede; Right: glowing cyan `.credit-pill` with tabular numbers).
  * `Slot 2 (Metrics)`: 4-up `.stats-grid` (`DM Mono` label + `Syne` tabular numbers).
  * `Slot 3 (Data)`: Striped `.production-list` (stacked `.production-row` items with channel tag, title, 13-stage mini progress bar, and `.status-mark`).
  * `Slot 4 (Feed Split)`: 2-column `.workspace-split` (Two 50/50 `.panel` containers holding `.event-list` feed items).
* **Variant B1-B (Entity Index / Catalog — `/app/channels`, `/app/staffing`)**:
  * `Slot 1 (Header)`: `.section-head` (Left: `Syne` H1 + lede; Right: `.button-primary` creation action).
  * `Slot 2 (Grid)`: Connected `.grid.channel-grid` (3-column cards with `<dl>` stat rows and hairline borders).
  * `Slot 3 (Empty State)`: Inset `.panel.empty-state` with guidance and action button when count is zero.

#### Core B2: Studio (Creative & Production Workbench)
* **Routes**: `/app/studio`, `/app/productions/[id]`, `/app/builder`, `/app/universe`, `/app/universe/[id]`, `/app/assets`, `/app/orchestration`, `/app/agents`
* **Variant B2-A (Production Pipeline & Shot Board — `/app/productions/[id]`, `/app/orchestration`)**:
  * `Slot 1 (Stepper)`: 13-stage `.production-progress` stepper with active state dots.
  * `Slot 2 (Gate Panel)`: `.active-step-panel` (Cyan glow border highlighting current approval gate or active job).
  * `Slot 3 (Work Surface)`: Vertical `.shot-list` (`.shot-card` items with prompt preview and `.clip-row` version selectors).
  * `Slot 4 (Assembly & Logs)`: Assembly decision controls + collapsible `.event-list details` JSON execution logs.
* **Variant B2-B (Split Inspector Workbench — `/app/builder`, `/app/universe/[id]`, `/app/agents`, `/app/marketing`)**:
  * `Slot 1 (Breadcrumb)`: Context header (`.text-link` back link + `Syne` H1 + `.status-mark`).
  * `Slot 2 (Split Surface)`: 2-column `.workspace-split`:
    * *Left (60%)*: Dark text editor (`.file-form`), visual asset canvas, or DNA sheet viewer.
    * *Right (40%)*: Configuration stack (`.stack-form` with dropdowns, model selection, prompt overrides).
  * `Slot 3 (Action Strip)`: `.actions` strip (`.button-primary` save + `.button-outline` + `.danger-button`).
* **Variant B2-C (Asset Warehouse — `/app/assets`, `/app/universe`)**:
  * `Slot 1 (Filter Bar)`: Search & filter `.inline-form` with tier and type dropdowns.
  * `Slot 2 (Catalog Matrix)`: Connected `.catalog-list` or `.grid` with metadata badges.
  * `Slot 3 (Batch Deck)`: Selection drawer with download, DNA casting, and tagging actions.

#### Core B3: Account & Infrastructure (Settings & Security)
* **Routes**: `/account`, `/app/billing`, `/app/integrations`, `/app/onboarding`
* **Variant B3-A (Settings & Security — `/account`, `/app/onboarding`)**:
  * `Slot 1 (Header)`: `Syne` H1 + `Space Grotesk` lede.
  * `Slot 2 (Panels Stack)`: Vertical stack of `.panel` containers holding standard `.stack-form` inputs.
  * `Slot 3 (Danger Zone)`: Bottom `.panel.danger-panel` with red border for key revocation or workspace deletion.
* **Variant B3-B (Vault & Billing Ledger — `/app/billing`, `/app/integrations`)**:
  * `Slot 1 (Header)`: `Syne` H1 + usage overview.
  * `Slot 2 (Ledger / Connections)`: 2-up `.credit-hero` (Available vs Reserved) + connected `.connection-list` (provider rows with masked secrets, capabilities, and `.status-mark`).
  * `Slot 3 (Revocation)`: Confirmation dialogs for credential rotation or disconnection.

---

### 5.3 Strict Anti-Patterns & Validation Gates

1. **Font Role Inversion**: `Syne` is forbidden in body copy, buttons, inputs, and tables (Headings only). `Space Grotesk` is forbidden in data numbers and status tags (`DM Mono` only).
2. **Uncontained Width**: Every page must be contained inside `.shell` (`88rem`) or `.reading-page` (`58rem`). Zero marginless full-bleed content.
3. **Floating Island Cards**: Never create detached rounded cards with standard drop shadows. Always use connected 1px border grids (`border-top/left` on parent, `border-right/bottom` on children) with `--color-surface` fills.
4. **Un-tokenized Colors**: Never use raw hex/RGB. Colors strictly constrained to Pink (`350`), Cyan (`205`), Lime (`145`), Amber (`75`), and Red (`25`).
5. **Custom Header/Footer**: Never create custom headers or footers inside page routes. All pages use `<SiteFooter />` and either `<SiteHeader />` (Core A) or `<StudioNav />` (Core B).

---

## 6. UI Component Hierarchy & Patterns

### 6.1 Common Atoms & Primitives
- **Button System:**
  - `.button-primary`: Vibrant Pink background (`--color-pink`), dark text, subtle pink glow on hover.
  - `.button-secondary`: Subtle surface background (`--color-surface-2`), hairline border (`--color-border`), white text.
  - `.button-ghost`: Transparent background, hover highlight, used for toolbar controls.
  - `.button-danger`: Soft red border and text, red background on active press.
- **Form Controls:**
  - Standard dark input field with `--color-surface` fill, `--color-border` outline, and bright Cyan focus ring (`--color-focus`).
  - Monospace code & prompt editors with syntax highlight and character counter.
- **Status & Telemetry Badges:**
  - Pill shape (`--radius-pill`), 11px uppercase monospace font, soft background mix with saturated status dot.

### 6.2 Composite Product Components
- **`HeroStage` (`marketing/hero-stage.tsx`):** Ambient interactive backdrop with canvas-driven particle lines, glowing radial light pulses, and dynamic action buttons.
- **`SignalBoard` (`marketing/signal-board.tsx`):** Filterable telemetry grid displaying real-time generation signals, channel frequencies, and public proofs.
- **`ProductionProgress` (`product/production-progress.tsx`):** Horizontal stepped pipeline tracker displaying current execution phase, gate status (Pending / Approved), and progress percentage.
- **`ExecutionLive` (`product/execution-live.tsx`):** Terminal-style log drawer with ANSI color parsing, real-time step duration timer, and worker retry controls.
- **`CommandMenu` (`shell/command-menu.tsx`):** Global Spotlight-style search modal (triggered via `Cmd+K` / `Ctrl+K`) for rapid navigation across productions, characters, assets, and documentation.

---

## 7. Motion & Micro-interactions

Motion in Gem Studio is restrained, physics-based, and performance-optimized using CSS transforms and hardware-accelerated transitions.

```css
/* Motion Curves */
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--dur-fast: 160ms;  /* Tooltips, Button press, Toggle switches */
--dur-base: 280ms;  /* Dropdowns, Modal reveals, Panel expansion */
--dur-slow: 700ms;  /* Progress bar fills, Ambient background shifts */
```

### Accessibility Fallback (Reduced Motion)
All animations are strictly wrapped with `@media (prefers-reduced-motion: reduce)`:
```css
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 8. Accessibility (A11y) & Engineering Compliance

1. **Color Contrast Standards:**
   - Body copy (`--color-text` on `--color-bg`): Contrast ratio > `12.5:1` (Exceeds WCAG AAA).
   - Muted labels (`--color-text-muted` on `--color-surface`): Contrast ratio > `4.8:1` (Exceeds WCAG AA).
2. **Keyboard Navigation:**
   - All interactive controls feature visible `2px solid var(--color-focus)` outlines via `:focus-visible`.
   - Modals and drawers implement strict focus trapping and `Escape` key listeners.
   - Global skip link (`#main-content`) provided on all pages.
3. **Screen Reader Support:**
   - Semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `<section>`).
   - Dynamic states (live job execution, upload progress) announced via `aria-live="polite"`.
   - Explicit `aria-expanded` and `aria-controls` bindings on collapsible navigation and accordion drawers.

---

## 9. File Structure Reference
```
web/
├── app/
│   ├── (auth)/          # Authentication flow routes
│   ├── (marketing)/     # Public discovery and explainer routes
│   ├── (product)/       # Protected Studio and Front Office workspace routes
│   ├── layout.tsx       # Global root layout with fonts and metadata
│   ├── globals.css      # CSS token implementations & base utilities
│   └── tokens.css       # Canonical design token declarations
├── components/
│   ├── auth/            # Auth forms, MFA settings, signout actions
│   ├── marketing/       # Hero stage, signal board, marketing effects
│   ├── product/         # Workbench panels, execution monitors, agent editor
│   ├── shell/           # Command menu, headers, footers, nav rails
│   └── blocks/          # Vendored component packs (Kometa, Preline, Flowbite)
│       ├── kometa/      # Marketing and editorial blocks
│       ├── preline/     # Workbench and product UI blocks
│       ├── flowbite/    # Feedback, upload, and media blocks
│       └── reveal.tsx   # Animation-on-scroll standard
```

---

## 10. Vendored Block Components

All 34 rendered pages utilize strictly typed block components mapped to the OKLCH token engine:

### 10.1 Kometa (Marketing & Editorial)
* `web/components/blocks/kometa/kometa-header.tsx`
* `web/components/blocks/kometa/kometa-footer.tsx`
* `web/components/blocks/kometa/kometa-hero.tsx`
* `web/components/blocks/kometa/kometa-features-grid.tsx`
* `web/components/blocks/kometa/kometa-steps.tsx`
* `web/components/blocks/kometa/kometa-pricing.tsx`
* `web/components/blocks/kometa/kometa-stats.tsx`
* `web/components/blocks/kometa/kometa-contact.tsx`
* `web/components/blocks/kometa/kometa-content.tsx`

### 10.2 Preline (Workbench & Controls)
* `web/components/blocks/preline/preline-login-card.tsx`
* `web/components/blocks/preline/preline-modal.tsx`
* `web/components/blocks/preline/preline-stepper.tsx`
* `web/components/blocks/preline/preline-tabs.tsx`
* `web/components/blocks/preline/preline-accordion.tsx`
* `web/components/blocks/preline/preline-table.tsx`
* `web/components/blocks/preline/preline-sidebar.tsx`
* `web/components/blocks/preline/preline-card.tsx`
* `web/components/blocks/preline/preline-stats-grid.tsx`

### 10.3 Flowbite (Feedback & Utilities)
* `web/components/blocks/flowbite/flowbite-breadcrumb.tsx`
* `web/components/blocks/flowbite/flowbite-pagination.tsx`
* `web/components/blocks/flowbite/flowbite-file-upload.tsx`
* `web/components/blocks/flowbite/flowbite-video.tsx`
* `web/components/blocks/flowbite/flowbite-badge.tsx`
* `web/components/blocks/flowbite/flowbite-progress.tsx`
* `web/components/blocks/flowbite/flowbite-timeline.tsx`
