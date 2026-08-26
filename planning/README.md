# Gem Studio Planning and Release Documents

**Clean Base Index** — Updated 2026-08-24.

The workflow is gated; do not skip directly to implementation or launch.

---

## 1. Master Execution Plan

- `MASTER-TODO.md` — The single source of truth for completed baseline state and all remaining tasks across content, UI refinement, staging/production infrastructure, multi-tenant integration, and post-launch commercial stages.

---

## 2. Product and Operating Definitions

Read and approve:

1. `site-workflow-spec.md` — Product purpose, four-module sitemap, routes, flows, results, stack, boundaries, and success criteria.
2. `lane-theory-spec.md` — Studio operating model and workflow law (lanes, desks, round-table mode, casting gate, DNA data sheets, onboarding wizard).
3. `spec-contract-coverage.md` — Observable navigation, data, interaction, security, and quality contracts.
4. `commercial-service-architecture.md` — Architectural seams that must exist now so plans, roles, providers, support, operations, and customer scale remain additive.
5. `service-level-requirements.md` — Internal availability, performance, recovery, incident, capacity, cost, and support objectives.

If product intent changes, update spec first, then contracts, architecture, and `MASTER-TODO.md`.

The staged commercial roadmap (Stages 0–8) is consolidated into `MASTER-TODO.md` Phase E; full text archived at `planning/archive/post-launch.md`. Day-0 public-hosting security is never deferred.

---

## 3. Security, Operations, and Runbooks

7. `day-zero-public-hosting-security.md` — Mandatory production security/operations standard.
8. Release checklist, restore-rehearsal runbook, and Supabase auth-hook procedure: templates/archived snapshots in `planning/archive/` (`day-zero-release-checklist.md`, `restore-rehearsal.md`, `supabase-auth-hook.md`) — execute per `MASTER-TODO.md` C.4 / C.6 / D.3.

---

## 4. Adversarial Verification

9. `doubt-driven-review.md` — Standing doubts and falsification protocol.

Before any non-trivial decision stands:
- State claim and why it matters.
- Give reviewer artifact plus contract without prior reasoning.
- Ask reviewer to find failures, not validate.
- Classify each finding: contract misread, actionable, accepted trade-off, or noise.
- Stop when findings are trivial, three cycles complete, or owner overrides.

---

## 5. Launch Workflow

1. Finish implementation task and TDD evidence (`npm test`, `npm run lint`, `npm run typecheck`, `npm run build`).
2. Pass phase acceptance gate.
3. Run doubt review per `doubt-driven-review.md`.
4. Run local and staging security tests (`scripts/test-migrations.sh`, `scripts/security-gate.sh`).
5. Complete day‑0 checklist with evidence (template: `planning/archive/day-zero-release-checklist.md`).
6. Restore backup into isolated environment and measure RTO/RPO (`planning/archive/restore-rehearsal.md`).
7. Run staging rehearsal and multi-tenant integration tests.
8. Deploy immutable production candidate.
9. Run canary and synthetic workflows.
10. Obtain required signatures.
11. Open traffic gradually.
12. Monitor and roll back on gate failure.

No “mostly ready” status exists for public launch. Unmet `MUST`, unresolved critical/high security issue, tenant leak, unavailable recovery, or unsigned checklist means no launch.

---

## 6. Archive

All superseded implementation plans, task handoffs, and temporary phase completion evidence files are archived in `planning/archive/`.
