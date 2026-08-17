# Future Live Product Implementation Plan

**Status:** Planning only
**Target:** Finished live Gem Studio product
**Current repository role:** Reference material and migration input only
**Selected platform direction:** Supabase Auth + Postgres/RLS + Edge Functions where privileged operations are required

## 1. Non-negotiable product boundary

The implementation target is the finished live product, not the current repository demo.

The current files can inform brand language, visual direction, existing landing-page concepts, and product vocabulary. They must not dictate the final architecture. Before launch, the demo’s seeded records, localStorage-backed product state, duplicated page markup, temporary hash routes, fake dashboard assumptions, and obsolete asset/layout copies must be purged or moved outside the production surface.

The work should be planned as a future product build and migration, not as a patch on top of the current demo.

## 2. Product outcomes

The finished product must provide:

1. A public marketing/information experience that explains Gem Studio without requiring an account.
2. Standalone, live webpages for The Studio, The System, Social Workshop, Core Values, Terms, and Privacy.
3. A consistent header and footer on every public and authenticated page.
4. A logged-out header with public navigation plus Sign in and Create account actions.
5. A logged-in header with authenticated product navigation, account controls, and access to public information pages.
6. A full live account lifecycle: sign up, sign in, sign out, email verification as required, password recovery, session expiration, and account deletion/deactivation.
7. Protected user/workspace product data with authorization enforced at the database/trusted backend boundary.
8. U.S.-focused plain-language draft Privacy content and full AI-product Terms content, clearly marked for legal review until approved.
9. A Core Values template page that can later be replaced with final owner-approved values.
10. A deliberate demo purge and production readiness gate before launch.

## 3. Future architecture decision

### 3.1 Frontend

Use a production frontend architecture that supports:

- Real page routes and direct navigation.
- Shared layout components for header and footer.
- Auth-state-aware navigation.
- Protected-route handling.
- Accessible forms and errors.
- Server/deployment rewrites where needed.
- A clear separation between public content and authenticated application data.

The current no-build static HTML arrangement is not a requirement for the finished product. The final frontend may retain vanilla JavaScript if it can meet the live product requirements, but the architecture should not avoid a suitable production build or routing system merely to preserve the demo.

### 3.2 Authentication and data

Use Supabase as the selected platform direction:

- Supabase Auth for account registration, login, logout, recovery, and sessions.
- Supabase Postgres for product data.
- Row Level Security on every exposed product table.
- Storage policies for uploads and generated assets.
- Edge Functions for privileged operations, third-party API calls, webhooks, transactional workflows, and secrets.
- Supabase project secrets for service credentials.

Browser code may use the project URL and anon/publishable key. The service-role key must never be exposed to a browser, included in static assets, or committed to the repository.

RLS policies must authorize access by authenticated user and, if the product supports shared workspaces, by explicit workspace membership/role. Hiding routes or filtering results in JavaScript is not authorization.

### 3.3 Production routing

Use stable public URLs suitable for a live website. The repository may use page entry points or framework routes, but the deployment must support direct navigation and refresh.

Preferred public route inventory:

