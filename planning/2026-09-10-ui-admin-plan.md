# UI cleanup and site administration — approval plan

Date: 2026-09-10. Source: `dev` at `742205b177b6b4ba3604ac23d0557729617d108d`.
Planning branch: `dev-ui-admin-plan`. Status: implementation reviewed locally on 2026-09-11; owner-input and live-environment handoffs remain below. Not deployed or promoted.
Harness: Codex. Planner: Astra. Execution buckets: Luna work, Terra work, Sol sets.

**Current handoff:** owner requested wrap-up on 2026-09-11. See [the prioritized remaining-work list](ui-admin-remaining.md) for implementation status, verified evidence and outstanding work. This plan is not a completion certificate.

## 1. Review findings and scope

| Finding | Evidence | Consequence |
|---|---|---|
| Dashboard stays selected on child pages | `web/components/product/studio-shell.tsx` uses equality OR a descendant-prefix match for every item | Dashboard requires exact matching; route ancestry and current selection need separate treatment. |
| Third-level navigation occupies the content canvas | `web/components/product/channel-subnav.tsx` renders a full-width panel and select; five channel clients own local `activeView` state | Move the selection into the sidebar with a shared view contract; changing CSS alone will not connect the controls. |
| Current specification and tests require that dropdown | `planning/site-workflow-spec.md` navigation sections; `web/tests/unit/channel-third-tier-nav.test.ts` | Update behavior contracts before changing implementation. Preserve view coverage while replacing outdated dropdown assertions. |
| Dashboard presents fabricated operational data | `channel-dashboard-client.tsx`: 142 posts, 18.4k comments, 9.2k shares, fixed posting times, dated release entries | Remove fabricated values and charts; trace each replacement to persisted channel/workspace records. |
| Footer has two social destinations | `web/components/shell/site-footer.tsx`: GitHub and GitLab only, plus lorem ipsum | Restore the full nine-platform set and real copy. Seven profile URLs still need identification. |
| Public placeholder copy extends beyond footer | Marketing pages and authentication sidebars contain lorem ipsum | Include a bounded public-copy cleanup; legal/payment claims need their own owner decisions. |
| Pink finale is a likely target | `web/components/blocks/landing/landing-experience.tsx`, section `#next`; `landing-page.module.css` | Apply the requested pink/black/bright-symbol direction once the screenshot location is confirmed. This mapping is inferred. |
| Admin boundary is already described, not proven implemented | `planning/commercial-service-architecture.md` §10 requires separate authorization, MFA, reason and audit | Build on that seam. A workspace owner is not automatically a site operator. No admin route appears in the inspected route inventory. |

This is a source review, not a rendered-page audit. Screenshots arrived as Obsidian filenames, without image bytes. Exact visual measurements, the cyan-button target, and the rotating-slot location remain unverified. The local unDraw library was not found. `docs/CODEX-NAVIGATION-GUIDE.md` was also absent; repository instructions and `planning/README.md` supplied navigation context.

Tastemaker findings: fabricated proof violates gate 47; lorem ipsum violates gate 46; wasted layout is a restraint/hierarchy issue requiring browser verification. Exact contrast and visual scores are not claimed from source alone.

## 2. Requirement inventory

| ID | Required outcome | Owner tasks | Acceptance |
|---|---|---|---|
| R01 | Preserve strong pink; shorten copy; black, wide, bold typography | T01, L02 | Pink section keeps its identity; one short headline, at most one support sentence; no clipped type. |
| R02 | Tell the story with bold cyan, bright-yellow and fluorescent-green icons/emoji | L02 | Coherent three-beat concept sequence, readable labels, consistent symbol weight; no decorative clutter or invented proof. |
| R03 | TikTok, YouTube, Instagram, X, Telegram, Discord, Facebook, GitHub, GitLab | L01 | All nine named links reach approved real destinations; accessible names and keyboard focus. |
| R04 | Third-level choices inside sidebar, only for selected subpage | T02–T04 | Dashboard has none; each selected non-dashboard subpage reveals only its own nested choices. |
| R05 | Only current destination highlighted; third-level selection faded cyan | T02, T03 | Dashboard loses selected state on descendants; exactly one current subpage and one selected view where applicable. |
| R06 | Reclaim space across every authenticated page | T06–T08, L06 | Route/view matrix reviewed at mobile/tablet/desktop; no empty structural columns or oversized utility rows. |
| R07 | Show only real studio data | T05 | Every operational number, chart and record has a persisted source; missing/error data never masquerades as zero or success. |
| R08 | Make the identified action cyan | L03 | Only the identified action changes; black readable label, focus/hover/disabled states verified. |
| R09 | One rectangle rotating site tips/promotions | T09, T10 | One slot, one item visible; authored content; pause/manual controls; no blank reserved box. |
| R10 | One site-admin login/access point | S01, T11 | One named operator initially, existing sign-in plus MFA; customer accounts denied server-side. |
| R11 | Admin manages banners, training, images and documents | T09, L05, T11 | Draft, preview, publish, unpublish and recover previous revision; public sees only approved published content. |
| R12 | Basic account review, duplicate review, banned-content review | S02, T11 | Search and review real records; record reason/outcome; enforce approved reversible restrictions. No automatic merging/deletion. |

