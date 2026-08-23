#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
runtime="${CONTAINER_RUNTIME:-podman}"
image="${POSTGRES_TEST_IMAGE:-docker.io/library/postgres:16-alpine}"

"$runtime" run --rm --user postgres \
  -v "$PWD:/repo:ro" \
  "$image" sh -c '
    set -eu
    initdb -D /tmp/pgdata -U postgres -A trust >/dev/null
    pg_ctl -D /tmp/pgdata -o "-c listen_addresses=" -w start >/dev/null
    trap "pg_ctl -D /tmp/pgdata -m fast stop >/dev/null" EXIT
    psql -U postgres -v ON_ERROR_STOP=1 -q -f /repo/supabase/tests/bootstrap.sql
    for migration in /repo/supabase/migrations/*.sql; do
      echo "checking $(basename "$migration")"
      psql -U postgres -v ON_ERROR_STOP=1 -q -f "$migration"
    done
    psql -U postgres -v ON_ERROR_STOP=1 -q -f /repo/supabase/tests/studio_invariants.sql
    sh /repo/supabase/tests/storage_quota_concurrency.sh
    echo "migration invariants passed"
  '
