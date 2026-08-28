# Plan: Flow Revamp (Site -> Docs -> Pricing -> Usage Level -> Account Creation -> Studio Essentials -> Departmental Setup)

Scope: Complete End-to-End Studio Flow Revamp
Depth: tree 7
Mode: orchestrated

## Contract

Decide before fan-out:

- Interfaces: Typed pricing tiers, auth signup payload with full name, studio essentials schema (name, logo, colors, tagline), 4-department configuration (Marketing, Socials, Development, Production), Pro lane preconfigs vs BYOK buildout, 6-file agent contract (`role`, `soul`, `jobdescription`, `skills`, `memory`, `user_content`), and protected IP boundaries.
- Ownership:
  - `planning/**` (specifications and architecture)
  - `web/app/(marketing)/**` (Site, Docs, Pricing)
  - `web/app/(auth)/**`, `web/components/auth/**` (Account details & signup)
  - `web/components/onboarding/**`, `web/lib/studio/onboarding.ts` (Studio essentials: Name, Logo, Colors, Tag Line)
  - `web/app/(product)/app/builder/**`, `web/components/product/**`, `web/lib/studio/**` (4 departments, Pro lanes vs BYOK buildout, 6-file agent editor)
  - `web/tests/**`, `scripts/**` (unit tests and verification oracle)
- Dependencies: None (single branch integration).
- Host launch mode: Sequential execution.
- Toolchain: Node 20+, Next.js 15, React 19, TypeScript strict, Vitest, Tailwind/CSS custom properties.
- Conventions: Server-side authorization, immutable workspace scope, zero secret exposure, masked API keys, protected IP agent boundaries, WCAG 2.2 AA contrast, 8-state interactive components, Hallmark anti-slop rules.

## Current contract inventory

Contract revision: 1

| ID | Required outcome or constraint | Owner | Observing gate or manual review | Disposition | Revision |
|---|---|---|---|---|---|
| C1 | Site discovery & navigation seamlessly connects Site, Docs, and Pricing | leaf-2.1.1.1.1.1 | G2 | VERIFIED | 1 |
| C2 | Comprehensive Docs covering Pipeline, DNA, GenPlay, BYOK, Agents, and Self-Hosting | leaf-2.2.1.1.1.1 | G2 | VERIFIED | 1 |
| C3 | Pricing with Pro tiers (Content Pro, Creator Pro, Hollywood Pro), BYOK Subscriptions (Content BYOK, Creator BYOK), Self Host Creator Community, and Payroll Budget | leaf-3.1.1.1.1.1 | G3 | VERIFIED | 1 |
| C4 | Account creation collecting Email, Full Name, Password, and Confirm Email for Auth | leaf-4.1.1.1.1.1 | G4 | VERIFIED | 1 |
| C5 | Logged in Studio Essentials collecting Studio Name, Logo, Colors (palette), and Tag Line | leaf-5.1.1.1.1.1 | G5 | VERIFIED | 1 |
| C6 | 4-Department Setup (Marketing, Socials, Development, Production) with Pro preconfigured lanes vs BYOK custom build-out | leaf-6.1.1.1.1.1 | G6 | VERIFIED | 1 |
| C7 | Custom agents with all 6 files (`role`, `soul`, `jobdescription`, `skills`, `memory`, `user_content`) and absolute protection of IP agent details | leaf-6.2.1.1.1.1 | G7 | VERIFIED | 1 |
| C8 | Tastemaker & Hallmark visual quality, anti-slop rules, locked tokens, and mobile responsiveness | leaf-7.1.1.1.1.1 | G8 | VERIFIED | 1 |
| C9 | Full verification: strict TypeScript, ESLint max-warnings=0, and unit test suite | leaf-7.2.1.1.1.1 | G9 | VERIFIED | 1 |

## Tree (7 Levels)

