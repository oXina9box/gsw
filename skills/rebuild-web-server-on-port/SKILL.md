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
5. Verify with curl status checks on the base URL and one or two key routes (`curl -s -o /dev/null -w "%{http_code}"`).
   - Done when expected routes answer 200; report which routes were checked.

## Notes

- If env points at a remote backend, flag that to the user when serving locally so they know which data the running site touches.
