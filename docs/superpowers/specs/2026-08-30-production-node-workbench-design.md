# Production Node Workbench Design

## Goal

Restore the stashed production-node orchestration workbench so it fits the current `dev` orchestration page, while preserving workspace isolation and never sending protected agent prompts to the browser.

## Architecture

The server page remains the source of truth for workflows, lanes, agents, execution steps, and handoff rules. It derives a small client view model: agent metadata and sealed file placeholders are sanitized server-side, while the existing workflow CRUD and `ExecutionLive` surfaces remain unchanged. The client workbench owns only workflow selection, ordered/grouped presentation, node selection, inspector tabs, and handoff filtering; mutations continue through existing server actions.

## Safety and correctness

- Query `protected_config` and sanitize every agent file record before crossing the server/client boundary.
- Protected agents render a sealed inspector state and never expose editable prompt fields.
- All inspector mutation forms include `return_to=/app/orchestration`.
- Inspector forms are keyed by agent ID so uncontrolled defaults cannot survive an agent switch.
- Handoff direction compares `source_id`/`target_id`, not display names.
- Node status is derived from the selected workflow's latest execution/step data.

## Verification

Pure helpers are covered with Vitest tests for flow ordering, protected-file filtering, and handoff direction. The production-node structure script checks composition and accessibility markers. The affected unit suite, typecheck, lint, build, and security gate are run before handoff.
