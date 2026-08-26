# Demo-to-Live Conversion Plan

**Status:** Implemented and locally verified; external launch configuration remains
**Scope:** Public marketing surface and authenticated dashboard
**Source of truth for visual direction:** Root demo (`index.html`, `dashboard.html`, `assets/css/*`, `assets/js/app.js`)
**Target architecture:** `web/` Next.js App Router + Supabase-backed live data
**Conversion rule:** Match the demo’s visible layout, copy, states, motion, and interactions as closely as possible; change only the implementation language/runtime and the data boundary.

## 1. Decisions captured

- Convert **both** the public marketing site and authenticated dashboard.
- Pursue **exact visual and interaction parity** with the existing demo, not a simplified content-only port.
- Rebuild in idiomatic Next.js/React/TypeScript; do not embed the demo HTML or preserve localStorage/hash routing as the production source of truth.
- Make supported interactions live against Supabase.
- Use live authenticated data and honest empty/loading/error states; do not expose fake demo records as production data.
- Treat the Social Workshop signal board as a real workspace feature, not only a presentation mockup.
- Core Values is outside this conversion scope; do not block the migration on that page’s unresolved copy.

## 2. Current-to-target route map

The demo uses `index.html` and `dashboard.html` with hash routes. The live product keeps direct, refreshable Next.js routes:

| Demo surface | Live target | Conversion |
|---|---|---|
| `index.html` | `/` | Full landing-page visual/interaction port |
| `#studio` section | `/` + `/studio` | Preserve landing anchor and port the full Studio detail page |
| `#system` section | `/` + `/system` | Preserve landing anchor and port the full System detail page |
| `#social` section | `/` + `/social-workshop` | Preserve landing anchor and port the full Social Workshop detail page |
| `dashboard.html` / `#/` | `/app` | Authenticated Studio view with live workspace data |
| `#/builder` | `/app/builder` | Live departments, lanes, agents, and agent-file editor |
| `#/channel/:id` | `/app/channels/[channelId]` | Authorized channel detail and production list |
| `#/production/:id` | `/app/productions/[productionId]` | Authorized production detail, workflow, and events |
| Demo file URL `/dashboard.html` | `/dashboard` compatibility entry | Add a compatibility route/redirect to the authenticated `/app` experience if required by existing links; do not retain hash routing |

The existing live route names remain the canonical implementation routes unless a later owner decision explicitly changes them.

## 3. Public marketing conversion

### 3.1 Landing page parity

Replace the simplified live marketing home with the demo’s full composition:

1. Shared atmospheric shell: logo, primary navigation, command button, mobile menu, noise overlay, cursor glow.
2. Hero:
   - Eyebrow and online/live indicator.
   - Exact headline and lede hierarchy.
   - Three CTA paths: dashboard/account entry, studio walkthrough, system handoff.
   - Hero stage artwork including frame window, orbit lines, signal cards, labels, stamp, and progress bars.
3. Repeating ticker band for department names.
4. Studio section:
   - Four department cards.
   - Exact number/label/title/copy/list treatment.
   - Card arrows routed to the correct detail or anchor destination.
5. Handoff section:
   - Four-step flow board with dots and connecting line.
   - Quote panel and principle treatment.
6. Social Workshop section:
   - Workbench copy and CTA.
   - Signal board with live filter behavior.
7. Closing CTA section.
8. Exact footer statement, navigation, contact, and legal/product links.
9. Command dialog with keyboard shortcut behavior and accessible focus handling.

The marketing page must use the live auth-aware CTA behavior: logged-out users go to sign-up/login; authenticated users can enter `/app` without seeing a dead demo link.

### 3.2 Detail pages

Port the visual composition and copy hierarchy from the corresponding demo sections into:

- `web/app/(marketing)/studio/page.tsx`
- `web/app/(marketing)/system/page.tsx`
- `web/app/(marketing)/social-workshop/page.tsx`

