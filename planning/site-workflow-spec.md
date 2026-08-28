# Gem Studio Site Workflow Specification

**Status:** Final product requirements draft for owner review  
**Scope:** Dry launch and intended managed-cloud product  
**Owner:** Gem Studio  
**Architecture:** Next.js App Router, Supabase Auth/Postgres/Storage, server-authorized product flows

**Public-hosting standard:** Day‑0 is an internet-facing production service. `planning/day-zero-public-hosting-security.md` is normative. Any unmet `MUST`, unresolved high/critical vulnerability, tenant-isolation failure, missing restore evidence, or untested incident/rollback path blocks public hosting.

**Commercial evolution standard:** `planning/commercial-service-architecture.md` is normative for code boundaries. `planning/service-level-requirements.md` defines initial internal service objectives. Owner launch must not hard-code single-user, free access, one provider, or disabled-commerce assumptions into pages or domain behavior.

## 0. Spec-driven development header

### Assumptions

1. Product remains a Next.js App Router web application under `web/`.
2. Supabase Auth, Postgres, RLS, and Storage remain system-of-record services.
3. Dry launch has one owner account and one solo workspace.
4. Modern responsive browsers are supported; accessibility target is WCAG 2.2 AA-oriented behavior.
5. Existing route families remain canonical unless this document explicitly marks a compatibility redirect.
6. Public pricing describes the intended final offer; dry-launch commerce does not pretend to transact.

### Commands

Run from `web/`:

```bash
npm run typecheck
npm run lint
npm test -- --coverage
npm run test:e2e
npm run build
npm run dev
```

Run migration checks from repository root when configured:

```bash
bash scripts/test-migrations.sh
```

### Tech stack

- Next.js `^16.3.1`, React/React DOM `^19.2.8`, TypeScript `^5.8.0`.
- Supabase JS `^2.57.0` and SSR `^0.7.0` for Auth, Postgres, RLS, and Storage access.
- Vitest `^3.2.4` with V8 coverage.
- Playwright `^1.55.0` for browser workflows.
- PostgreSQL migrations under `supabase/migrations/`.

### Project structure

- `web/app/` — route pages, layouts, server actions, API routes.
- `web/components/` — shared shell, marketing, auth, and product UI.
- `web/lib/` — auth, Supabase, domain, storage, orchestration, billing, and worker helpers.
- `web/tests/` — unit and E2E tests.
- `web/content/` — public legal and editorial content.
- `supabase/migrations/` — schema, RLS, triggers, and lifecycle changes.
- `planning/` — product specs, contracts, implementation tasks, doubt review, and post-launch scope.

### Code style contract

Use strict TypeScript, server components for reads, explicit client components for browser interaction, immutable data transformations, small focused functions, schema validation at boundaries, and user-safe errors.

```tsx
const entryHref = authenticated ? "/app" : "/signup";
return <Link className="button button-primary" href={entryHref}>Open your Studio ↗</Link>;
```

Do not duplicate shell markup, mutate shared objects, add abstractions with one consumer, or expose secrets through props, logs, or browser storage.

### Testing strategy

- Unit: pure navigation, redirect, validation, domain, security, and state-transition helpers.
- Integration: server actions, Supabase queries/RLS, Storage authorization, queues, webhooks, export, and deletion.
- E2E: public navigation, auth lifecycle, owner workflows, responsive shell, production flow, assets, socials, account controls.
- Coverage: existing Vitest thresholds remain at 80% branches/functions/lines/statements for included library code.
- TDD: write one failing behavior test, verify RED, implement minimum GREEN, verify all tests, then refactor.

### Boundaries

- **Always:** validate trust-boundary input; authorize server-side; preserve workspace scope; test before claiming success; update this spec when behavior changes; keep secrets out of code and browser.
- **Ask first:** schema/migration changes; new dependencies; public route changes; payment/provider policy; legal/content claims; destructive data behavior; CI/deployment changes.
- **Never:** commit secrets; weaken RLS; use localStorage as product truth; fake successful mutations; delete failing tests; expose private agent files; ship unresolved launch-blocking doubts.

### Success criteria

