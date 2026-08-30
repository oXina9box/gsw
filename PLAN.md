# Plan: Blocks Wireframe Rebuild (3 packs, every page)

Scope: Rebuild presentation layer of all 36 content pages on Kometa / Preline / Flowbite blocks. Approved wireframe plan 2026-08-30.
Depth: tree 6
Mode: orchestrated
Harness: cline (model-router locked)
Skill persistence active: caveman ultra, ponytail full, rtk on, unlazy, tastemaker style lock, landing-page-design rules, animation-on-scroll reveal standard.

## Contract

- Interfaces: Tailwind v4 `@theme` bridge in `web/app/globals.css` consuming `web/tokens.css` (OKLCH colors, Syne/Space Grotesk/DM Mono fonts, radii, motion curves). Vendored blocks live in `web/components/blocks/{kometa,preline,flowbite}/` as strict-TS React, ported by hand from pack sources. Pages keep server components, data queries, server actions, RLS, routing. Shell invariants stay: SiteHeader / StudioNav / SiteFooter only, `.shell` containment, `data-archetype`, WCAG 2.2 AA, reduced motion.
- Ownership: `web/app/**`, `web/components/**`, `web/app/globals.css`, `web/tokens.css`, `design.md`, `docs/DESIGN.md`, `scripts/verify-blocks-coverage.mjs`.
- Dependencies: none new. Packs are copy-in source, not npm.
- Toolchain: Node 22, Next 16, React 19, Tailwind v4, Vitest, Playwright.
- Conventions: TDD per repo law, branch `dev-blocks-wireframe` cloned from `dev`, merge back on completion, push to GitLab immediately.
- Ponytail scope guard: no new copy, no new routes, no capability logic in pages. Visual layer only. Tagline reveal treats existing copy, adds no claims. FAQ or new pricing copy needs owner approval first, excluded here.

## Model routing (cline matrix)

| Tier | Model + thinking | Leaves |
|---|---|---|
| Default | kimi-k3 medium | Shell components, standard Core A pages, standard Core B pages, vendoring ports |
| Fast | glm-flash-5.3 none/low | Auth gateway sweep, staffing, assets, channels index, mechanical class conversions |
| Max | qwen-3.8-max high | Theme bridge, home page, production detail, builder, verification audit |

Escalation only after default tier proves insufficient. Never Flash direct to Max.

## Tree (6 levels)

