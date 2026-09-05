# Gem Studio — Channel Submenu Comprehensive Design Plan

**Status:** Living Design Plan & Implementation Architecture (Tree 4)  
**Scope:** Authenticated Channel Submenu Content Pages  
**Target Viewports:** Desktop (1280px–1920px), Tablet (768px–1024px), Mobile (360px–640px)  
**Design Skills Applied:** `tastemaker`, `better-interface`, `better-layout`, `unlazy`  

---

## 1. Executive Summary & Design Foundations

Gem Studio is a solo-creator AI film studio SaaS. Channels represent dedicated publishing outlets, intellectual properties, or distribution brands (e.g. YouTube episodic series, TikTok micro-drama universes, cinematic narrative arcs). 

At the end of the day, Gem Studio executes two fundamental responsibilities:
1. **Pre-Production & World-Building:** Creating and structuring everything that goes into making a movie (strategic thesis, lore, characters, locations, budgets, scripts, marketing, audience research).
2. **Production & Execution:** Actually making and distributing that movie across the 13-stage pipeline to final release cuts.

This design plan articulates a production-grade visual and interactive overhaul across all logged-in channel submenu surfaces, preserving the global navigation shell and the existing subnav tab architecture while elevating the content area to the standard of a high-density creative IDE.

### 1.1 Core Aesthetic Architecture (tastemaker)
- **Macrostructure:** Creative Workbench & Studio Control Room in the canonical **Studio Dark** theme. Dark canvas, matte slate panels, hairline dividers, precision mono telemetry, and high-contrast status cues.
- **Color Space:** OKLCH Perceptual Engine (`web/tokens.css`).
  - **Base Canvas:** `oklch(0.12 0.01 270)` (`#0d0e15`) — deep, non-distracting Studio Dark canvas.
  - **Panels & Surfaces:** `oklch(0.18 0.015 260)` (`#1a1b24`) with elevated cards at `oklch(0.22 0.015 255)` (`#232530`).
  - **Brand Focal Anchor:** Hot Pink `oklch(0.62 0.28 350)` (`#ec4899` / `#f43f5e` anchor) for primary action triggers and hero counters.
  - **Active Focus & Telemetry:** Cyan `oklch(0.85 0.16 205)` (`#38bdf8`) for keyboard focus rings, active step highlights, and live telemetry data.
  - **Operational Status:** Lime `oklch(0.88 0.22 145)` for active/approved/online; Amber `oklch(0.78 0.16 75)` for pending review/guidelines/approvals; Red `oklch(0.62 0.22 25)` for errors/unassigned/destructive actions.
- **Typography:**
  - **Editorial / Display:** `Syne`, sans-serif (`font-display`) for section titles, modal headers, major metric callouts.
  - **Interface / Body:** `Space Grotesk`, sans-serif (`font-body`) for labels, card subtitles, descriptions, form inputs.
  - **Data / Telemetry:** `DM Mono`, monospace (`font-mono`) for timecodes, pipeline steps, credit numbers, JSON keys, shot counts, storage bytes.

### 1.2 Data Contracts & Supabase Tables
The design plan maps directly to live Supabase schema tables and RLS boundaries:
- **`channels`**: Identity, audience directives, voice preset, cadence, content pillars, status.
- **`productions`**: Active production slate, current step (0-12), step count, run mode, scheduled release, budget guidelines.
- **`channel_staff`**: Roster mapping between channels and specialist `agents`.
- **`channel_marketing_budgets`**: Strategic guideline credits ceiling, marketing notes, and allocation timestamps.
- **`social_connections`**: Connected distribution outlets (YouTube, TikTok, X, Instagram, Facebook, Discord, Telegram, Snapchat) and authorization status.
- **`signals`**: Audience intelligence, feedback, performance metrics, and market signals scoped to channel and productions.
- **`production_dna`**: Casting links binding productions to specific continuity profiles.
- **`dna_records`**: Character, location, and style continuity records with JSON payload and locked status.
- **`generated_assets`**: Output takes, image renders, audio tracks, and assembled cuts produced on this channel.

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
   - Sits below the breadcrumb and section header.
   - Tabs: `Dashboard` (`""`), `Staffing` (`"/staffing"`), `Marketing` (`"/marketing"`), `Social Media` (`"/social"`), `Assets` (`"/assets"`), `Production` (`"/production"`).
   - Active tab indicator: `border-pink text-text font-semibold` with `aria-current="page"`.
   - Invariant: tab order, subpaths, and layout positioning are preserved 100%. All new design specifications apply strictly to the page content rendered below `<ChannelSubnav />`.

---

## 3. Page 1: Channel Dashboard (`/app/channels/[channelId]`)

**Role:** View-Only Mission Control & Full-Fledged Reporting Stat Board.  
**Strict Behavior Constraint:** View-only page. Node execution and orchestration information is viewed but not managed here. Everything in the channel rolls up into this board.

