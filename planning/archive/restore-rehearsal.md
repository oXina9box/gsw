# Restore Rehearsal — RTO/RPO

**Status:** `BLOCKED — owner infra task` (Gate C V14)

## Scope
Rehearsal requested by `planning/day-zero-release-checklist.md:Gate C` — isolated restore, not yet run.

## Procedure (to be executed in Step 5)
1. Snapshot prod Supabase project (DB + `creative-assets` Storage) to isolated rehearsal project (`supabase db dump/restore` or dashboard snapshot).
2. Verify RLS: cross-workspace reads still denied; signed URLs (`createSignedUrls(..., 300)`) remain required.
3. Verify `job_queue` + `production_artifacts` state, `production_events` audit trail round-trip.
4. Measure timestamps: snapshot start → restore complete = **RTO**; last WAL backup → restore point = **RPO**.
5. Record results below and obtain auditor signature.

## Evidence template
| Run | Snapshot at | Restore done | RTO | Last backup | RPO | RLS pass | Assets pass | Notes |
|-----|-------------|--------------|-----|-------------|-----|----------|-------------|-------|
| 1 | | | | | | | | |

## Acceptance
- Gate C rows `Isolated restore rehearsal` + `Measured RTO/RPO approved` move to `PASS` only after one fully-filled row + signature in this file.
- Until then they remain `DEFERRED — Requires production Supabase separation / DNS/TLS / PITR` and V14 stays blocked.

## Blocker
Requires isolated production Supabase project + PITR enabled (Step 5 owner infra). Track in checklist Final Decision.
