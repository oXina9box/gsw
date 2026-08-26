# Future Live Product Execution Blueprint

**Status:** Ready for owner review before implementation
**Target:** Finished live Gem Studio product
**Current repository role:** Reference material and migration input only
**Frontend:** Next.js App Router + TypeScript
**Backend platform:** Supabase Auth + Postgres + Storage + Edge Functions where privileged work is required
**Workspace model:** One private workspace per account first; schema remains team-ready

## 1. Implementation boundary

This blueprint implements the requirements in:

- `planning/complete/public-information-and-shared-shell-spec.md`
- `planning/complete/future-live-product-implementation-plan.md`

The target is the finished live product, not the current static demo. The current HTML/CSS/JS files are used to recover brand language, visual tokens, content concepts, assets, and the shape of the demo dashboard. They are not the target architecture.

Do not:

- Add authentication to the current localStorage dashboard as a shortcut.
- Preserve hash routing as the production application route model.
- Treat seeded demo records as starter production data.
- Expose private data through browser-only filtering or hidden links.
- Put Supabase secret/service-role credentials in browser code.
- Replace the project’s authoritative DNA data with unvalidated ad hoc records.

Before launch, demo pages, demo state, seeded records, fake transitions, and obsolete duplicate layout files are removed or archived outside the production surface.

## 2. Architecture decision

### 2.1 Future repository structure

Create one future application surface while keeping the existing DNA/GenPlay workbench available during migration:

```text
/
├── web/                              # future Next.js application
│   ├── app/
│   │   ├── (marketing)/              # public pages and shared public shell
│   │   ├── (auth)/                   # sign-in, sign-up, recovery, verification
│   │   ├── (product)/                # authenticated product routes
│   │   └── api/                      # only when a Next server boundary is needed
│   ├── components/
│   │   ├── shell/                    # header, footer, mobile nav, auth actions
│   │   ├── marketing/
│   │   ├── auth/
│   │   └── product/
│   ├── lib/
│   │   ├── supabase/                 # browser/server clients and session helpers
│   │   ├── authorization/             # workspace access helpers
│   │   ├── dna/                       # schema/type/validation adapters
│   │   └── content/
│   ├── public/                        # migrated logo/brand assets
│   ├── styles/                        # migrated token layer and global styles
│   ├── content/                       # versioned public/legal/value content
│   ├── tests/
│   ├── package.json
│   └── next.config.*
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   ├── seed/                          # development-only seed data, never production demo data
│   └── functions/                     # authenticated/privileged Edge Functions
├── dna/                               # schema and migration source during transition
├── genplay/                           # offline compiler/validator during transition
├── scripts/
│   ├── migrate-dna-to-supabase.*
│   ├── migrate-genplay-to-supabase.*
│   └── purge-demo-data.*
└── planning/
```

`web/` is the proposed future canonical application root. The owner should review this choice before scaffolding. The existing root-level `index.html`, `dashboard.html`, `assets/`, and `_attic/` are migration inputs, not a second application surface.

### 2.2 Rendering and routing

Use Next.js App Router with server-rendered public pages and protected product layouts:

- Public marketing/legal/value pages can be statically rendered or revalidated.
- Authenticated product pages load data through Supabase server clients scoped to the current session.
- Client components are limited to interactive controls, forms, mobile navigation, session transitions, and data interactions that genuinely need client state.
- The shared shell is implemented once and consumed by route layouts, not copied into each page.
- Public routes and authenticated routes use stable URLs that work on direct navigation and refresh.

Use the current official Supabase SSR integration for the installed version at implementation time. Session refresh must use the supported cookie/server-client pattern rather than a custom localStorage auth flag.

### 2.3 Data ownership decision

All future product and DNA data moves to Supabase Postgres. MongoDB is not the future source of truth.

The repository currently contains DNA JSON Schemas, examples, a local JSON DAO, and documentation describing a possible MongoDB registry. There is no confirmed working MongoDB integration in the inspected code. Therefore:

1. Treat the JSON records/schemas and any verified external records as migration input.
2. Preserve immutable `dna_id` values such as `CHAR-…`, `LOC-…`, and `PROP-…`.
3. Validate and transform records into Supabase Postgres.
4. Keep JSON Schema definitions as validation/source artifacts until the new runtime validators are verified.
5. Retire MongoDB references from the live product documentation once the migration is complete.