- Every route has owner module, access rule, flow, data contract, state behavior, result, and acceptance test.
- Owner can complete all dry-launch workflows from empty workspace using persisted data.
- Public pages, auth, shell, product pages, assets, socials, account, and compatibility routes pass direct-load and refresh checks.
- RLS, Storage, secret, input, and destructive-action checks pass.
- No demo records, hash routing, fake transitions, or localStorage product source remain.
- Final Core Values, Terms, Privacy, Gallery, Docs, Pricing, and Contact content is approved before public-user launch.
- All five release gates in `day-zero-public-hosting-security.md` pass with timestamped evidence and required sign-off.
- Public hosting has verified TLS, CSP/security headers, exact CORS, WAF/rate limits, abuse controls, monitoring, alerting, backups, restore, incident response, and rollback from its first public request.
- Workspace capability, operational policy, durable external effects, normalized provider adapters, data lifecycle, audit, and service-indicator seams pass commercial integration tests.

## 1. Product boundary

Gem Studio has four modules. This is the sitemap contract. New pages may be added inside a module only with owner approval.

1. **Unknown User** — public discovery, proof, documentation, pricing, legal, contact, and account entry.
2. **Front Office** — studio-level overview, channels, marketing/research, social operations, and staffing.
3. **Studio** — creative/production lane configuration, active production work, and the asset warehouse.
4. **Account** — profile, billing, connections, secrets, security, and data controls.

Dry launch has one user: the owner. Product pages must still use real persisted data and real permissions. No fake records, localStorage source of truth, or simulated successful mutations.

## 2. Shared rules

### 2.1 Shell

All pages use one shared header/footer system.

Unknown User header contains:

- Brand/Home
- Gallery / Work
- Docs
- Pricing
- Sign up
- Log in

Authenticated header keeps public-site access and exposes Front Office, Studio, and Account navigation.

Footer appears on every public and authenticated page and contains:

- Home
- The Studio
- The System
- Social Workshop
- Gallery / Work
- Docs
- Pricing and License
- Core Values
- Contact
- Terms
- Privacy
- Front Office
- Studio
- Account
- Session-appropriate signup, login, account, and sign-out actions

Protected footer links redirect to authentication and preserve the requested destination.

### 2.2 Auth and workspace

- Supabase session is the only auth source.
- One solo workspace is created for each account.
- Every product query and mutation is workspace-scoped and RLS-protected.
- Expired sessions show a recoverable sign-in state.
- Sign-out invalidates the session and returns to a public page.
- No password, provider secret, or private agent file enters browser storage.
- Onboarding is mandatory: account creation lands in the authenticated app where an onboarding popup modal gates entry until completion (`onboarding_profiles.step === 'complete'`). The modal collects core studio identity (Studio Name with deferred option, SVG/PNG/WebP logo, brand color palette with primary/secondary/accent, Studio Tag Line, content direction taxonomy, free-form description), allows commercial plan selection (`content-pro`, `creator-pro`, `hollywood-pro`, `content-byok`, `creator-byok`, `self-host`) with standalone or companion BYOK, and connects OpenAI/Anthropic providers with AES-256-GCM encrypted server-side storage and masked display. Once saved, the user configures the 4 core departments (Marketing, Socials, Development, Production) where Pro users select/deselect preconfigured lanes and BYOK users build custom lanes, with full 6-file custom agent editing while strictly protecting proprietary catalog IP agent configurations. See `planning/flow-revamp-spec.md`.
### 2.2A Day-zero operating limits

Owner-only access does not mean unlimited access. All product writes, uploads, jobs, provider calls, exports, and publishing use server-side capability and operational policy. Provisional launch values live in `service-level-requirements.md` section 5 and are enforced centrally: provider spend, Storage, bandwidth, job concurrency, request/auth rates, upload size/count, and retry budget. Values include UTC reset windows, warning thresholds, hard-stop behavior, global emergency ceilings, and audited expiring overrides.

The owner may bypass payment entitlement because commerce is disabled, but never safety caps, rate limits, abuse controls, reservations, or suspension/maintenance stops. A denied or capped action returns a stable reason and truthful UI state; it never creates a fake success or hidden partial external effect. Accepted private assets target a 15-minute RPO; service RTO target is four hours. Exact evidence requirements are in `planning/day-zero-public-hosting-security.md` §11 and `planning/archive/day-zero-release-checklist.md`.

### 2.3 Page-state contract

Every data page implements loading, empty, success, validation-error, server-error, and expired-session states. Empty state explains the next useful action. Failed writes do not claim success. Destructive actions require explicit confirmation and explain impact.

### 2.4 Cross-module links

Every channel, production, asset, signal, and agent link preserves its source context. A user can move from a channel to Marketing, Research, Production Set, Socials, or Assets without losing channel scope.

### 2.5 Accessibility and responsive behavior

