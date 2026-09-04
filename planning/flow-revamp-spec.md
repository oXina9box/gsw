# Flow Revamp Specification: End-to-End Studio Onboarding & Operations

**Status:** Normative Product Specification
**Scope:** Public Discovery -> Docs -> Pricing & Plans -> Account Registration -> Studio Essentials -> Departmental Setup -> Agent Customization & IP Protection

---

## 1. Flow Overview & Architecture

Gem Studio implements a frictionless, transparent end-to-end user lifecycle structured across six key milestones:

```
[ Go to Site (/) ]
       │
       ▼
[ Review Docs (/docs) ] ────────► Architecture, Pipeline, BYOK, Self-Host, Agents
       │
       ▼
[ Find Pricing (/pricing) ] ────► Pro Tiers, BYOK Subscriptions, Self-Host Community, Payroll Budget
       │
       ▼
[ Pick Usage Level & Signup ] ──► Email, Full Name, Password, Confirm Email for Auth
       │
       ▼
[ Create Studio Essentials ] ───► Studio Name, Logo, Brand Colors (Palette), Tag Line
       │
       ▼
[ Departmental Setup ] ─────────► 4 Core Departments: Marketing, Socials, Development, Production
                                   ├─ Pro Users: Preconfigured Lanes with Select / Deselect toggles
                                   ├─ BYOK Users: Build out custom lanes
                                   └─ Both Users: Create Custom Agents (All 6 Files)
                                   └─ CRITICAL: AT NO POINT DO WE TIP THE IP AGENT DETAILS
```

---

## 2. Milestone Details

### 2.1 Go to Site (`/`)
- **Visual Presentation:** Cinematic editorial hero stage, "Walk the floor" department overview, structured signal board, proof gallery link.
- **Actions:** Seamless entry points to "Create your Studio" (`/?auth=signup`), "Open your Studio" (`/app` for authenticated users), "Review Docs" (`/docs`), and "Editions & Economics" (`/pricing`).

### 2.2 Review Docs (`/docs`)
- **Coverage:** Practical guides explaining:
  1. `studio-pipeline`: Thirteen connected departments and deliberate handoffs.
  2. `dna-continuity`: Versioned character, location, prop, and camera continuity records.
  3. `genplay-contracts`: Reproducible shot descriptions, parameter locking, and acceptance testing.
  4. `byok-security`: AES-256-GCM encrypted provider secrets, zero browser exposure, server-only proxy.
  5. `agent-system`: 6-file agent architecture (`role`, `soul`, `jobdescription`, `skills`, `memory`, `user_content`), capability resolution, and strict protected configuration boundary.
  6. `self-host-community`: Self Host Creator Community deployment on own hardware or VPS, BYOK key setup, custom channel limits, hardware sizing, and agent authoring.

### 2.3 Find Pricing & Usage Levels (`/pricing`)
Gem Studio offers three commercial modalities:

#### A. Pro Tiers (Managed Cloud + All Agents Included + BYOK Capable)
1. **Content Pro:**
   - Channels: 1 Channel
   - Credits: Low credits (starter monthly allocation)
   - Agents: All official protected catalog agents included
   - BYOK: Can optionally pair BYOK API keys
   - Target: Focused solo creators and single publication outlets.

2. **Creator Pro (Featured):**
   - Channels: 3 Channels
   - Credits: Mid credits (expanded multi-series monthly allocation)
   - Agents: All official protected catalog agents included
   - BYOK: Hybrid Cloud + BYOK key pairing
   - Target: Active production teams running multiple series.

3. **Hollywood Pro:**
   - Channels: 5 Channels (expandable)
   - Credits: Max credits (high-capacity studio generation)
   - Agents: All official protected catalog agents included
   - BYOK: Full custom BYOK routing + direct model tiers
   - Target: Commercial studios and high-volume production floors.

#### B. BYOK Subscriptions (Software Floor + Zero Credit Markup + Payroll Budget)
1. **Content BYOK:**
   - Channels: 1 Channel
   - Credits: No platform credits (0 credits)
   - Pricing: Lowest cost entry
   - Agents: Full studio operating system with agent payroll options.

2. **Creator BYOK:**
   - Channels: 3 Channels
   - Credits: No platform credits (0 credits)
   - Pricing: Second lowest cost
   - Agents: Multi-channel operating system with agent payroll options.

Both BYOK subscriptions feature the **Payroll Budget Options** for human and agent allocation planning.