- 1 Blocks Wireframe Rebuild ............................... GATES.md .................. State: PENDING
  - 1.1 Foundation ........................................ gates/node-1.1.md ......... State: PENDING (qwen-3.8-max high)
    - 1.1.1 Tailwind theme bridge
      - 1.1.1.1 `@theme` maps tokens.css into Tailwind
        - 1.1.1.1.1 globals.css edit
          - 1.1.1.1.1.1 Leaf: bridge compiles, build green .... gates/leaf-1.1.1.1.1.1.md
    - 1.1.2 Reveal standard (animation-on-scroll)
      - 1.1.2.1 One `blocks/reveal.tsx` observer component replaces per-page reveal CSS
        - 1.1.2.1.1 Implement + reduced-motion
          - 1.1.2.1.1.1 Leaf: reveal works on test page ..... gates/leaf-1.1.2.1.1.1.md
    - 1.1.3 Block vendoring (ponytail: port only blocks pages use)
      - 1.1.3.1 Port Kometa marketing sections, Preline app UI, Flowbite widgets
        - 1.1.3.1.1 Strict-TS ports, token colors only
          - 1.1.3.1.1.1 Leaf: blocks lint + typecheck .... gates/leaf-1.1.3.1.1.1.md
  - 1.2 Shell .......................................... gates/node-1.2.md ......... State: PENDING (kimi-k3)
    - 1.2.1 Header + Footer (Kometa Header / Footer dark)
      - 1.2.1.1 SiteHeader, SiteFooter rework
        - 1.2.1.1.1 Mobile drawer, nav states
          - 1.2.1.1.1.1 Leaf: shell renders all routes .. gates/leaf-1.2.1.1.1.1.md
    - 1.2.2 StudioNav (Preline navbar + tabs + dropdown)
      - 1.2.2.1 Module tabs, subnav, account dropdown
        - 1.2.2.1.1 Keep navigation contracts from lib/studio
          - 1.2.2.1.1.1 Leaf: nav matches contracts ... gates/leaf-1.2.2.1.1.1.md
    - 1.2.3 Modals + palette
      - 1.2.3.1 AuthModal, OnboardingModal (Preline modal + stepper), CommandMenu (Preline palette)
        - 1.2.3.1.1 Focus trap, Escape, aria kept
          - 1.2.3.1.1.1 Leaf: modal suite works ......... gates/leaf-1.2.3.1.1.1.md
  - 1.3 Core A public pages .............................. gates/node-1.3.md ......... State: PENDING
    - 1.3.1 Home (qwen-3.8-max high, landing-page-design Part A: one action, tagline reveal B11, closing CTA mirrors hero)
      - 1.3.1.1 Hero + HeroStage, desk grid, flow board, SignalBoard split, teasers, closing
        - 1.3.1.1.1 Section ports
          - 1.3.1.1.1 Build
            - 1.3.1.1.1.1 Leaf: home green .............. gates/leaf-1.3.1.1.1.1.md
    - 1.3.2 Flagship details (kimi-k3)
      - 1.3.2.1 studio, system, social-workshop: hero, band, rail or steps, 2x2 features, CTA
        - 1.3.2.1.1 Port per approved wireframes
          - 1.3.2.1.1 Build
            - 1.3.2.1.1.1 Leaf: three pages green ...... gates/leaf-1.3.2.1.1.1.md
    - 1.3.3 Pricing (kimi-k3)
      - 1.3.3.1 Kometa Pricing stacks, featured card cyan, payroll stats, self-host block
        - 1.3.3.1.1 Port
          - 1.3.3.1.1 Build
            - 1.3.3.1.1.1 Leaf: pricing green ........... gates/leaf-1.3.3.1.1.1.md
    - 1.3.4 Docs (kimi-k3)
      - 1.3.4.1 Docs index + slug: Preline sidebar layout, Flowbite breadcrumb + pagination
        - 1.3.4.1.1 Port
          - 1.3.4.1.1 Build
            - 1.3.4.1.1.1 Leaf: docs green .............. gates/leaf-1.3.4.1.1.1.md
    - 1.3.5 Small publics (glm-flash-5.3)
      - 1.3.5.1 contact (Kometa Contact), core-values, privacy, terms (LegalDocument skin), do-not-click (Flowbite Video)
        - 1.3.5.1.1 Port
          - 1.3.5.1.1 Build
            - 1.3.5.1.1.1 Leaf: five pages green ......... gates/leaf-1.3.5.1.1.1.md
  - 1.4 Auth gateway ..................................... gates/node-1.4.md ......... State: PENDING (glm-flash-5.3 low)
    - 1.4.1 One Preline Login gateway block
      - 1.4.1.1 login, forgot, mfa, reset, verify-email
        - 1.4.1.1 AuthForm, MfaChallenge stay as-is inside
          - 1.4.1.1.1 Build
            - 1.4.1.1.1.1 Leaf: five routes green ...... gates/leaf-1.4.1.1.1.1.md
  - 1.5 Core B product pages ............................. gates/node-1.5.md ......... State: PENDING
    - 1.5.1 Front Office hub (kimi-k3)
      - 1.5.1.1 `/app` KPI cards, channel rows, production rows, feed split; `/app/front-office` form card
        - 1.5.1.1.1 Port
          - 1.5.1.1.1 Build
            - 1.5.1.1.1.1 Leaf: hub green ............... gates/leaf-1.5.1.1.1.1.md
    - 1.5.2 Studio floor (kimi-k3, production detail qwen-3.8-max high)
      - 1.5.2.1 `/app/studio` rows + feed; `/app/productions/[id]` stepper, gate panel, artifacts, shot board (Flowbite file upload), assembly table, casting, logs terminal
        - 1.5.2.1.1 Port
          - 1.5.2.1.1 Build
            - 1.5.2.1.1.1 Leaf: floor green ............. gates/leaf-1.5.2.1.1.1.md
    - 1.5.3 Builder + orchestration (kimi-k3)
      - 1.5.3.1 Builder accordion, agent rows, 6-file editor tabs; orchestration rule list + terminal
        - 1.5.3.1.1 Port
          - 1.5.3.1.1 Build
            - 1.5.3.1.1.1 Leaf: both green .............. gates/leaf-1.5.3.1.1.1.md
    - 1.5.4 Universe + agents (kimi-k3)
      - 1.5.4.1 Universe split form + registry filter; record inspector with code block; agents catalog rows
        - 1.5.4.1.1 Port
          - 1.5.4.1.1 Build
            - 1.5.4.1.1.1 Leaf: three green ............ gates/leaf-1.5.4.1.1.1.md
    - 1.5.5 Account set (kimi-k3)
      - 1.5.5.1 Billing stat hero + ledger feeds; integrations form + connection rows; account panels + danger zone
        - 1.5.5.1.1 Port
          - 1.5.5.1.1 Build
            - 1.5.5.1.1.1 Leaf: three green ............ gates/leaf-1.5.5.1.1.1.md
    - 1.5.6 Department pages (glm-flash-5.3 low)
      - 1.5.6.1 marketing split, social board, channels index + detail, staffing, assets
        - 1.5.6.1.1 Port
          - 1.5.6.1.1 Build
            - 1.5.6.1.1.1 Leaf: six green .............. gates/leaf-1.5.6.1.1.1.md
  - 1.6 Verification + docs (qwen-3.8-max high) ........... gates/node-1.6.md ......... State: PENDING
    - 1.6.1 Full gate suite + tastemaker audit_motion.py + screenshot pass + dead legacy CSS deletion
      - 1.6.1.1 Run GATES.md G1 to G7
        - 1.6.1.1.1 Fix failures
          - 1.6.1.1.1 Re-run
            - 1.6.1.1.1.1 Leaf: all root gates met ....... gates/leaf-1.6.1.1.1.1.md
    - 1.6.2 Docs addendum
      - 1.6.2.1 design.md + docs/DESIGN.md pack mapping section (G8)
        - 1.6.2.1.1 Draft
          - 1.6.2.1.1 Verify
            - 1.6.2.1.1.1 Leaf: docs gate met .......... gates/leaf-1.6.2.1.1.1.md