- One page-level `h1`.
- Logical heading order.
- Keyboard operation for menus, dialogs, filters, forms, uploads, and approvals.
- Visible focus treatment.
- Focus return after dialogs.
- Reduced-motion support.
- No hover-only information.
- Verify 320, 375, 414, 768, desktop, and wide desktop layouts.

## 3. Unknown User pages

All Unknown User pages are public and refreshable by direct URL.

### `/` — Home

**Need:** Let a new visitor understand Gem Studio quickly and choose a next step.

**Flow:** Visitor lands, scans hero and studio summary, explores Studio/System/Social Workshop sections, opens Gallery/Docs/Pricing, then signs up or logs in.

**Content:** Product promise, four-department overview, brief-to-release flow, Social Workshop explanation, proof CTA, public navigation, legal links.

**Result:** Visitor understands what the product does and reaches an intentional destination; no protected data renders while logged out.

**Acceptance:** Direct load works; section anchors work; each major section links to its detail page; auth-aware CTA sends an authenticated user to `/app` and a logged-out user to `/signup`.

### `/studio` — The Studio

**Need:** Explain channels, brand context, 13 departments, lanes, agents, continuity, and deliverables.

**Flow:** Visitor reads studio model, sees how a brief becomes structured work, reviews agent and Universe concepts, then enters Docs, Pricing, or account flow.

**Result:** Visitor understands why the connected studio differs from disconnected tools.

### `/system` — The System

**Need:** Explain brief, handoffs, approvals, providers, credits, shots, assembly, and human judgment.

**Flow:** Visitor follows Brief, Build, GenPlay, Assemble, Release; sees manual/semi-auto/auto behavior and provider boundaries.

**Result:** Visitor understands what is automated, what requires approval, and where work remains user-controlled.

### `/social-workshop` — Social Workshop

**Need:** Explain platform-native cuts, conversations, feedback, and signal return.

**Flow:** Visitor sees a finished frame become release variants, reviews signal examples, then enters Docs, Pricing, or signup.

**Result:** Social work is understood as a creative feedback loop, not empty repurposing.

### `/gallery` — Gallery / Work

**Need:** Show approved Gem Studio work as proof.

**Flow:** Visitor browses curated work, filters by format or project where useful, opens a work detail, and returns to public navigation.

**Data:** Curated public records only. No private workspace query. Each item includes title, summary, media, credits, rights status, and publication state.

**Result:** Visitor sees credible work without exposure of private prompts, assets, credentials, or unapproved outputs.

### `/docs` — Documentation

**Need:** Give users a practical explanation of product concepts and operation.

**Flow:** Visitor selects a topic such as Studio model, channels, production, assets, agents, signals, or account safety; in-page links return to relevant public or authenticated page.

**Result:** User can answer “how does this work?” without support intervention.

**Boundary:** Docs never reveal protected agent files, secrets, private prompts, private workspace data, or implementation credentials.

### `/pricing` — Pricing and License

**Need:** Explain intended Free/Self-hosted and Managed Cloud offers in one comparison.

**Flow:** Visitor compares deployment, channel limits, agents, lanes, supported platforms, storage, automation, support, updates, output rights, and add-ons; CTA enters signup or contact.

**Result:** Visitor knows what each edition includes and why Cloud differs from self-hosted.

**Dry launch:** Page presents the final intended offer. Checkout and public account acquisition remain gated because owner is the only user.

### `/core-values` — Core Values

**Need:** Publish owner-approved principles and how they affect product decisions.

**Flow:** Visitor reads values, examples, and “how this shows up in the studio,” then explores product or signup.

**Result:** Values are final, public, and connected to observable behavior. No placeholder values at launch.

### `/contact` — Contact

**Need:** Provide a reliable path for questions, access requests, support, legal, and partnership contact.

**Flow:** Visitor chooses reason, submits validated message, sees confirmation, and receives a reference or expected response path.

**Result:** Message is delivered safely without exposing internal email or secrets; abuse and rate limits apply.

### `/terms` — Terms

**Need:** State final rules for website, product, accounts, AI inputs/outputs, acceptable use, providers, rights, payments, limits, liability, and termination.

**Result:** Public, counsel-reviewed terms with effective date, entity, governing law, contact, and version history.

### `/privacy` — Privacy

**Need:** Explain collection and handling of account data, prompts, uploads, outputs, metadata, analytics, cookies, providers, retention, deletion, rights, and model-training policy.

**Result:** Public, counsel-reviewed notice with accurate U.S. scope and owner-approved model-training position.

### Authentication pages

Routes: `/signup`, `/login`, `/forgot-password`, `/reset-password`, `/verify-email`, `/mfa`.