## 3. Route and page plan

### 3.1 Public routes

| Route | Source/integration | Result |
|---|---|---|
| `/` | Current `index.html` content and visual system | Public landing page with section anchors and detail links |
| `/studio` | New page based on current The studio section | Detailed public Studio explanation |
| `/system` | New page based on current The system section | Detailed handoff/process explanation |
| `/social-workshop` | New page based on current Social workshop section | Detailed social workflow explanation |
| `/core-values` | New content template | Public editable values framework |
| `/terms` | New legal draft content | Full AI-product/site Terms draft |
| `/privacy` | New legal draft content | U.S.-focused plain-language Privacy draft |
| `/login` | New auth flow | Live sign-in |
| `/signup` | New auth flow | Live account creation |
| `/forgot-password` | New auth flow | Recovery request |
| `/reset-password` | New auth flow | Authenticated password update |
| `/verify-email` | New auth flow | Confirmation/result state |

The landing page keeps `#studio`, `#system`, and `#social` for fast scanning. Each section receives a prominent detailed-page link. Any marketing CTA that refers to a protected product route sends a logged-out visitor to `/login?next=...`.

### 3.2 Authenticated routes

| Route | Current reference | Future behavior |
|---|---|---|
| `/app` | `dashboard.html` studio view | Authenticated workspace overview |
| `/app/channels` | Dashboard channel area | Workspace channels loaded from Supabase |
| `/app/channels/[channelId]` | Hash `#/channel/:id` | Authorized channel detail |
| `/app/productions/[productionId]` | Hash `#/production/:id` | Authorized production detail/workflow |
| `/app/builder` | Hash `#/builder` | Authorized departments/lanes/agents builder |
| `/account` | Not present | Profile, password/session, deletion, sign-out |

The route names can be adjusted during scaffold review, but the public/protected boundary cannot be weakened.

## 4. Shared shell implementation

### 4.1 Single source of truth

Implement:

- `SiteHeader` for brand, navigation, auth-state actions, and mobile menu.
- `SiteFooter` for the identical sitemap/footer structure on every route.
- `PublicShell` for marketing/legal/value pages.
- `ProductShell` for authenticated application pages while reusing the same header/footer components.
- `AuthState`/session provider only where client-side transition state is needed.

The shell receives a resolved auth state with three states:

1. Loading/unresolved.
2. Logged out.
3. Logged in.

Avoid a flash of logged-out controls while a valid session is loading. Use stable loading dimensions so the header does not shift.

### 4.2 Logged-out shell

Show:

- Home/logo.
- The studio.
- The system.
- Social Workshop.
- Core Values through the approved navigation placement.
- Sign in.
- Create account.
- Mobile equivalents.

Protected product links preserve the intended route and redirect to sign-in.

### 4.3 Logged-in shell

Show:

- Home/public site.
- Product/workspace entry points.
- Channels, productions, and builder areas.
- Account identity/menu.
- Account/settings.
- Sign out.
- Public/legal links through the same shell/footer.

Sign-out must invalidate the session through Supabase and return the user to a public route. The browser must not merely delete a local flag.

### 4.4 Footer parity

The same footer component must render on every public and authenticated page with:

- Gem Studio brand statement.
- Home.
- Studio.
- System.
- Social Workshop.
- Core Values.
- Dashboard/product entry.
- Sign in/Create account or Account/Sign out according to auth state.
- Terms.
- Privacy.
- Contact.

Add an automated route inventory test that renders/checks every page category for the required footer links.

## 5. Migration of current pages and assets

### 5.1 Landing page

Extract, do not copy blindly:

- Hero message and supporting copy.
- Four-department studio cards.
- Brief → build → cut → release flow.
- Social signal board concept.
- Closing CTA.
- Existing anchor IDs and intended user journey.

Rebuild these as Next components/content blocks. Preserve the existing visual direction where it supports the finished product, but make content and layout responsive to the new shared shell.

### 5.2 Dashboard

Map current dashboard concepts as follows:

- `studioView()` → `/app` workspace overview.
- `channelView(id)` → `/app/channels/[channelId]`.
- `productionView(id)` → `/app/productions/[productionId]`.
- `builderView()` → `/app/builder`.
- `editAgent()` → authenticated agent file editor.
- `seed()` → deleted from production; replaced with empty workspace state and optional development-only seed.
- `load()`/`save()` localStorage → removed; use Supabase queries/mutations.
- Hash routing → replaced with Next routes.
- Demo “Advance” action → replaced with the actual approved production workflow or omitted until that workflow exists.

