# Public Information Pages & Authentication-Aware Shared Shell Spec

**Status:** Future-state product requirements
**Requested by:** Project owner
**Date:** 2026-08-17
**Implementation target:** The finished live Gem Studio product—not the current repository demo
**Scope:** Public website information architecture, Core Values page, Terms page, Privacy page, full authentication flow, and a shared header/footer across public and authenticated pages.

## 1. Product intent

Gem Studio should give an unauthenticated visitor enough context to understand the studio, its creative-production system, and its social workshop without requiring the visitor to scroll through one long landing page. The landing page should remain a useful overview, but each major information section must lead to a real, browser-addressable, detailed webpage.

The site must also establish a consistent product shell:

- The footer is the same on every page.
- The header uses the same visual structure and brand treatment on every page.
- Header navigation changes according to whether the visitor is logged out or logged in.
- Visitors can discover the product, values, Terms, and Privacy information without an account.
- Visitors can create an account, sign in, sign out, and reach authenticated product data through a complete live authentication flow.
- Legal and values pages are real linked webpages, not modal-only content or sections hidden at the bottom of the landing page.

This is intended for the finished live web product. It is not a static mockup-only request and should not be reduced to dead links, fake buttons, or a local-only authentication shortcut.

### Future-state boundary

This document describes what must exist when Gem Studio is ready to operate as a live product. The current repository/demo is reference material only. Do not design the finished product around the current page files, duplicated markup, hash-routing, seeded records, or localStorage behavior. Those are temporary implementation artifacts and must be replaced, migrated, or purged before launch.

Any implementation plan derived from this document must begin with the finished product architecture and then identify what must be discarded from the demo. It must not preserve demo constraints merely because they exist today.

## 2. Current repository as reference only

The repository currently describes Gem Studio as a dependency-free vanilla HTML/CSS/JS website with no build step. The following details are useful only as brand/content reference and migration input:

- A public landing page with these major sections:
  - The studio
  - The system / handoff
  - Social workshop
- A separate dashboard page with hash-routed studio, channel, production, and builder views.
- A shared visual system in `assets/css/tokens.css` and `assets/css/app.css`.
- Client behavior in `assets/js/app.js`.
- Existing navigation and footer markup duplicated in page files rather than generated from a shared component system.
- Existing client-side dashboard demo state stored in localStorage.
- No visible authentication service, server-side session layer, account database, backend API, or production authorization implementation in the inspected files.

The finished product may preserve the existing Gem Studio visual language—OLED-dark surfaces, hot-pink anchor color, cyan/lime/amber signals, Syne/Space Grotesk/DM Mono typography, geometric details, restrained transitions, responsive mobile navigation, and visible keyboard focus states—but the finished product’s architecture, routing, data model, security, deployment, and page composition take priority over the current demo.

The repository documentation refers to a `Gem-Studio/` canonical tree, while the currently inspected working tree contains public HTML and `assets/` at the repository root. This discrepancy is a migration concern only. The implementation plan must select one future canonical application/deployment structure and explicitly remove or archive obsolete demo structure before launch. Do not create a second competing live site tree or duplicate CSS/JS roles.

## 3. Terminology

- **Logged-out visitor:** A visitor with no valid authenticated session.
- **Logged-in user:** A visitor with a valid authenticated session recognized by the application backend.
- **Public information page:** A page readable without authentication, including the landing page, detailed product pages, Core Values, Terms, and Privacy.
- **Authenticated product page:** A page containing user-specific or studio-specific data, including the dashboard and its nested views.
- **Shared shell:** The common header, responsive navigation, footer, typography, visual treatment, global links, and global interaction behavior used by all pages.
- **Detailed page:** A standalone, addressable webpage that expands on a landing-page section and can be reached through a normal link.

## 4. Information architecture and routes

The exact deployment URL prefix may vary, but the final implementation must expose stable, human-readable routes or equivalent browser URLs. The preferred page map is:

| Page | Access | Purpose |
|---|---|---|
| Landing page | Public | High-level overview with scrollable sections and conversion paths |
| Studio detail | Public | Explain the creative departments, services, workflow, and outcomes in depth |
| System detail | Public | Explain the handoff/process model and how context moves through production |
| Social Workshop detail | Public | Explain how finished work becomes platform-native cuts, conversations, and feedback loops |
| Core Values | Public | Draft template page for values the owner will provide later |
| Terms | Public | Plain-language first draft covering the full site, product, and usage of an AI-generation website |
| Privacy | Public | U.S.-focused, plain-language first-draft privacy notice |
| Sign up | Public entry point | Create a real account and establish an authenticated session |
| Sign in | Public entry point | Authenticate an existing account |
| Password reset | Public entry point | Request and complete password recovery |
| Email verification | Public/auth transition | Verify account email when required by the auth design |
| Dashboard/product pages | Authenticated | Show logged-in studio data and product functionality |
| Account/settings | Authenticated | Manage account/session-related settings and sign out |

Suggested filenames/routes for a vanilla implementation are `studio.html`, `system.html`, `social-workshop.html`, `core-values.html`, `terms.html`, `privacy.html`, `login.html`, `signup.html`, and password-recovery routes. Equivalent server routes are acceptable. The important requirement is that these are real live webpages with normal links, reliable refresh behavior, and working navigation—not merely hash fragments that cannot be independently loaded.

The existing landing-page anchors should remain useful:

- The studio nav item may scroll to `#studio` on the landing page and must include a visible “Learn more”/“Explore the studio” link to the detailed Studio page.
- The system nav item may scroll to `#system` and must include a visible link to the detailed System page.
- The Social Workshop nav item may scroll to `#social` and must include a visible link to the detailed Social Workshop page.
- The landing-page links must not force a visitor to hunt through the page to find the detailed-page path.

## 5. Logged-out header requirements

The logged-out header must use the same logo placement, spacing, responsive behavior, visual styling, mobile menu behavior, and global action region as the shared header.

It must provide:

1. Brand/home link.
2. Public information navigation for the major site sections.
3. Access to Core Values either in the top navigation or through an equally discoverable public information path; the final navigation should avoid hiding an important new page.
4. A clear **Sign in** action.
5. A clear **Create account** action.
6. A mobile menu containing the same destinations and actions in a usable order.
7. A path to the public landing page from every public detail/legal page.

Any destination that requires authentication must not silently fail. If an unauthenticated visitor selects a protected destination, the application must send the visitor to sign in and preserve the originally requested destination when technically possible. After successful authentication, the visitor should be returned to that destination or shown a clear fallback dashboard.

The existing “Dashboard” link should become authentication-aware rather than exposing private product data to an unauthenticated visitor.

## 6. Logged-in header requirements

The logged-in header must preserve the same shared header structure and visual identity while switching the navigation to the authenticated experience and full logged-in site data.

It must provide:

1. Brand/home or public-site link.
2. Authenticated product navigation for the dashboard, studio data, channels, productions, lanes/agents, and other currently available product areas.
3. Continued access to public information pages, either directly in the logged-in navigation or through a clearly labeled public-site link.
4. Account identity indication, such as the user’s email/name or an account menu.
5. A working **Sign out** action that invalidates the session and returns the user to a public page.
6. Protected navigation behavior that checks authorization rather than relying on hidden links alone.
7. The same responsive mobile menu pattern as the logged-out shell.

The logged-in navigation must reflect the full logged-in site/product data available to the user. It must not expose another user’s channels, productions, agents, account data, or private creative material.

## 7. Authentication scope

“Full” authentication means a production-oriented account flow, not a visual placeholder. The final implementation should include:

