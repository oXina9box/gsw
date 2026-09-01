# Gem Studio — Template Book & UI/UX Design System Specification

**Status:** Canonical Living Design Specification  
**Architecture:** Next.js App Router (React 19, Strict TypeScript), Tailwind CSS / Vanilla CSS Variables, OKLCH Color Engine  
**Theme:** Studio Dark (Marquee Hero macrostructure, Anchor Hue: 350 Pink, Focus: Cyan)  
**Accessibility:** WCAG 2.2 AA Compliant  

---

## 1. Design Philosophy & Core Principles

Gem Studio is a solo-creator AI film studio SaaS. The interface reflects an authentic, high-density **Creative Workbench & Control Room** rather than generic enterprise SaaS.

### Core Visual Principles
1. **Density with Legibility:** Maximized information density for film production workflows (timeline, lanes, shot binders, logs) without visual clutter.
2. **True Studio Dark Palette:** Built with OKLCH color space for perceptually uniform lightness, deep neutral blacks, subtle slate surfaces, and targeted chromatic signals.
3. **Intentional Accent Signals:**
   * **Hot Pink (`oklch(0.62 0.28 350)`):** Primary brand anchor, primary action triggers (`.button-primary`), hero focal points.
   * **Cyan (`oklch(0.85 0.16 205)`):** Active focus outlines (`:focus-visible`), telemetry, featured plans (`.pricing-card-featured`), active step gates.
   * **Lime (`oklch(0.88 0.22 145)`):** Success states, completed jobs (`.status-mark.completed`), active online workers, verified rights.
   * **Amber (`oklch(0.78 0.16 75)`):** Warning thresholds, approval gates, pending human review, quota notices (`.notice`).
   * **Red (`oklch(0.62 0.22 25)`):** Errors, destructive operations (`.danger-button`, `.danger-panel`), quota depletion, failed generation steps.
4. **Zero Decorative Noise:** Every border, line, badge, and glow represents an operational state, production status, or interactive boundary. Connected 1px borders replace floating island cards with drop shadows.

---

## 2. Design Token System

All tokens are declared in `web/tokens.css` and imported globally in `web/app/globals.css`.

### 2.1 Color Palette (OKLCH Engine)

