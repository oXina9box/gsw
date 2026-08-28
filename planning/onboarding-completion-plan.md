# Gem Studio onboarding completion plan

Status: task list only. No implementation in this packet.
Owner: next implementation agent
Base: `dev`
Contract revision: `R1`

## Outcome

New account can move from first popup to a usable first Studio and first Channel:

1. Answer only useful identity questions.
2. Choose Cloud credits, BYOK, or both.
3. Connect OpenAI or Anthropic safely, with OAuth where supported and masked API-key fallback.
4. Review missing setup data and let the user or assistant fill it.
5. Run a guided Marketing lane: Studio brand, Channel discovery/branding/content, then media planning.
6. Approve the handoff and enter the product with persisted, workspace-scoped records.

## Current code baseline

- `web/components/onboarding/onboarding-modal.tsx`: four-step modal exists, but still asks for assistant mode/tagline, accepts one text color, and has no logo, multi-color, billing, provider, or first-lane stages.
- `web/app/(product)/actions.ts`: onboarding persists JSON payloads and creates the first channel, but does not persist the requested identity/provider/plan state or lane handoffs.
- `web/app/(product)/layout.tsx`: opens onboarding while `onboarding_profiles.step !== 'complete'`.
- `web/app/(marketing)/pricing/page.tsx`: plans exist; BYOK is only a feature line, not a selectable path.
- `web/app/(product)/app/integrations/page.tsx`: encrypted generic API-key path exists; OAuth and explicit OpenAI/Anthropic UX do not.
- `web/components/product/onboarding-assistant.tsx`: optional live guidance exists, but provider calls are currently unmetered.
- `supabase/migrations/0016_phase4_onboarding.sql`: onboarding profile has only `mode`, `step`, three JSON blobs, and completion timestamp.
- `supabase/migrations/0006_studio_product.sql`: `agent_catalog_files` already has the six-file shape: `role`, `soul`, `jobdescription`, `skills`, `memory`, `user_content`.
- Existing branch changes already touch modal onboarding, pricing, shell, and route contracts. Treat those changes as user-owned; reconcile before implementation.

## Product decisions to resolve before code

These are gates, not silent assumptions:

- **Tagline conflict:** request removes Studio tagline; current lane spec lists tagline as identity data. Owner must choose remove, optional note, or retain.
- **No studio name path:** define where the “decide later” note lives and when it blocks completion. Recommended: persist `studio_name_status = deferred`, show a final reminder, allow completion.
- **Logo limits:** approve formats, max bytes, max pixel dimensions, and storage bucket/path. Recommended: SVG/PNG/WebP, 5 MB, 4096×4096, server-side MIME/dimension validation.
- **Color model:** approve 1–3 roles (`primary`, `secondary`, `accent`), picker-first UX, optional hex input, WCAG contrast behavior, and editable-later semantics.
- **Content direction taxonomy:** approve dropdown values and whether “not decided” is a first-class value.
- **Plans:** define subscription products versus current credit packs, plan IDs, entitlement effects, checkout state, and dry-launch behavior.
- **OAuth:** verify current OpenAI/Anthropic user OAuth availability and scopes. Do not promise OAuth if provider does not support it for this product; retain API-key fallback.
- **Assistant authority:** assistant may draft suggestions only; user approves every persisted identity, brand, channel, and schedule value.
- **First-lane boundary:** define “ready to enter product” as approved Studio brand + first Channel brief + media plan, not generated media or publishing.

## Design read

```yaml
artifact: authenticated onboarding wizard + pricing/provider setup + first-lane workbench
audience: new solo creator configuring a private AI film studio
visual-language: warm cinematic builder tool; editorial hierarchy; restrained instrument-panel detail
mode: redesign-preserve (keep routes, server authority, shell, and existing visual vocabulary)
visual-variance: 5
motion-intensity: 4
information-density: 5
asset-dependence: 7
brand-fidelity: 8
```

Consequences: keep one stable wizard spine; use progressive disclosure for billing/provider complexity; reserve motion for step transitions and handoff status; inventory real logo/illustration assets before layout; preserve route names, auth, RLS, and masked-secret contracts.

## Six-level depth tree

Level 1 is outcome. Level 2 is workstream. Level 3 is capability. Level 4 is product slice. Level 5 is agent chunk. Level 6 is the dispatch leaf. Only level-6 leaves are assigned to implementation agents.

### 1. Contracts and product law

- **1.1.1.1.1.1 Spec reconciliation** — update `site-workflow-spec`, `lane-theory-spec`, coverage, and TODO with approved onboarding/provider/first-lane behavior. Record unresolved owner decisions; no code policy invention.
- **1.1.1.1.1.2 Data contract and migration design** — define typed payloads, statuses, idempotency, upload metadata, plan/provider state, handoff artifacts, RLS, retention, and rollback. Migration required; additive only.

### 2. Popup onboarding spine

