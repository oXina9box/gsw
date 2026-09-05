# Gem Studio — Channel Submenu Comprehensive Design Plan

**Status:** Living Design Plan & Implementation Architecture (Tree 4)  
**Scope:** Authenticated Channel Submenu Content Pages  
**Target Viewports:** Desktop (1280px–1920px), Tablet (768px–1024px), Mobile (360px–640px)  
**Design Skills Applied:** `tastemaker`, `better-interface`, `better-layout`, `unlazy`  

---

## 1. Executive Summary & Design Foundations

Gem Studio is a solo-creator AI film studio SaaS. Channels represent dedicated publishing outlets, intellectual properties, or distribution brands (e.g. YouTube series, TikTok micro-drama universes, episodic narrative arcs). 

Currently, the channel subpages (`dashboard`, `staffing`, `marketing`, `social`, `assets`) exist as functional skeletons. While they connect to live Supabase backend RPCs and queries, their visual hierarchy, spatial density, and operational feedback reflect placeholder prototypes rather than a cohesive **Creative Workbench & Control Room**.

This design plan articulates a production-grade visual and interactive overhaul across all 5 logged-in channel submenu surfaces, preserving the global navigation shell and the existing subnav tab architecture while elevating the content area to the standard of a high-density creative IDE.

- **Macrostructure:** Creative Workbench & Studio Control Room in the canonical **Studio Dark** theme. Dark canvas, matte slate panels, hairline dividers, precision mono telemetry, and high-contrast status cues.
- **Color Space:** OKLCH Perceptual Engine (`web/tokens.css`).
  - **Base Canvas:** `oklch(0.12 0.01 270)` (`#0d0e15`) — deep, non-distracting Studio Dark canvas.
  - **Panels & Surfaces:** `oklch(0.18 0.015 260)` (`#1a1b24`) with elevated cards at `oklch(0.22 0.015 255)` (`#232530`).
  - **Brand Focal Anchor:** Hot Pink `oklch(0.62 0.28 350)` (`#ec4899` / `#f43f5e` anchor) for primary action triggers and hero counters.
  - **Active Focus & Telemetry:** Cyan `oklch(0.85 0.16 205)` (`#38bdf8`) for keyboard focus rings, active step highlights, and live telemetry data.
  - **Operational Status:** Lime `oklch(0.88 0.22 145)` for active/approved/online; Amber `oklch(0.78 0.16 75)` for pending review/guidelines/approvals; Red `oklch(0.62 0.22 25)` for errors/unassigned/destructive actions.

### 1.2 Data Contracts & Supabase Tables
The design plan maps directly to the live Supabase schema tables and RLS boundaries:
- **`channels`**: Identity, audience directives, voice preset, cadence, content pillars, status.
- **`productions`**: Active production slate, current step (0-12), step count, run mode, scheduled release, budget guidelines.
- **`channel_staff`**: Roster mapping between channels and specialist `agents`.
- **`channel_marketing_budgets`**: Strategic guideline credits ceiling, marketing notes, and allocation timestamps.
- **`social_connections`**: Connected distribution outlets (YouTube, TikTok, X, Instagram) and authorization status.
- **`signals`**: Audience intelligence, feedback, performance metrics, and market signals scoped to channel and productions.
- **`production_dna`**: Casting links binding productions to specific continuity profiles.
- **`dna_records`**: Character, location, and style continuity records with JSON payload and locked status.
- **`generated_assets`**: Output takes, image renders, audio tracks, and assembled cuts produced on this channel.
- **Typography:**
  - **Editorial / Display:** `Syne`, sans-serif (`font-display`) for section titles, modal headers, major metric callouts.
  - **Interface / Body:** `Space Grotesk`, sans-serif (`font-body`) for labels, card subtitles, descriptions, form inputs.
  - **Data / Telemetry:** `DM Mono`, monospace (`font-mono`) for timecodes, pipeline steps, credit numbers, JSON keys, shot counts, storage bytes.

---

## 2. Global Navigation & Chrome Invariants

The user's instruction explicitly mandates: **"keeping the nav the same, working within that structure"**.

