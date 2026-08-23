#!/usr/bin/env bash
set -uo pipefail
fail=0
drift(){ echo "DRIFT: $1"; fail=1; }

# Canonical production app.
for path in web/package.json web/app/layout.tsx web/app/globals.css web/lib/supabase/server.ts; do
  [ -e "$path" ] || drift "$path missing"
done

# Approved reference demo stays intact until owner accepts the live visual port.
for path in index.html dashboard.html assets/css/tokens.css assets/css/app.css assets/js/app.js assets/img/logo.png assets/img/gem-mark.png; do
  [ -e "$path" ] || drift "$path missing"
done

# Keep runtime secrets out of tracked files.
tracked_env=$(git ls-files 'web/.env*' | grep -v '^web/.env.example$' || true)
[ -z "$tracked_env" ] || drift "tracked runtime environment file: $tracked_env"

# Migrations must remain append-only and sortable.
duplicates=$(find supabase/migrations -maxdepth 1 -type f -name '*.sql' -printf '%f\n' | cut -d_ -f1 | sort | uniq -d)
[ -z "$duplicates" ] || drift "duplicate migration prefixes: $duplicates"

exit "$fail"
