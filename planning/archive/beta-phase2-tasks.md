# Beta Phase 2 — Lane Theory Core Tasks

**Status:** Execution plan 2026-08-23
**Source:** `planning/lane-theory-spec.md` §3.1 and `planning/beta-execution-plan.md` Phase 2
**Goal:** Make orchestration a supported, persisted workflow builder with forward doc-chain and round-table lane execution.

## Constraints

- Production branch only.
- No new dependencies.
- Workspace authorization and RLS remain server-side.
- Existing workflows remain readable; migration is additive.
- Document handoffs carry complete accumulated document sets.
- Round-table pass order is explicit, validated, bounded, and persisted per lane.
- Unsupported condition operators reject before persistence.

## Task 1: Persist workflow versions and lane collaboration modes

- [x] Add additive migration columns for workflow version/template metadata and lane mode/pass order.
- [x] Add database checks for valid modes and non-empty bounded pass orders.
- [x] Add typed domain validators and unit tests.
- [x] Add server actions for workflow template creation and lane collaboration settings.
- [x] Keep existing workflows usable with forward mode defaults.

## Task 2: Implement doc-chain payload semantics

- [x] Add pure helper that normalizes an execution document set.
- [x] Forward every prior document plus current output; never replace upstream documents.
- [x] Persist document-set metadata in execution context and step payloads.
- [x] Add unit tests for empty, append, overwrite-by-document-id, and malformed payloads.
- [x] Make engine use the helper on rule execution and step completion.

## Task 3: Implement round-table pass execution

- [x] Add pure pass-order/cycle decision helper.
- [x] Execute configured round-table agents in order and repeat cycles in execution context.
- [x] Record pass and cycle in execution context/events.
- [x] Stop on failed step, missing target, unmet condition, or approval gate.
- [x] Add unit tests for order, cycle completion, invalid order, and stop conditions.

## Task 4: Promote supported orchestration and templates

- [x] Remove feature-flag dead end from `/app/orchestration`.
- [x] Update navigation and route contracts to supported authenticated Studio route.
- [x] Add idempotent default workflow template creation without duplicating existing templates.
- [x] Add lane mode/pass-order controls in supported Builder surface.
- [x] Add template picker at production creation backed by persisted workflow templates.

## Task 5: Verification

- [x] Run focused Phase 2 unit tests RED then GREEN.
- [x] Run typecheck, lint, full unit suite, build, migration tests, and security gate.
- [x] Smoke supported orchestration route protection and direct load.
- [x] Record local verification evidence in `planning/beta-execution-plan.md`.
