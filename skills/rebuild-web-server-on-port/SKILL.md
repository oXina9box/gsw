---
name: "rebuild-web-server-on-port"
description: "Rebuild or restart a Next.js production/dev server on a port: kill the stale listener safely, rebuild, start in background, verify routes return 200."
---

# Rebuild Web Server on Port

Rebuild and restart a local web app (Next.js-style) on a fixed port after code changes.

## Procedure

1. Identify the current listener before killing anything: `ss -tlnp | grep :PORT` shows whether an old server holds the port and its pid.
   - Done when you know the owning pid, or confirmed the port is already free.
2. Kill by pid derived from the port — `PID=$(ss -tlnp ... | grep -oP 'pid=\K[0-9]+' | head -1); kill "$PID"` — never `pkill -f "<start command>"`.
   - Hard guardrail: `pkill -f` matches any process whose command line contains the pattern, including the shell running the compound command itself; that kills the exec session mid-run (observed as SIGTERM abort). Match by pid or port, not by pattern text that appears in your own command string.
   - Done when `ss -tln | grep :PORT` returns nothing ("port free").
3. Rebuild with the project's build script (`npm run build`), tailing output for the success summary.
   - Done when the build exits 0.
4. Start detached so the exec call returns: `(nohup <start cmd> > /tmp/<app>-<port>.log 2>&1 &)` followed by a short sleep.
   - Done when the log shows the ready line.
5. When the trigger is "changes aren't showing," verify the served bundle, not just the status code: extract the asset URL from the rendered page (`curl -s http://localhost:PORT | grep -o '/_next/static/[^"]*\.css' | head -1`), fetch it, and grep it for the new selectors/keyframes; grep the HTML for new markup too.
   - Done when each reported change is either confirmed present in the served output, or located in source but absent from the build (then rebuild from the right commit).
6. Before rebuilding again on a stale-report claim, recheck git state — `git status --short && git log --oneline -3`. Working-tree edits seen earlier may have been committed (or reverted) by another session between checks, so diff output can silently become empty.
   - Done when you know which commit HEAD serves and can tell the user which changes are live, where they render, and what interaction triggers them (e.g., one-shot load reveals vs. click-only transitions).
7. Verify with curl status checks on the base URL and one or two key routes (`curl -s -o /dev/null -w "%{http_code}"`).
   - Done when expected routes answer 200; report which routes were checked.

## Notes

- If env points at a remote backend, flag that to the user when serving locally so they know which data the running site touches.