Screenshot references retained for implementation matching: `20260910031216` = pink text; `20260910031437` = socials; `20260909161905`/`20260909162058` = third-level navigation; `20260909162833`, `20260909162437`, `20260910032718` = density; `20260909162219` = selection; `20260909162623` = cyan action; `20260910032827` = rotating slot. All refer to `Pasted image <timestamp>.png`.

## 3. Proposed contracts

### Design and density

Keep existing logo, semantic palette, display/body fonts and component stack. Tailwind 4 is installed; landing already uses a CSS module. Extend both in place. No dependency or GSAP addition is proposed. Current style lock already permits short CSS state feedback.

Pink section: black display text, weight 700–800 where the existing face supports it, broad letterforms, normal line height, no artificial horizontal stretching. Proposed copy: **“Make your next world.”** Three compact story beats: **Idea / Build / Release**, each carried by a bold symbol. Cyan, yellow and lime are symbol fills; black outlines/labels keep meaning legible on pink. Resolve exact hues against current tokens and verify contrast before locking them. User-requested emoji remain permitted; consistent SVG symbols offer more predictable color and weight.

Ideagram concept: “A creator turns an idea into a finished film.” First reuse existing licensed project assets. If one scene adds meaning, match a real local unDraw illustration, recolor original accent only, validate SVG and embed it. Library is currently unavailable; asset sourcing remains explicit, with no fake illustration-completion claim. No illustration is needed in every dashboard card.

Authenticated pages: compact title/actions row; only main work sections span the full canvas. Utility controls use content width. Supporting panels share responsive rows when their content fits. Use existing 4-point spacing scale, typically 12–16px gaps for tools, larger gaps for major sections. Remove arbitrary minimum heights and empty columns; preserve usable whitespace, touch targets, readable form widths and scrollable editor canvases. Do not stretch short forms just to fill a screen.

### Navigation

Create one typed registry of existing subpage/view IDs; move current group definitions there. Proposed view state is an allowlisted `?view=` query parameter on the existing route. It supports direct links, refresh, back and forward without adding routes. Missing/invalid values select that subpage's documented default. This replaces the current spec's local-only selection and is part of plan approval.

Sidebar expands the active subpage's children after navigation, including direct page entry. Sibling child groups stay hidden. Dashboard matches its exact channel root only. Use segment-boundary matching for channel IDs; do not select a channel by loose string prefix or default to `channels[0]` on unrelated Account/utility pages. Distinguish contextual parent styling from current-page/view styling. Current third-level view uses faded cyan plus a non-color indicator and appropriate accessibility state.

### Truthful data

Build a source ledger: rendered item, loader/service, persisted table/field, workspace/channel scope, freshness, missing/error behavior. Remove fabricated metrics, heatmaps, calendars, merchants, locations, events and success fallbacks across runtime product surfaces. Keep deterministic fixtures in tests; labels/options/domain constants are not fake operational records. No production database purge is authorized by this UI plan. Any suspected seeded rows get an ID-scoped cleanup proposal first.

For an actual empty result, show “No records yet” and a useful supported action. For an unconnected source, show “Not connected”; for errors, show retry/error state; for stale provider data, show last-updated time. Use zero only when an authoritative count is zero. Do not build social publishing adapters to fill widgets: that is separate existing roadmap work.

Public factual proof must also be real and explicitly approved for public display. Illustrations and clearly labeled concept art may explain the product; never relabel them as customer output or live studio records. Private studio data never flows into public proof automatically.

### Content and rotating slot

Proposed minimal editorial model: content item with kind (`banner`, `tip`, `promotion`, `training`, `document`, `image`), named placement, title/body, optional safe CTA/media reference, draft/published/archived state, revision, audience and optional start/end times. Use structured text/simple fields and existing controls; no page-builder or rich-text dependency.

