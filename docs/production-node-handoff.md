# Production node workbench — continuation list

Branch: `dev-production-node`
Worktree: `/tmp/gsw-dev-production-node`
Base: current `dev` (`6e2b5e1`)

## Already completed

- Recovered the workbench family from stash commit `a014f4b` and adapted it to the current orchestration page.
- Added visual flow ordering and handoff-direction helpers.
- Added protected-agent file filtering; protected prompt rows do not cross into client props.
- Added ordered/grouped node canvas, agent inspector, and handoff context rail.
- Added workflow-scoped node status derivation.
- Added `return_to=/app/orchestration` to inspector mutation forms.
- Keyed inspector forms by agent/lane identity to prevent stale uncontrolled values after selection changes.
- Added unit coverage in `web/tests/unit/visual-flow.test.ts` and structural verification in `scripts/verify-production-node-system.mjs`.
- Existing workbench CSS was already present in `web/app/globals.css` on `dev` and did not need duplication.

## Verification already green

- `cd web && npm test` — 29 files, 160 tests passed.
- `cd web && npm run typecheck` — passed.
- `cd web && npm run lint` — passed.
- `node scripts/verify-production-node-system.mjs` — passed.
- `bash scripts/structure-audit.sh` — passed.
- `bash scripts/security-gate.sh` — passed with zero in-scope high findings.
- `cd web && npm run build` — passed.

## Remaining pickup tasks

- [ ] Review the complete diff for product polish and accessibility in a browser at `/app/orchestration` (ordered/grouped modes, empty state, protected agent, mobile layout, keyboard selection).
- [ ] Confirm Supabase runtime data matches the selected columns, especially `execution_steps.source_*` and `agents.protected_config`.
- [ ] Consider adding an integration/E2E test for selecting a protected node and switching between two agents before saving.
- [ ] Decide whether lane-level handoffs should filter into an agent's context rail (current rail filters exact agent IDs).
- [ ] Decide whether this checkpoint should be merged into `dev` and pushed according to the branch policy.

## Important safety notes

- Do not replace `filterAgentFilesForClient` with a raw `agent_files` pass to a client component.
- Do not remove `return_to` hidden fields from inspector forms.
- Preserve the unrelated user edit to `AGENTS.md` on the original `/home/ox/Projects/gsw` worktree.
