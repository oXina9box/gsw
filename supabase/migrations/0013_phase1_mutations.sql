-- Phase 1 mutation seams: keep user actions workspace-scoped while preserving protected rows.
create or replace function public.update_dna_record(
  target_workspace uuid,
  target_record uuid,
  next_record jsonb,
  lock_version boolean
)
returns boolean language plpgsql security definer set search_path = public as $$
declare current_record public.dna_records;
begin
  if not public.is_workspace_member(target_workspace) then raise exception 'not_authorized'; end if;
  select * into current_record
  from public.dna_records
  where id = target_record and workspace_id = target_workspace
  for update;
  if current_record.id is null then raise exception 'record_not_found'; end if;
  if current_record.locked and next_record is distinct from current_record.record then raise exception 'record_locked'; end if;
  update public.dna_records
  set record = next_record, locked = lock_version, updated_at = now()
  where id = target_record and workspace_id = target_workspace;
  return found;
end;
$$;

create or replace function public.delete_custom_agent(
  target_workspace uuid,
  target_agent uuid,
  target_lane uuid
)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_workspace_member(target_workspace) then raise exception 'not_authorized'; end if;
  delete from public.agents
  where id = target_agent and lane_id = target_lane and workspace_id = target_workspace;
  return found;
end;
$$;

create or replace function public.delete_custom_lane(
  target_workspace uuid,
  target_lane uuid
)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_workspace_member(target_workspace) then raise exception 'not_authorized'; end if;
  delete from public.agents where lane_id = target_lane and workspace_id = target_workspace;
  delete from public.lanes where id = target_lane and workspace_id = target_workspace;
  return found;
end;
$$;

revoke all on function public.update_dna_record(uuid, uuid, jsonb, boolean), public.delete_custom_agent(uuid, uuid, uuid), public.delete_custom_lane(uuid, uuid) from public, anon;
grant execute on function public.update_dna_record(uuid, uuid, jsonb, boolean), public.delete_custom_agent(uuid, uuid, uuid), public.delete_custom_lane(uuid, uuid) to authenticated;