```css
:root {
  /* Surface Layers */
  --color-bg: oklch(0.12 0.01 270);         /* Deep Canvas Base */
  --color-surface: oklch(0.18 0.015 260);    /* Card & Container Surface */
  --color-surface-2: oklch(0.22 0.015 255);  /* Elevated Panels & Rail */
  --color-surface-3: oklch(0.27 0.015 250);  /* Interactive Items / Hover */

  /* Text Contrast Hierarchy */
  --color-text: oklch(0.93 0.005 260);      /* Primary High-Contrast Text */
  --color-text-muted: oklch(0.68 0.01 260);  /* Body & Label Text */
  --color-text-faint: oklch(0.58 0.01 260);  /* Placeholder & Metadata */

  /* Structural Borders & Hairlines */
  --color-border: oklch(0.38 0.01 260);      /* Standard Element Separation */
  --color-border-2: oklch(0.36 0.015 255);   /* Subtle Inner Border */
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

| Token | Font Family | Usage |
| :--- | :--- | :--- |
| `--font-display` | `'Syne', 'Space Grotesk', sans-serif` | Editorial headlines, landing hero, module banners, major section titles (`h1`-`h3`). Tight tracking (`-0.04em` to `-0.06em`). Never in body or buttons. |
| `--font-body` | `'Space Grotesk', system-ui, sans-serif` | Core interface text, form controls, card titles, navigation items, ledes (max `44rem`). |
| `--font-mono` | `'DM Mono', ui-monospace, monospace` | Data tables, timecodes, JSON contracts, shot IDs, token counts, log streams, eyebrows, kickers, status tags. |

### 2.3 Spatial Scale & Radii

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

---

## 3. Shell Architecture & Core System (Invariants)

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

### 3.1 Shell Invariants
1. **Universal Container**: All page content is wrapped in `<main id="main-content">` inside `<div className="shell">` (`width: min(100% - 3rem, 88rem); margin-inline: auto;`).
2. **Universal Footer**: `<SiteFooter />` (`.site-footer`) renders identically on every public, authenticated, and account route. Never customized or hidden.
3. **Header A (Logged Out / Public)**: `<SiteHeader />` (`.site-header`) with N5 floating pill container, GemLogo, 5 public links (`/studio`, `/system`, `/docs`, `/pricing`, `/portfolio`), and Auth action buttons.
4. **Header B (Logged In / Product)**: `<StudioNav />` (`.studio-header`) with studio dot, workspace title, `.studio-nav` module tabs (Front Office, Studio, Account), and `.studio-subnav` page tabs.

---

## 4. Template Book & Archetype Taxonomy

All routes must strictly select and implement one of the following canonical archetypes.

### 4.1 CORE A: Logged Out / Public Pages (`.site-header`)

#### Archetype A1: Marketing Flagship & Detail Showcase
* **Mapped Routes**: `/`, `/studio`, `/system`, `/social-workshop`, `/gallery`, `/portfolio`, `/pricing`, `/core-values`, `/do-not-click`
* **Block Composition Contracts**:
  * `/` (Home): Inline Marquee Hero (Eyebrow + Syne H1 + Lede + Actions) → `KometaC2Section` → `KometaStepSection` → `PrelineVerticalMarquee` → `FlowbiteCtaSection`.
  * `/studio`: `KometaC4Section` → `KometaF2Section` → `KometaC1Section`.
  * `/system`: `KometaF1Section` → `KometaC5Section` → `FlowbiteCtaSection`.
  * `/social-workshop`: `KometaF1Section` → `KometaC3Section`.
  * `/gallery`: `KometaC1Section` → `KometaC4Section`.
  * `/portfolio`: `KometaC1Section` → `KometaC4Section`.
  * `/pricing`: `KometaC2Section` → `KometaC3Section` → `KometaStepSection`.
  * `/core-values`: `KometaC2Section` → `KometaF2Section` (gated behind `SITE_CONTENT_APPROVED`).
  * `/do-not-click`: Unlisted Easter Egg (`FlowbiteVideo` + YouTube iframe).

#### Archetype A2: Documentation & Authentication Split Gateways
* **Variant A2-A (Docs Portal — `/docs`)**:
  * `KometaC3Section` (4 core manual spotlight cards) → `KometaC5Section` (system guide index).
* **Variant A2-B (Contact Gateway — `/contact`)**:
  * `KometaContact` (Support & Inquiries header + contact details + interactive message form).
* **Variant A2-C (Split Auth Gateways — `/login`, `/forgot-password`, `/reset-password`, `/verify-email`, `/mfa`)**:
  * `PrelineSplitAuth` (Left: 5 cols with tagline, Syne headline, honest `—` metric rows; Right: 7 cols with title, subtitle, auth form, and helper links).
* **Variant A2-D (Legal Documents — `/terms`, `/privacy`)**:
  * `LegalDocument` viewer component (gated behind `SITE_CONTENT_APPROVED`).
---

### 4.2 CORE B: Logged In / Product Pages (`.studio-header`)

#### Core B1: Front Office (Control & Operations)
* **Mapped Routes**: `/app`, `/app/channels`, `/app/marketing`, `/app/social`, `/app/staffing`, `/app/front-office`
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
* **Mapped Routes**: `/app/studio`, `/app/productions/[id]`, `/app/builder`, `/app/universe`, `/app/universe/[id]`, `/app/assets`, `/app/orchestration`, `/app/agents`
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
* **Mapped Routes**: `/account`, `/app/billing`, `/app/integrations`, `/app/onboarding`
* **Variant B3-A (Settings & Security — `/account`, `/app/onboarding`)**:
  * `Slot 1 (Header)`: `Syne` H1 + `Space Grotesk` lede.
  * `Slot 2 (Panels Stack)`: Vertical stack of `.panel` containers holding standard `.stack-form` inputs.
  * `Slot 3 (Danger Zone)`: Bottom `.panel.danger-panel` with red border for key revocation or workspace deletion.
* **Variant B3-B (Vault & Billing Ledger — `/app/billing`, `/app/integrations`)**:
  * `Slot 1 (Header)`: `Syne` H1 + usage overview.
  * `Slot 2 (Ledger / Connections)`: 2-up `.credit-hero` (Available vs Reserved) + connected `.connection-list` (provider rows with masked secrets, capabilities, and `.status-mark`).
  * `Slot 3 (Revocation)`: Confirmation dialogs for credential rotation or disconnection.

---

## 5. Strict Anti-Patterns & Validation Gates

1. **Font Role Inversion**: `Syne` is forbidden in body copy, buttons, inputs, and tables (Headings only). `Space Grotesk` is forbidden in data numbers and status tags (`DM Mono` only).
2. **Uncontained Width**: Every page must be contained inside `.shell` (`88rem`) or `.reading-page` (`58rem`). Zero marginless full-bleed content except intentionally styled horizontal tickers.
3. **Floating Island Cards**: Never create detached rounded cards with standard drop shadows. Always use connected 1px border grids (`border-top/left` on parent, `border-right/bottom` on children) with `--color-surface` fills.
4. **Un-tokenized Colors**: Never use raw hex/RGB. Colors strictly constrained to Pink (`350`), Cyan (`205`), Lime (`145`), Amber (`75`), and Red (`25`).
5. **Custom Header/Footer**: Never create custom headers or footers inside page routes. All pages use `<SiteFooter />` and either `<SiteHeader />` (Core A) or `<StudioNav />` (Core B).

---

## 6. Block Component System & Pack Mapping

All page presentation layers are assembled from strictly typed, tokenized block components in `web/components/blocks/`.

### 6.1 Kometa Design System (Marketing & Editorial)
* **Kometa Header (`kometa-header.tsx`)**: Responsive dark header with backdrop blur and token navigation links.
* **Kometa Footer (`kometa-footer.tsx`)**: 5-column editorial footer with status badge and legal attribution.
* **Kometa Hero (`kometa-hero.tsx`)**: Editorial flagship hero section with eyebrow, headline, lede, and actions.
* **Kometa Features Grid (`kometa-features-grid.tsx`)**: Connected 2x2 or 3x3 matrix with mono numbers and chromatic signals.
* **Kometa Steps (`kometa-steps.tsx`)**: Multi-stage production timeline and execution workflow.
* **Kometa Pricing (`kometa-pricing.tsx`)**: Tier comparisons with cyan highlight for featured pro editions.
* **Kometa Stats (`kometa-stats.tsx`)**: KPI metric counters with tabular numbers and trend delta indicators.
* **Kometa Contact (`kometa-contact.tsx`)**: Split contact card with coordinate details and form slot.
* **Kometa Content (`kometa-content.tsx`)**: Editorial showcase and master reel teaser grids.

### 6.2 Preline UI (Workbench & Product)
* **Preline Login Card (`preline-login-card.tsx`)**: Centered authentication gateway container.
* **Preline Modal (`preline-modal.tsx`)**: Accessible dialog with focus trapping and backdrop blur.
* **Preline Stepper (`preline-stepper.tsx`)**: Step progress bar for onboarding and pipeline status.
* **Preline Tabs (`preline-tabs.tsx`)**: Accessible module tabs and page subnavigation.
* **Preline Accordion (`preline-accordion.tsx`)**: Expandable department and inspector panels.
* **Preline Table (`preline-table.tsx`)**: High-density data tables for ledgers and rosters.
* **Preline Sidebar (`preline-sidebar.tsx`)**: Sticky documentation and workspace navigation.
* **Preline Card (`preline-card.tsx`)**: Workbench panel with header, status pill, and action menu.
* **Preline Stats Grid (`preline-stats-grid.tsx`)**: 4-up telemetry and credit burn rate grid.

### 6.3 Flowbite (Interactive Feedback & Utilities)
* **Flowbite Breadcrumb (`flowbite-breadcrumb.tsx`)**: Hierarchical breadcrumb navigation trails.
* **Flowbite Pagination (`flowbite-pagination.tsx`)**: Accessible pagination controls for docs and catalogs.
* **Flowbite File Upload (`flowbite-file-upload.tsx`)**: Drag-and-drop shot file and take uploader.
* **Flowbite Video (`flowbite-video.tsx`)**: Responsive video playback container with ambient border.
* **Flowbite Badge (`flowbite-badge.tsx`)**: Chromatic status marks (`lime`, `cyan`, `pink`, `amber`, `red`).
* **Flowbite Progress (`flowbite-progress.tsx`)**: Linear percentage progress indicator.
* **Flowbite Timeline (`flowbite-timeline.tsx`)**: Vertical execution stream and audit logs.