- `/`
- `/studio`
- `/system`
- `/social-workshop`
- `/core-values`
- `/terms`
- `/privacy`
- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`
- `/verify-email`

Preferred authenticated route inventory:

- `/app` or `/dashboard`
- `/app/channels`
- `/app/channels/:channelId`
- `/app/productions/:productionId`
- `/app/builder`
- `/account`

Exact route naming can change during application design, but the route inventory and access boundaries must remain.

## 4. Implementation phases

### Phase 0 — Product architecture and content lock

**Purpose:** Define the finished product before carrying forward demo assumptions.

Tasks:

- Choose the future frontend framework/build/deployment architecture if the final product will not remain static vanilla.
- Define the canonical production repository/application tree.
- Define public route and authenticated route inventory.
- Define the shared shell contract.
- Define the auth/session contract.
- Define user/workspace ownership rules.
- Confirm what current product concepts map to the finished product and what will be discarded.
- Replace current content placeholders with approved content ownership and review workflow.
- Mark Terms, Privacy, and Core Values as draft, approved, or blocked states.

Deliverables:

- Future architecture decision record.
- Route/access matrix.
- Shared-shell component contract.
- Content inventory.
- Demo purge checklist.

### Phase 1 — Shared product shell

**Purpose:** Build one source of truth for page chrome in the finished app.

Tasks:

- Implement shared header component/layout.
- Implement shared footer component/layout.
- Implement responsive mobile menu.
- Implement keyboard focus and current-page states.
- Implement auth-state loading behavior so the header does not flash the wrong navigation.
- Implement logged-out navigation.
- Implement logged-in navigation.
- Implement account menu and sign-out behavior.
- Ensure public/legal links remain available in the logged-in experience.
- Add a skip link and semantic landmarks.

Acceptance:

- Every page consumes the same shell.
- There are no independent header/footer copies that can drift.
- Logged-out and logged-in states are visually consistent but functionally distinct.
- Mobile and desktop navigation contain equivalent destinations.

### Phase 2 — Public information pages

**Purpose:** Give visitors useful information without requiring them to scroll through one landing page.

Tasks:

- Retain concise landing-page summaries and section anchors.
- Add clear links from each landing section to its detailed page.
- Build Studio detail page.
- Build System detail page.
- Build Social Workshop detail page.
- Build Core Values template page.
- Build Terms draft page.
- Build Privacy draft page.
- Add metadata, page titles, descriptions, canonical URLs, and social preview requirements.
- Add in-page navigation for long Terms and Privacy documents.
- Add clear sign-up and sign-in CTAs to appropriate public pages.

Acceptance:

- Every public page works by direct URL and refresh.
- No important information is available only by scrolling the landing page.
- The footer links every required public/legal page everywhere.
- The page content is structured for reading, not only visual presentation.

### Phase 3 — Supabase foundation

**Purpose:** Establish the production account/data security boundary before connecting product UI.

Tasks:

- Provision separate development/staging/production Supabase projects as appropriate.
- Configure Auth site URL, redirect URLs, email templates/provider, password policies, and recovery behavior.
- Add browser client configuration through safe public environment configuration.
- Define SQL migrations.
- Define profile/account records.
- Define workspace membership and roles if applicable.
- Define channels, productions, departments/lanes, agents, files, and generated asset metadata according to the finished product model.
- Enable RLS on every exposed table.
- Write positive and negative RLS tests.
- Define Storage buckets and object policies for uploads/generated assets.
- Define Edge Functions for privileged operations and third-party integrations.
- Configure secrets, logs, monitoring, backups, and environment separation.

Proposed ownership model:

- `profiles`: one profile per authenticated user, keyed to `auth.users.id`.
- `workspaces`: product-owned or user-created studio spaces.
- `workspace_members`: user/workspace membership and role.
- `channels`: owned by a workspace.
- `productions`: owned by a channel/workspace.
- `departments`: product/workspace configuration as appropriate.
- `lanes`: owned by a department/workspace.
- `agents`: owned by a lane/workspace.
- `agent_files`: agent role/soul/job description/skills/memory/user files, owned through the agent/workspace relationship.
- `assets` or `generated_outputs`: metadata owned by a production/workspace and linked to Storage objects.
- `audit_events`: security/product activity records with restricted access.

The exact schema must be designed from the finished product requirements, not copied blindly from demo object shapes.

### Phase 4 — Full authentication lifecycle

**Purpose:** Make account state real and secure.

Tasks:

- Build sign-up page and validation.
- Build sign-in page and validation.
- Build sign-out.
- Build password reset request.
- Build password reset completion.
- Build email verification/confirmation handling if enabled.
- Handle expired sessions and refresh.
- Preserve intended destination through sign-in.
- Protect authenticated routes.
- Add account page with profile/session controls.
- Add account deletion/deactivation flow.
- Add abuse/rate-limit protections appropriate to the deployment.
- Add error, loading, empty, and offline states.

Acceptance:

- Auth state is sourced from Supabase, not localStorage demo flags.
- No password or service secret is stored in browser storage.
- Protected data cannot be retrieved by changing URLs or request parameters.
- Header state updates correctly on sign-in, sign-out, refresh, and session expiration.

### Phase 5 — Authenticated product migration

**Purpose:** Replace the demo dashboard with the finished product’s real user/workspace experience.

Tasks:

- Define authenticated product information architecture.
- Build dashboard entry and loading states.
- Load only the current user/workspace’s data.
- Replace seeded/localStorage channels with Supabase-backed channels.
- Replace seeded/localStorage productions with Supabase-backed productions.
- Replace demo departments/lanes/agents with the finished data model.
- Move agent file editing to authorized persisted records.
- Add optimistic updates only where safe and recoverable.
- Add auditability for meaningful changes.
- Define upload/generated asset access rules.
- Add empty states for new accounts rather than demo records.

### Phase 6 — Demo purge and cutover

**Purpose:** Ensure the live product does not ship demo behavior or data.

Tasks:

- Identify every seeded record, demo identifier, localStorage key, fixture, sample account, and mock auth path.
- Delete demo seed paths from the production build.
- Delete or quarantine demo-only HTML/CSS/JS that is not part of the finished app.
- Remove localStorage as a source of truth for product data.
- Remove fake “advance” or demo-only state transitions unless they are real product functionality.
- Purge demo records from production databases and Storage.
- Rotate any credentials exposed during development.
- Verify no demo identifiers appear in production HTML, JavaScript, database, API responses, or search metadata.
- Run a clean new-account test from an empty workspace.
- Run a migration rollback/recovery rehearsal where applicable.

The cutover is incomplete until the purge is confirmed in both code and live data.

### Phase 7 — Production verification and launch

**Purpose:** Validate the finished product as a real web service.

Test categories:

- Public routes and direct refresh.
- Header/footer parity across all public/authenticated pages.
- Responsive navigation.
- Sign-up/sign-in/sign-out.
- Email verification and password recovery.
- Expired sessions.
- Redirect-to-login and return-to-destination.
- Account deletion/deactivation.
- RLS positive and negative cases.
- Workspace isolation.
- Storage object access.
- Input validation and error states.
- Accessibility keyboard and screen-reader flows.
- Reduced-motion behavior.
- Privacy/Terms/Core Values discoverability.
- SEO metadata and social previews.
- Performance and caching.
- Monitoring, logging, backups, and alerting.
- Demo purge verification.

## 5. Shared header/footer contract

### Header

The shell must render based on a resolved auth state with at least three states:

1. Loading/auth state unresolved.
2. Logged out.
3. Logged in.

Do not render logged-out controls briefly while a valid session is still loading. Use a stable loading treatment that avoids layout shift.

Logged-out controls:

- Public navigation.
- Sign in.
- Create account.
- Protected product CTA that redirects to sign in when selected.

Logged-in controls:

- Authenticated product navigation.
- Public-site access.
- Account identity/menu.
- Sign out.

### Footer

One shared footer component must contain:

- Brand statement.
- Home/public navigation.
- Studio/System/Social Workshop.
- Core Values.
- Dashboard/product entry.
- Account actions appropriate to auth state.
- Terms.
- Privacy.
- Contact.

Terms, Privacy, and Core Values must never disappear because the user is logged in.

## 6. Content plan

### Core Values

Initial state: template pending owner content.

Required structure:

- Hero and status note.
- 4–6 editable value blocks.
- Principle, explanation, behavior/example, and draft marker per block.
- Connection to the studio workflow.
- CTA to explore or create an account.

### Terms

Initial state: plain-language draft for full website/product/AI use, pending qualified legal review.

Must cover accounts, eligibility, content rights, generated outputs, AI limitations, acceptable use, third-party providers, safety/moderation, payments placeholders, termination, disclaimers, liability, indemnity, U.S. governing-law placeholders, and contact.

### Privacy

Initial state: U.S.-focused plain-language draft centered on user privacy, pending legal review.

Must cover account data, prompts/uploads/outputs, product metadata, logs, cookies/storage/analytics, providers, model training decision, retention, security, rights, deletion, marketing opt-out, children, sensitive data, and contact.

## 7. Configuration and secrets

Safe browser configuration:

- Supabase project URL.
- Supabase anon/publishable key.

Never expose:

- Supabase service-role key.
- Database passwords.
- AI provider secret keys.
- Payment/webhook signing secrets.
- Internal administrative credentials.

Privileged secrets belong in Supabase Edge Function secrets or the chosen trusted deployment environment.

## 8. Definition of done

The work is ready for implementation sign-off only when:

- Future-state route/access and data contracts are approved.
- Shared shell is one source of truth.
- Public detail/legal/value pages are independently reachable.
- Auth is real and backed by Supabase.
- Database and Storage authorization is enforced with tested RLS/policies.
- Authenticated product data is user/workspace-owned.
- Demo data and demo mechanisms are purged before launch.
- Draft legal content is clearly labeled or replaced with reviewed content.
- Accessibility and responsive checks pass.
- Production environment and rollback/monitoring plans are documented.

## 9. Open product decisions

These decisions remain product-owner/legal decisions, not reasons to preserve demo behavior:

- Final frontend/build/deployment architecture.
- Workspace model: single-user workspaces versus shared teams.
- Roles and permissions.
- Account age requirement.
- Email verification requirement.
- Password/MFA policy.
- Account deletion and data export behavior.
- Prompt/output/model-training policy.
- Upload limits and retention.
- Billing, trials, refunds, and taxes.
- Final Core Values.
- Legal entity, address, privacy contact, effective dates, and governing law.
- U.S. state privacy regimes that apply.

## 10. Planning references

- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