- Sign-up form.
- Email/password or the project-approved credential method.
- Client and server-side validation.
- Clear invalid-credential and duplicate-account errors.
- Sign-in form.
- Persistent authenticated session using the selected secure session mechanism.
- Sign-out.
- Protected-page authorization checks on the server/backend.
- Password reset request and completion flow.
- Email verification if required by the selected auth architecture or security policy.
- Loading, success, failure, expired-session, and network-error states.
- Redirect handling for protected destinations.
- Account/session state available to the shared header.
- Secure handling of credentials; passwords must not be stored in browser localStorage or plain text.
- Rate limiting or abuse protection appropriate to the production auth implementation.
- A way to delete or deactivate an account, or an explicitly documented post-launch dependency if account deletion is not included in the first release.

The existing localStorage demo data may remain useful for UI prototyping but must not be treated as production authentication, authorization, or a source of truth for private user data.

The selected future-state platform is Supabase. The finished product should use Supabase Auth for account/session management, Postgres with Row Level Security for user-owned product data, and Supabase Edge Functions only where privileged server-side or third-party operations are required. The public Supabase URL and anon/publishable key may be used by browser code; a service-role key must never be shipped to the browser or committed to the repository.

The implementation plan must still verify the final Supabase project configuration, redirect URLs, email provider, RLS policies, storage policies, secrets, backups, and production deployment settings before launch.

## 8. Shared footer requirements

The footer must have identical structure, visual treatment, link groups, copy placement, and responsive behavior on every public and authenticated page. Page-specific footer variants are out of scope unless they are required for a technical reason and approved explicitly.

The common footer must include a full sitemap containing:

### Navigate

- Home / landing page
- The studio
- The system
- Social workshop
- Core Values
- Dashboard or authenticated product entry point

### Account

- Sign in when logged out
- Create account when logged out
- Account/settings when logged in
- Sign out when logged in

### Legal

- Terms
- Privacy

### Contact

- Existing Gem Studio contact path, currently represented by `hello@gemstudio.app`, unless replaced by the owner before launch.

The footer should preserve the existing statement/brand treatment, including the Gem Studio mark and “Films for the next signal” style language, while adding the required legal, values, navigation, and account links in a scannable way.

Terms, Privacy, and Core Values must be linked from the footer on every page, including dashboard/product pages. Legal links must remain available even when the user is logged in.

## 9. Core Values page

Create a real public Core Values webpage using the shared shell plus the shared reading layout.

The page is intentionally a template. The owner will provide the final values later. The first draft should therefore:

- Use clear placeholder language rather than inventing final company values.
- Explain that the page is a working template awaiting the studio’s final values.
- Provide an editable structure for multiple values.
- Give each value a title, short principle statement, longer explanation, and practical behavior/example placeholder.
- Connect the values to the product’s existing themes where helpful—creative collaboration, context-rich handoffs, responsible AI generation, craft, audience feedback, and keeping the original signal alive—but label these as draft framing, not approved final values.
- Include a clear CTA to explore the studio or create an account.
- Remain fully public and linked from both navigation/footer as decided during implementation.

Suggested draft structure:

1. Hero: “What we believe” / Core Values.
2. Intro explaining that the values are a template pending owner input.
3. Values grid or vertical editorial list with 4–6 placeholder value blocks.
4. “How this shows up in the studio” section.
5. CTA to explore the product or create an account.

## 10. Terms page

Create a real public Terms webpage as a plain-language first draft. It must cover the full website, product, and usage model of an AI-generation website—not only the marketing site.

The page must:

- Be labeled as a draft or template pending legal review.
- Use placeholders for legal identity, address, effective date, governing law, and legal contact.
- State that the document is not a substitute for advice from qualified legal counsel.
- Include a visible last-updated/effective-date field.
- Use semantic headings and a table of contents or in-page section links for long content.

The first draft should address, at minimum:

1. Acceptance of terms.
2. Eligibility and age requirements.
3. Account creation, credentials, and account security.
4. Subscriptions, payments, trials, refunds, and taxes as applicable, with placeholders where the product rules are not finalized.
5. Acceptable use and prohibited conduct.
6. User-submitted prompts, files, images, video, audio, text, and other content.
7. Ownership and license to user content.
8. Ownership and permitted use of generated outputs, including the fact that AI output may be non-unique, inaccurate, infringing, or unsuitable and may require human review.
9. Responsibility for rights, permissions, likenesses, copyrighted material, trademarks, and other inputs supplied by the user.
10. AI provider/model and third-party service dependencies.
11. Content moderation, safety restrictions, takedowns, and account suspension/termination.
12. Product availability, changes, maintenance, beta features, and service limitations.
13. Intellectual property belonging to Gem Studio.
14. Third-party links and services.
15. Disclaimers, including no guarantee of output accuracy, availability, fitness, or legal clearance.
16. Limitation of liability.
17. Indemnification.
18. Dispute resolution and governing-law placeholders for the United States.
19. Changes to the Terms.
20. Contact information.

The copy must not imply that a generated result is automatically legally cleared, factually accurate, exclusive, or safe for publication.

## 11. Privacy page

Create a real public Privacy webpage as a U.S.-focused, plain-language first-draft privacy notice centered on user privacy. It must be clearly marked as a draft/template pending legal review and must use placeholders for the legal entity, address, privacy contact, effective date, and any state-specific details.

The page should explain, in understandable language:

1. What the notice covers.
2. Categories of information collected:
   - Account and contact information.
   - Authentication and security information.
   - Prompts and uploaded creative content.
   - Generated outputs and project metadata.
   - Device, browser, log, and usage information.
   - Communications and support requests.
   - Payment information if/when payments are enabled.
3. Sources of information.
4. Purposes for collection and use.
5. How AI prompts, inputs, outputs, and project data are processed.
6. Whether data is used to train models, with an explicit placeholder/decision required before launch rather than an unsupported claim.
7. Cookies, local storage, analytics, and similar technologies.
8. Service providers and third-party sharing.
9. Business transfers and legally required disclosures.
10. Data retention and deletion practices.
11. Security safeguards and their limitations.
12. Children’s privacy and age restrictions.
13. U.S. state privacy rights, including a placeholder for the states that apply and the request process.
14. How users can access, correct, delete, or otherwise control their information.
15. How to opt out of marketing communications.
16. Sensitive personal information handling, if collected.
17. International visitors and cross-border processing, if applicable.
18. Changes to the notice.
19. Privacy contact information.

The notice must distinguish between data needed to provide the product and optional analytics/marketing data. It must not claim compliance with a specific U.S. state law unless the owner/legal reviewer confirms that the claim is accurate.

## 12. Detailed public information pages

Each existing landing-page information area must retain its concise landing summary and gain a standalone detailed page.

### Studio detail page

Explain:

- What Gem Studio is.
- Who it is for.
- How Marketing, Creative, Production, and Social Workshop relate to each other.
- What a brief becomes as it moves through the studio.
- Typical deliverables or outcomes.
- Why the connected creative floor differs from a disconnected toolbox.
- CTA paths for creating an account and signing in.

### System detail page

Explain:

- The brief → build → cut → release flow.
- How context and decisions move through handoffs.
- How departments or agents collaborate.
- What users can see, review, change, and approve.
- How feedback returns to the next creative iteration.
- What is automated versus what requires human judgment.
- CTA paths for creating an account and signing in.

### Social Workshop detail page

Explain:

- How a finished frame becomes multiple platform-native entry points.
- Native cuts, conversation prompts, and audience feedback loops.
- How social signals inform future creative work.
- How Gem Studio avoids reducing social work to empty repurposing.
- What users can expect from the workflow and outputs.
- CTA paths for creating an account and signing in.

These pages should use structured explanation rather than only decorative copy: a strong hero, scannable sections, clear headings, supporting visual treatments, examples/placeholders where needed, and a clear next action.