The dashboard UI is a reference for information hierarchy only. The final data model must not be forced to match the nested localStorage object.

### 5.3 CSS and images

Migrate:

- Design variables from `assets/css/tokens.css` into the future global token layer.
- Component styles from `assets/css/app.css` into the chosen Next styling approach.
- `logo.png` and `gem-mark.png` into `web/public/` or the approved asset system.
- Motion/reveal behavior into accessible client components or CSS.

Delete duplicate CSS/JS/page role copies after the new app is verified. The `_attic/` directory is not a production dependency.

### 5.4 Content ownership

Store public content in version-controlled content modules/files under `web/content/` initially. Do not make Terms, Privacy, or Core Values editable through the authenticated product unless that becomes an explicit product requirement.

Content states:

- Core Values: template/draft until owner supplies final values.
- Terms: plain-language draft until legal approval.
- Privacy: U.S.-focused draft until legal approval.

A launch check must fail if unresolved placeholders remain in content marked production-ready.

## 6. Supabase data model

### 6.1 Identity and workspace tables

Create SQL migrations for:

- `profiles`
  - `id uuid primary key references auth.users(id) on delete cascade`
  - display name/contact fields as approved
  - timestamps
- `workspaces`
  - UUID primary key
  - owner user ID
  - name/slug/status
  - timestamps
- `workspace_members`
  - workspace ID
  - user ID
  - role, initially `owner`
  - unique workspace/user pair

On successful account creation, create a profile and one private workspace. Use a safe server-side trigger/function or controlled post-signup workflow; test failure behavior so profile/workspace creation cannot silently leave unusable accounts.

The schema must support future teams without requiring a rewrite, but team invitations/roles beyond owner are not required for the first release.

### 6.2 Product tables

Create workspace-scoped tables for:

- `channels`
- `productions`
- `departments`
- `lanes`
- `agents`
- `agent_files`
- `production_events` or `audit_events`
- `generated_assets` metadata
- `genplay_masters` and/or versioned production contracts if the finished product exposes them

Every private table must have a workspace relationship, direct or through a parent, and indexes for workspace ownership and common route queries.

Recommended relationships:

```text
workspace
  ├── channels
  │     └── productions
  │           ├── production_events
  │           ├── genplay_masters
  │           └── generated_assets
  └── departments
        └── lanes
              └── agents
                    └── agent_files
```

### 6.3 DNA tables

Use a generic, versioned table first to preserve the existing flexible JSON Schema records without creating three enormous duplicated relational schemas:

- `dna_records`
  - internal UUID primary key
  - `workspace_id`
  - `dna_id text unique within the product` (`CHAR-`, `LOC-`, or `PROP-`)
  - `dna_type` enum/check (`CDNA`, `LDNA`, `PDNA`)
  - lifecycle status
  - `record jsonb`
  - `schema_version`
  - source/checksum metadata
  - created/updated timestamps
- Optional later typed projection tables only for fields that require frequent relational queries.

Database constraints should enforce the ID/type relationship at minimum. The full JSON Schema validation occurs in a trusted write path and CI migration validation.

Do not change existing immutable DNA IDs during migration. Preserve references from GenPlay records.

### 6.4 GenPlay and binder data

Keep the current Python GenPlay compiler as a migration/pipeline boundary initially, but make Supabase the runtime registry for its masters and outputs:

- `genplay_masters`
  - workspace ID
  - immutable `genplay_id`
  - channel/episode identifiers
  - version
  - locked boolean
  - full validated master JSONB
  - source checksum
  - created/locked timestamps
- `genplay_binders`
  - master ID
  - version
  - full binder JSONB or manifest
  - validation result
  - Storage path for large page/output artifacts

The binder rules remain immutable: locked masters produce versioned projections; updates create a new version rather than mutating locked documents. The first application release should not rewrite the compiler unless runtime product requirements require it.

### 6.5 Storage

Use private Storage buckets for user uploads and generated assets. Object paths must include workspace ownership, for example:

```text
workspace/{workspace_id}/production/{production_id}/asset/{asset_id}/...
```

Storage policies must derive authorization from workspace membership, not from a user-provided path alone. Public marketing images can remain in the frontend deployment asset directory; private creative assets must not be public URLs by default.

