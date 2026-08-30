# Production Node Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Adapt the recovered production-node workbench to today's `dev` orchestration page with protected-agent safety and stable inspector interactions.

**Architecture:** Keep orchestration data fetching and workspace scoping on the server page; pass only a sanitized view model to small client components. Preserve the existing workflow CRUD and execution live view below the new visual workbench.

**Tech Stack:** Next.js App Router, React 19, strict TypeScript, existing CSS tokens, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-30-production-node-workbench-design.md`

## Global Constraints

- No new dependencies, migrations, routes, or provider policy changes.
- Protected catalog agent files never reach browser props.
- Mutations must remain workspace-scoped through existing server actions.
- TDD: write focused failing tests before implementation and run the affected suite after each change.
- Preserve the current `AGENTS.md` edit on the original worktree.

### Task 1: Define pure view-model safeguards

**Files:**
- Create: `web/lib/orchestration/visual-flow.ts`
- Modify: `web/lib/studio/agent-protection.ts`
- Test: `web/tests/unit/visual-flow.test.ts`

- [ ] Write failing tests for deterministic flow order, protected-file omission/sealing, and source/target handoff direction helper behavior.
- [ ] Run the focused Vitest file and observe RED.
- [ ] Implement pure helpers with immutable outputs and bounded input handling.
- [ ] Run the focused Vitest file and observe GREEN.

### Task 2: Restore the client workbench components

**Files:**
- Create: `web/components/product/production-node-workbench.tsx`
- Create: `web/components/product/production-node-canvas.tsx`
- Create: `web/components/product/agent-node-inspector.tsx`
- Create: `web/components/product/handoff-context-rail.tsx`

- [ ] Restore the visual flow and grouped lane layout using current CSS tokens.
- [ ] Key inspector forms by agent ID, pass real status, seal protected files, and include `return_to` in every mutation form.
- [ ] Filter handoffs by IDs and label inbound/outbound from `source_id`.
- [ ] Keep keyboard selection and ARIA states intact.

### Task 3: Integrate with the current orchestration page

**Files:**
- Modify: `web/app/(product)/app/orchestration/page.tsx`
- Modify: `web/app/globals.css`

- [ ] Extend server queries with only the fields needed by the workbench, including `protected_config`.
- [ ] Sanitize agent files before passing client props and derive workflow-scoped statuses/documents.
- [ ] Render the workbench above existing workflow CRUD and execution UI.
- [ ] Add the recovered workbench styles without changing unrelated surfaces.

### Task 4: Add structural verification and run gates

**Files:**
- Create: `scripts/verify-production-node-system.mjs`

- [ ] Add the structural checks for composition, canvas accessibility, six-file labels, and handoff payloads.
- [ ] Run unit tests, structural checks, typecheck, lint, build, and security checks.
- [ ] Review the final diff for accidental prompt leakage, route changes, or unrelated edits.