**Need:** Complete account lifecycle.

**Flow:** Validate input, create/authenticate account, verify email when required, complete MFA when enabled, establish session, and return to safe `next` destination.

**Result:** User sees truthful loading, duplicate-account, invalid-credential, expired-link, network, success, and invite/access states. Open redirects are rejected.

### Compatibility and failure routes

- `/dashboard` redirects to `/app` and preserves authentication behavior.
- Unknown public URLs render the public not-found shell with Home, Docs, and Contact exits.
- Missing or unauthorized private records do not reveal whether another workspace owns the identifier.
- Unexpected failures show a retry path and reference-safe error state; raw database/provider errors stay server-side.

## 4. Front Office pages

### `/app` — Overview

**Need:** Provide a beautiful, preconfigured studio-level dashboard across every brand and channel.

**Displays:** Production health, schedule, approvals, blockers, budgets, credits, assets, signals, channel comparison, audience performance, agent activity, lane health, and upcoming releases.

**Customization:** Owner can reorder or hide predefined widgets and change filters/date ranges. User-defined custom actions are post-launch.

**Result:** User understands whole-studio state within one glance and can jump to the correct work surface.

### `/app/channels` and `/app/channels/[channelId]` — Channels

**Need:** Create, edit, inspect, and operate channel identity without deleting it from the channel surface.

**Create/edit data:** Name, logo, theme, color tokens, audience, voice, cadence, pillars, rating, season, topics, budget, destinations, and rights status.

**View:** Related Marketing/Research, productions, Socials, assets, signals, schedules, budgets, and channel-scoped agents.

**Actions:** Edit, open Marketing, open Research, open Production Set, open Socials, open Assets. Permanent deletion or archive exists only in Account data controls.

**Result:** Channel becomes the reliable scope for all related work.

### `/app/marketing` — Marketing and Research

**Need:** Operate brand and channel strategy plus continuous research.

**Flow:** Select Studio or channel scope; edit identity and strategy; review research; save findings; promote findings into channel, production, or social planning.

**Data:** Logo, theme, tokens, target viewership, rating, arcs, topics, merch, cross-channel work, promotions, episode schedules, budgets, camera/lens/lighting/color/movement standards, research evidence, tools, agents, ideas, and saved signals.

**Lane ownership:** Non-creative/non-production lanes are configured here.

**Result:** Strategy and research become usable inputs, not disconnected notes.

### `/app/social` — Socials

**Need:** Stage, review, schedule, publish, interact, measure, and learn.

**Flow:** Select production/channel; prepare platform package; validate platform requirements; review; explicitly approve; publish/schedule; capture reports and feedback; promote useful signals.

**Platforms:** YouTube, X, TikTok, Instagram, Facebook first.

**Result:** Every release has explicit status, destination, owner, feedback, and next-step signal.

### `/app/staffing` — Staffing

**Need:** See studio roles and available agents.

**Studio Team:** Filled/vacant roles, assigned agent, capabilities, lane, status, and configuration.

**Gem Sourced:** Full standard catalog, versions, capabilities, department fit, configuration preview, and owner-created agents.

**Dry launch:** All agents are available to the owner without commerce. Assignment/configuration works. Purchase, entitlement, protected-file delivery, and transactional hiring are post-launch.

**Result:** Every required role has a visible responsible agent or clear vacancy.

Secondary routes `/app/agents` and `/app/builder` remain reachable through the appropriate module pages.

## 5. Studio pages

### `/app/builder` — Build Production

**Need:** Configure reusable Creative and Production lanes.

**Flow:** Select department; create/edit lane; define role and required inputs/outputs; assign agent; configure handoff and approval gate; save and test readiness.

**Owns:** Creative and Production lanes only. Marketing/Research/operations lanes stay in Front Office Marketing.

**Result:** Production Set has a clear, runnable operating structure.

### `/app/studio` — Production Set

**Need:** Run active productions through configured lanes and agents.

**Flow:** Open production from channel brief; inspect current lane; provide context; review agent result; approve/revise/reject; advance handoff; monitor budget/schedule; select output; prepare release.

**States:** Draft, active, waiting approval, blocked, paused, failed, completed, cancelled.

**Result:** User always knows what is waiting, why, who owns next action, and what artifact is authoritative.

### `/app/front-office` — Open Production subflow

**Need:** Start a production from a channel.

**Flow:** Select channel, title, brief, audience, rights attestation, run mode, credit cap, and schedule; validate; create persisted production; redirect to Production Set/detail.

