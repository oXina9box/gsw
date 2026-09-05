# Pazz Assignment — Gem Studio LLM-Wiki (Obsidian)

**Status:** Plan ready — awaiting trigger (ox fires it).
**Owner:** Pazz (Hermes + ox-alpha — free tier, unconstrained).
**Coordinator:** Puff.

---

## 1. Objective

Build a fresh LLM-first wiki in Obsidian documenting **the actual Gem Studio system** — derived from the codebase alone. The wiki answers "how does this actually work?" for humans and AI agents without re-reading the repo.

**The code is the only source of truth.** Planning/working docs are not inputs to this wiki. Notes describe what the code does, not what anything intends to do.

## 2. Trigger

ox fires it. Suggested checkpoint: after the current lane-theory implementation lands on `dev` and passes review — so v1 documents the finished state, not a moving target.

## 3. Target setup

- **Vault:** `~/Documents/Obsidian/Gem Studio Wiki/` — brand new vault (machine has only an empty Archive Vault).
- **Sources (pinned to commit):**
  - `web/lib/studio/` — capability/policy resolution, secrets, caps, worker, domain constants
  - `web/lib/orchestration/` — workflow engine, handoff rules, executions
  - `web/app/` — route tree, server actions, API endpoints
  - `web/components/`, `web/lib/auth/`, `web/lib/billing/`
  - `supabase/migrations/` — schema, RLS, RPCs
  - `scripts/` — quality/security gates

## 4. Structure (v1 — Pazz refines in Phase 1)

```text
Gem Studio Wiki/
├── 00 Home.md                  # Root MOC (map of content)
├── 10 System Map/              # Modules, route inventory, request lifecycle
├── 20 Domain/                  # Workspaces, channels, productions, lanes,
│                               #   casting, Universe/DNA, assets, socials,
│                               #   credits/BYOK — behavior as coded
├── 30 Engine/                  # Orchestration engine, job_queue lifecycle,
│                               #   worker, pass orders, merge semantics
├── 40 Data/                    # Schema map, RLS enforcement points,
│                               #   migration timeline, storage policies
├── 50 Ops & Security/          # Caps, rate limits, encryption path,
│                               #   auth flow, audit events, kill switches
└── 90 Meta/                    # Conventions, sync log, stale-note registry
```

**Note rules (LLM-wiki format):**
- One concept per note; atomic and self-contained.
- Every note has frontmatter: `title`, `source` (repo paths @ commit), `updated`, `tags`, `status`.
- Hub-and-spoke: MOCs link out; notes link laterally; orphans are defects.
- Describe behavior with evidence — name the function/file where the behavior lives.
- No invention. If the code doesn't do it, the wiki doesn't say it.

## 5. Pazz work plan

| Phase | Work | Output |
|---|---|---|
| 1. Repo survey | Walk the codebase at pinned commit; propose final note map + naming/tag conventions | Note-map proposal → ox/Puff approval |
| 2. Skeleton | Create vault, folders, frontmatter template, Home MOC | Empty structured vault |
| 3. Core pass | Domain notes first (workspaces → productions → lanes → engine), each backed by named code | ~20–30 core notes |
| 4. Deep pass | Data/RLS map, ops/security, full route inventory | Full v1 wiki |
| 5. Verification | Source-link audit, orphan/backlink report, spot-check claims against code | Sign-off report |

## 6. Handoff contract (task-handoff format)

```text
OBJECTIVE       LLM-wiki v1 per sections 3–5.
CONTEXT         Code = only truth. Wiki = derived documentation of the
                codebase. No planning docs as inputs.
RELEVANT FILES  Section 3 source list; skills: hermes-architect, obsidian.
CONSTRAINTS     Fresh vault only; no edits to the repo; pin every note
                to a commit; cite functions/files as evidence.
ACCEPTANCE      Every note: valid frontmatter, resolvable source links,
                ≥1 inbound link. Zero orphans. Claims traceable to code.
VERIFICATION    Backlink/orphan report; Puff spot-checks 5 random notes
                against the pinned commit.
RESOURCE POLICY Hermes + ox-alpha. Free. Do not escalate.
RETURN          RESULT / CHANGES / VERIFICATION / IMPORTANT / DECISIONS /
                LEARNINGS / FOLLOW-UP per task-handoff success format.
```

## 7. Maintenance protocol (after v1)

- Refresh at named checkpoints (ox/Puff calls them): diff-driven — update only notes whose source code changed since last sync commit; log in `90 Meta/sync log`.
- Superseded snapshots move to vault archive folder — never deleted.