```
+-----------------------------------------------------------------------------------------------------------------------+
| Breadcrumb: Studio / Channels / [Channel Name]                                                                        |
| Header: [Channel Name] · Executive Stat Board   [Status: Active (Lime)]  [Customize Board ▾]  [Theme: Studio Dark ▾]  |
| Subnav: [Dashboard*] [Staffing] [Marketing] [Social Media] [Assets] [Production]                                      |
+-----------------------------------------------------------------------------------------------------------------------+
| 1. High-Density Telemetry Strip (Customizable Metric Cards):                                                         |
| [ Total Reach: 4.8M ] [ Avg Retention: 74% ] [ Channel Budget Burn: 3.4k/5k c ] [ Media Vault: 24.8 GB ]             |
+-----------------------------------------------------------------------------------------------------------------------+
| 2. Social Media Stat Board (Live Feed Across All Outlets):                                                           |
| +-------------------------------------------------------------------------------------------------------------------+ |
| | Metrics Grid: [ Total Posts: 142 ] [ Posts This Week: 12 ] [ Comments: 18.4k ] [ Shares: 9.2k ] [ Likes: 284k ]   |
| | Hourly Best-Post Heatmap (Days vs Peak Engagement Hours) · Engagement Breakdown Chart (YouTube / TikTok / X / IG)  |
| +-------------------------------------------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------------------------------------+
| 3. 12-Column Modular Stat Grid:                                                                                       |
|                                                                                                                       |
| Col 1-8: Production Slate & Node State Monitor (View Only)     Col 9-12: Planning, Web Traffic & Merch               |
| +-----------------------------------------------------------+  +----------------------------------------------------+ |
| | Active & Completed Productions:                           |  | Calendar & Upcoming Drop Cadence:                  | |
| | - Ep 01: The Neon Genesis                                 |  | - Oct 12: Ep 01 Full Master Release (YouTube)      | |
| |   Stage: 09 Video Production (75% Progress) · Run: Auto   |  | - Oct 14: TikTok Vertical Teaser Cut               | |
| |   Node Telemetry: 14/18 Jobs Succeeded · 2 Rendering      |  | - Oct 18: Discord Watch Party & Live Q&A           | |
| |                                                           |  +----------------------------------------------------+ |
| | - Ep 02: Neural Fracture                                  |  | Channel Website & Traffic Telemetry:               | |
| |   Stage: 04 Story Engine (30% Progress) · Run: Guided     |  | - Unique Visitors (7D): 84,200 (+18%)              | |
| |   Node Telemetry: 6/6 Concept Briefs Locked               |  | - Avg On-Site Watch Time: 6m 42s                   | |
| |                                                           |  | - Landing Page Conversion Rate: 8.4%               | |
| | - Ep 00: Pilot Prologue [COMPLETED]                       |  +----------------------------------------------------+ |
| |   Status: Released · Master 4K · 1.2M Views               |  | Merchandise & Commerce Stats:                      | |
| |   [Inspect Output in Vault]                               |  | - Total Sales: $14,280 (324 Orders)                | |
| |                                                           |  | - Top Item: "Cyberpunk Neon Hoodie" (94 units)     | |
| +-----------------------------------------------------------+  +----------------------------------------------------+ |
+-----------------------------------------------------------------------------------------------------------------------+
| 4. Global Audience Geographic Map & Demographic Spread:                                                              |
| [ SVG World Map Heatmap: US (42%), UK (18%), DE (12%), JP (9%), Other (19%) ] [ Age/Gender Distribution Chart ]        |
+-----------------------------------------------------------------------------------------------------------------------+
```

### 3.1 Functionalities & Specifications
1. **Full-Fledged View-Only Reporting Stat Board:**
   - Aggregates every operational metric for the channel into one screen without navigation hops.
   - Read-only node execution status: displays active step progress, node completion counts, worker job states, without exposing edit or restart controls (those live in the dedicated Production Node Workbench).
2. **Comprehensive Social Media Statistics:**
   - Real-time aggregation of posts, optimal posting time heatmaps, comments, shares, likes, viewer sentiment, and click-through rates.
   - Filterable across all connected platforms or consolidated as an omni-channel score.
3. **Production Slate Registry:**
   - If a production is created, in-flight, paused, or completed, it is rendered in this view.
   - Completed productions show release dates, master asset badges, and lifetime viewer metrics.
4. **Planning, Calendar, Website & Merchandise Telemetry:**
   - Multi-track release calendar showing scheduled episode drops, teaser clips, and marketing events.
   - Official channel website analytics: visitor counts, bounce rate, watch-time duration, referral channels.
   - Merchandise sales tracker: units sold, gross revenue, inventory alert thresholds.
