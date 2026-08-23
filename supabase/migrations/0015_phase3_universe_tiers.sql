alter table public.dna_records
  add column if not exists tier text not null default 'B' check (tier in ('A', 'B')),
  add column if not exists group_type text not null default 'Universe'
    check (group_type in ('Universe', 'Studio', 'Channel', 'Season', 'Socials', 'FDNA'));

create table if not exists public.dna_promotion_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  dna_record_id uuid not null references public.dna_records(id) on delete cascade,
  from_tier text not null check (from_tier = 'B'),
  to_tier text not null check (to_tier = 'A'),
  reason text not null,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.dna_promotion_events enable row level security;
create policy "members read dna promotion events" on public.dna_promotion_events for select to authenticated using (public.is_workspace_member(workspace_id));
create index if not exists dna_records_group_idx on public.dna_records(workspace_id, group_type, tier);

create or replace function public.promote_dna_record(target_workspace uuid, target_record uuid, promotion_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare current_tier text;
begin
  if not public.is_workspace_member(target_workspace) then raise exception 'workspace_forbidden'; end if;
  if length(trim(promotion_reason)) < 1 or length(promotion_reason) > 1000 then raise exception 'invalid_reason'; end if;
  select tier into current_tier from public.dna_records where id = target_record and workspace_id = target_workspace for update;
  if current_tier is null then raise exception 'record_not_found'; end if;
  if current_tier <> 'B' then raise exception 'already_a_tier'; end if;
  update public.dna_records set tier = 'A', version = version + 1, updated_at = now() where id = target_record and workspace_id = target_workspace;
  insert into public.dna_promotion_events (workspace_id, dna_record_id, from_tier, to_tier, reason, actor_id)
    values (target_workspace, target_record, 'B', 'A', trim(promotion_reason), auth.uid());
end; $$;
grant execute on function public.promote_dna_record(uuid, uuid, text) to authenticated;