Keep the existing direct routes and shared public shell. Do not duplicate header/footer markup per page.

### 3.3 Content and legal boundary

- Do not include Core Values in this migration’s acceptance criteria.
- Preserve the existing Terms and Privacy routes and shared shell.
- Do not copy unresolved placeholder content into new production UI.
- Keep public marketing copy version-controlled in the existing `web/content/` or page-content convention.

## 4. Authenticated dashboard conversion

### 4.1 Studio view (`/app`)

Rebuild the demo dashboard’s visual structure rather than the current plain overview:

- App header with Studio, Lanes & agents, and Site destinations.
- Channel cards with identity/strategy summaries and production counts.
- Active production list with department progress pipe.
- Empty states for a new workspace.
- Live counts and records from Supabase; no `seed()` or localStorage fallback.

The page must retain the demo’s information hierarchy while showing the current workspace’s real records.

### 4.2 Channel detail

Port the demo’s channel page into the existing authorized route:

- Channel identity/strategy panel.
- Production list and current department/status.
- New production action.
- Empty, loading, validation, and server-error states.
- Links to the live production detail route.

### 4.3 Production detail

Port the demo production view into the existing route:

- Channel breadcrumb.
- Production title and current action.
- Full department flow/progress treatment.
- Live stage advancement only where the existing production action contract supports it.
- Recent production event history.
- Status controls remain server-authorized and workspace-scoped.

If a demo control has no persisted live equivalent, preserve its visual state but wire it to the nearest supported server action or present a truthful disabled/future state; never simulate a successful mutation.

### 4.4 Builder

Port the demo builder’s nested department → lane → agent hierarchy into the existing live page:

- Department sections and add-department action.
- Lane rows and add-lane action.
- Agent chips/rows with worker/supervisor distinction.
- Six-file agent editor dialog.
- Persisted server actions for all edits.
- Dialog keyboard/focus/close behavior equivalent to the demo.
- Live errors and optimistic/loading states without localStorage.

## 5. Social Workshop as a workspace feature

The public page retains the demo signal-board presentation, but the board becomes backed by a defined workspace data model.

### 5.1 Proposed data model

Add a workspace-scoped signal table or equivalent approved schema containing at minimum:

- `id`
- `workspace_id`
- optional `channel_id` / `production_id`
- signal type (`native`, `conversation`, or approved future types)
- title
- description/body
- display metadata/tag
- ordering/status
- timestamps

Use RLS through workspace membership. Do not let client-provided filters bypass authorization.

### 5.2 Product behavior

- Render live signal cards in the authenticated workspace context.
- Preserve demo filters (`All`, `Native cut`, `Conversation`) as real client/server-filtered state.
- Show a truthful empty state when no signals exist.
- Define create/edit ownership before adding mutation UI; the first conversion may support read/filter behavior plus approved server actions if creation requirements are not yet available.
- Public marketing view may use approved static editorial examples only if explicitly marked as presentation content and not confused with private workspace data.

## 6. Component and styling strategy

### 6.1 Reuse and extraction

Create reusable components instead of duplicating demo markup:

- Public site header/nav/mobile menu.
- Public footer.
- Hero frame/stage.
- Department desk card.
- Handoff flow board.
- Signal board/card/filter tabs.
- Command dialog.
- Product app header/navigation.
- Channel card and production row.
- Department/lane/agent builder sections.
- Production progress pipe.

Use the current live shell/components as the ownership boundary and extend them where possible.

### 6.2 Assets and CSS

- Move/reuse the approved logo and gem-mark assets through `web/public/` or the existing live asset convention.
- Port tokens from `assets/css/tokens.css` into the live global token layer.
- Port relevant styles from `assets/css/app.css` into `web/app/globals.css` or focused component styles, matching the project’s current convention.
- Port only the needed behavior from `assets/js/app.js` into React/client components; do not import the demo script wholesale.
- Preserve the demo’s motion, reveal, filtering, command navigation, and responsive intent while adding reduced-motion and keyboard accessibility.
- Do not create a second production stylesheet or shell.

