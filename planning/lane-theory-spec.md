# Lane Theory — Studio Operating Model

**Status:** Owner-approved direction; implementation-state annotations below
**Source:** Owner interviews, 2026-08-22/23
**Role:** The workflow-behavior law for the live product (how work flows through lanes/desks). `site-workflow-spec.md` remains the authority for routes, modules, contracts, and security; where the two conflict on workflow behavior, this document reflects the owner's latest direction and the conflict must be resolved spec-first (see `beta-execution-plan.md` Gate 0).

**Building metaphor:** studio = building · department = floor · stage = segment on the floor · lane = working team · desk = agent.

## 1. Principle

Gem Studio is a configurable AI film studio, not one fixed pipeline. The owner's workflow ships as the default baseline template; users can bolster or trim it, build flows from scratch, or pick from baseline templates. Cloud deployments get deeper configuration options than self-hosted (which has restrictions on depth/availability). Nothing in the code may hard-code the owner's 13-department flow as the only path.

## 2. Studio setup spine (onboarding → first production readiness)

1. **Account created → onboarding.** Gem Studio's first job is configuring the user's studio, guided.
2. **Studio identity phase.** A studio assistant agent walks the user through branding: studio name, logo, brand colors, tagline, initial content type, and other basics we define. Each point hands off to a marketing-department studio role. Two modes, per user preference:
   - *Guided:* agent interactively makes suggestions.
   - *Fast:* agent confirms, files, and passes off.
   The assistant also teaches how lanes operate — onboarding and lane education are the same event.
3. **First channel creation** (prompted once brand is set): name, content type, colors/theming, target audience, season details, episode count, episode length, ad copy, etc. Channel type presets: content creation, advertising, film, documentary, other video formats. Then scheduling, budget estimation, and process depth (should AI write scripts? research content ideas?) — channel branding plus first planning scope in one flow.
4. **Hiring fair / department configuration.** Core departments: **Marketing, Creative, Production, Social**. Social lives under Marketing organizationally but gets top-level billing in the product. Marketing has mandatory baseline needs (branding, channel creation). Optional teams: R&D, advertising, merchandise, budgeting, legal, scheduling, cross-channel instances, and more.

## 3. Development pipeline

Sequence: **seed generation → storyboards → plot design → season/channel continuity → script writing → screenplay writing → GenPlay drafting.** Each stage is a team with roles/agents.

### 3.1 Lane collaboration modes

- **Forward-facing lane (assembly line):** work flows down a chain of agents; each acts on all upstream data plus its own `.md` files. Example: Jr. Script Writer produces output → Sr. Script Writer adds their layer → Executive Script Writer finalizes.
- **Round table:** agents iterate in configurable pass orders (e.g. 1-2-3, 2-1, 2-3-1, or repeated cycles 123-123-123), reviewing and revising each other's work. **Pass order is set per lane.**

### 3.2 Casting gate (mandatory between writing and production)

- Writers write the story; nobody else dictates characters. They write for whoever fits the role.
- The casting team (casting, location scout, asset producer, etc.) searches the Universe: if an existing record fits look, feel, persona, and lore → reuse. If not → spawn a new record.
- Casting may add unplanted entities the scene implies (park → mom and baby, kids playing, man with a dog).
- Tiers: **A-tier** = main characters (exhaustive attribute list); **B-tier** = minimum viable for background roles. B-tier can be promoted to A-tier and filled out when casting decides the base is there.

## 4. Production phase

GenPlay complete → production reviews it → decides tools per shot/scene → creates **DNA data sheets** → generates images → feeds images into GenPlay prompts to create shots.

- **DNA data sheet** = the master look sheet compiled from character/location/prop DNA. Stored and carried forward so look and feel stays identical across shot, scene, season, universe. JSON because it edits cleanly and versions.
- **Per-episode lanes, sized by the GenPlay:** one episode may need 10 DNA sheets, 8 locations, X shots; another half that. Lanes are spawned from stated GenPlay needs, not a fixed pipeline: DNA→imaging, imaging→video shot, review, b-roll, continuity, reshoot, whatever is needed.
- **Image/video generation is off-site for now** (user generates outside and brings results back), but must be wired to providers with minimal change later. Everything else runs in-site (see §6).

## 5. Social workshop & feedback cycle

Finished production is chopped up by the social team: prep posts → market with lead-ins → manage the social platform → post → review, watch, report, interact → **cycles back as data for marketing to review** on the next production. Audience signal is the first input of the next brief: brief → build → cut → release → signal → brief.

## 6. Agent runtime & model access