5. **Customizable Widgets & Display Theming:**
   - **Widget Selection:** "Customize Board" modal allows users to select which widgets appear or remain hidden (e.g. hide Merchandise if pure digital, show Maps if international).
   - **Theme Presets:** Template picker allows selecting visual themes:
     - `Studio Dark` (default, cyan telemetry on deep slate)
     - `Amber Glow` (retro-cinema amber monochrome)
     - `Cyber Cyan` (high-contrast electric cyan highlights)
     - `Executive Monochrome` (clean high-contrast gray/white)
6. **Zero Dashboard Mutations (View-Only Invariant):**
   - Directives (Audience, Voice, Cadence, Pillars) are presented as read-only telemetry badges; editing is strictly housed in the Pre-Production & Marketing Engine (`/app/channels/[channelId]/marketing`).
   - Production execution is observed in real-time, but node configuration and job dispatch are managed in the Production Node Workbench (`/app/channels/[channelId]/production`).
---

## 4. Page 2: Channel Staffing (`/app/channels/[channelId]/staffing`)

**Role:** Master Agent Talent Roster & Departmental Staffing Desk.

```
+-----------------------------------------------------------------------------------------------------------------------+
| Breadcrumb: Studio / Channels / [Channel Name] / Staffing                                                             |
| Header: [Channel Name] · Channel Staffing   [Staffed: 8 Agents] [Vacancies: 2]                 [+ Hire Specialists]   |
| Subnav: [Dashboard] [Staffing*] [Marketing] [Social Media] [Assets] [Production]                                      |
+-----------------------------------------------------------------------------------------------------------------------+
| Department Quota & Coverage Bar:                                                                                      |
| [ Marketing: 2/2 Locked (Lime) ] [ Creative: 3/4 Needs Screenwriter (Amber) ] [ Production: 2/2 ] [ Operations: 1/1 ] |
+-----------------------------------------------------------------------------------------------------------------------+
| Filter & View Controls:                                                                                               |
| [ Filter: All Staff ] [ Hired / Assigned (8) ] [ Available to Hire (14) ]   [ Search Specialist by Name or Skill... ] |
+-----------------------------------------------------------------------------------------------------------------------+
| Section 1: Hired & Active Channel Staff (Assigned to This Channel)                                                    |
| +-------------------------------------------------------------------------------------------------------------------+ |
| | [ Agent: Aria Vance ]                   [ Agent: CineBot Prime ]               [ Agent: SonicWeaver ]             | |
| | Dept: Creative · Lane: Storyboard       Dept: Production · Lane: Video Render   Dept: Production · Lane: Sound FX | |
| | Capability: Continuity Director         Capability: Neural 4K Video Synth      Capability: Foley & Dialogue Mix   | |
| | Model: Claude 3.5 Sonnet (BYOK)         Model: Runway Gen-3 Alpha              Model: ElevenLabs / Suno v3        | |
| | Workload: 2 Active Productions          Workload: 1 In-Flight Render           Workload: Idle                     | |
| | Status: [Assigned · Online (Lime)]      Status: [Assigned · Busy (Cyan)]       Status: [Assigned · Ready (Lime)]  | |
| | Action: [Remove from Channel (Red)]     Action: [Remove from Channel (Red)]    Action: [Remove from Channel (Red)]| |
| +-------------------------------------------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------------------------------------+
| Section 2: Talent Pool — Available to Staff on This Channel                                                           |
| +-------------------------------------------------------------------------------------------------------------------+ |
| | [ Agent: ScriptSmith Pro ]              [ Agent: ViralScout ]                  [ Agent: LoreKeeper ]              | |
| | Dept: Creative · Lane: Screenplay       Dept: Marketing · Lane: Social Pulse   Dept: Creative · Lane: World Bible | |
| | Capability: Dialogue & Beat Architect   Capability: Trend & Hook Detector      Capability: Canon Continuity Watch | |
| | Model: GPT-4o Cinematic Mode            Model: Perplexity Pro / DeepSeek       Model: Claude 3.5 Sonnet           | |
| | Status: [In Studio Pool · Available]    Status: [In Studio Pool · Available]   Status: [Catalog Preview · Hire]   | |
| | Action: [Assign to Channel (Pink)]      Action: [Assign to Channel (Pink)]     Action: [Hire to Studio (Button)]  | |
| +-------------------------------------------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------------------------------------+
```

### 4.1 Functionalities & Specifications
1. **Master Agent List with Two Clear Tiers:**
   - **Who is Hired / Assigned:** Specialists actively linked in `channel_staff` executing jobs for this channel.
   - **Who Can Be Hired / Assigned:** Available agents in the studio pool ready to be assigned, plus un-hired specialists in the global catalog recommended for vacant slots.