## 13. Shared reading layout

New standalone pages should match the existing design system while improving reading comfort:

- Shared OLED background, fonts, colors, logo, buttons, borders, and motion language.
- A constrained readable text measure for legal and editorial copy.
- Clear page title and introductory summary.
- Consistent section spacing and heading hierarchy.
- Optional in-page table of contents for Terms and Privacy.
- Section anchors with visible focus behavior.
- Sufficient contrast and line height for long-form reading.
- Responsive behavior for narrow screens.
- No page should depend on hover to reveal essential information.
- Reduced-motion users must receive a usable experience without decorative animation requirements.

## 14. Accessibility and quality baseline

The implementation should target WCAG 2.2 AA practices for the shared shell and new pages, including:

- Semantic `header`, `nav`, `main`, and `footer` landmarks.
- One clear page-level `h1` per page, followed by logical heading order.
- Keyboard access to every navigation item, CTA, accordion, menu control, and form control.
- Visible focus indicators.
- Correct expanded/collapsed state on the mobile menu.
- Correct current-page indication where practical.
- Sufficient color contrast for text and controls.
- Labels, instructions, and useful error messages for auth forms.
- Accessible dialog behavior if any auth or navigation interaction uses a dialog.
- Reduced-motion support consistent with the current site.
- No reliance on color alone to communicate authentication state or legal status.
- Responsive layout at desktop, tablet, and mobile widths.
- Link text that identifies its destination instead of repeated ambiguous “read more” labels.

W3C WCAG 2.2 is the reference standard for this baseline: https://www.w3.org/TR/WCAG22/

## 15. Content and legal governance

- Terms and Privacy are first drafts, not legal advice or final legal approval.
- Core Values is placeholder/template content until the owner supplies the final values.
- Legal placeholders must be obvious and easy to locate before launch.
- The owner or legal reviewer must confirm:
  - Legal entity name.
  - Business address.
  - Privacy/legal email.
  - Effective and last-updated dates.
  - Governing law and dispute venue.
  - Account age requirement.
  - Payment/refund rules.
  - AI model-training/data-retention policy.
  - State privacy regimes that apply.
  - Account deletion process.
  - Whether generated outputs may be used to improve services.
- No implementation should silently convert draft legal copy into an implied final policy.

## 16. Data and security requirements

Because the requested site is live and includes full authentication and logged-in product data:

- Authentication state must come from a secure backend/session mechanism.
- Protected data must be authorized server-side for the current user.
- Client-side route hiding is not sufficient protection.
- User-generated prompts, uploads, outputs, and project metadata require an explicit data ownership, retention, deletion, and privacy policy.
- Secrets and credentials must not be committed to the repository or exposed in browser code.
- Forms need CSRF, abuse/rate-limit, validation, and error-handling considerations appropriate to the chosen architecture.
- The existing demo/localStorage state must be clearly separated from production user data.

## 17. Acceptance criteria

### Public information

- [ ] A visitor can load the landing page without an account.
- [ ] The existing landing-page section anchors still scroll to The studio, The system, and Social Workshop.
- [ ] Each major landing section has a prominent link to its own detailed webpage.
- [ ] Detailed pages are independently addressable, refreshable, and reachable through normal links.
- [ ] Core Values is a standalone public page linked from the site.
- [ ] Core Values visibly communicates that the first content is a template awaiting owner-provided values.

### Legal pages

- [ ] Terms is a standalone public page linked from the footer on every page.
- [ ] Privacy is a standalone public page linked from the footer on every page.
- [ ] Both pages are plain-language first drafts with explicit draft/legal-review status.
- [ ] Terms covers the site, product, account, user content, AI generation, acceptable use, outputs, third parties, disclaimers, liability, and termination topics.
- [ ] Privacy is U.S.-focused, centered on user privacy, and covers account/product/AI data, cookies/storage, sharing, retention, security, rights, children, and contact.
- [ ] Legal identity and unresolved policy decisions use clearly marked placeholders.

