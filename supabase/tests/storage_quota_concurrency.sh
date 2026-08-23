#!/usr/bin/env sh
set -eu

workspace_id="$(psql -U postgres -Atc "select workspaces.id from public.workspaces join auth.users on users.id = workspaces.owner_id where users.email = 'owner@example.test'")"
quota=107374182400
headroom=52428800
upload_size=41943040
expected=$((quota - headroom + upload_size))

psql -U postgres -q -v ON_ERROR_STOP=1 -c "insert into public.workspace_storage_usage(workspace_id, bytes_used) values ('$workspace_id', $((quota - headroom))) on conflict (workspace_id) do update set bytes_used = excluded.bytes_used"

set +e
psql -U postgres -q -v ON_ERROR_STOP=1 -c "begin; insert into storage.objects(bucket_id, name, metadata) values ('creative-assets', 'workspace/$workspace_id/quota-a.mp4', '{\"size\":$upload_size}'); select pg_sleep(1); commit" >/tmp/quota-a.log 2>&1 &
first_pid=$!
sleep 0.1
psql -U postgres -q -v ON_ERROR_STOP=1 -c "insert into storage.objects(bucket_id, name, metadata) values ('creative-assets', 'workspace/$workspace_id/quota-b.mp4', '{\"size\":$upload_size}')" >/tmp/quota-b.log 2>&1 &
second_pid=$!
wait "$first_pid"; first_status=$?
wait "$second_pid"; second_status=$?
set -e

if [ $((first_status + second_status)) -eq 0 ] || { [ "$first_status" -ne 0 ] && [ "$second_status" -ne 0 ]; }; then
  cat /tmp/quota-a.log /tmp/quota-b.log
  echo "expected exactly one concurrent upload to succeed" >&2
  exit 1
fi

actual="$(psql -U postgres -Atc "select bytes_used from public.workspace_storage_usage where workspace_id = '$workspace_id'")"
objects="$(psql -U postgres -Atc "select count(*) from storage.objects where name like 'workspace/$workspace_id/quota-%.mp4'")"
[ "$actual" = "$expected" ] && [ "$objects" = "1" ] || {
  echo "quota accounting mismatch: bytes=$actual objects=$objects" >&2
  exit 1
}

echo "concurrent storage quota passed"
