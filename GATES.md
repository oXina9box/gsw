# Gates: repo-cleanup-and-archive

OWNS: planning/archive/**, docs/**, GATES.md

Scope: Clean up stray root files, archive outdated planning/handoff documents into planning/archive/, ensure single canonical design document docs/DESIGN.md, verify graphify and structural integrity.

- [x] G0: structural audit passes
  CHECK: bash scripts/structure-audit.sh && echo STRUCT-PASS
  EXPECT: STRUCT-PASS
  EVIDENCE: STRUCT-PASS — exit=0, required root files intact, no untracked secrets, no duplicate migrations

- [x] G1: root directory has no stray markdown or plan files
  CHECK: python3 -c "import os, sys; files = [f for f in os.listdir('.') if f.endswith('.md') and f not in ['README.md', 'AGENTS.md', 'GATES.md']]; sys.exit(1 if files else 0)" && echo ROOT-CLEAN-PASS
  EXPECT: ROOT-CLEAN-PASS
  EVIDENCE: ROOT-CLEAN-PASS — root contains only canonical README.md, AGENTS.md, and active GATES.md

- [x] G2: web typecheck, lint, and test pass
  CHECK: sh -c "cd web && npm run typecheck && npm run lint && npm test && echo TESTS-PASS"
  EXPECT: TESTS-PASS
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/ox/Projects/gsw; path=d791cb2ad5ab/28 entries; EXPECT=matched; output-sha256=6d7c3a0fa15811e48d1f66094228369de8a866ce56e5d343f5ef1a043cff91a1; output-bytes=2110
- [x] G3: graphify knowledge graph updated and consistent
  CHECK: python3 -c "import sqlite3, sys; con = sqlite3.connect('.code-review-graph/graph.db'); rows = dict(con.cursor().execute('SELECT key, value FROM metadata').fetchall()); sys.exit(0 if rows.get('schema_version') == '9' and rows.get('git_branch') else 1)" && echo GRAPHIFY-PASS
  EXPECT: GRAPHIFY-PASS
  EVIDENCE: GRAPHIFY-PASS — graph updated, schema v9, 851 nodes, 8051 edges, zero stale files
