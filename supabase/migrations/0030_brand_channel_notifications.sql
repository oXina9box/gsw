-- Milestone 2: implicit Studio Brand Channel + workspace notifications.
alter table public.channels add column if not exists is_brand boolean not null default false;
create unique index if not exists channels_one_brand_per_workspace_idx on public.channels (workspace_id) where is_brand;
create table if not exists public.notifications (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, kind text not null default 'info', body text not null, href text, read_at timestamptz, created_at timestamptz not null default now());
alter table public.notifications enable row level security;
create policy "members read notifications" on public.notifications for select to authenticated using (public.is_workspace_member(workspace_id));
create index if not exists notifications_workspace_unread_idx on public.notifications (workspace_id, created_at desc);
revoke insert, update, delete, truncate on public.notifications from anon, authenticated;

-- 3. New workspaces get the brand channel at creation.
create or replace function public.seed_studio_workspace()
returns trigger language plpgsql security definer set search_path = public as $$
declare department_name text;
declare department_order integer := 0;
begin
  foreach department_name in array array['Research','Marketing','Creative','Story','Storyboard','Script','Screenplay','AI Conversion','Video Production','Launch','Social Posting','Social Management','Reporting']
  loop
    insert into public.departments (workspace_id, name, display_order)
    values (new.id, department_name, department_order)
    on conflict (workspace_id, name) do nothing;
    department_order := department_order + 1;
  end loop;
  insert into public.channels (workspace_id, name, status, is_brand)
  values (new.id, 'Studio Brand Channel', 'active', true)
  on conflict (workspace_id) where is_brand do nothing;
  insert into public.credit_accounts (workspace_id, available) values (new.id, 100)
  on conflict (workspace_id) do nothing;
  insert into public.credit_ledger (workspace_id, amount, entry_type, idempotency_key, metadata)
  values (new.id, 100, 'grant', 'beta-starter', '{"reason":"beta_starter"}'::jsonb)
  on conflict (workspace_id, idempotency_key) do nothing;
  return new;
end;
$$;

-- 4. Backfill brand channel for existing workspaces.
do $$
declare workspace_record record;
begin
  for workspace_record in select id from public.workspaces loop
    insert into public.channels (workspace_id, name, status, is_brand)
    values (workspace_record.id, 'Studio Brand Channel', 'active', true)
    on conflict (workspace_id) where is_brand do nothing;
  end loop;
end $$;

-- 5. Mark workspace notifications read (RPC-only mutation).
create or replace function public.mark_notifications_read(target_workspace uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare updated_count integer;
begin
  if not public.is_workspace_member(target_workspace) then raise exception 'not_authorized'; end if;
  update public.notifications set read_at = now()
  where workspace_id = target_workspace and read_at is null;
  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

-- 6. Channel staffing: which agents work on a channel.
create table if not exists public.channel_staff (
  channel_id uuid not null references public.channels(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (channel_id, agent_id)
);

alter table public.channel_staff enable row level security;
create policy "members read channel staff" on public.channel_staff for select to authenticated using (public.is_workspace_member(workspace_id));
create index if not exists channel_staff_workspace_idx on public.channel_staff(workspace_id);
create index if not exists channel_staff_channel_idx on public.channel_staff(channel_id);

create or replace function public.set_channel_staff(target_workspace uuid, target_channel uuid, target_agent uuid, assign boolean)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_workspace_member(target_workspace) then raise exception 'not_authorized'; end if;
  if not exists (select 1 from public.channels where id = target_channel and workspace_id = target_workspace) then raise exception 'invalid_channel'; end if;
  if not exists (select 1 from public.agents where id = target_agent and workspace_id = target_workspace) then raise exception 'invalid_agent'; end if;
  if assign then
    insert into public.channel_staff (channel_id, agent_id, workspace_id) values (target_channel, target_agent, target_workspace)
    on conflict (channel_id, agent_id) do nothing;
  else
    delete from public.channel_staff where channel_id = target_channel and agent_id = target_agent;
  end if;
  return true;
end;
$$;

revoke insert, update, delete, truncate on public.channel_staff from anon, authenticated;

-- 7. Channel marketing budget guidelines (mirrors production_budget_guidelines).
create table if not exists public.channel_marketing_budgets (
  channel_id uuid primary key references public.channels(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  guideline_credits bigint check (guideline_credits is null or guideline_credits >= 0),
  notes text not null default '', updated_at timestamptz not null default now()
);

alter table public.channel_marketing_budgets enable row level security;
create policy "members manage channel marketing budgets" on public.channel_marketing_budgets for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
grant select, insert, update, delete on public.channel_marketing_budgets to authenticated;