**Result:** Production exists with safe defaults, traceable brief, and no work started before required rights and budget checks pass.

### `/app/productions/[productionId]` — Production detail

**Need:** Inspect and control one production.

**Displays:** Brief, channel, lane/agent progress, approvals, artifacts, GenPlay documents, shot versions, events, budget, schedule, and release readiness.

**Assembly workbench (owner ruling 2026-08-23):** Production detail includes an assembly workbench — ordered shot sequence, trim/keep decisions, audio/music choices — that produces an edit decision list and assembly package for off-site editing, with pasted/uploaded results stored in the same artifact slots the worker uses. A full in-browser timeline editor is a later provider-era upgrade on the same interface, not beta scope.

**Result:** One authorized source of truth for production decisions and history.

### `/app/assets` — Assets warehouse

**Need:** Find and understand every Studio file and record.

**Includes:** DNA, brand/channel docs, briefs, scripts, screenplays, storyboards, images, audio, clips, generated outputs, masters, social variants, and GenPlay documents.

**Functions:** Search, filter, preview, tag, version, lineage, rights, channel/production links, approval status, and download where authorized.

**Result:** Assets remain traceable, reusable, private, and connected to source work.

`/app/universe` and `/app/dna` become Assets subviews. `/app/genplay` is not a primary page; it redirects to an Assets-filtered view or production document view.

### `/app/orchestration` — Workflow builder (owner ruling 2026-08-23)

**Need:** Configure, run, and inspect the studio's production workflows. This is the supported surface for customizable flows: departments, lanes, handoff rules, collaboration modes, and execution state.

**Flow:** Start from a template (the 13-stage Gem Studio default, or a trimmed/bespoke definition); edit workflow definitions, lanes, and handoff rules; run productions through them; inspect executions, steps, and errors.

**Result:** Workflow definitions are user-owned, versioned workspace data. The fixed 13-stage flow ships as the default template, not hard-coded law; built-in and custom definitions run through the same engine. This remains inside the Studio module — it does not add a fifth module.

## 6. Account pages

### `/account` — Profile, Security, and Data

**Need:** Control identity, Studio settings, security, export, and destructive data operations.

**Includes:** Email, Studio name, password, MFA, active sessions, sign-out, data export, account deletion, channel archive/deletion, asset deletion policy, retention, and confirmation flows.

**Result:** User controls account and data lifecycle without hidden support-only operations.

### `/app/billing` — Billing and Usage

**Need:** See plan, credits, reservations, usage, products, invoices, and purchase history.

**Dry launch:** Read-only owner balance/usage. No required transaction path.

**Post-launch:** Checkout, taxes, refunds, protected-agent purchases, and subscription lifecycle.

### `/app/integrations` — Connections and Secrets

**Need:** Connect providers securely.

**Includes:** AI/model providers, social platforms, storage, validation status, capability mapping, masked values, replacement, rotation, and disconnect.

**Result:** Providers are usable without exposing credentials to browser or agents that lack permission.

## 7. Launch requirements

Dry launch must verify:

- Owner sign-in and session refresh.
- Real workspace bootstrap.
- Empty-to-populated channel flow.
- Marketing and research persistence.
- Lane and agent assignment.
- Production creation, review, approval, and artifact flow.
- Asset upload/read/lineage behavior.
- Social staging and explicit publish confirmation.
- Account export and deletion controls.
- Provider secret encryption and masking.
- RLS isolation and negative access tests.
- Responsive/accessibility checks.
- No demo records, fake transitions, hash routing, or localStorage product state.
- All controls and evidence in `planning/day-zero-public-hosting-security.md`.
- Production threat model reviewed against Unknown User, Front Office, Studio, Account, APIs, workers, Supabase, Storage, email, providers, social platforms, and payments.
- Zero unresolved critical/high findings. Medium findings require written risk acceptance, compensating control, owner, and expiry.
- Production restore rehearsal completed with measured RTO/RPO.
- Alerts, incident response, secret rotation, purge, and rollback rehearsed before traffic opens.

## 8. Open questions requiring owner decision before public-user launch

- Final plan prices, caps, add-ons, and license copy.
- Final Core Values, Terms, Privacy, and Gallery content.
- Public signup/invite policy.
- Payment provider and tax/refund rules.
- Premium agent protection and entitlement rules.
- Self-hosted packaging and supported limits.
- Data retention, deletion, and model-training policy.
- Legal/clearance desk design (owner ruling 2026-08-23: deferred — no legal advisors engaged; do not build until counsel input exists).