2. **Departmental Coverage Validation:**
   - Visual breakdown across Marketing, Creative, Production, Operations.
   - Immediate visual cues (Amber status) when a channel lacks the agents needed to complete autonomous 13-stage runs.
3. **Agent Assignment State Machine:**
   - One-click assign/unassign actions bound to `setChannelStaffAction` calling the Postgres RPC `set_channel_staff`.
   - Live workload indicator (Active Productions count, In-Flight generation job counts).
4. **Talent Acquisition & Empty States:**
   - Direct navigation triggers linking to `/app/builder` (Departmental Setup) and `/app/agents` (Agent Catalog) when staffing vacancies or custom lane builders are needed.
---

## 5. Page 3: Marketing & Budget (`/app/channels/[channelId]/marketing`)

**Role:** The Pre-Production Engine — Everything that goes into making the movie before cameras roll and generators render.

```
+-----------------------------------------------------------------------------------------------------------------------+
| Breadcrumb: Studio / Channels / [Channel Name] / Marketing                                                            |
| Header: [Channel Name] · Pre-Production & Marketing Engine    [Budget: 5,000c]               [Save Directives (Pink)] |
| Subnav: [Dashboard] [Staffing] [Marketing*] [Social Media] [Assets] [Production]                                      |
+-----------------------------------------------------------------------------------------------------------------------+
| Master Pre-Production Navigation Rail (14 Operational Lanes):                                                         |
| [01 Onboarding] [02 Research] [03 Budgets] [04 Merchandise] [05 Website] [06 Advertising] [07 Scheduling]             |
| [08 Season Theming] [09 Promos] [10 Cross-Channel] [11 Reporting] [12 Lore/Canon] [13 Legal] [14 Core Values]         |
+-----------------------------------------------------------------------------------------------------------------------+
| 12-Column Comprehensive Pre-Production Workbench:                                                                     |
|                                                                                                                       |
| Lane 01 & 08: Season Theming & Story Arcs            Lane 03: Budgets & Credit Economics                              |
| +--------------------------------------------------+ +--------------------------------------------------------------+ |
| | - Season 01 Premise: "The Neon Genesis"          | | - Total Guideline Ceiling: 5,000c (Upsert in DB)              | |
| | - Narrative Arc: 12-episode cyberpunk noir       | | - Committed to Slate: 3,400c | Unallocated Pool: 1,600c       | |
| | - Character Growth Vectors & Climax Beats        | | - Cost-Per-Episode Guideline Stepper: [+250c] [+500c] [+1000c]| |
| +--------------------------------------------------+ +--------------------------------------------------------------+ |
|                                                                                                                       |
| Lane 02: Research Hub (Channel, Social, Competitor)  Lane 04 & 05: Merchandise, Products & Official Website           |
| +--------------------------------------------------+ +--------------------------------------------------------------+ |
| | - Target Demographic: Sci-Fi Enthusiasts (18-35) | | - Merch Design Bibles: Apparel, Posters, Digital Drops       | |
| | - Competitor Gap Analysis: Lack of gritty noir   | | - E-commerce Storefront Hooks: Shopify / Printful API sync   | |
| | - Trending Soundscapes: Dark synthwave, industrial| | - Official Fan Site Funnel: Trailer embed, email capture     | |
| +--------------------------------------------------+ +--------------------------------------------------------------+ |
|                                                                                                                       |
| Lane 06 & 09: Advertising, Promos & Teaser Strategy  Lane 10: Cross-Channel Synergy & Guest Appearances               |
| +--------------------------------------------------+ +--------------------------------------------------------------+ |
| | - 15s Hook Cuts for TikTok / YouTube Shorts      | | - Shared Universe Connections: Sibling Channel Crossovers    | |
| | - Paid Acquisition Ad Copy & A/B Creative Tests  | | - Character Guest Cameos & Shared Lore Easter Eggs           | |
| +--------------------------------------------------+ +--------------------------------------------------------------+ |
|                                                                                                                       |
| Lane 12: Lore, World Bible & Continuity Engine       Lane 13 & 14: Legal Clearance, Values & Guardrails               |
| +--------------------------------------------------+ +--------------------------------------------------------------+ |
| | - World History Timeline: 2084-2142 Chronology   | | - Commercial Model Rights: Attested BYOK Provider Licenses   | |
| | - Factions, Technology Rules, Street Slang Lexicon| | - Audio Clearance: 100% Royalty-Free / AI Synth Rights       | |
| | - Canonical Continuity Bible locked for AI prompts| | - Content Guardrails: PG-13 Violence, Zero Hate, Safe AI Policy| |
| +--------------------------------------------------+ +--------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------------------------------------+
```

