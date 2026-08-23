#!/usr/bin/env bash
# scripts/security-gate.sh - vendored red-team audit gate.
#
# Runs the in-repo scanner against the working tree in `local` threat mode,
# then fails (exit 1) if any high-or-worse finding lives in VERSIONABLE code that
# is not quarantined under `_attic/` and is not the vendored scanner under
# `scripts/vendor/`.
#
# Exclusions are intentional and principled, not arbitrary:
#   * Gitignored build artifacts (web/.next/, web/out/, *.tsbuildinfo, web/.env*)
#     are not shipped code. New, untracked source is scanned before first commit.
#   * `_attic/` is the <7-day quarantine (pre-existing sinks kept out of the gate).
#   * `scripts/vendor/` is the vendored scanner; its own regex literals would
#     self-match CODE008/CODE009 - it is ignored by its own DEFAULT_IGNORED_DIRS
#     and by this gate, so it can never gate itself.
#   * Committed real secrets would still appear here and fail the gate.
#
# Usage:
#   bash scripts/security-gate.sh          # fail on high-or-worse (default)
#   bash scripts/security-gate.sh medium   # fail on medium-or-worse
set -uo pipefail

cd "$(dirname "$0")/.."

THRESH="${1:-high}"

# 1. Run the vendored scanner (its own --fail-on is ignored; this gate decides).
python3 scripts/vendor/security_redteam_audit.py . --mode local \
  --out security-audit-report --fail-on critical

# 2. Filter the machine-readable report to in-scope (tracked, non-excluded)
#    findings at/above the threshold.
python3 - "$THRESH" <<'PY'
import json, os, subprocess, sys

thresh = sys.argv[1]
rank = {s: i for i, s in enumerate(("critical", "high", "medium", "low", "info"))}
threshold_rank = rank[thresh]

report = json.load(open("security-audit-report/report.json"))

# Versionable = tracked plus untracked, non-ignored files. This prevents new
# source from bypassing the gate before its first commit.
tracked = set(os.path.normpath(p) for p in subprocess.check_output(
    ["git", "ls-files", "--cached", "--others", "--exclude-standard"], text=True, cwd=os.getcwd()).splitlines())

in_scope = [
    f for f in report["findings"]
    if os.path.normpath(f["file"]) in tracked
    and not f["file"].startswith("_attic/")
    and not f["file"].startswith("scripts/vendor/")
    and rank[f["severity"]] <= threshold_rank
]

for f in in_scope:
    print(f"{f['severity']:<8} {f['id']:<9} {f['file']}:{f['line']}  {f['title']}")

print(
    f"gate: {len(in_scope)} findings at/above {thresh} in versionable code "
    f"(outside _attic/ and scripts/vendor/)"
)
sys.exit(1 if in_scope else 0)
PY