### 6.3 Accessibility requirements

- Keyboard access for navigation, command dialog, menus, filters, and editor dialogs.
- Visible `:focus-visible` treatment.
- Correct dialog semantics and focus return.
- Reduced-motion support.
- No hover-only information or actions.
- Responsive checks at 320, 375, 414, and 768px at minimum.

## 7. Implementation sequence

### Phase 1 — visual foundation

- Extract demo tokens/assets and compare against live global styles.
- Establish shared public/product shell parity.
- Port the landing page structure and responsive styling.
- Port command navigation, mobile menu, reveal motion, and signal-board filtering.

**Gate:** Public pages visually match the demo at desktop/mobile widths with no fake product data.

### Phase 2 — public detail pages

- Convert Studio, System, and Social Workshop detail pages.
- Wire all nav/footer/CTA links.
- Keep legal and Core Values scope unchanged.

**Gate:** Every public demo destination has a direct live URL and no dead links.

### Phase 3 — authenticated dashboard parity

- Convert `/app` overview.
- Convert channel and production views.
- Convert builder and agent editor.
- Preserve Supabase authorization and server actions.

**Gate:** A new account sees the complete visual system with empty states; a populated workspace sees only its own records.

### Phase 4 — signal board data integration

- Approve/apply signal data schema and RLS.
- Add server queries/actions.
- Connect authenticated board to live records.
- Verify public presentation content is clearly separate from private data.

**Gate:** Filters and records are live, authorized, and truthful.

### Phase 5 — verification and purge boundary

- Run typecheck/build.
- Run structure and security gates.
- Run route/link inventory.
- Browser-test all converted public and protected routes.
- Confirm no production dependency on root demo HTML, demo JS, hash routing, `localStorage`, or seeded fake records.

The root demo remains reference material during implementation and is retired/archive-purged only after the live conversion is verified and explicitly approved.

## 8. Acceptance checklist

- [x] `/` matches the demo’s full landing composition and responsive behavior.
- [x] `/studio`, `/system`, and `/social-workshop` are full-fidelity detail pages.
- [x] Marketing nav, footer, command dialog, menu, and CTAs work in logged-out and logged-in states.
- [x] `/app` matches the demo dashboard hierarchy using live workspace data.
- [x] Channel, production, and builder routes match their demo counterparts; the later-approved fixed 13-department model replaces department creation.
- [x] Agent editor persists all six files through authorized server actions.
- [x] Production progress/events/status behavior is truthful and persisted.
- [x] Signal board filters work and workspace signals are authorized.
- [x] New accounts show empty states, not demo records.
- [x] No hash routing or localStorage is part of the production source of truth.
- [x] No secrets or private records leak into browser code.
- [x] Typecheck, build, security gate, structure audit, database invariants, and browser smoke tests pass.

## 9. Files expected to change after approval

Likely existing files:

- `web/app/(marketing)/page.tsx`
- `web/app/(marketing)/studio/page.tsx`
- `web/app/(marketing)/system/page.tsx`
- `web/app/(marketing)/social-workshop/page.tsx`
- `web/app/(product)/app/page.tsx`
- `web/app/(product)/app/channels/[channelId]/page.tsx`
- `web/app/(product)/app/productions/[productionId]/page.tsx`
- `web/app/(product)/app/builder/page.tsx`
- `web/app/globals.css`
- Shared shell/product components under `web/components/`
- Relevant server actions under `web/app/(product)/actions.ts`

Potential additions:

- Focused marketing/product components.
- Public assets under `web/public/`.
- Signal-board migration, queries, and actions.
- Route compatibility entry for `/dashboard` if required.
- Tests for route inventory, signal authorization, and interactive states.

No files are deleted in the planning phase. Deletion/archiving of the root demo is a later, explicit purge step after verification.