### 5.1 Functionalities Across the 14 Pre-Production Lanes
1. **Studio & Channel Onboarding Alignment:** Binds the studio's overarching design tokens and voice to this specific channel's sub-brand.
2. **Research Hub:** Automated audience listening, competitive intelligence, and trending format radar.
3. **Credit Economy & Budgets:** Direct connection to `channel_marketing_budgets` with `guideline_credits` management and production spend ledger.
4. **Merchandise Desk:** Product specifications, concept renders, print-on-demand integrations.
5. **Official Website Operations:** Fan landing page copy, traffic analytics, newsletter subscription funnels.
6. **Advertising Operations:** Multi-variant paid promo management, ad copy generators, creative testing logs.
7. **Master Scheduling:** Editorial drop dates, teaser release waves, premiere countdowns.
8. **Season Theming & Narrative Arcs:** High-level story bible defining season theme, episodic pacing, and emotional climax beats.
9. **Promos & Teaser Packaging:** Formats short-form teasers and cliffhangers designed to convert social scrollers into channel subscribers.
10. **Cross-Channel IP Synergy:** Manages shared universe lore, character crossovers, and guest appearances across workspace channels.
11. **Reporting & Business Analytics:** Rollup of cost-per-minute produced, audience acquisition cost, and revenue generated.
12. **Lore & Canon Continuity Engine:** The comprehensive world bible: timelines, faction hierarchies, weapon specs, and magic/tech systems injected into prompt binders.
13. **Legal & Rights Attestation:** Tracks copyright clearance, model licensing (Midjourney, Runway, OpenAI), voice clone attestations, and commercial indemnification.
14. **Core Values & Ethics Guardrails:** Sets automated guardrails for agent behavior, violence ceilings, profanity filters, and creative safety boundaries.

---

## 6. Page 4: Social Media & Signals (`/app/channels/[channelId]/social`)

**Role:** Multi-Platform Distribution Desk, Two-Way Engagement Manager & Signals Radar.

```
+-----------------------------------------------------------------------------------------------------------------------+
| Breadcrumb: Studio / Channels / [Channel Name] / Social Media                                                         |
| Header: [Channel Name] · Multi-Platform Distribution Desk   [8 Outlets Active]               [+ Stage Post Release]   |
| Subnav: [Dashboard] [Staffing] [Marketing] [Social Media*] [Assets] [Production]                                      |
+-----------------------------------------------------------------------------------------------------------------------+
| 8-Platform Two-Way Connection Strip:                                                                                  |
| [ YouTube: Connected (Lime) ] [ TikTok: Connected (Lime) ] [ X/Twitter: Connected (Lime) ] [ Instagram: Connected ]   |
| [ Facebook: Connected (Lime)] [ Discord: Bot Active ]     [ Telegram: Channel Sync ]      [ Snapchat: Spotlight ]     |
+-----------------------------------------------------------------------------------------------------------------------+
| 12-Column Distribution & Interaction Workspace:                                                                       |
|                                                                                                                       |
| Col 1-5: Two-Way Interaction & Community Inbox         Col 6-12: Signals Radar & Release Packages                     |
| +---------------------------------------------------+  +------------------------------------------------------------+ |
| | Community Inbox (All Platforms Consolidated):     |  | Sub-Tabs: [Audience Signals (14)] [Release Packages (6)]   | |
| | - [YouTube] @alex_cyber: "The twist in Ep 1 was   |  |                                                            | |
| |   insane! When is Ep 2 dropping?"                 |  | Signal Stream (Feedback Loops to Marketing & Production):  | |
| |   [Quick Reply] [Send to Marketing Research]      |  | - Signal: "Audience Demand for Kaelen Vance Backstory"     | |
| |                                                   |  |   Type: Narrative Desire · Strength: 96% · Origin: TikTok  | |
| | - [TikTok] @neon_fan: "That visual style is wild" |  |   Action: [Generate Storyboard Idea in Creative]           | |
| |   [Like] [Reply] [Flag as Viral Audio Trend]      |  |                                                            | |
| |                                                   |  | - Signal: "Pacing Drop-off in Act 2 of Ep 01"              | |
| | - [Discord] Server Announcement Thread:           |  |   Type: Retention Alert · Strength: 84% · Origin: YouTube  | |
| |   Active Discussion in #ep1-theories (42 online)  |  |   Action: [Send Note to Screenplay Specialist]             | |
| |                                                   |  +------------------------------------------------------------+ |
| | Interaction Management Controls:                  |  | Platform-Native Release Packages (Platform Cuts):          | |
| | - Sentiment Score: 94% Positive                   |  | - Package: "Ep 01: TikTok Vertical Teaser Cut"             | |
| | - Auto-Moderation: Active (0 spam leaks)          |  |   Format: 9:16 Vertical · Max Chars: 2,200 (Used: 420)     | |
| | - Unanswered Inquiries: 3                         |  |   Status: [Approved (Lime)] [Schedule for Oct 14]          | |
| +---------------------------------------------------+  +------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------------------------------------+
```

