# Pazz Assignment — Gem Studio LLM-Wiki (Obsidian)

**Status:** Plan ready — awaiting trigger (ox fires it).
**Owner:** Pazz (Hermes + ox-alpha — free tier, unconstrained).
**Coordinator:** Puff.

---

## 1. Objective

Build a **fresh LLM-first wiki** in Obsidian that mirrors Gem Studio's knowledge — product definition, workflow law, architecture, operations — as atomic, densely-linked notes usable by both humans and AI agents for fast retrieval.

The repo stays the **single source of truth**. The wiki is a **derived view**: it summarizes, links, and navigates; it never becomes a second place where policy lives.

## 2. Trigger

Start when **one** of these fires:

- **Primary:** Codex's lane-theory implementation is merged to `dev` and passes Puff's review (spec §9 gap table + Phase B alignment), and `MASTER-TODO.md` reflects post-merge state. Docs generated from completed reality, not intent.
- **Early (ox override):** ox calls the checkpoint early to get the scaffold seeded from the two anchor docs (`lane-theory-spec.md` + `MASTER-TODO.md`) alone.

## 3. Target setup

- **Vault:** `~/Documents/Obsidian/Gem Studio Wiki/` — brand new vault (machine currently has only an empty Archive Vault).
- **Anchor sources (pinned to commit):**
  - `planning/site-workflow-spec.md` — product definition
  - `planning/lane-theory-spec.md` — workflow law
  - `planning/MASTER-TODO.md` — current state + remaining work
  - `planning/spec-contract-coverage.md`, `commercial-service-architecture.md`, `service-level-requirements.md`, `day-zero-public-hosting-security.md`
  - `AGENTS.md`, `docs/ARCHITECTURE.md`, `.ai/project-map.md`, `.ai/current-state.md`

## 4. Structure (v1 — Pazz refines in Phase 1)

```text
Gem Studio Wiki/
├── 00 Home.md                  # Root MOC (map of content)
├── 10 Product/                 # Four modules, routes, page contracts, flows
├── 20 Workflow Law/            # Lanes, desks, round-table, casting gate,
│                               #   DNA sheets, onboarding spine, social cycle
├── 30 Architecture/            # Capability resolver, seams, data model,
│                               #   migrations, BYOK secrets, orchestration engine
├── 40 Operations/              # SLOs, caps table, release gates, runbooks
├── 50 Status/                  # Point-in-time snapshots of MASTER-TODO phases
└── 90 Meta/                    # Conventions, sync log, stale-note registry
```

**Note rules (LLM-wiki format):**
- One concept per note; atomic and self-contained.
- Every note has frontmatter: `title`, `source` (repo path @ commit), `updated`, `tags`, `status`.
- Hub-and-spoke: MOCs link out; notes link laterally; orphans are defects.
- Summarize + link to the repo file — never copy normative text wholesale (drift risk).
- No invented policy. If the repo doesn't say it, the wiki doesn't say it.

## 5. Pazz work plan

| Phase | Work | Output |
|---|---|---|
| 1. Inventory & taxonomy | Read all anchor sources at pinned commit; propose final note map + naming/tag conventions | Note-map proposal → ox/Puff approval |
| 2. Skeleton | Create vault, folders, frontmatter template, Home MOC | Empty structured vault |
| 3. Seed pass | Notes from the two anchor docs (workflow law + status) first — they're freshest | ~15–25 core notes |
| 4. Deep pass | Product routes, architecture seams, ops/SLO notes | Full v1 wiki |
| 5. Verification | Source-link audit, orphan/backlink report, spot-check summaries against specs | Sign-off report |

## 6. Handoff contract (task-handoff format)

```text
OBJECTIVE       LLM-wiki v1 per sections 3–5.
CONTEXT         Repo = truth; wiki = derived view. Trigger = section 2.
RELEVANT FILES  Anchor sources in section 3; skills: hermes-architect,
                obsidian (CLI), task-handoff.
CONSTRAINTS     Fresh vault only; no edits to repo planning docs;
                no invented product policy; pin every note to a commit.
ACCEPTANCE      Every note: valid frontmatter, resolvable source link,
                ≥1 inbound link. Zero orphans. Spot-checks match specs.
VERIFICATION    Backlink/orphan report; Puff spot-checks 5 random notes
                against repo at pinned commit.
RESOURCE POLICY Hermes + ox-alpha. Free. Do not escalate.
RETURN          RESULT / CHANGES / VERIFICATION / IMPORTANT / DECISIONS /
                LEARNINGS / FOLLOW-UP per task-handoff success format.
```

## 7. Maintenance protocol (after v1)

- Refresh at each named checkpoint: post-Phase-B, post-Phase-C/D infra, pre-beta.
- Diff-driven: update only notes whose source changed since last sync commit; log in `90 Meta/sync log`.
- Superseded snapshots move to vault archive folder — never deleted.
