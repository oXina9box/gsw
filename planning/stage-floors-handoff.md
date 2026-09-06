# Stage Floors handoff

Updated: 2026-09-05. Branch: `dev-stage-floors`. Base: `7acc5606c6f7`.
Owner requested a quota-conscious stop and handoff. Implementation is present in the working tree, uncommitted. Do not restart the feature or replace existing edits.

## Implemented

- Shared Stage M, Stage S and Production workbench on six existing department/production routes, with existing theme tokens.
- Workflow creation/rename, saved handoff connections/disconnection, searchable workspace hired-agent pool, lane/agent inspector, graph selection/zoom, URL workflow selection and responsive layout.
- Server-scoped start, complete, fail, manual advance and cancel controls; visible run history/output; loading, empty, error and pending states.
- Explicit workspace and channel/production ownership checks; safe agent summaries; privileged execution calls only after authorization; rate limiting.
- Workflow JSON compare-and-swap lock across lifecycle and graph edits; duplicate-start and concurrent-completion protection; legacy graph actions reject designated Stage Floors.
- Product spec, coverage mapping and implementation plan updated. No new routes, dependencies or migrations.

## Evidence already obtained

- Earlier full Vitest run: 186 tests passed before the final legacy/boundary tests and final engine workspace-filter edits.
- Latest focused server/lock run: 41 tests passed; the four new server modules had 100% line/function coverage and 89.01% branch coverage. Command below.
- Legacy action plus lock tests: 11 passed in an earlier focused run.
- Four Playwright fixture checks passed, including workflow interactions, mobile keyboard/reduced-motion behavior and desktop capture. These exercise actual UI/CSS with simulated action transport, not a live database.
- Earlier direct typecheck, lint and production build passed. Final source changed afterward; repeat once for the exact final tree.
- Latest `git diff --check` passed. `npm audit --omit=dev` reported zero vulnerabilities; full dependency audit remains outstanding before commit.
- Independent review closed with no remaining High findings. Review evidence: `.unlazy/stage-floors/review.md` (local ignored ledger).

## Remaining work, in order

1. **Final verification — coding/test agent.** Run direct commands below, preserve output, fix only failures introduced by this change. The last automated Unlazy wrapper reported empty captured output for every command; test/lint processes exited 0 but could not match their expectations, while its build process exited 1 without diagnostics. Do not claim this wrapper run passed. Diagnose the build with a direct run first; an earlier direct build passed.
2. **Authenticated integration acceptance — backend/E2E agent.** Use an authorized test workspace. Verify real persistence after reload, exact floor isolation, hired agents across departments, start/complete/fail/cancel/manual handoffs, cross-workspace rejection and simultaneous operations. No live database acceptance has been run. Do not create schema or alter provider/payment policy without approval.
3. **Lock operational review — backend agent.** Confirm the existing JSONB compare-and-swap behavior against PostgreSQL. Interrupted processes can leave a persistent lock. Follow the scoped recovery procedure in `planning/stage-floors-plan.md`; never automatically expire or bulk-clear locks. This is not a multi-statement database transaction.
4. **Close local execution ledgers — integration agent.** Update `.unlazy/stage-floors/PLAN.md`, gates and dispatch with actual final evidence. Wrapper approvals exist outside the repo at `/tmp/gsw-stage-approvals`. Fix output capture or record a clear verification handoff; do not mark unmatched checks met. Reviewer has returned, but review dispatch bookkeeping still needs closure. Release only this scope's leases.
5. **Commit and integrate — integration agent.** Inspect complete tracked and untracked task diff; run full `npm audit` and applicable source security checks. Commit the task files, reconcile with `dev`, and follow repository GitLab completion policy only once verification is green. No staging/production promotion. Mark the planning TODO done in the completion commit.

## Commands

From `web/`:

```sh
npm test
npm run typecheck
npm run lint
npm run build
npm run test:coverage
npm audit
npm run test:e2e -- --config tests/stage-floor.playwright.config.ts
./node_modules/.bin/vitest run tests/unit/stage-floor-server.test.ts tests/unit/workflow-lock.test.ts --coverage --coverage.include='lib/studio/stage-floor.ts' --coverage.include='lib/studio/stage-floor-data.ts' --coverage.include='app/(product)/stage-floor-actions.ts' --coverage.include='lib/orchestration/workflow-lock.ts'
```

Browser fixture requires loopback binding; request normal sandbox escalation if denied. Screenshots currently exist at `web/test-results/stage-floor-desktop.png` and `web/test-results/stage-floor-mobile.png` and may be replaced by the next browser run.

## Files and boundaries

- Shared UI: `web/components/product/stage-floor*`.
- Server: `web/app/(product)/stage-floor-actions.ts`, `web/lib/studio/stage-floor*`.
- Lifecycle: `web/lib/orchestration/engine.ts`, `workflow-lock.ts`; legacy guards in `web/app/(product)/actions.ts`.
- Tests: `web/tests/unit/stage-floor*`, `workflow-lock.test.ts`, `web/tests/e2e/stage-floor.spec.ts`, `web/tests/fixtures/stage-floor*`, `web/tests/stage-floor.playwright.config.ts`.
- Scope/behavior: `planning/stage-floors-plan.md`, `site-workflow-spec.md`, `spec-contract-coverage.md`, `TODO.md`.
- Design memory: `.tastemaker/decisions.log`, `style-lock.md`, `reference-board.md`; new composition remains pending review. Personal profile unchanged. Existing code was the owner-confirmed mockup baseline; no external mockup or generated illustration claim.
- Preserve unrelated untracked `.aionrs/`, `.claude/`, `.codex/`, `.omp/`, `.opencode/`. Never stage these wholesale. Do not overwrite other agents' edits or include generated build/test output in the commit.