- All agents except production image/video generation run **in-site with real AI**, configured to pass info out and data back.
- Access paths, both coded now:
  - **BYOK:** user-supplied provider keys. Beta providers: **OpenAI and Anthropic based** (exact list TBD; keep the routing layer provider-agnostic so adding Google/OpenRouter later is configuration, not rework).
  - **Credit-based:** cloud metering, ships alongside BYOK (may launch disabled).
- **Recommended models per role:** each role/agent template ships a suggested model/tier so users understand the effort/skill to assign (heavy model for executive roles, cheap/fast for junior). User can override.
- **Keys live in a safe secrets space** — encrypted at rest, scoped to workspace, revocable; never in browser code or Git.
- Historical note: spec testing used Hermes agent profiles; the runtime must be profile-configurable, not Hermes-locked.

## 7. Universe (DNA store)

- The Universe is **studio-scoped** (workspace-level): real life is separate, and any channel can pull from the DB and reuse entities — saving time and money.
- Existing `dna/` schemas (CDNA/LDNA/PDNA), ID law (`CHAR-`/`LOC-`/`PROP-` + 32-hex), and tier/promotion rules carry over as the data model.
- DNA creation is meant to be fairly automated (casting searches/spawns); users can come in and edit anything.

## 8. Post-launch hooks

`planning/archive/post-launch.md` defines the staged commercial roadmap (owner-only → invited beta → paid cloud → agent marketplace → public signup → self-hosted → teams → workflow customization → platform expansion), consolidated into task form in `MASTER-TODO.md` Phase E. Architecture must keep those stages additive: capability resolver, operational policy, durable effects, provider adapters, server-authoritative billing facts, audited security changes, data classification, expand/contract migrations, stable view models (its §1 foundation contract). No owner-launch decision may close a door the roadmap opens.

## 9. Implementation state vs. this spec (2026-08-23)

Owner rulings since first draft: **no stubs anywhere** (features ship working, or as interfaces awaiting a backend that doesn't exist yet); season structure fully built-in and flexible (film / set seasons / open-ended — user decides); lore keeper = continuity role spanning scenes/seasons/channels (Johnny stays divorced); budget = free/mid/best model-tier recommendations + user-managed guideline tracking only, real controls deferred until credits exist.

| This spec | Current code (`production` branch) | Gap |
|---|---|---|
| §2 Onboarding wizard (studio assistant, guided/fast, first channel, hiring fair) | `/app/onboarding` persists guided/fast profile, writes studio/channel/departments, creates default workflow | **Partial** — BYOK assistant conversation/hiring agent assignment still requires runtime wiring |
| §1/§2 Flow templates, build-from-scratch, bolster/trim | 13 stages hard-coded in `lib/studio/domain.ts`; orchestration workflows exist but marked experimental diagnostics in the site spec | **Resolved 2026-08-23** — customization is core; spec amended; 13-stage flow becomes default template |
| §3.1 Forward lanes + round-table pass orders (per lane) | Persisted lane modes, bounded pass order/cycles, document merge, engine pass context/events | **Partial** — full supervisor desk review/kickback policy still requires workflow-level UI |
| §3.2 Casting gate, A/B tiers, B→A promotion | Universe tier/group filters, audited promotion, production casting gate and attach | **Partial** — fit scoring/spawn-from-minimum template still requires richer casting UI |
| §7 DNA groups (Big 3 + Studio/Channel/Season/Socials/FDNA) | `group_type` supports Universe/Studio/Channel/Season/Socials/FDNA; filters available | **Partial** — creation/edit controls for non-Universe groups remain |
| §4 Production lanes sized by GenPlay | Production detail page + job enqueue + GenPlay shot contracts + ffmpeg `assemble_master` | Exists (13-stage shape) |
| §6 In-site AI, BYOK + credits, recommended models per role | Real worker via OpenAI-compatible BYOK (`provider_configs`, AES-256-GCM), credit ledger + Stripe checkout, protected inference for premium agents; agent tier recommendations/overrides and production guideline tracking | **Partial** — worker poller/provider generation remains backend-dependent |
| §5 Social cycle | Release package prep, explicit approval/publish confirmation, report/interaction capture, signal promotion audit | **Partial** — platform adapters remain intentionally backend-dependent |
| Video editor (assembly) | `assemble_master` concatenates selected MP4s — no timeline/trim/sequence UI | **Resolved 2026-08-23** — assembly workbench for beta; full editor is provider-era upgrade |
| Legal/clearance desk | None | **Resolved 2026-08-23** — deferred; no legal advisors engaged, do not build until counsel input exists |

Known defects to fix alongside: `/app/universe/[id]` Manage buttons 404 (route absent); most entities (channels, lanes, agents, workflows) lack edit/delete; CAP_LIMITS defined+tested but not enforced at enforcement points; orchestration conditions silently fail for unsupported ops; `/app/dna` and `/app/genplay` are passive "after migration" views while spec says they become Assets subviews.