## 7. Authorization and security

### 7.1 RLS policy model

Enable RLS on every exposed private table. Policies should authorize through `workspace_members`:

- A user can select/insert/update/delete only rows belonging to a workspace where they have a valid membership and appropriate role.
- Insert policies must validate the submitted workspace ID.
- Update policies must validate both the existing and new workspace relationship.
- Delete policies must be explicit.
- Child records must not be accessible if the parent workspace is inaccessible.

Write negative tests for:

- User A reading User B’s workspace.
- User A guessing User B’s route IDs.
- User A changing a row’s workspace ID.
- User A accessing another workspace’s Storage object.
- Logged-out access to private tables.

### 7.2 Trusted operations

Use normal session-scoped Supabase clients for user operations so RLS remains active. Use Edge Functions only for:

- Account deletion and cleanup.
- Operations requiring third-party provider secrets.
- Generation orchestration.
- Webhooks.
- Administrative maintenance.
- Cross-record transactions that cannot safely be performed by the user-scoped client.

Authenticated user functions must validate the caller JWT and use an RLS-scoped client by default. Admin/service keys are restricted to the function environment and never shipped to `web`.

### 7.3 Auth lifecycle

Implement:

- Email/password sign-up.
- Email confirmation with configured production redirect URLs.
- Sign-in.
- Sign-out.
- Password reset request with non-enumerating responses.
- Password reset completion.
- Session refresh/expiration.
- Protected-route redirect with `next` destination.
- Account deletion/deactivation through a trusted function.
- Clear loading, invalid input, expired link, network, and success states.

Configure production SMTP rather than relying on the default low-volume testing email service. Keep local email testing isolated from production.

### 7.4 Secrets

Allowed in browser configuration:

- Supabase URL.
- Supabase publishable/anon key.

Never in browser or Git:

- Supabase secret/service-role key.
- Database password.
- AI provider secrets.
- Webhook signing secrets.
- Payment credentials.

Maintain separate environment variables/projects for local, staging, and production. Commit only an `.env.example` with names, not values.

## 8. Migration strategy

### 8.1 Inventory

Before writing importers:

- Inventory all JSON DNA records, examples, templates, and references.
- Inventory any actual MongoDB export or connection configuration; do not assume the README describes a live integration.
- Inventory GenPlay masters, binder outputs, and referenced DNA IDs.
- Identify duplicate/conflicting IDs and schema versions.
- Classify records as canonical, example, template, demo, or obsolete.
- Produce a migration report with counts and unresolved references.

### 8.2 Transform and validate

Build idempotent migration scripts that:

1. Read source records.
2. Validate against the existing JSON Schema.
3. Normalize timestamps and status values.
4. Preserve immutable IDs.
5. Attach the correct future workspace ownership.
6. Store the original record in JSONB with checksum/source metadata.
7. Reject duplicates and unresolved references.
8. Produce a machine-readable error report.

Do not import examples/templates/demo records into production workspaces unless explicitly approved as real content.

### 8.3 Import order

Recommended order:

1. Users/workspace ownership mapping, if real accounts already exist.
2. CDNA, LDNA, and PDNA records.
3. GenPlay masters that reference valid DNA IDs.
4. Binder projections/manifests.
5. Channels and productions.
6. Agent/department/lanes and files.
7. Generated asset metadata and Storage objects.
8. Audit/history records.

If the finished product starts with no real users, do not create fake production accounts. Import only approved product-owned records or wait until the owner assigns them.

### 8.4 Cutover

Run migration in staging first. Compare:

- Source record counts.
- ID sets.
- Checksums.
- Schema validation results.
- GenPlay reference resolution.
- Workspace ownership.
- Storage object counts.

After owner approval, run production import, freeze source edits, run final reconciliation, and mark the old source read-only. Do not purge source data until rollback/recovery is verified and the owner approves retirement.

## 9. Implementation phases and gates

### Phase A — Owner review and architecture lock

Deliverables:

- Approved blueprint.
- Approved `web/` canonical app root.
- Approved Supabase project/environment strategy.
- Approved workspace/data ownership model.
- Approved content/legal status.
- Approved migration source inventory.

**Gate:** No implementation code begins before this review is complete.

### Phase B — Next.js scaffold and shell

Build the Next app, global styles/tokens, assets, shared layouts, header/footer, route skeletons, and accessibility foundations.