### Shared shell

- [ ] Header structure and visual treatment are consistent on every page.
- [ ] Footer structure, visual treatment, and sitemap links are consistent on every page.
- [ ] The footer includes Core Values, Terms, Privacy, full public navigation, account links, dashboard/product entry, and contact.
- [ ] Mobile header navigation works consistently across public and authenticated pages.
- [ ] A visitor can reach legal pages regardless of authentication state.

### Authentication

- [ ] A visitor can create an account through a real production-oriented flow.
- [ ] An existing user can sign in and sign out.
- [ ] Password recovery is supported.
- [ ] Session persistence and expiration are handled safely.
- [ ] Protected routes reject unauthenticated access and redirect to sign in.
- [ ] Intended destination is preserved when practical.
- [ ] Logged-in users see authenticated navigation and their own product data.
- [ ] Logged-out users see public navigation and sign-in/create-account actions.
- [ ] No private product data is available merely by editing a URL or browser state.

### Quality

- [ ] New pages are responsive.
- [ ] New pages follow WCAG 2.2 AA-oriented practices.
- [ ] Keyboard navigation, visible focus, labels, errors, and reduced-motion behavior work.
- [ ] Existing structure-audit and link-check expectations are reconciled with the actual canonical tree.
- [ ] The implementation does not add a second duplicate CSS/JS/page-role tree.

## 18. Out of scope for this specification

- Final legal approval or legal advice.
- Final Core Values copy supplied by the owner.
- Final pricing, subscription, refund, or monetization policy beyond placeholders in Terms.
- Rewriting product capabilities unrelated to shared navigation, authentication, or protected data behavior.
- Treating the current repository demo as the finished product architecture.
- Shipping seeded demo records, localStorage product data, fake accounts, or a local-only authentication simulation as live functionality.

## 19. Reference research

- W3C, *Web Content Accessibility Guidelines (WCAG) 2.2*: https://www.w3.org/TR/WCAG22/
- U.S. Web Design System, *Website policies and notices*: https://designsystem.digital.gov/about/website-policies-notices/

## 20. Future-state launch gates

Before the finished product is called live:

- [ ] The future canonical site/application structure is selected and documented.
- [ ] Current demo pages, seeded data, localStorage state, and obsolete duplicate assets are removed or explicitly archived outside the production surface.
- [ ] Supabase Auth, Postgres, RLS, Storage policies, Edge Function secrets, email redirects, and production environment configuration are verified.
- [ ] No service-role key, database credential, or private secret is present in browser code or committed files.
- [ ] Every protected product query is authorized by the authenticated user/workspace at the database or trusted server boundary.
- [ ] Public pages work independently at their production URLs and survive direct navigation/refresh.
- [ ] Header/footer parity is tested across the complete finished public and authenticated page inventory.
- [ ] Terms, Privacy, and Core Values content has the correct final/draft status before public launch.
- [ ] Legal placeholders are resolved or the affected product capability is disabled until resolved.
- [ ] Auth, authorization, account recovery, data deletion, and logout behavior are tested in a production-like environment.
- [ ] Demo-to-live migration has been completed, verified, and the demo data purge has been confirmed.

## 21. Implementation handoff questions

These are intentionally recorded for the implementation phase rather than blocking this spec:

1. Which backend/auth/session architecture will support the live account flow?
2. Where will the canonical deployed page tree live, given the discrepancy between the README’s `Gem-Studio/` layout and the currently inspected root-level files?
3. What is the owner’s final legal identity, address, legal/privacy contact, and governing-law choice?
4. Which U.S. state privacy laws apply to the business and its audience?
5. Will prompts, uploads, outputs, and project data be used for model training or service improvement?
6. What are the final Core Values?
7. What are the final account age, retention, deletion, billing, and refund policies?