## Dispatch

Sequential waves, single agent default; fan-out via subagent allowed inside a wave when leaves disjoint:
- Wave 1: 1.1 all foundation leaves (blocks everything)
- Wave 2: 1.2 shell
- Wave 3: 1.3 Core A (1.3.1 to 1.3.5 parallelizable after wave 2)
- Wave 4: 1.4 auth gateway
- Wave 5: 1.5 Core B (1.5.1 to 1.5.6 parallelizable)
- Wave 6: 1.6 verification + docs

Each leaf: own gates file at leaf start, four passes (complete, expert reread, defect hunt, polish), evidence recorded, only then next leaf. Leaf gates cover the leaf; whole-project checks live here in GATES.md, run once at 1.6.

## Page wireframe map (approved 2026-08-30, execution reference)

Public: home (Hero + Features 2x2 + Steps + SignalBoard split + Content teasers + CTA), studio (Hero + band + 13-dept rail + Features + CTA), system (Hero + Steps + 3-col Features + Features + CTA), social-workshop (Hero + board split + Features + CTA), portfolio (Hero + media cards + CTA), pricing (Hero + 2 Pricing stacks + stats ledger + self-host), docs (sidebar layout), docs slug (breadcrumb + sidebar + prose + pagination), contact (Contact form card + CTA), core-values (reading + 4 Features), privacy/terms (LegalDocument skin), do-not-click (Video block).
Auth: one Login gateway, five routes.
Product: `/app` (KPI 4-up, channel rows, production rows, feed split), front-office (form card), channels (3-col cards + empty state), channel detail (breadcrumb + definition list + form + table), marketing (checklist + brief form, roster + channels), social (platform strip, signal board + form, packages + reports), staffing (2 cards), studio (production rows + feed), productions detail (stepper, gates, artifacts, shots + upload, assembly, casting, budget, logs), builder (accordion + agent rows + editor tabs), universe (split form + filtered registry), record (split + code block), assets (3 KPI cards), orchestration (workflow cards + rule list + terminal), agents (catalog rows + hire action), billing (stat hero + products + ledger), integrations (form + connection rows), account (panels + danger zone).
Redirects untouched: gallery, dashboard, dna, genplay.

## Open decisions for owner

- Card aesthetic (pack default rounded cards + shadow) versus design.md anti-pattern 3 (connected 1px borders). Default for execution: theme bridge maps radii to token radius, shadows to border-plus-fill, keeping pack DOM. Say otherwise to keep raw pack look.
- FAQ + risk-reversal sections on pricing per landing-page-design: content addition, needs owner approval per doc-driven law. Excluded from this scope.