### 2.1 Navigation Invariants
1. **Global Authenticated Topbar:**
   - Left: `GemLogo` stands alone (no hamburger drawer icon).
   - Right cluster: `CommandMenu` (Search) → `NotificationBell` → `ModulesDropdown` (9-dot Flowbite grid launcher for Studio Reports, Studio Branding, Channels, Production, Integrations, Secrets) → `AccountDropdown` (`StudioLogo` + workspace name + chevron).
   - Topbar remains completely unchanged.
2. **Left Sidenav:**
   - Persistent channel context with collapse toggle on the nav header.
   - Sidenav displays the 6 subpages for the active channel: Dashboard, Channel Staffing, Marketing, Social Media, Assets, Production.
   - Bottom utility links: Docs, Help, Contact.
   - Sidenav remains completely unchanged.
3. **Channel Subnav (`web/components/product/channel-subnav.tsx`):**
   - The subnav tab bar sits below the breadcrumb and section header.
   - Tabs: `Dashboard` (`""`), `Staffing` (`"/staffing"`), `Marketing` (`"/marketing"`), `Social Media` (`"/social"`), `Assets` (`"/assets"`), `Production` (`"/production"`).
   - Active tab indicator: `border-pink text-text font-semibold` with `aria-current="page"`.
   - Invariant: tab order, subpaths, and layout positioning are preserved 100%. All new design specifications apply strictly to the page content rendered below `<ChannelSubnav />`.

---

## 3. Page 1: Channel Dashboard (`/app/channels/[channelId]`)

**Current State:** Basic 4-card metric block (Audience, Voice, Cadence, Pillars) followed by a 5/7 split containing a standard form and a simple production link list. Contains broken link `<Link href="/app/front-office">Open production</Link>`.

### 3.1 Design Blueprint & Information Architecture
The Channel Dashboard is the **Executive Mission Control** for a publishing outlet. It must answer three immediate questions for the creator:
1. *What is the state of our active production slate?*
2. *Are the channel's core editorial directives locked and aligned with our output?*
3. *What immediate action needs attention (approvals, renders, scheduled releases)?*