### 6.1 Functionalities & Specifications
1. **8 Supported Social Platforms with Two-Way Connections:**
   - Pre-configured Two-Way Interactive Connections for **Facebook, YouTube, X (Twitter), Instagram, TikTok, Telegram, Discord, Snapchat**.
   - **Outbound:** Direct publishing, automated post scheduling, platform-native video cutdowns and tags.
   - **Inbound:** Ingests comments, mentions, likes, shares, subscriber velocity, and DMs back into the channel dashboard.
2. **Unified Interaction Management:**
   - Central community inbox across all 8 networks.
   - Reply, like, and moderate community conversations directly from the studio.
3. **Bi-Directional Marketing & Creative Feedback Loop:**
   - Convert viewer comments into actionable research signals stored in `signals` table.
   - Send signals directly into Creative and Screenplay specialist agent prompts for subsequent episodes.
4. **Wide View Multi-Platform Command Grid:**
   - Side-by-side comparative views of engagement across all 8 outlets.
5. **Platform-Native Release Package Staging:**
   - Platform-customized aspect ratios (`9:16`, `16:9`, `1:1`) with character-counter enforcement against platform API constraints.

---

## 7. Page 5: Assets & DNA Continuity (`/app/channels/[channelId]/assets`)

**Role:** Creative Continuity Vault & Comprehensive Channel File Store.  
**Core Law:** All DNA lives here (connected to database, but rendered as visual continuity sheets, not raw database rows). Stores EVERY channel file; anything saved for this channel lives here.

```
+-----------------------------------------------------------------------------------------------------------------------+
| Breadcrumb: Studio / Channels / [Channel Name] / Assets & DNA                                                         |
| Header: [Channel Name] · Assets Warehouse & DNA Vault    [Storage: 24.8 GB / 100 GB]         [+ Upload / New Anchor]  |
| Subnav: [Dashboard] [Staffing] [Marketing] [Social Media] [Assets*] [Production]                                      |
+-----------------------------------------------------------------------------------------------------------------------+
| Vault Storage Telemetry:                                                                                              |
| [ Total Files: 412 ] [ DNA Anchors: 14 Locked ] [ Master Cuts: 6 ] [ Video Takes: 184 ] [ Audio Stems: 92 ]           |
| Storage Utilization Bar: [============================........................................] 24.8% Cyan            |
+-----------------------------------------------------------------------------------------------------------------------+
| Section 1: Visual DNA Continuity Profiles (Character, Location, Style Bibles):                                        |
| Filter: [All DNA (14)] [Characters (CDNA)] [Locations (LDNA)] [Style Bibles (SDNA)] [Audio/Voice (VDNA)] [Props (PDNA)]|
| +-------------------------------------------------------------------------------------------------------------------+ |
| | [ Character DNA: "Kaelen Vance" ]       [ Location DNA: "Sector 7 Alley" ]      [ Style DNA: "Neo-Noir 35mm" ]    | |
| | Type: CDNA · Role: Protagonist Lead     Type: LDNA · Role: Recurring Setting    Type: SDNA · Role: Visual Standard| |
| | Facial Anchor: Synthetic left eye, scar  Lighting: Wet asphalt, amber haze       Grain: Kodak 5219, anamorphic flare|
| | Wardrobe: Weathered trenchcoat, collar  Architecture: Modular brutalist towers  Palette: Deep blacks, hot pink    | |
| | Status: [LOCKED (Lime)]                 Status: [LOCKED (Lime)]                 Status: [LOCKED (Lime)]           | |
| | Used in: Ep 01, Ep 02, Ep 03            Used in: Ep 01, Ep 02                   Used in: All Productions          | |
| | [Inspect Full DNA Sheet]                [Inspect Full DNA Sheet]                [Inspect Full DNA Sheet]          | |
| +-------------------------------------------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------------------------------------+
| Section 2: Complete Channel File Store (Everything Saved for This Channel):                                           |
| Search Files: [ Search by filename, production, stage, or format... ]    Filter: [All] [Video] [Audio] [Scripts] [Art]   |
| +-------------------------------------------------------------------------------------------------------------------+ |
| | [ Video Master: Ep01_Final_Master_4K.mp4 ] - 14.2 GB · 4K UHD · Pro-Res · Released Oct 12 · [Download] [Preview]  | |
| | [ Shot Take: Ep02_Scene04_Shot02_Take03.mp4 ] - 42.4 MB · 1080p · H.264 · In-Flight · [Inspect Prompt Binder]     | |
| | [ Audio Stem: Ep01_Dialogue_Kaelen_Final.wav ] - 128 MB · 24-bit 48kHz · Master Audio · [Play Preview]            | |
| | [ Screenplay: Ep02_Neural_Fracture_v3.fountain ] - 142 KB · Full Screenplay · 38 Pages · [Read in Script Viewer]   | |
| | [ Storyboard Deck: Ep02_Visual_Storyboards.pdf ] - 18.6 MB · 24 Storyboard Panels · Approved · [Inspect Deck]      | |
| | [ Concept Art: Sector7_Establishing_Shot.png ] - 8.4 MB · Midjourney v6 Master Render · [Inspect DNA Anchor]       | |
| +-------------------------------------------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------------------------------------+
```

