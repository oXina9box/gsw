# Gem Studio Planning and Release Documents

Use these documents in order. The workflow is gated; do not skip directly to implementation or launch.

## 1. Product definition

Read and approve:

1. `site-workflow-spec.md` — product purpose, four-module sitemap, routes, flows, results, stack, boundaries, and success criteria.
2. `spec-contract-coverage.md` — observable navigation, data, interaction, security, and quality contracts.
3. `post-launch.md` — features intentionally deferred. Day‑0 public-hosting security is never deferred.
4. `commercial-service-architecture.md` — seams that must exist now so plans, roles, providers, support, operations, and customer scale remain additive.
5. `service-level-requirements.md` — internal availability, performance, recovery, incident, capacity, cost, and support objectives.

If product intent changes, update spec first, then contracts, plan, and tasks.

## 2. Implementation definition

6. `site-workflow-implementation-plan.md` — implementation order and phase gates.
7. `site-workflow-tasks.md` — focused TDD tasks with acceptance and verification.
8. `agent-implementation-handoff.md` — exact `@terra` / `@luna` task ownership, dependencies, shared-contract handoff, and integration order.

Each task follows:

1. Write one behavior test.
2. Run it and confirm expected failure.
3. Add minimum production code.
4. Run focused test and full affected suite.
5. Refactor only while green.
6. Update docs if discovered behavior changes contract.

## 3. Security and operations

9. `day-zero-public-hosting-security.md` — mandatory production security/operations standard.
10. `day-zero-release-checklist.md` — per-release evidence and sign-off.

Owner-only product access does not make public hosting private. All public-hosting controls apply before first public request.

## 4. Adversarial verification

11. `doubt-driven-review.md` — standing doubts and falsification checks.
12. `doubt-review-record.md` — review results, findings, classifications, and unresolved limitations.

Before any non-trivial decision stands:

- State claim and why it matters.
- Give reviewer artifact plus contract without prior reasoning.
- Ask reviewer to find failures, not validate.
- Classify each finding: contract misread, actionable, accepted trade-off, or noise.
- Stop when findings are trivial, three cycles complete, or owner overrides.

## 5. Launch workflow

1. Finish implementation task and TDD evidence.
2. Pass phase acceptance gate.
3. Run doubt review.
4. Run local and staging security tests.
5. Complete day‑0 checklist with evidence.
6. Restore backup into isolated environment.
7. Run staging rehearsal.
8. Deploy immutable production candidate.
9. Run canary and synthetic workflows.
10. Obtain required signatures.
11. Open traffic gradually.
12. Monitor and roll back on gate failure.

No “mostly ready” status exists for public launch. Unmet `MUST`, unresolved critical/high security issue, tenant leak, unavailable recovery, or unsigned checklist means no launch.
