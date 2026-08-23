alter table public.productions
  add column current_step integer not null default 0,
  add column step_count integer not null default 13,
  add constraint productions_step_bounds check (current_step >= 0 and step_count > 0 and current_step <= step_count);

create table public.production_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  production_id uuid not null references public.productions(id) on delete cascade,
  event_type text not null,
  from_step integer,
  to_step integer,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.genplay_masters (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  production_id uuid references public.productions(id) on delete set null,
  genplay_id text not null,
  version text not null,
  locked boolean not null default false,
  document jsonb not null,
  source_checksum text,
  created_at timestamptz not null default now(),
  unique (workspace_id, genplay_id, version)
);

create table public.genplay_binders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  master_id uuid not null references public.genplay_masters(id) on delete cascade,
  version text not null,
  binder jsonb,
  storage_path text,
  validation_errors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (master_id, version)
);

create table public.generated_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  production_id uuid not null references public.productions(id) on delete cascade,
  kind text not null,
  status text not null default 'pending',
  storage_path text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index production_events_production_idx on public.production_events(production_id, created_at desc);
create index genplay_masters_workspace_idx on public.genplay_masters(workspace_id);
create index generated_assets_production_idx on public.generated_assets(production_id);

alter table public.production_events enable row level security;
alter table public.genplay_masters enable row level security;
alter table public.genplay_binders enable row level security;
alter table public.generated_assets enable row level security;

create policy "members read production events" on public.production_events for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members create production events" on public.production_events for insert to authenticated with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.productions where id = production_id and workspace_id = production_events.workspace_id)
);

create policy "members read genplay masters" on public.genplay_masters for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members create genplay masters" on public.genplay_masters for insert to authenticated with check (
  public.is_workspace_member(workspace_id)
  and (production_id is null or exists (select 1 from public.productions where id = production_id and workspace_id = genplay_masters.workspace_id))
);
create policy "members update genplay masters" on public.genplay_masters for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members delete genplay masters" on public.genplay_masters for delete to authenticated using (public.is_workspace_member(workspace_id));

create policy "members read genplay binders" on public.genplay_binders for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members create genplay binders" on public.genplay_binders for insert to authenticated with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.genplay_masters where id = master_id and workspace_id = genplay_binders.workspace_id)
);
create policy "members update genplay binders" on public.genplay_binders for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members delete genplay binders" on public.genplay_binders for delete to authenticated using (public.is_workspace_member(workspace_id));

create policy "members read generated assets" on public.generated_assets for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members create generated assets" on public.generated_assets for insert to authenticated with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.productions where id = production_id and workspace_id = generated_assets.workspace_id)
);
create policy "members update generated assets" on public.generated_assets for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members delete generated assets" on public.generated_assets for delete to authenticated using (public.is_workspace_member(workspace_id));

create or replace function public.advance_production(target_production uuid)
returns public.productions
language plpgsql
security invoker
set search_path = public
as $$
declare result public.productions;
begin
  update public.productions
  set current_step = least(current_step + 1, step_count), updated_at = now()
  where id = target_production
    and public.is_workspace_member(workspace_id)
    and current_step < step_count
  returning * into result;

  if result.id is null then
    return null;
  end if;

  insert into public.production_events (workspace_id, production_id, event_type, from_step, to_step)
  values (result.workspace_id, result.id, 'advanced', result.current_step - 1, result.current_step);

  return result;
end;
$$;

grant execute on function public.advance_production(uuid) to authenticated;

insert into storage.buckets (id, name, public)
values ('creative-assets', 'creative-assets', false)
on conflict (id) do nothing;

create policy "members read creative assets" on storage.objects for select to authenticated using (
  bucket_id = 'creative-assets'
  and (storage.foldername(name))[1] = 'workspace'
  and public.is_workspace_member(((storage.foldername(name))[2])::uuid)
);
create policy "members upload creative assets" on storage.objects for insert to authenticated with check (
  bucket_id = 'creative-assets'
  and (storage.foldername(name))[1] = 'workspace'
  and public.is_workspace_member(((storage.foldername(name))[2])::uuid)
);
create policy "members update creative assets" on storage.objects for update to authenticated using (
  bucket_id = 'creative-assets'
  and (storage.foldername(name))[1] = 'workspace'
  and public.is_workspace_member(((storage.foldername(name))[2])::uuid)
) with check (
  bucket_id = 'creative-assets'
  and (storage.foldername(name))[1] = 'workspace'
  and public.is_workspace_member(((storage.foldername(name))[2])::uuid)
);
create policy "members delete creative assets" on storage.objects for delete to authenticated using (
  bucket_id = 'creative-assets'
  and (storage.foldername(name))[1] = 'workspace'
  and public.is_workspace_member(((storage.foldername(name))[2])::uuid)
);