### 7.1 Functionalities & Specifications
1. **DNA Continuity Vault:**
   - **All DNA Lives Here:** Character continuity profiles (`CDNA`), Location continuity profiles (`LDNA`), Style bibles (`SDNA`), Voice anchors (`VDNA`), and Props/Vehicles (`PDNA`).
   - Connected directly to Supabase `dna_records` and `production_dna` tables.
   - Visually presented as rich continuity cards showing prompt anchors, negative constraints, color keys, and face/wardrobe locks.
   - Prevents AI hallucination and continuity drift across sequential production takes.
2. **Complete Channel File Store:**
   - **Everything Saved Lives Here:** Universal repository of every file created, rendered, generated, or uploaded for this channel.
   - Categories: Screenplays, Storyboard decks, Prompt Binders, Concept Art, Audio Stems, Voiceover Takes, Raw Video Generations, Master Video Cuts, Release Packages, Subtitles.
   - Comprehensive metadata: file size, resolution/sample rate, associated production, stage origin, creation date.
   - Integrated media viewer: video player, audio waveform player, script reader, and full-resolution lightbox.

---

## 8. Page 6: Production Pipeline (`/app/channels/[channelId]/production`)

**Role:** The 13-Stage Production Pipeline & Node Canvas — Creative Through Final Episode.

### 8.1 The 13 Canonical Production Stages
Every production created under this channel moves through the canonical 13-stage workflow defined in `0021_phase2_default_template.sql`:
1. **Stage 01 — Research:** Market opportunities, audience data, competitive landscape.
2. **Stage 02 — Marketing:** Campaign hooks, audience thesis, credit allocation guidelines.
3. **Stage 03 — Creative:** Core creative brief, premise, protagonist journey.
4. **Stage 04 — Story:** Narrative structure, beat sheet, episodic pacing.
5. **Stage 05 — Storyboard:** Visual shot sequence, camera angles, lighting keys.
6. **Stage 06 — Script:** Scene-by-scene script outline, dialogue passes.
7. **Stage 07 — Screenplay:** Industry-standard formatted screenplay (`.fountain`).
8. **Stage 08 — AI Conversion:** Translation of screenplay into deterministic GenPlay shot contracts.
9. **Stage 09 — Video Production:** Multi-model AI media generation (video takes, image synthesis).
10. **Stage 10 — Launch:** Master assembly, color conform, audio foley, final 4K export.
11. **Stage 11 — Social Posting:** Automated platform-tailored cutdowns and staging.
12. **Stage 12 — Social Management:** Two-way community engagement and comment moderation.
13. **Stage 13 — Reporting:** Performance analytics rollup and audience retention analysis.

---

## 9. Cross-Discipline Review & Verification (better-interface)

| Domain | Specification & Verification Standard | Status |
|---|---|---|
| **Accessibility (a11y)** | WCAG 2.2 AA compliant. 44px min touch targets. Visible cyan focus rings (`focus-visible:ring-2 focus-visible:ring-cyan`). Form controls paired with explicit `<label htmlFor="...">`. Non-color status indicators (icons + text). `aria-live="polite"` for asynchronous save notifications. | VERIFIED SPEC |
| **Layout** | 12-column modular responsive grid. Standard layout margins (`px-4 sm:px-6 lg:px-8`). Content stays within `max-w-7xl` container. Progressive disclosure affordances for deep settings. | VERIFIED SPEC |
| **Writing & Copy** | Terse, purposeful film studio terminology. No marketing buzzwords inside the authenticated workbench. Unambiguous action buttons ("Save Directives", "Assign Specialist", "Stage Release"). Standard error messages with recovery instructions. | VERIFIED SPEC |
| **Typography** | Strict 3-family hierarchy: `Syne` for titles, `Space Grotesk` for UI copy, `DM Mono` for metadata, timecodes, credits, and IDs. Tabular figures (`font-variant-numeric: tabular-nums`) on all metric numbers. | VERIFIED SPEC |
| **Colors & Contrast** | OKLCH color engine. Primary body text (`--color-text`, oklch 0.93) against surface (`--color-surface`, oklch 0.18) yields contrast ratio > 11:1 (exceeds 4.5:1 WCAG AA floor). Badges and borders exceed 3:1 UI element floor. Semantic colors strictly mapped: Lime=Success, Cyan=Telemetry, Amber=Review, Red=Destructive, Pink=Primary. | VERIFIED SPEC |
| **UI Polish** | Optical alignment of icons and text baselines. Radius hierarchy: `rounded-sm` (8px) for buttons/badges, `rounded-md` (16px) for cards/panels. Motion governed by `prefers-reduced-motion` with transition durations <= 200ms. No `transition: all`. | VERIFIED SPEC |