#### C. Self Host (Community Edition)
- **Self Host Creator Community:**
  - Licensing: Open core / Community deployment
  - Provider Model: 100% BYOK
  - Infrastructure: Run on your own hardware or VPS
  - Channels: Configurable # of channels
  - Limits: Harder system limits based on host resources
  - Agents: Standard set of core agents included; custom agents authorable via the 6-file contract.

#### D. Payroll Budget Section
- Transparent framework for planning human collaborators (Creative, Production, Operations) alongside agent execution budgets.

---

### 2.4 Account Details & Signup Flow (`/?auth=signup` & `/signup`)
- **Fields Collected:**
  1. **Email Address** (`email`): Validated format, uniqueness check.
  2. **Full Name** (`fullName`): Personal or creator name for workspace profile and audit logs.
  3. **Password** (`password`): Min 8 characters, secure password validation.
  4. **Confirm Email for Auth:** Clear notification upon registration instructing the user to confirm their email address via the sent verification link before entering production workspaces. Testing bypasses provide immediate feedback where configured.

---

### 2.5 Logged In -> Inspect Studio and Open Setup
Upon first login, the complete authenticated Studio is available for inspection. `/app/onboarding` provides resumable Studio Essentials setup without blocking navigation or opening automatically. It captures:
1. **Studio Name:** Required studio title (or explicit "Decide later" deferred option).
2. **Studio Brand:**
   - **Logo:** Upload (SVG, PNG, WebP ≤ 5MB, ≤ 4096px) or select a default studio mark.
   - **Brand Colors:** Full palette selection:
     - Primary brand color (picker + hex input)
     - Secondary color (picker + hex input)
     - Accent color (picker + hex input)
     - WCAG contrast verification indicator.
   - **Tag Line:** Short memorable statement or mission for the studio (e.g. "Cinema at the speed of thought").

---

### 2.6 Departmental Setup (`/app/builder` & Onboarding Step)
The studio architecture is organized across **4 Core Departments**:
1. **Marketing:** Strategy, Brand Direction, Campaign Briefs, Audience Discovery.
2. **Socials:** Short-form adaptations, Community Management, Channel Broadcasts, Audience Feedback.
3. **Development:** Screenplays, Storyboards, DNA Character Continuity, Worldbuilding.
4. **Production:** GenPlay shot generation, Scene Assembly, Sound/Color Master, Rendering.

#### Tier-Specific Lane Behavior:
- **Pro Users:** Receive preconfigured, industry-standard Lanes in each department (e.g. "Brand Campaign", "Social Pulse", "Screenplay Lab", "Virtual Stage") and can select which lanes they want active and which they do not via straightforward toggle selectors.
- **BYOK Users:** Build out lanes from scratch, custom-tailoring stage flows, collaboration modes (Forward vs Round Table), pass orders, and cycle counts.

#### Custom Agents & 6-File Contract (Both Pro & BYOK Users):
Both Pro and BYOK users can create and edit custom studio agents. Every agent configuration adheres to the **6-File Contract**:
1. `role.md` — Core identity, authority level, and departmental role.
2. `soul.md` — Personality, aesthetic philosophy, and voice tone.
3. `jobdescription.md` — Exact task boundaries, input schemas, and expected output deliverables.
4. `skills.md` — Domain capabilities, technical proficiencies, and operational knowledge.
5. `memory.md` — Context retention rules, canon guidelines, and approved reference material.
6. `user_content.md` — Studio-specific creator notes, custom guardrails, and project direction.

---

### 2.7 CRITICAL IP PROTECTION STANDARD
> **AT NO POINT DO WE TIP THE IP AGENT DETAILS.**
- Official catalog / protected agents (`protected_config: true`) encapsulate proprietary prompts, system architectures, and internal fine-tuning contracts.
- **Invariants:**
  1. The server NEVER sends `agent_catalog_files` or private file contents of protected agents to browser clients.
  2. The agent editor renders protected configurations in a secure masked/badge state ("Protected Configuration — Proprietary Studio Agent").
  3. API endpoints, database views, export endpoints, and debug logs MUST sanitize and redact private prompt contents for protected agents.
  4. Execution workers resolve protected agent prompts strictly in server-side memory or through the operator-controlled protected inference endpoint (`PROTECTED_INFERENCE_BASE_URL`).
  5. Custom agents (`protected_config: false`) created by users remain fully editable across all 6 files.