**Gate:** All public/protected route shells render with placeholder content and no duplicated shell markup.

### Phase C — Auth and workspace foundation

Configure Supabase clients, auth flows, session handling, workspace creation, protected layouts, account page, and RLS migrations/tests.

**Gate:** A new account gets one private workspace; a second account cannot read or mutate it.

### Phase D — Public content migration

Build landing/detail/legal/value pages using migrated content and visual language. Add metadata, direct routes, section links, footer links, and draft/legal status banners.

**Gate:** All public URLs work directly and all pages share the same shell.

### Phase E — Product data and dashboard migration

Replace hash/localStorage dashboard behavior with Supabase-backed workspace queries and mutations. Add empty states, loading/error states, and route authorization.

**Gate:** New accounts show no demo data; all product records are workspace-scoped.

### Phase F — DNA/GenPlay migration and integration

Add JSONB DNA records, validation, imports, GenPlay records, binder metadata, and trusted pipeline access. Preserve immutable IDs and locked-document behavior.

**Gate:** All imported GenPlay references resolve to authorized Supabase DNA records; invalid imports fail with reports.

### Phase G — Demo purge and production hardening

Remove demo paths, seeds, localStorage data source, obsolete pages/assets, and temporary auth assumptions. Rotate any exposed development credentials. Configure SMTP, domains, redirects, Storage, backups, logs, and alerts.

**Gate:** Clean checkout/new-account test passes without seeded demo state.

### Phase H — Owner review and launch readiness

Present the integrated product for owner review before deployment. Resolve feedback, run security/accessibility/link tests, verify legal content status, and document rollback.

**Gate:** Owner explicitly approves the finished product for live deployment.

## 10. Verification plan

### Automated checks

- TypeScript and Next.js build.
- ESLint/format checks.
- Unit tests for auth helpers, route guards, content status, ID/type validation, and migration transforms.
- RLS integration tests against a local/staging Supabase project.
- Migration idempotency tests.
- DNA JSON Schema validation.
- GenPlay binder self-check and reference-resolution checks.
- Public route inventory and footer-link checks.
- Secret scan and `.env` exclusion check.

### Browser tests

- Logged-out header/footer on every public page.
- Mobile menu keyboard behavior.
- Sign-up, email confirmation, sign-in, sign-out, recovery, reset.
- Redirect to sign-in and return to intended product route.
- Session expiration and refresh.
- New account empty state.
- Channel/production/agent CRUD within one workspace.
- Cross-account isolation.
- Direct route refresh for every page.
- Legal/value page discoverability.

### Accessibility/performance

- Keyboard-only flow.
- Focus visibility and focus return after menus/dialogs.
- Semantic headings/landmarks.
- Contrast and reduced motion.
- Screen-reader labels/errors.
- Image dimensions/alt text.
- Core Web Vitals and public-page performance.

## 11. Demo purge checklist

Before launch, verify and record:

- [ ] No `gem-studio-v1` localStorage source remains in production code.
- [ ] No `seed()`/demo reset path ships in production.
- [ ] No demo channels, productions, agent names, or sample records appear in production responses.
- [ ] No hash-only dashboard routes remain as the application source of truth.
- [ ] No duplicate header/footer implementations remain.
- [ ] No root-level legacy page tree is deployed alongside `web/`.
- [ ] No service-role/database/AI secrets are present in Git or browser bundles.
- [ ] No examples/templates are imported as real user-owned production data.
- [ ] Old source data is archived/read-only or retired only after approved rollback verification.

## 12. Owner review checkpoint

This blueprint is complete enough to review, not to execute blindly. The next step is owner review of:

1. The proposed `web/` Next.js application root.
2. The Supabase-only future data source decision.
3. The JSONB/versioned DNA storage approach.
4. The private individual-workspace-first model.
5. The migration/purge sequence.
6. The decision to keep the Python GenPlay compiler as a pipeline boundary during the first application release.
7. The public page route inventory and shared-shell behavior.

Implementation should begin only after these choices are approved or revised.

## 13. References

- Supabase password-based Auth: https://supabase.com/docs/guides/auth/passwords
- Supabase user management: https://supabase.com/docs/guides/auth/managing-user-data
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Edge Function authentication: https://supabase.com/docs/guides/functions/auth
- Supabase Edge Function secrets: https://supabase.com/docs/guides/functions/secrets
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