- **2.1.1.1.1.1 Identity questions and inputs** — remove assistant-mode line and tagline field; implement name yes/no/defer, logo yes/no/upload, 1–3 picker colors with optional hex, content-direction yes/no/dropdown, and free-form content description.
- **2.1.1.1.1.2 Onboarding persistence and resume** — implement server action/state machine for new identity fields, missing-data notes, validation, upload references, step resume, immutable workspace scope, and truthful error states.

### 3. Commercial and provider choice

- **3.1.1.1.1.1 Plan selection and BYOK path** — add explicit Cloud subscription tiers 1/2/3 plus less-prominent BYOK; support BYOK alongside any paid tier; persist selection and route choice into onboarding.
- **3.1.1.1.1.2 Secure provider connection** — OpenAI/Anthropic provider cards, verified OAuth path if available, API-key fallback, server-only exchange/encryption, first-digits mask, revoke/replace/test, no secret in props/logs/storage.

### 4. First marketing lane

- **4.1.1.1.1.1 Lane workbench and missing-data prompts** — show entered values and missing checklist; let user fill, ask assistant to draft, or defer; require explicit approval before handoff; persist status/events.
- **4.1.1.1.1.2 Agent catalog and handoffs** — seed/configure Marketing Director, Studio Brand Designer, Channel Discovery, Channel Branding, Channel Content Designer, and Media agent roles; define six files and structured output/handoff schemas.

### 5. Visual system and asset quality

- **5.1.1.1.1.1 Design system and interaction direction** — document palette roles, typography, spacing, radius, shadow, motion, form states, reduced motion, and responsive layout. Use existing brand assets; no generic AI gradients or fake logo.
- **5.1.1.1.1.2 Illustration and asset pipeline** — inventory `brand-spec.md`, logo variants, upload preview rules, and one real unDraw match for setup/first-lane explanation; recolor only from local library; validate SVG/PNG output.
- **5.1.1.1.1.3 Responsive and accessible polish** — keyboard dialog/focus behavior, mobile 320–414, tablet, desktop, loading/empty/error/disabled states, contrast, labels, and reduced-motion behavior.

### 6. Verification and release

- **6.1.1.1.1.1 Automated contract/security suite** — unit/integration tests for state transitions, validation, uploads, plan/provider decisions, secret masking, RLS/workspace scope, metering, and idempotency; run typecheck/lint/coverage/security gates.
- **6.1.1.1.1.2 End-to-end integration and handoff** — browser flow from signup through plan/BYOK, onboarding, first lane approvals, resume/refresh, and entry to `/app`; verify no fake completion, no leaked key, and all route contracts.

## Dispatch order

| Wave | Leaves | Needs | Model |
|---|---|---|---|
| 0 | `1.1.1.1.1.1`, `5.1.1.1.1.1` | none; owner decisions visible | Terra, high |
| 1 | `1.1.1.1.1.2`, `5.1.1.1.1.2` | Wave 0 | Terra, high / Luna, low |
| 2 | `2.1.1.1.1.1`, `3.1.1.1.1.1` | contract + design system | Terra, medium / Luna, low |
| 3 | `2.1.1.1.1.2`, `3.1.1.1.1.2`, `5.1.1.1.1.3` | data contract; identity UI may be parallel with provider | Terra, high / Terra, high / Luna, low |
| 4 | `4.1.1.1.1.1`, `4.1.1.1.1.2` | persisted onboarding + provider/plan contracts | Terra, medium |
| 5 | `6.1.1.1.1.1` | all implementation leaves | Terra, high |
| 6 | `6.1.1.1.1.2` | automated suite green; manual visual review | Terra, high |

## Shared interfaces

- `OnboardingProfile`: server-owned typed state; no browser/localStorage truth.
- `IdentityInput`: `{ studioNameStatus, studioName?, logoAssetId?, brandColors, contentDirectionStatus, contentDirection?, contentDescription? }`.
- `CommercialChoice`: `{ plan: 'cloud-1'|'cloud-2'|'cloud-3'|'byok', byokWithPlan: boolean }`.
- `ProviderConnection`: provider-neutral metadata + masked secret; plaintext exists only during server request.
- `LaneArtifact`: `{ laneId, role, status, inputRefs, output, approvedAt, handoffEventId }`.
- Six agent files stay named exactly: `role`, `soul`, `jobdescription`, `skills`, `memory`, `user_content`.
- Stable errors: validation, unauthorized, provider unavailable, upload rejected, plan unavailable, handoff blocked. UI renders errors; server logs redacted context only.

## Non-goals

- No public route family changes beyond existing onboarding/auth compatibility decisions.
- No generated media, social publishing, or production execution in this onboarding slice.
- No provider secret display, export, browser storage, or client-side policy decisions.
- No new dependency unless owner approves after stdlib/native/existing dependency check.

## Completion definition

Root is complete only when every level-6 leaf is verified, all owner decisions are resolved or visibly handed off, child ledgers are reverified, the full flow passes, and the implementation agent can start from this packet without rediscovering scope.
