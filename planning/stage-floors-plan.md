# Stage Floors implementation plan
Date: 2026-09-05. Base: dev at 7acc5606c6f7. Task branch: dev-stage-floors.

1. Freeze shared scope and view models. Record existing code as the owner-confirmed mockup baseline.
2. TDD scoped loader/actions using existing workflows.definition, handoff_rules and execution engine. No migration/dependency changes.
3. Build shared dense themed editor: workflow toolbar, searchable hired roster, actual graph, inspector, connection forms, and run history. Keep production generation in existing jobs controls.
4. Mount on existing department routes ahead of current tools, including per-production scope. Use Suspense for loading state.
5. Verify isolated behavior, integrated page contracts, browser interactions, security review, coverage, lint, typecheck and build. Keep claims qualified to actual evidence.

Tree depth ceiling 6; natural branches: shared workshop (server and UI leaves), page integration, verification. Exact ownership and dispatch records: .unlazy/stage-floors/PLAN.md. Backend and UI use Terra after evaluating Luna as insufficient for multi-file authorization and interactive state. No schema, route, dependency, payment/provider or deployment changes planned.

## Concurrency and lock recovery

Workflow starts, graph edits and execution lifecycle updates use an atomic compare-and-swap on the existing `workflows.definition` JSONB value. A unique `_operation_lock` token serializes cooperating server requests across processes. Start rechecks running/pending executions under that lock; completing/failing a step also uses a conditional running-state update. Legacy graph mutation forms reject tagged Stage Floors, preserving the designated editor boundary.

The lock is released in `finally`, including handled operation failures. A killed server process or failed database release can leave an orphan token. This deliberately fails closed rather than expiring while a request might still be writing. If “workflow busy” persists, an operator must first verify the owning request/process has terminated, inspect current executions and handoff steps for partial progress, then remove only `definition._operation_lock` on the affected workspace/workflow using a token-matched conditional update. Preserve all other JSON fields. Retry/reconcile the interrupted operation only after checking whether its write already succeeded. Never clear locks in bulk or merely because time elapsed. A transactional workflow RPC is the future upgrade if automated crash recovery is needed.

## Verification boundaries

The local browser fixture compiles actual production UI and CSS but substitutes its action transport and data. Server action tests exercise validation and scope against an in-memory query double; concurrency tests call the actual engine and lock helper. These checks do not claim a live authenticated database acceptance run. No remote workspace data, keys, schema, providers or deployment were changed.