---

## 10. Layout, Spatial Rhythms & Responsive Breakpoints (better-layout)

### 10.1 Spatial Scale & Invariants
- **Modular Scale:** 4px/8px rhythm (`--space-1` = 4px, `--space-2` = 8px, `--space-4` = 16px, `--space-6` = 24px, `--space-8` = 32px).
- **Grouping Rule:** Space groups first, background shapes second, lines last.
  - Intra-card element spacing: 8px–12px (`gap-2` to `gap-3`).
  - Card internal padding: 16px–20px (`p-4` to `p-5`).
  - Inter-card grid gaps: 16px–24px (`gap-4` to `gap-6`).
  - Major section vertical margin: 24px–32px (`mb-6` to `mb-8`).

### 10.2 Responsive Viewport Adaptivity
- **Desktop (1280px+):**
  - Full 12-column grids for all stat boards and distribution workspaces.
  - Multi-column specialist rosters (`lg:grid-cols-3` or `lg:grid-cols-4`).
- **Tablet (768px–1024px):**
  - 12-column grids collapse to 2 equal columns (`md:grid-cols-2`).
  - Telemetry strips maintain 2x2 grid (`sm:grid-cols-2`).
  - Subnav scrolls horizontally with smooth snap.
- **Mobile (360px–640px):**
  - Full single-column stack (`grid-cols-1`).
  - Buttons expand to full width (`w-full sm:w-auto`) with 44px min touch height.

---

## 11. Tastemaker Visual Craft & Anti-Slop Audit (tastemaker)

1. **No Generic Purple/Indigo Gradients:** Strict Studio Dark palette with intentional OKLCH Pink, Cyan, and Lime chromatic signals.
2. **No Arbitrary 3-Card Feature Slop:** Grid cards are shaped directly around actual studio entities: Production step progressions, Agent capability files, Social platform cutdowns, and DNA continuity profiles.
3. **No Dead Links or Placeholders:** Every button triggers an authentic Next.js Server Action (`updateChannel`, `setChannelStaffAction`, `saveChannelMarketingBudget`) or routes to a live verified page.
4. **No Emoji as Interface Icons:** Use SVG icons from approved libraries (`Flowbite`, `Heroicons`, `Simple Icons` for platform logos) with consistent 16px/20px stroke geometry.
5. **No Decorative Noise:** Borders represent functional boundaries (`border-border` at 1px); backgrounds provide elevation hierarchy (`surface` -> `surface-2` -> `surface-3`).

---

## 12. State Matrix & Edge Cases

### 12.1 State Contracts
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
| **Production** | 13-stage interactive DAG node workbench with live job telemetry | Skeleton pipeline progression nodes | "No productions initialized" with template selector | Failed job error card with retry step action |

---

## 13. Implementation Roadmap & Milestones

1. **Milestone 1 (Dashboard Stat Board):**
   - Implement view-only executive reporting stat board.
   - Add social media stats, production slate rollup, calendar, website visitors, and merchandise modules.
   - Build widget visibility toggle and color theme picker (`Studio Dark`, `Cyber Cyan`, `Amber Glow`).
2. **Milestone 2 (Staffing Master Roster):**
   - Build Department Coverage Banner (Marketing, Creative, Production, Operations).
   - Implement two-tier master agent roster (Hired / Assigned vs Available to Hire).
   - Wire `setChannelStaffAction` forms with accessible feedback.
3. **Milestone 3 (Pre-Production & Marketing Engine):**
   - Implement the 14 pre-production lanes (Onboarding, Research, Budgets, Merch, Website, Ads, Scheduling, Season Theming, Promos, Cross-Channel, Reporting, Lore, Legal, Values).
   - Wire credit ceiling form with `saveChannelMarketingBudget`.
4. **Milestone 4 (Social Media & Two-Way Engagement):**
   - Implement 8 platform connectors (Facebook, YouTube, X, Instagram, TikTok, Telegram, Discord, Snapchat).
   - Build unified community inbox with two-way reply/sentiment tools and release cutdown drawer.
5. **Milestone 5 (Assets & DNA Continuity Vault):**
   - Build visual DNA continuity profile cards (Character, Location, Style, Voice, Props).
   - Build complete channel file store with search, filters, and media lightbox previews.
6. **Milestone 6 (Production 13-Stage Pipeline Overview):**
   - Seamless link to 13-stage production DAG node workbench from creative brief through final episode cuts.
   - Embed live job telemetry and execution step viewer in channel context.