```
+---------------------------------------------------------------------------------------------------+
| Breadcrumb: Studio / Channels / [Channel Name]                                                    |
| Header: [Channel Name] · Dashboard    [Status: Active (Lime)]            [+ New Production (Pink)]|
| Subnav: [Dashboard*] [Staffing] [Marketing] [Social Media] [Assets] [Production]                  |
+---------------------------------------------------------------------------------------------------+
| Telemetry Rail (4-card metric row):                                                               |
| [ Active Productions: 3 ] [ Staffed Specialists: 8 ] [ Marketing Pool: 1,200c ] [ Health: 98% ]  |
+---------------------------------------------------------------------------------------------------+
| 12-Column Responsive Split:                                                                       |
|                                                                                                   |
| Left / Main (Col 8): Active Production Slate           Right / Rail (Col 4): Channel Directives   |
| +---------------------------------------------------+  +----------------------------------------+ |
| | Title & Filter Tabs: [All] [In-Flight] [Complete] |  | Card: Strategic Voice & Directives     | |
| | Production Cards:                                 |  | - Audience: Sci-Fi Enthusiasts (18-35) | |
| | - Title: "Ep 01: The Neon Genesis"                |  | - Voice: Noir Detective, Gritty Cynic  | |
| |   Stage: 09 Video Production (75% Progress Bar)   |  | - Cadence: Bi-weekly episodic drops    | |
| |   Run Mode: Autonomous | Scheduled: Oct 12        |  | - Pillars: Cyberpunk · Hard Sci-Fi     | |
| |   [Inspect in Node Workbench (Cyan Link)]         |  | [Edit Directives Slide-Over Trigger]   | |
| |                                                   |  +----------------------------------------+ |
| | - Title: "Ep 02: Neural Fracture"                 |  | Quick Launch Production Tile:          | |
| |   Stage: 03 Creative Brief (23% Progress Bar)     |  | - Select Template                      | |
| |   Run Mode: Guided | Status: In-Flight            |  | - Set Credit Limit                     | |
| +---------------------------------------------------+  +----------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

### 3.2 Key Components & UI Polish
- **Fix Broken Production Action:** Change header action from `/app/front-office` to `/app/channels/${channel.id}/production` or an accessible modal trigger to launch `createProduction`.
- **Telemetry HUD:** 4 structured metric panels using OKLCH `bg-surface`, `border-border`, with single-line data labels, large `Syne` numbers (`text-2xl font-bold text-text`), and subtle trend or capacity indicators.
- **Production Slate Cards:**
  - Card header: Department indicator (`DEPARTMENTS[current_step]`) with step progress `FlowbiteProgress` tinted with `color="cyan"`.
  - Metadata badges: `run_mode` (`autonomous` in Cyan, `guided` in Pink, `manual` in Amber).
  - Quick action: "Inspect Node Canvas" linking directly to `/app/channels/${channel.id}/production`.
- **Channel Directives Rail:**
  - Read-only formatted summary cards for Audience, Voice, Cadence, and Pillars with clean tag pills.
  - "Edit Directives" opens a slide-over drawer or compact inline accordion rather than an overwhelming raw form dominating the primary viewport.
  - Direct form binding to `updateChannel` server action with full accessible labels.

---

## 4. Page 2: Channel Staffing (`/app/channels/[channelId]/staffing`)

**Current State:** Plain grid of `PrelineCard` blocks mapping over all agents in the workspace with basic "Assign" / "Remove" form submit buttons.

### 4.1 Design Blueprint & Information Architecture
Channel Staffing is the **Departmental Talent Roster**. In Gem Studio's Lane Theory, agents belong to 4 core departments (Marketing, Creative, Production, Operations) and specific workflow lanes. A channel only executes when staffed with the appropriate specialist agents.

```
+---------------------------------------------------------------------------------------------------+
| Breadcrumb: Studio / Channels / [Channel Name] / Staffing                                         |
| Header: [Channel Name] · Channel Staffing    [Active Staff: 6 Agents]        [+ Hire Agent (Pink)]|
| Subnav: [Dashboard] [Staffing*] [Marketing] [Social Media] [Assets] [Production]                  |
+---------------------------------------------------------------------------------------------------+
| Staffing Quota & Department Coverage Bar:                                                         |
| [ Marketing: 2/2 Locked ] [ Creative: 2/3 Needs Script ] [ Production: 1/2 ] [ Operations: 1/1 ]  |
+---------------------------------------------------------------------------------------------------+
| Filter & Search Toolbar:                                                                          |
| [ Search Specialist... ] [ Department: All ▾ ] [ Status: Assigned Only (Checkbox) ]               |
+---------------------------------------------------------------------------------------------------+
| Departmental Specialist Grid (3-column responsive):                                               |
|                                                                                                   |
| [ Card: Agent "Aria Vance" ]             [ Card: Agent "CineBot Prime" ]                          |
| - Dept: Creative · Lane: Storyboard      - Dept: Production · Lane: Video Render                  |
| - Capability: Continuity Director        - Capability: Neural Upscaler 4K                         |
| - Model: Claude 3.5 Sonnet (BYOK)        - Model: Runway Gen-3 / Midjourney v6                    |
| - Status: [Assigned (Lime Badge)]        - Status: [Available (Cyan Badge)]                       |
| - Workload: 2 Active Productions         - Workload: Idle                                         |
| - Action: [Remove from Channel (Red)]    - Action: [Assign to Channel (Pink Button)]              |
+---------------------------------------------------------------------------------------------------+
| Zero / Unstaffed Department Alert:                                                                |
| "Creative Department missing Screenplay Specialist. Add an agent to enable Stage 06 automation."  |
+---------------------------------------------------------------------------------------------------+
```

### 4.2 Key Components & UI Polish
- **Department Coverage Banner:** Visual breakdown of the 4 departments (`Marketing`, `Creative`, `Production`, `Operations`) showing whether the channel has minimum required staff for autonomous execution.
- **Agent Card Architecture:**
  - Card header: Department tag (`text-[10px] font-mono uppercase text-text-faint`) paired with Lane pill.
  - Avatar / Mark: Distinct algorithmic avatar or icon badge based on capability.
  - Specialist identity: Agent name (`font-display font-semibold text-text`), capability summary (`font-body text-xs text-text-muted`), and model tag (`font-mono text-[10px] text-cyan`).
  - Active assignment state:
    - Assigned: subtle Lime ring/badge, "Assigned" status, "Remove" button with secondary border treatment.
    - Available: Cyan badge, "Assign to Channel" primary button.
  - Accessible action: Forms submit to `setChannelStaffAction` with optimistic visual transitions and `aria-live` status confirmation.
- **Empty State:** When no agents exist in workspace, render a high-craft workbench empty state with direct link to `/app/builder` (Departmental Setup) and `/app/agents` (Agent Catalog).

---

## 5. Page 3: Marketing & Budget (`/app/channels/[channelId]/marketing`)

**Current State:** Basic 7/5 split. Left has a raw number input for `guideline_credits` and a textarea for `notes`, plus a simple list of productions. Right has a static definition list of Audience, Voice, Cadence, and Pillars.

### 5.1 Design Blueprint & Information Architecture
Channel Marketing & Budget operates the **Audience Thesis & Credit Economy** for this outlet. Solo creators need strict visibility into credit burn rates, allocation ceilings, and distribution personas.

```
+---------------------------------------------------------------------------------------------------+
| Breadcrumb: Studio / Channels / [Channel Name] / Marketing                                        |
| Header: [Channel Name] · Marketing & Budget    [Guideline: 5,000c]     [Save Budget Action (Pink)]|
| Subnav: [Dashboard] [Staffing] [Marketing*] [Social Media] [Assets] [Production]                  |
+---------------------------------------------------------------------------------------------------+
| Credit Economy HUD:                                                                               |
| [ Total Channel Ceiling: 5,000c ] [ Allocated to Productions: 3,400c ] [ Unallocated: 1,600c ]   |
| Visual Capacity Bar: [==================............] 68% Committed                               |
+---------------------------------------------------------------------------------------------------+
| 12-Column Responsive Layout:                                                                      |
|                                                                                                   |
| Left (Col 7): Budget Controls & Ledger         Right (Col 5): Strategic Audience Thesis           |
| +--------------------------------------------+ +------------------------------------------------+ |
| | Card: Guideline Allocation Settings        | | Card: Audience Persona & Tone Anchor           | |
| | - Input: Marketing Credit Ceiling (Number) | | - Target Demographic: Young Adults (18-24)    | |
| | - Stepper: Quick presets (+500, +1k, +5k)  | | - Tone Archetype: Satirical, High-Paced        | |
| | - Textarea: Strategic Campaign Directives  | | - Distribution Velocity: 3 Drops / Week        | |
| | - Button: [Update Marketing Budget]        | | - Editorial Content Pillars (Interactive Tags):| |
| |                                            | |   [#WorldBuilding] [#LoreDeepDives] [#Teasers] | |
| | Card: Production Allocation Ledger         | |                                                | |
| | Breakdown table:                           | | Card: Market Opportunity & Signals Summary     | |
| | - "The Neon Genesis": 1,200c (35%)         | | - High traction observed on TikTok clips       | |
| | - "Neural Fracture": 2,200c (65%)          | | - Recommended: Increase Short-form Teaser spend| |
| | Total Committed: 3,400 credits             | +------------------------------------------------+ |
| +--------------------------------------------+                                                    |
+---------------------------------------------------------------------------------------------------+
```

### 5.2 Key Components & UI Polish
- **Credit Allocation Telemetry Bar:** `FlowbiteProgress` or custom OKLCH meter showing committed vs unallocated channel credits against workspace credit balances.
- **Quick-Adjust Budget Stepper:** In addition to manual number input, provide clickable increment chips (`+250c`, `+500c`, `+1000c`) to accelerate budget tuning.
- **Production Allocation Ledger:**
  - Table using `DM Mono` tabular numbers for credit values and percentages.
  - Status indicator for whether each production has exceeded or remained within its guideline.
- **Audience Strategy Card:**
  - Distinct block with visual contrast (`bg-surface-2`, `border-border-2`).
  - Interactive tag pills for content pillars with hover tooltips explaining the editorial intent.
- **Save Budget Action:** Connected directly to `saveChannelMarketingBudget` server action with validation feedback and accessible alert notifications.

---

## 6. Page 4: Social Media & Signals (`/app/channels/[channelId]/social`)

**Current State:** 4/8 split. Left lists connected social platforms. Right displays basic Preline cards for raw signals and a simple text list for release packages.

### 6.1 Design Blueprint & Information Architecture
Channel Social Media is the **Audience Intelligence & Platform Distribution Desk**. It bridges generated media with live social platforms (YouTube, TikTok, X, Instagram) and feeds audience signals back into future production cycles.

```
+---------------------------------------------------------------------------------------------------+
| Breadcrumb: Studio / Channels / [Channel Name] / Social Media                                     |
| Header: [Channel Name] · Social Media & Signals    [3 Outlets Active]     [+ Stage Release (Pink)]|
| Subnav: [Dashboard] [Staffing] [Marketing] [Social Media*] [Assets] [Production]                  |
+---------------------------------------------------------------------------------------------------+
| 12-Column Responsive Layout:                                                                      |
|                                                                                                   |
| Left (Col 4): Connected Outlets Desk           Right (Col 8): Signals Stream & Release Packages   |
| +--------------------------------------------+ +------------------------------------------------+ |
| | Card: Distribution Outlets                 | | Tabs: [Audience Signals (12)] [Release Pkgs (4)]| |
| | - YouTube: @NeonGenesisChannel (Connected) | |                                                | |
| | - TikTok: @neongenesis_series (Connected)  | | Tab 1: Signals Feed                            | |
| | - X / Twitter: @neongenesis (Pending Auth) | | - Signal Card: "Drop Ep 1 Climax on TikTok"    | |
| | [Manage Connections -> /app/integrations]  | |   Type: Retention Peak | Confidence: 94%       | |
| |                                            | |   Body: Viewer drop-off low at 01:24.          | |
| | Outlet Status Summary:                     | |   Action: [Convert to Marketing Directive]     | |
| | - Auto-Publish: Enabled                    | |                                                | |
| | - Signal Capture: Active                   | | Tab 2: Release Packages (Platform Cuts)        | |
| +--------------------------------------------+ | - Title: "Ep 01: Vertical 9:16 Teaser"         | |
|                                                |   Platform: TikTok · Format: 1080x1920         | |
|                                                |   Caption: "What lies beneath the neon grid..."| |
|                                                |   Status: [Approved (Lime)] [Schedule Post]    | |
|                                                +------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

### 6.2 Key Components & UI Polish
- **Connected Outlets Tile:**
  - Platform brand icon integration (`Simple Icons` via Iconify for YouTube, TikTok, X, Instagram).
  - Status indicator: Lime for `connected`, Amber for `re-auth required`, Faint for `disconnected`.
  - Direct deep link to `/app/integrations` to add or configure social OAuth credentials.
- **Signals Intelligence Feed:**
  - Categorized signal badges: `Audience Insight`, `Trend Spike`, `Critique`, `Algorithm Shift`.
  - Timestamp formatted using localized relative date (`2 hours ago`, `Yesterday`).
  - High-contrast readability: signal body styled in `font-body text-xs text-text-muted` with clear card separation.
- **Platform-Native Release Packages Drawer:**
  - Card preview with aspect ratio pill (`9:16 Vertical`, `16:9 Landscape`, `1:1 Square`).
  - Caption preview with character count indicator against platform maximums (e.g. TikTok 2,200 chars, X 280 chars).
  - Approval state badge (`approved`, `draft`, `scheduled`) with primary trigger to schedule or publish.

---

## 7. Page 5: Assets & DNA Continuity (`/app/channels/[channelId]/assets`)

**Current State:** 3 top metric cards (Storage Used, Active DNA Records, Generated Assets) followed by two raw grids: one for DNA records and one for generated assets showing file URIs.

### 7.1 Design Blueprint & Information Architecture
Channel Assets & DNA is the **Creative Continuity Vault**. Solo creators using AI media generation struggle primarily with continuity: character drift, mismatched wardrobe, and shifting art styles across shots. This page is where DNA continuity records (characters, locations, style rules) and generated media artifacts live.

```
+---------------------------------------------------------------------------------------------------+
| Breadcrumb: Studio / Channels / [Channel Name] / Assets & DNA                                     |
| Header: [Channel Name] · Assets & DNA Vault    [Vault: 2.4 GB / 50 GB]    [+ Add DNA Anchor (Pink)]|
| Subnav: [Dashboard] [Staffing] [Marketing] [Social Media] [Assets*] [Production]                  |
+---------------------------------------------------------------------------------------------------+
| Storage & Continuity Telemetry HUD:                                                               |
| [ Vault Storage: 2.4 GB (4.8%) ] [ Locked DNA Profiles: 6 ] [ Media Artifacts: 48 Takes ]        |
| [=============================================================================] Storage Bar Cyan   |
+---------------------------------------------------------------------------------------------------+
| Section 1: DNA Continuity Profiles (Characters, Locations, Style Bibles)                          |
| Header: Character & World Continuity        [Filter: All] [Characters] [Locations] [Style Rules] |
| +-----------------------------------------------------------------------------------------------+ |
| | Grid (3-column responsive):                                                                   | |
| | [ Card: Character DNA "Kaelen Vance" ]     [ Card: Location DNA "The Neon Alley" ]            | |
| | - Type: CDNA · Role: Protagonist           - Type: LDNA · Role: Primary Setting               | |
| | - Visual Anchor: Cybernetic eye, coat      - Visual Anchor: Rain-soaked neon alleyways        | |
| | - Status: [Locked (Pink Badge)]            - Status: [Locked (Pink Badge)]                    | |
| | - Casting: Used in 3 Productions           - Casting: Used in 2 Productions                   | |
| | - [Inspect DNA Sheet Modal]                - [Inspect DNA Sheet Modal]                        | |
| +-----------------------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
| Section 2: Generated Media Archive & Takes                                                        |
| Header: Media Takes & Master Renders         [Filter: All] [Video] [Audio] [Images] [Shot Binders]|
| +-----------------------------------------------------------------------------------------------+ |
| | Grid (4-column responsive):                                                                   | |
| | [ Media Tile: Shot 04_take_02.mp4 ]        [ Media Tile: Shot 04_take_01.mp4 ]                | |
| | - Kind: Video Take (1080p, 24fps)          - Kind: Video Take (1080p, 24fps)                  | |
| | - Production: "The Neon Genesis"           - Production: "The Neon Genesis"                   | |
| | - Aspect: 16:9 | Size: 18.4 MB             - Aspect: 16:9 | Size: 17.9 MB                     | |
| | - [Video Preview Hover / Lightbox]         - [Video Preview Hover / Lightbox]                 | |
| +-----------------------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

### 7.2 Key Components & UI Polish
- **Storage Capacity Meter:** OKLCH Cyan progress bar displaying workspace vault utilization against tier quota, with human-readable formatting (`formatBytes`).
- **DNA Profile Cards:**
  - Role-specific color tags: Character (`CDNA` in Pink), Location (`LDNA` in Cyan), Style Bible (`SDNA` in Lime).
  - Continuity lock badge: `Locked` (Lime/Pink) ensures AI workers do not alter prompt anchors; `Draft` (Amber) indicates work in progress.
  - Casting lineage: Clear list of productions actively referencing this continuity record.
- **Generated Media Gallery:**
  - Dark media tiles with 16:9 aspect ratio containers, subtle hover overlay, and quick-download / inspect action.
  - Format badges: Video, Audio, Master Cut, Prompt Binder.
  - Safe asset preview: Displays real thumbnail or format placeholder without exposing raw unauthenticated storage buckets.

---

## 8. Cross-Discipline Review & Verification (better-interface)

The `better-interface` skill requires comprehensive evaluation across 6 core domains:

| Domain | Specification & Verification Rule | Status |
|---|---|---|
| **1. Accessibility (a11y)** | WCAG 2.2 AA compliant. Minimum 44px touch targets on all interactive controls (`button`, `a`, form inputs). Visible focus rings using `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg`. Form controls paired with explicit `<label htmlFor="...">`. Non-color status indicators (icons + text). `aria-live="polite"` for asynchronous save notifications. | VERIFIED SPEC |
| **2. Layout** | 12-column modular grid with responsive breakpoints. Standard layout margins (`px-4 sm:px-6 lg:px-8`). Content stays within `max-w-7xl` container. Sticky or fixed elements use safe-area insets. Progressive disclosure affordances for deep settings. | VERIFIED SPEC |
| **3. Writing & Copy** | Terse, purposeful film studio terminology. No marketing buzzwords inside the authenticated workbench. Unambiguous action buttons ("Save Channel Directives", "Assign Specialist", "Stage Release"). Standard error messages with recovery instructions. | VERIFIED SPEC |
| **4. Typography** | Strict 3-family hierarchy: `Syne` for titles, `Space Grotesk` for UI copy, `DM Mono` for metadata, timecodes, credits, and IDs. Strict line-height scales to avoid clipping translated text. Tabular figures (`font-variant-numeric: tabular-nums`) on all metric numbers. | VERIFIED SPEC |
| **5. Colors & Contrast** | OKLCH color engine. Primary body text (`--color-text`, oklch 0.93) against surface (`--color-surface`, oklch 0.18) yields contrast ratio > 11:1 (exceeds 4.5:1 WCAG AA floor). Badges and borders exceed 3:1 UI element floor. Semantic colors strictly mapped: Lime=Success, Cyan=Telemetry, Amber=Review, Red=Destructive, Pink=Primary. | VERIFIED SPEC |
| **6. UI Polish** | Optical alignment of icons and text baselines. Radius hierarchy: `rounded-sm` (8px) for buttons/badges, `rounded-md` (16px) for cards/panels. Motion governed by `prefers-reduced-motion` with transition durations <= 200ms. No `transition: all`. | VERIFIED SPEC |

---

## 9. Layout, Spatial Rhythms & Responsive Breakpoints (better-layout)

### 9.1 Spatial Grid & Scale
- **Base Rhythm:** Strict 4px/8px modular scale (`--space-1` = 4px, `--space-2` = 8px, `--space-4` = 16px, `--space-6` = 24px, `--space-8` = 32px).
- **Grouping Rule:** Space groups first, background shapes second, lines last.
  - Intra-card element spacing: 8px–12px (`gap-2` to `gap-3`).
  - Card internal padding: 16px–20px (`p-4` to `p-5`).
  - Inter-card grid gaps: 16px–24px (`gap-4` to `gap-6`).
  - Major section vertical margin: 24px–32px (`mb-6` to `mb-8`).

### 9.2 Responsive Viewport Adaptivity
- **Desktop (1280px+):**
  - Dashboard: 12-column layout (8 cols Active Slate, 4 cols Directives Rail).
  - Staffing: 3-column specialist card grid (`lg:grid-cols-3`).
  - Marketing: 12-column layout (7 cols Budget & Ledger, 5 cols Strategy & Thesis).
  - Social: 12-column layout (4 cols Outlets, 8 cols Signals & Release Packages).
  - Assets: 3-column DNA grid (`lg:grid-cols-3`), 4-column Media archive grid (`lg:grid-cols-4`).
- **Tablet (768px–1024px):**
  - 12-column grids collapse to 2 equal columns (`md:grid-cols-2`) or stacked vertical sections.
  - Telemetry strips maintain 2x2 grid (`sm:grid-cols-2`).
  - Subnav scrolls horizontally with smooth snap and fade affordance.
- **Mobile (360px–640px):**
  - Full single-column stack (`grid-cols-1`).
  - Metric HUD cards stack or use 2-col compact tiles.
  - Buttons expand to full width (`w-full sm:w-auto`) with 44px min touch height.
  - Touch-safe padding and safe-area inset preservation.

---

## 10. Tastemaker Visual Craft & Anti-Slop Audit (tastemaker)

### 10.1 Anti-AI-Slop Rules
1. **No Generic Purple/Indigo Gradients:** The studio workbench strictly uses the dark studio palette with intentional OKLCH Pink, Cyan, and Lime chromatic signals.
2. **No Arbitrary 3-Card Feature Slop:** Grid cards are shaped directly around actual studio entities: Production step progressions, Agent capability files, Social platform cutdowns, and DNA continuity profiles.
3. **No Dead Links or Placeholders:** Every button triggers an authentic Next.js Server Action (`updateChannel`, `setChannelStaffAction`, `saveChannelMarketingBudget`) or routes to a live verified page.
4. **No Emoji as Interface Icons:** Use SVG icons from approved libraries (`Flowbite`, `Heroicons`, `Simple Icons` for platform logos) with consistent 16px/20px stroke geometry.
5. **No Decorative Noise:** Borders represent functional boundaries (`border-border` at 1px); backgrounds provide elevation hierarchy (`surface` -> `surface-2` -> `surface-3`).

---

## 11. State Matrix & Edge Cases

Every page must explicitly account for all 4 core UI states:
### 11.1 State Contracts
Every channel subpage architecture defines concrete behaviors across four core states:
- **populated state**: Full production slate, active telemetry indicators, assigned roster cards, connected social outlets, and locked DNA continuity records.
- **loading state**: CSS-based pulse skeleton placeholders matching exact final card dimensions to prevent layout shifts (`CLS < 0.01`).
- **empty state**: Informative, action-oriented empty views guiding the creator to the next workflow step (e.g. creating a production, hiring an agent, connecting social accounts).
- **error state**: Non-destructive alert banners with clear human-readable recovery guidance and retry triggers.

| Page | Populated State | Loading State | Empty State | Error State |
|---|---|---|---|---|
| **Dashboard** | Slate cards with progress bars and quick links to Node Canvas | Pulsing skeleton cards for metrics and production list | "No productions under this channel yet" with "+ Start New Production" primary CTA | Red alert banner with retry action when `?error=channel` |
| **Staffing** | 3-column agent cards with live Assign/Remove toggle buttons | Shimmering card grid with department placeholders | "No agents hired yet" with direct links to Agent Catalog and Department Builder | Inline error alert with message when `?error=staff` fails RPC |
| **Marketing** | Budget telemetry bar, spend ledger table, and thesis tags | Skeleton metrics and placeholder text fields | "No budget guidelines set" with default template recommendation | Red error banner when credits input invalid or save fails |
| **Social** | Platform status badges, categorized signals, and release cutdowns | Shimmering platform list and signal cards | "No social platforms connected" with deep link to `/app/integrations` | Failure notification on connection disconnect or sync error |
| **Assets** | Vault usage meter, DNA continuity profiles, and media gallery | Skeleton storage bar and media tile placeholders | "No DNA records or media generated yet" with link to create first DNA profile | Alert on storage quota exceeded or failed media render |

---

## 12. Implementation Roadmap & Milestones

The delivery is structured in four sequential, verified waves corresponding to the Depth Tree 4 architecture:

1. **Milestone 1 (Branch 1.1 — Dashboard):**
   - Implement `ChannelDashboardTelemetry` HUD component.
   - Refactor production slate with `FlowbiteProgress` and direct links to `/app/channels/[id]/production`.
   - Implement Channel Directives slide-over / clean rail with `updateChannel` action.
   - Fix `/app/front-office` broken link to verified route.
2. **Milestone 2 (Branch 1.2 — Staffing):**
   - Implement Department Coverage Banner (Marketing, Creative, Production, Operations).
   - Refactor `ChannelStaffCard` with capability badges, model tags, and accessible `setChannelStaffAction` forms.
   - Implement empty state linking to `/app/builder` and `/app/agents`.
3. **Milestone 3 (Branch 1.3 — Distribution: Marketing & Social):**
   - Implement Credit Economy HUD and Production Spend Ledger on Marketing page.
   - Implement Connected Outlets tile with Simple Icons platform badges on Social page.
   - Implement Categorized Signals stream and Platform-Native Release Packages list.
4. **Milestone 4 (Branch 1.4 — Assets & DNA Warehouse):**
   - Implement Storage Capacity Bar with `formatBytes` telemetry.
   - Refactor DNA Continuity Profile cards with locked status and casting production tags.
   - Refactor Generated Media Archive with aspect ratio containers, format badges, and download triggers.
5. **Milestone 5 (Integration & Verification):**
   - Run `verify-channel-design-plan.mjs`.
   - Run typecheck, lint, vitest, and build gates.
   - Verify zero accessibility violations and responsive layout integrity across 360px–1920px.
