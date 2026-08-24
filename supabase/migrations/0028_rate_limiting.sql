-- DB-backed rate limiting (CRITICAL-FIXES Fix 18)
create table if not exists public.rate_limit_log (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_log_key_time_idx on public.rate_limit_log(key, created_at desc);

create or replace function public.check_rate_limit(
  rate_key text,
  rate_limit integer,
  window_start timestamptz
)
returns jsonb
language plpgsql
as $$
declare
  request_count integer;
begin
  select count(*) into request_count
  from public.rate_limit_log
  where key = rate_key and created_at >= window_start;

  if request_count >= rate_limit then
    return jsonb_build_object('allowed', false, 'remaining', 0);
  end if;

  insert into public.rate_limit_log (key) values (rate_key);

  return jsonb_build_object('allowed', true, 'remaining', rate_limit - request_count - 1);
end;
$$;

-- Cleanup old logs
create or replace function public.cleanup_rate_limit_logs()
returns void
language sql
as $$
  delete from public.rate_limit_log where created_at < now() - interval '1 hour';
$$;

-- Lock down: only service_role / authenticated via RPC; no direct table access
revoke all on public.rate_limit_log from anon, authenticated;