Separate global editorial records from workspace-private records. Public reads expose only effective published revisions for the requested placement/audience; previews require operator access. Validate destination protocols, file type/content/size and alt text. Use new versioned image objects for replacement so rollback retains the prior asset. Public editorial uploads and private studio assets have separate access rules. Training means site help/tutorials, never protected agent files or system prompts. Documents means public/help documents; workspace documents keep existing tenancy.

One compact rectangle at the confirmed location. Initial proposed timing: 8 seconds per item, short opacity transition, pause on hover/focus and hidden tab; reduced motion disables auto-rotation. Provide previous/next/pause controls with stable dimensions. One item stays static; no published items collapses the slot; errors do not invent a promotion. User can approve a different interval/location without changing the architecture.

### Admin and moderation

Propose an operator-only **Administration** section under Account, initially at existing `/account?section=administration`, preserving four modules and existing sign-in. This is a proposed placement, not an approved route addition. One named operator account initially; no shared password and no client-side email allowlist.

Authorization is checked for every server read/write, with current operator grant, MFA assurance, revocation handling and audit reason. Customer workspace-owner permissions remain separate. Sensitive grants must not depend on user-editable metadata. Supabase documents the distinction between grants and row policies, and warns that service-role credentials bypass RLS: [RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security). MFA assurance must be enforced for privileged access: [MFA guidance](https://supabase.com/docs/guides/auth/auth-mfa).

Account review starts with safe summary fields: account/workspace identifiers, creation time, status and review history. Duplicate review links candidate records and records confirmed/dismissed outcomes; detection rules and any cross-account matching require owner agreement. Do not infer duplicates from shared IP alone. Banned-content review links the reported asset and applicable policy, supports restricted preview, reason, reviewer and timestamp. Proposed actions are dismiss, request changes, reversible quarantine and reversible suspension, subject to the approved policy. No automatic bans, account merging, unrestricted impersonation or bulk deletion.

## 4. Depth tree and model buckets

`tree 6` is a maximum meaningful depth. The deepest branch is: program / admin / moderation / enforcement / atomic state-and-audit contract / S02. Smaller UI deliverables stop earlier; no filler subtasks.

| Branch | Leaf tasks |
|---|---|
| Program / contract | T01 |
| Program / public / identity and communication | L01, L02, L04 |
| Program / authenticated / navigation / state and rendering | T02, T03, T04 |
| Program / authenticated / truthful data | T05 |
| Program / authenticated / density and actions | T06, T07, T08, L03 |
| Program / editorial / persistence and presentation | T09, T10, L05 |
| Program / admin / privileged access / authorization / S01 | S01 |
| Program / admin / moderation / enforcement / atomic state-and-audit contract / S02 | S02 |
| Program / admin / integrated console | T11 |
| Program / verification | L06, T12 |

Implementation approved. Execution consolidates adjacent tasks into scoped worker packages to reduce shared-file handoffs: public, channel navigation/views, admin/editorial, then data/density and integration. Current states and exact live ownership are in `.unlazy/ui-admin/PLAN.md`. Each task owns its focused tests as well as the listed implementation paths. A parent re-verifies every returned package. Unknown social destinations remain configurable rather than invented; screenshot-specific targets use the proposed locations where available.

### Luna work — gpt-5.6-luna, low

| Task | Deliverable / Owns | Needs | Acceptance gate |
|---|---|---|---|
| L01 | Restore nine social links and remove footer filler. `web/components/shell/site-footer.tsx`; new `web/lib/site/social-links.ts`; its test | T01; seven verified URLs | Nine distinct labels/destinations; no `#` substitutes; wrapping, focus and external-link attributes work. Existing GitHub/GitLab destinations are preserved unless corrected. |
| L02 | Apply approved pink story treatment and assets. `web/components/blocks/landing/landing-experience.tsx`, `landing-page.module.css`; new `web/public/site-story/*` | T01; pink target confirmed | Copy budget, black bold wide display, cyan/yellow/lime story symbols; contrast and responsive screenshot gates pass; asset embedded and licensed. |
| L03 | Cyan action styling in exactly the confirmed component and its focused regression test | T01; target file/label resolved; owning density task complete | Correct action alone receives cyan; behavior unchanged; readable label and all interaction states. Exact path must replace this unresolved ownership before dispatch. |
| L04 | Replace nonlegal public/auth placeholder prose with source-grounded concise copy. Existing `web/app/(marketing)/**/page.tsx`, marketing `not-found.tsx`, and `web/app/(auth)/**/page.tsx`; exclude `terms`, `privacy`, `core-values`, `pricing`; new focused copy test | T01 | No lorem ipsum in owned surfaces; auth behavior preserved; no invented metrics/testimonials. Legal, values and pricing copy goes through explicit owner review, not an invented replacement. |
| L05 | Basic content editor fields and list rows against a settled service contract. New `web/components/admin/content-editor.tsx`, `content-list.tsx`; focused tests | T09 | Labelled native inputs, persisted result handling, pending/error states, no forged success; presentation invokes guarded server operations. |
| L06 | Complete route/view capture matrix and record visual defects. `web/tests/e2e/ui-density.spec.ts`; evidence under task-local `.unlazy/` | L01–L05, T03–T11, S01, S02; runnable test accounts | Every matrix row captured; keyboard/overflow/selection checks; honest unavailable-environment report. Terra fixes logic defects, Luna handles mechanical corrections within reassigned scope. |

### Terra work — gpt-5.6-terra, medium unless marked high

| Task | Deliverable / Owns | Needs | Acceptance gate |
|---|---|---|---|
| T01 — high | Final product/design contracts and dispatch manifests. `planning/site-workflow-spec.md`, `spec-contract-coverage.md`, `commercial-service-architecture.md`, `TODO.md`, this plan; `.tastemaker/style-lock.md`, `decisions.log` | Approval for the relevant branch of §7 | Update spec, coverage, implementation plan, then tasks; retain every R01–R12 mapping. Verify UI contracts separately from the admin addendum so unresolved admin decisions do not block approved UI work. Resolve each leaf's paths and policy before releasing it. |
| T02 — high | Navigation registry and validated view-state resolution. `web/lib/studio/navigation.ts`, `navigation.test.ts`; new `channel-views.ts`, its test and `web/components/product/use-channel-view.ts` | T01 | Tests for exact dashboard, sibling-prefix collisions, missing/invalid view, channel switching, Account context, refresh/back/forward. No cross-page stale view. |
| T03 | Sidebar hierarchy, selection and shared canvas spacing. `web/components/product/studio-shell.tsx`; new shell regression test | T02 | Only active subpage children appear; selected view faded cyan; desktop collapse/mobile drawer/focus preserved; duplicate full-width nav removed through T04 integration. |
| T04 | Wire all five channel clients to shared view state; retire old content dropdown. `channel-subnav.tsx`; `channel-{staffing,marketing,social,assets,production}-client.tsx`; `web/tests/unit/channel-third-tier-nav.test.ts` | T02, T03 | Every existing view remains reachable with identical data/actions; sidebar selection changes the rendered view; channel Dashboard has no third tier. |
| T05 — high | Runtime data provenance and fake-data removal. `web/components/product/**`, `web/app/(product)/**`, affected `web/lib/studio/**`; explicit source/test manifest frozen before dispatch | T04, T01 | Every runtime operational display traced; no demo fallback; workspace/channel filters verified; populated, empty, unavailable, error and stale cases covered. Broad ownership requires exclusive execution against these paths. |
| T06 | Compact channel dashboard after data cleanup. `web/components/product/channel-dashboard-client.tsx`; dashboard tests | T05 | Real main report sections use full width; short stats share rows; hiding widgets leaves no empty columns; no invented chart filler. |
| T07 | Compact all five channel subpages and every third-level view. Same five clients as T04; layout regression tests | T05 | Density matrix covers all view IDs, including long forms and editors; useful supporting content sits adjacent; no empty fixed-height panels. |
| T08 | Compact every other authenticated route and Account. `web/app/(product)/**`; `web/app/globals.css`; remaining `web/components/product/**` excluding T06/T07 files and T03 shell; exact manifest before dispatch | T05; T06/T07 for shared CSS verification | Every route in §5 covered; editor canvases retain usable height; narrow forms and tables behave at all breakpoints. Shared CSS must not regress public pages. |
| T09 — high | Editorial persistence, published reads, guarded writes, revisioned media and docs integration. New `web/lib/site/content.ts`, `content.test.ts`, `web/app/(product)/site-content-actions.ts`; migration suffix `*_site_content.sql` and DB tests; `web/app/(marketing)/docs/**` | T01, S01; schema/storage approval; L04 for docs file handoff | Draft isolation; durable reload; publish/unpublish scheduling; concurrent edit conflict; media validation; safe previews and revision recovery. Reuse existing storage/docs paths where viable. |
| T10 | Single accessible rotating slot and live published-content wiring. New `web/components/product/site-tip-slot.tsx`, its test; confirmed insertion file (`studio-shell.tsx` proposed) | T09, T03, T08; slot location fixed | No placeholder feed; zero/one/many behavior; timer cleanup, pause/reduced motion, stable dimensions and no focus movement. Own shared insertion file only after prior owners release it. |
| T11 — high | Integrated Account admin section: content tabs, account search, review queues, safe preview. `web/app/(product)/account/page.tsx`; new `web/components/admin/admin-console.tsx`, `account-review.tsx`, `moderation-review.tsx`; focused tests | S01, S02, T09, L05, T08 | Authorized operator completes each management flow; ordinary user cannot load privileged data or invoke operations directly; pagination and stable errors. |
| T12 — high | Final cross-feature integration, adversarial review and release evidence. `web/tests/e2e/ui-admin.spec.ts`; affected integration tests; task-local gate ledgers; `planning/TODO.md` completion evidence | Every other task; all required environments available | Full affected tests, coverage, build/lint/typecheck, tenant/adversarial tests and owner visual review pass. Any implementation file correction requires explicit ownership handoff. |

### Sol sets — proposed hardest work, gpt-5.6-sol high/xhigh

These are reserved frontier assignments. Before dispatch, review Luna fit, then Terra high. Sol is used only if Terra cannot close the security/concurrency contract; record that evidence and amend the dispatch tier if Terra suffices. No ordinary UI task needs Sol by default.

| Task | Deliverable / Owns | Needs | Acceptance gate |
|---|---|---|---|
| S01 | Privileged operator boundary spanning session assurance, grants, revocation and tenant-safe auditing. New `web/lib/studio/operator-access.ts`, `operator-access.test.ts`, `web/app/(product)/operator-actions.ts`; migration suffix `*_operator_access.sql` and DB tests; existing server security helpers only after manifest review | T01; named operator/bootstrap/recovery approval; schema approval | Anonymous/customer/workspace-owner/forged metadata/stale grant denied; valid MFA operator allowed; revocation effective on next privileged operation; no privileged payload or secret in browser; each mutation auditable. Hard part is proving consistent enforcement across all entry points. |
| S02 | Durable duplicate/content-review decisions and enforcement. New `web/lib/studio/moderation.ts`, `moderation.test.ts`, `web/app/(product)/moderation-actions.ts`; migration suffix `*_moderation_reviews.sql` and DB tests; impacted asset/publish/job guards assigned after T05 | S01, T05; approved review policy and reversibility | Duplicate candidates can be dismissed/confirmed without merging; quarantine/release/suspension decisions require reason; retried/concurrent decisions do not double-apply; state plus audit remains consistent; direct download/publish/job paths obey restrictions. Hard part is closing bypass and race paths. |

## 5. Complete authenticated coverage matrix

L06 records each row as populated/empty/error, narrow/wide, applicable views, and evidence path. Test data belongs only in isolated test environments. Actual studio runtime remains live-data-only.

| Surface class | Existing routes to verify |
|---|---|
| Reports / Front Office | `/app`, `/app/channels`, `/app/collective`, `/app/front-office`, `/app/marketing`, `/app/social`, `/app/staffing`, `/app/agents` |
| Channel | `/app/channels/[channelId]` plus `/staffing`, `/marketing`, `/social`, `/assets`, `/production`; every existing third-level ID from the registry |
| Studio / editors | `/app/studio`, `/app/builder`, `/app/orchestration`, `/app/productions/[productionId]` |
| Assets / continuity | `/app/assets`, `/app/universe`, `/app/universe/[id]` |
| Setup / connections | `/app/onboarding`, `/app/integrations`, `/app/secrets` |
| Account | `/account`, `/app/billing`, proposed operator section |
| Compatibility | `/dashboard`, `/app/dna`, `/app/genplay`; confirm redirects and final selected navigation |

Viewports: 390px, 768px, 1440px; public fold at 1280×800. Include 200% zoom, long channel names, no channels, multiple channels, brand channel, long lists, absent optional widgets, collapsed sidebar and mobile drawer. Tables may scroll inside their container; the page must not overflow horizontally. Contrast: normal text 4.5:1; meaningful state indicators 3:1, plus non-color state cues.

## 6. Dispatch and verification

Approval first. Materialize `.unlazy/ui-admin/PLAN.md`, root gates, branch integration ledgers and one narrow leaf ledger per task before execution. Each contains exact `OWNS`, `Needs`, tier/thinking, `CHECK`, `EXPECT` and evidence. Existing test commands are inspected; no gate executes merely because it appears in a file. This planning turn uses a separate manual review ledger.

Use at most three workers plus the parent. Ready tasks launch together; returns are independently verified and unblock work immediately. No waiting for an unrelated slow task. Shared paths serialize even if work sounds independent.

| Wave | Ready work / dependency rule |
|---|---|
| 0 | T01 resolves contract/ownership for each approved branch. Only dependent leaves wait for a missing decision. |
| 1 | T02, L01, L02; roll L04 into an available slot. S01 may proceed once its separate approvals are settled. |
| 2 | T03 then T04. T05 follows and holds exclusive product/domain ownership; schedule S01 around any shared helpers. |
| 3 | T06 and T07 can run independently. T08 has separate files but any shared CSS edits serialize. S02 waits for T05 and available capacity. |
| 4 | T09 after S01 and docs-copy handoff; L05 follows. L03 runs after the confirmed component owner. |
| 5 | T10 and T11 after their dependencies; shared insertion paths must be free. |
| 6 | L06 then T12; fix surfaced defects under bounded ownership and reverify affected branches. |

TDD for changed logic: failing behavior check, smallest implementation, affected suite, refactor while green. Use existing Vitest/Playwright tooling; no new framework. A shared-file test belongs to one writer at a time. Worker brief explicitly states other agents share the codebase and their changes must be preserved.

Leaf checks cover the leaf only. Branch gates cover: public copy/assets/social destinations; sidebar-to-view integration; data source/empty/error behavior; editorial publication and slot refresh; privileged access/moderation enforcement. Root gates run the affected full suite and repository-required checks once after integration: from `web`, `npm test`, `npm run test:coverage` (80% minimum), `npm run lint`, `npm run typecheck`, `npm run build`, relevant `npm run test:e2e`; root migration/security/structure checks where affected. Coverage shortfalls are reported, not concealed by excluding hard files. Run source-only visual/motion scans on changed UI, inspect rendered results, and reverify after fixes.

Adversarial cases: workspace A cannot read/mutate B; ordinary workspace owner cannot become site operator; drafts cannot leak; expired/revoked operator access fails; stored content cannot inject markup/scripts/unsafe links; hidden assets remain inaccessible through alternate paths; retries and conflicting reviews preserve coherent status/audit. Security reviewer signs off before commits. Do not claim live staging/database gates passed using mocked tests.

Branch workflow after approval: each task starts `dev-<task>` from current `dev`; integrate latest `dev`, verify, merge completed result into `dev`, push GitLab per repository policy, delete finished task branches. Promotion to staging/production needs owner approval and release gates. This turn does not commit, push, deploy, install dependencies or mutate remote data.

## 7. Decisions and approval scope

The plan can be reviewed now. These are implementation inputs, not missing planning work:

1. Provide seven missing social destinations and confirm the screenshot's cyan action. Existing GitHub/GitLab links are source findings, not independently verified ownership claims.
2. Confirm pink target (`#next` proposed), rotating-slot location, and 8-second interval. File names alone cannot establish those locations.
3. Approve sidebar view selection via `?view=` and update of the current dropdown/local-state contract.
4. Approve the Account admin section, named initial operator, grant bootstrap/recovery method and exact basic-account fields. No credentials belong in the plan.
5. Approve additive editorial/operator/moderation schemas and storage policies before those tasks run. Approve exact moderation actions, duplicate evidence rules and banned-content policy; existing legal wording is not silently rewritten.

UI cleanup and admin can be approved separately. If admin is held, R09/R10–R12 remain pending and the overall implementation is incomplete; a static dummy promo is not a substitute. Missing social URLs or screenshot targets block only their dependent leaves.

Planning completion means all requirements are assigned with honest dependencies and reviewable acceptance. Product completion means all required leaf/branch/root gates pass with current evidence and no outstanding owner decision.

Skill impact: Unlazy supplied gates/ownership/dispatch; Codex routing separates mechanical, integration and exceptional security work; Tastemaker preserves established identity while correcting density and proof; Ideagram defines honest illustration sourcing; Tailwind reuses installed utilities; Ponytail keeps native controls and existing dependencies. No design memory, style-lock or personal-profile changes were made during planning.
