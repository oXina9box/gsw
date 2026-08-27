---
name: "agent-feature-drop-review"
description: "Review an agent-produced feature drop (large multi-file diff) before commit: gates, spec-contract violations, misleading UI, overclaimed annotations."
---

Review an agent-produced feature drop end to end before commit or sign-off. Goal: catch contract violations, misleading UI, and overclaims the producing agent left behind.

## Procedure

1. Inventory the drop: list changed files (`git status`, `git diff --stat`) plus any new untracked directories at repo root. Completion: you have a file list covering every change, including files the agent did not mention.
2. Read the full diff file by file — pages, components, lib, actions, tests, scripts. Do not sample. Completion: every hunk read, with notes per file.
3. For each destructive action (delete/archive/purge), compare the button label and confirmation copy against what the action actually mutates, then check the repo's spec/contract docs for where that behavior is allowed to live. Completion: each destructive action verified as label-accurate and spec-located.
4. Flag content claims made on the product's behalf (rights/clearance badges, legal statements, public-facing copy) as owner-decision items unless evidence exists in the repo. Completion: every such claim listed with a recommendation.
5. Cross-check the agent's TODO/spec annotations ("done", "resolved") against the code actually present; downgrade partial work to partial in your verdict. Completion: no annotation accepted on trust.
6. Run the project's full gate suite (typecheck, lint, test, build) and record pass/fail counts. Completion: all gates green or failures reported.
7. Reconcile the commit with the reviewed file list: run `git status --short` immediately before committing and compare every file that would be staged (including untracked ones swept in by broad adds like `git add -A`) against your notes; read any file you did not explicitly review before including it. Completion: every committed file appears in your reviewed list or gets reviewed on the spot.
8. Deliver a verdict split into: solid items, blockers needing owner ruling (destructive behavior, legal claims), honesty corrections to annotations, housekeeping (untracked agent harness dirs to gitignore). Do not commit until blockers get explicit rulings when repo law requires ask-first.