- 1 Complete Flow Revamp ..................................................... GATES.md ..................... State: VERIFIED
  - 1.1 Planning, Contracts & Architecture ................................. gates/node-1.1.md ............ State: VERIFIED
    - 1.1.1 Specification Reconciliation ................................... gates/node-1.1.1.md .......... State: VERIFIED
      - 1.1.1.1 Spec Document Updates ...................................... gates/node-1.1.1.1.md ........ State: VERIFIED
        - 1.1.1.1.1 Spec Drafting .......................................... gates/node-1.1.1.1.1.md ...... State: VERIFIED
          - 1.1.1.1.1.1 Planning Specs Update .............................. gates/leaf-1.1.1.1.1.1.md .... State: VERIFIED
            - 1.1.1.1.1.1.1 Verification Oracle & Spec Alignment ......... G1 ........................... State: VERIFIED
  - 1.2 Site Discovery & Documentation ..................................... gates/node-1.2.md ............ State: VERIFIED
    - 1.2.1 Marketing Home & Documentation Index ........................... gates/node-1.2.1.md .......... State: VERIFIED
      - 1.2.1.1 Docs Knowledge Base Expansion .............................. gates/node-1.2.1.1.md ........ State: VERIFIED
        - 1.2.1.1.1 Self-Host & Agent Guides ............................... gates/node-1.2.1.1.1.md ...... State: VERIFIED
          - 1.2.1.1.1.1 Docs Content Implementation ........................ gates/leaf-1.2.1.1.1.1.md .... State: VERIFIED
            - 1.2.1.1.1.1.1 Verification of Docs Articles & Discovery ..... G2 ........................... State: VERIFIED
  - 1.3 Pricing, Usage Levels & Payroll Budget ............................. gates/node-1.3.md ............ State: VERIFIED
    - 1.3.1 Pro Tiers, BYOK Subscriptions, & Self-Host ..................... gates/node-1.3.1.md .......... State: VERIFIED
      - 1.3.1.1 Pricing Matrix & Model Definition .......................... gates/node-1.3.1.1.md ........ State: VERIFIED
        - 1.3.1.1.1 Pricing Component & Payroll Budget Section ............. gates/node-1.3.1.1.1.md ...... State: VERIFIED
          - 1.3.1.1.1.1 Pricing Page Implementation ........................ gates/leaf-1.3.1.1.1.1.md .... State: VERIFIED
            - 1.3.1.1.1.1.1 Verification of Pricing Tiers & Payroll ........ G3 ........................... State: VERIFIED
  - 1.4 Account Details & Auth Lifecycle ................................... gates/node-1.4.md ............ State: VERIFIED
    - 1.4.1 Signup Form & Email Confirmation ............................... gates/node-1.4.1.md .......... State: VERIFIED
      - 1.4.1.1 Account Input Fields & Validation .......................... gates/node-1.4.1.1.md ........ State: VERIFIED
        - 1.4.1.1.1 Auth Form & Modal UI Update ............................ gates/node-1.4.1.1.1.md ...... State: VERIFIED
          - 1.4.1.1.1.1 Auth UI Implementation ............................. gates/leaf-1.4.1.1.1.1.md .... State: VERIFIED
            - 1.4.1.1.1.1.1 Verification of Full Name, Email, Pass, Confirm  G4 ........................... State: VERIFIED
  - 1.5 Studio Essentials & Brand Onboarding ............................... gates/node-1.5.md ............ State: VERIFIED
    - 1.5.1 Wizard Step for Studio Identity ................................ gates/node-1.5.1.md .......... State: VERIFIED
      - 1.5.1.1 Name, Logo, Colors, & Tag Line Schema ...................... gates/node-1.5.1.1.md ........ State: VERIFIED
        - 1.5.1.1.1 Studio Essentials Modal UI & Validation ................ gates/node-1.5.1.1.1.md ...... State: VERIFIED
          - 1.5.1.1.1.1 Onboarding Modal Implementation .................... gates/leaf-1.5.1.1.1.1.md .... State: VERIFIED
            - 1.5.1.1.1.1.1 Verification of Studio Essentials Modal ....... G5 ........................... State: VERIFIED
  - 1.6 Departmental Setup, Lanes & 6-File Agent IP System ................. gates/node-1.6.md ............ State: VERIFIED
    - 1.6.1 4-Department Architecture & Lane Customization ................. gates/node-1.6.1.md .......... State: VERIFIED
      - 1.6.1.1 Pro Preconfigured Lanes vs BYOK Build-out .................. gates/node-1.6.1.1.md ........ State: VERIFIED
        - 1.6.1.1.1 Department Workbench & Lane Selector ................... gates/node-1.6.1.1.1.md ...... State: VERIFIED
          - 1.6.1.1.1.1 Departmental Setup Implementation .................. gates/leaf-1.6.1.1.1.1.md .... State: VERIFIED
            - 1.6.1.1.1.1.1 Verification of 4 Departments & Lane Modes .... G6 ........................... State: VERIFIED
    - 1.6.2 6-File Custom Agent Editor & IP Protection Boundary ............ gates/node-1.6.2.md .......... State: VERIFIED
      - 1.6.2.1 Agent Files Contract & Masking Engine ...................... gates/node-1.6.2.1.md ........ State: VERIFIED
        - 1.6.2.1.1 Agent File Editor & Protection Rules ................... gates/node-1.6.2.1.1.md ...... State: VERIFIED
          - 1.6.2.1.1.1 Agent Editor & IP Protection Implementation ........ gates/leaf-1.6.2.1.1.1.md .... State: VERIFIED
            - 1.6.2.1.1.1.1 Verification of 6 Files & Zero IP Leakage ..... G7 ........................... State: VERIFIED
  - 1.7 Verification, Anti-Slop Audit & Delivery ........................... gates/node-1.7.md ............ State: VERIFIED
    - 1.7.1 Design Quality & Anti-Slop Audit ............................... gates/node-1.7.1.md .......... State: VERIFIED
      - 1.7.1.1 Tastemaker / Hallmark Compliance ........................... gates/node-1.7.1.1.md ........ State: VERIFIED
        - 1.7.1.1.1 Style Lock, Tokens & CSS Stamps ........................ gates/node-1.7.1.1.1.md ...... State: VERIFIED
          - 1.7.1.1.1.1 Design Audit Execution ............................. gates/leaf-1.7.1.1.1.1.md .... State: VERIFIED
            - 1.7.1.1.1.1.1 Verification of Anti-Slop & Design Quality .... G8 ........................... State: VERIFIED
    - 1.7.2 Automated Suite Verification ................................... gates/node-1.7.2.md .......... State: VERIFIED
      - 1.7.2.1 End-to-End Test Execution .................................. gates/node-1.7.2.1.md ........ State: VERIFIED
        - 1.7.2.1.1 Typecheck, Lint, Vitest ................................ gates/node-1.7.2.1.1.md ...... State: VERIFIED
          - 1.7.2.1.1.1 Test Suite Execution ............................... gates/leaf-1.7.2.1.1.1.md .... State: VERIFIED
            - 1.7.2.1.1.1.1 Verification of Typecheck, Lint & Tests ........ G9 ........................... State: VERIFIED
